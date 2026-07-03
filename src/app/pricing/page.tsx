"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { PricingRepository } from "@/database/repositories/pricing";
import { FixedCostsRepository } from "@/database/repositories/fixed-costs";
import { migrateDisplayIds, fixCompanyName } from "@/database/dexie";
import { seedDefaultCategories } from "@/database/seed";
import type { PricingProduct, ProductionMode, PaymentMethod, FixedCost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { usePricingCalculations, calculateUnitsForProLabore, calculateDiscountSimulation, type ScenarioType } from "@/hooks/usePricingCalculations";
import { ProductionModeSelector } from "@/components/pricing/ProductionModeSelector";
import { FixedCostsCheckbox } from "@/components/pricing/FixedCostsCheckbox";
import { PaymentMethodSelector } from "@/components/pricing/PaymentMethodSelector";
import { FinancialSummaryCard } from "@/components/pricing/FinancialSummaryCard";
import { BreakEvenCard } from "@/components/pricing/BreakEvenCard";
import { ProLaboreSection } from "@/components/pricing/ProLaboreSection";
import { DiscountSimulation } from "@/components/pricing/DiscountSimulation";
import { TechnicalSheetModal } from "@/components/pricing/TechnicalSheetModal";
import {
  AlertTriangle,
  Calculator,
  Package,
  DollarSign,
  Percent,
  TrendingUp,
  Lightbulb,
  Save,
  Trash2,
  Copy,
  Pencil,
  X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDateBR(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatBRL(num: number): string {
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MonetaryInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value <= 0) { setDisplay(""); return; }
    setDisplay(formatBRL(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setDisplay(""); onChange(0); return; }
    const parsed = parseInt(raw);
    if (parsed > 99999999) return;
    const num = parsed / 100;
    onChange(num);
    setDisplay(formatBRL(num));
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="R$ 0,00"
        className="flex h-8 w-36 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function PercentInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={value || ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") { onChange(0); return; }
            const v = Number(raw);
            if (isNaN(v) || v > 100 || v < 0) return;
            onChange(v);
          }}
          className="flex h-8 w-20 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xs text-muted-foreground w-4">%</span>
      </div>
    </div>
  );
}

function formatPrice(p: number): string {
  return formatCurrency(p);
}

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PricingProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PricingProduct | null>(null);
  const initialized = useRef(false);
  const company = user?.company ?? "";
  const userName = user?.name ?? "Sistema";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [rawMaterial, setRawMaterial] = useState(0);
  const [packaging, setPackaging] = useState(0);
  const [labor, setLabor] = useState(0);
  const [freight, setFreight] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);

  const [taxes, setTaxes] = useState(0);
  const [marketplaceFee, setMarketplaceFee] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [commission, setCommission] = useState(0);
  const [otherFees, setOtherFees] = useState(0);

  const [marginStr, setMarginStr] = useState("");
  const marginNum = Number(marginStr) || 0;

  const [productionMode, setProductionMode] = useState<ProductionMode>("unitaria");
  const [lotQuantity, setLotQuantity] = useState(0);
  const [useFixedCosts, setUseFixedCosts] = useState(false);
  const [estimatedUnitsPerMonth, setEstimatedUnitsPerMonth] = useState(0);
  const [fixedCostsData, setFixedCostsData] = useState<FixedCost | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [creditCardRate, setCreditCardRate] = useState(0);
  const [debitCardRate, setDebitCardRate] = useState(0);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [installmentRate, setInstallmentRate] = useState(0);
  const [proLaboreValue, setProLaboreValue] = useState(0);
  const [simulatedPrice, setSimulatedPrice] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("saudavel");

  const prices = usePricingCalculations({
    rawMaterial, packaging, labor, freight, otherCosts,
    taxes, marketplaceFee, platformFee, commission, otherFees,
    desiredMargin: marginNum,
    productionMode, lotQuantity,
    useFixedCosts, fixedCosts: fixedCostsData, estimatedUnitsPerMonth,
    paymentMethod, creditCardRate, debitCardRate, installmentCount, installmentRate,
  });

  const unitsForProLabore = calculateUnitsForProLabore(
    proLaboreValue,
    fixedCostsData,
    prices.netProfit
  );

  const discountResult = useMemo(
    () => calculateDiscountSimulation(
      simulatedPrice,
      prices.healthyPrice,
      prices.effectiveCost,
      prices.paymentFeeAmount,
      prices.finalMargin
    ),
    [simulatedPrice, prices.healthyPrice, prices.effectiveCost, prices.paymentFeeAmount, prices.finalMargin]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      runStartup();
    } else {
      loadProducts();
    }
  }, [isAuthenticated, router, company]);

  const runStartup = async () => {
    try { await migrateDisplayIds(); } catch (e) { console.error("migrateDisplayIds:", e); }
    try { await fixCompanyName(); } catch (e) { console.error("fixCompanyName:", e); }
    try { await useAuthStore.getState().refreshUser(); } catch (e) { console.error("refreshUser:", e); }
    try { await seedDefaultCategories(company); } catch (e) { console.error("seedDefaultCategories:", e); }
    loadFixedCosts();
    loadProducts();
  };

  const loadFixedCosts = async () => {
    try {
      const data = await FixedCostsRepository.getByCompany(company);
      setFixedCostsData(data ?? null);
    } catch (err) {
      console.error("Error loading fixed costs:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const all = await PricingRepository.getAll(company);
      setProducts(all);
    } catch (err) {
      console.error("Error loading pricing products:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setSku("");
    setDescription("");
    setRawMaterial(0);
    setPackaging(0);
    setLabor(0);
    setFreight(0);
    setOtherCosts(0);
    setTaxes(0);
    setMarketplaceFee(0);
    setPlatformFee(0);
    setCommission(0);
    setOtherFees(0);
    setMarginStr("");
    setProductionMode("unitaria");
    setLotQuantity(0);
    setUseFixedCosts(false);
    setEstimatedUnitsPerMonth(0);
    setPaymentMethod("pix");
    setCreditCardRate(0);
    setDebitCardRate(0);
    setInstallmentCount(2);
    setInstallmentRate(0);
    setProLaboreValue(0);
    setSimulatedPrice(0);
    setSelectedScenario("saudavel");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) return;
    if (useFixedCosts && estimatedUnitsPerMonth <= 0) {
      toast("Informe a estimativa de vendas por mês para ratear os custos fixos.", undefined, "destructive");
      return;
    }

    const data = {
      name: name.trim(),
      category: category.trim(),
      sku: sku.trim() || undefined,
      description: description.trim() || undefined,
      rawMaterial, packaging, labor, freight, otherCosts,
      taxes, marketplaceFee, platformFee, commission, otherFees,
      desiredMargin: marginNum,
      minPrice: prices.minPrice,
      healthyPrice: prices.healthyPrice ?? 0,
      premiumPrice: prices.premiumPrice ?? 0,
      netMargin: prices.netMargin,
    };

    if (editingId) {
      await PricingRepository.update(editingId, data);
    } else {
      await PricingRepository.create(data, company, userName);
    }

    resetForm();
    loadProducts();
  };

  const handleEdit = (p: PricingProduct) => {
    setName(p.name);
    setCategory(p.category);
    setSku(p.sku ?? "");
    setDescription(p.description ?? "");
    setRawMaterial(p.rawMaterial);
    setPackaging(p.packaging);
    setLabor(p.labor);
    setFreight(p.freight);
    setOtherCosts(p.otherCosts);
    setTaxes(p.taxes);
    setMarketplaceFee(p.marketplaceFee);
    setPlatformFee(p.platformFee);
    setCommission(p.commission);
    setOtherFees(p.otherFees);
    setMarginStr(String(p.desiredMargin));
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = async (p: PricingProduct) => {
    const data = {
      name: `${p.name} (cópia)`,
      category: p.category,
      sku: p.sku,
      description: p.description,
      rawMaterial: p.rawMaterial, packaging: p.packaging, labor: p.labor,
      freight: p.freight, otherCosts: p.otherCosts,
      taxes: p.taxes, marketplaceFee: p.marketplaceFee, platformFee: p.platformFee,
      commission: p.commission, otherFees: p.otherFees,
      desiredMargin: p.desiredMargin,
      minPrice: p.minPrice, healthyPrice: p.healthyPrice,
      premiumPrice: p.premiumPrice, netMargin: p.netMargin,
    };
    await PricingRepository.create(data, company, userName);
    loadProducts();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await PricingRepository.delete(deleteConfirm.id);
    setDeleteConfirm(null);
    loadProducts();
  };

  const marginPresets = [10, 20, 30, 40, 50];

  const totalCostInput = rawMaterial + packaging + labor + freight + otherCosts;

  const { effectiveCost } = prices;

  const insights = useMemo(() => {
    const list: { type: "danger" | "warning" | "success" | "info"; title: string; body: string; tips: string[] }[] = [];

    if (totalCostInput > 0) {
      if (prices.netMargin < 5) {
        list.push({
          type: "danger",
          title: "Margem Muito Baixa",
          body: "Seu produto possui pouca proteção financeira contra aumento de custos.",
          tips: [
            "Revisar fornecedores em busca de melhores preços.",
            "Reduzir desperdícios operacionais.",
            "Avaliar aumento gradual de preço.",
            "Criar versões premium com maior margem.",
          ],
        });
      } else if (prices.netMargin < 10) {
        list.push({
          type: "warning",
          title: "Margem Baixa",
          body: "Sua margem atual oferece pouco espaço para imprevistos.",
          tips: [
            "Revisar fornecedores.",
            "Reduzir desperdícios.",
            "Avaliar aumento gradual de preço.",
            "Criar versões premium do produto.",
          ],
        });
      }

      if (prices.totalTaxRate > 20) {
        list.push({
          type: "warning",
          title: "Taxas Elevadas",
          body: "Grande parte do preço está sendo consumida por taxas e impostos.",
          tips: [
            "Negociar taxas com operadoras de pagamento.",
            "Incentivar métodos de pagamento com menor custo.",
            "Revisar parcelamentos longos.",
            "Avaliar repasse parcial das taxas ao preço final.",
          ],
        });
      }

      if (prices.netMargin > 50 && prices.netMargin <= 70) {
        list.push({
          type: "success",
          title: "Espaço para Promoções",
          body: "Existe espaço para campanhas promocionais sem comprometer a rentabilidade.",
          tips: [
            "Investir em campanhas promocionais.",
            "Escalar vendas com desconto estratégico.",
            "Criar combos ou kits com outros produtos.",
            "Expandir portfólio baseado neste produto.",
          ],
        });
      }

      if (marginNum > 70 && marginNum <= 100) {
        list.push({
          type: "info",
          title: "Margem Elevada",
          body: "Verifique se o mercado aceita esse posicionamento de preço.",
          tips: [
            "Comparar preço final com concorrentes diretos.",
            "Validar percepção de valor da marca.",
            "Avaliar elasticidade de demanda.",
            "Testar diferentes posicionamentos comerciais.",
          ],
        });
      }

      if (marginNum > 100 && marginNum <= 200) {
        list.push({
          type: "info",
          title: "Posicionamento Agressivo",
          body: "Preço com posicionamento agressivo. Compare com concorrentes para avaliar competitividade.",
          tips: [
            "Comparar preço final com concorrentes.",
            "Validar percepção de valor da marca.",
            "Avaliar elasticidade de demanda.",
            "Testar diferentes posicionamentos comerciais.",
          ],
        });
      }

      if (marginNum > 200) {
        list.push({
          type: "warning",
          title: "Margem Extremamente Alta",
          body: "Margem extremamente alta. O preço final pode reduzir significativamente a taxa de conversão.",
          tips: [
            "Comparar preço final com concorrentes.",
            "Validar percepção de valor da marca.",
            "Avaliar elasticidade de demanda.",
            "Testar diferentes posicionamentos comerciais.",
          ],
        });
      }

      if (prices.netMargin >= 10 && prices.netMargin <= 50 && prices.totalTaxRate <= 20) {
        list.push({
          type: "success",
          title: "Margem Saudável",
          body: "Seu produto apresenta boa rentabilidade.",
          tips: [
            "Investir em campanhas promocionais.",
            "Escalar vendas.",
            "Criar combos ou kits.",
            "Expandir portfólio baseado neste produto.",
          ],
        });
      }

      // Evolved insights
      const laborPct = totalCostInput > 0 ? (labor / totalCostInput) * 100 : 0;
      const packagingPct = totalCostInput > 0 ? (packaging / totalCostInput) * 100 : 0;

      if (laborPct > 30) {
        list.push({
          type: "warning",
          title: "Mão de Obra Elevada",
          body: `Sua mão de obra representa ${laborPct.toFixed(0)}% do custo do produto — um dos maiores componentes. Avalie se há espaço para otimização.`,
          tips: ["Avaliar automação de processos.", "Revisar produtividade.", "Comparar com média do mercado."],
        });
      }

      if (packagingPct < 5 && packaging > 0) {
        list.push({
          type: "success",
          title: "Embalagem Eficiente",
          body: `Sua embalagem representa apenas ${packagingPct.toFixed(1)}% do custo total — um componente eficiente.`,
          tips: [],
        });
      }

      if (paymentMethod !== "pix" && paymentMethod !== "dinheiro") {
        const feeDisplay = prices.paymentFeeAmount;
        if (feeDisplay > 0) {
          list.push({
            type: "info",
            title: "Taxa no Recebimento",
            body: `O ${paymentMethod === "parcelado" ? "parcelamento" : "recebimento por " + paymentMethod} escolhido reduz seu lucro em ${formatCurrency(feeDisplay)} por venda.`,
            tips: ["Considerar repasse da taxa ao preço.", "Oferecer desconto para PIX/Dinheiro."],
          });
        }
      }

      if (marginNum > 0 && prices.healthyPrice !== null) {
        const maxDiscount = Math.min(100, (prices.finalMargin - marginNum));
        if (maxDiscount >= 5) {
          list.push({
            type: "success",
            title: "Margem para Desconto",
            body: `Você ainda pode conceder até ${maxDiscount.toFixed(0)}% de desconto sem comprometer sua margem saudável.`,
            tips: ["Criar estratégias promocionais.", "Oferecer descontos por volume."],
          });
        }
      }

      if (useFixedCosts && fixedCostsData) {
        list.push({
          type: "info",
          title: "Custos Fixos por Unidade",
          body: `Seus custos fixos representam ${formatCurrency(prices.fixedCostRateio)} por unidade vendida.`,
          tips: ["Avaliar aumento de volume para diluir custos fixos."],
        });
      }

      if (prices.finalMargin >= 25) {
        list.push({
          type: "success",
          title: "Margem para Campanhas",
          body: "Sua margem atual permite realizar campanhas promocionais com segurança.",
          tips: ["Investir em marketing.", "Criar promoções sazonais."],
        });
      }

      if (labor === 0) {
        list.push({
          type: "info",
          title: "Mão de Obra não Informada",
          body: "Você não informou mão de obra. Lembre-se de valorizar o seu tempo de produção.",
          tips: ["Calcular horas gastas na produção.", "Atribuir um valor justo à sua hora de trabalho."],
        });
      }

      if (useFixedCosts && fixedCostsData && totalCostInput > 0) {
        const costPct = (prices.fixedCostRateio / effectiveCost) * 100;
        if (costPct > 40) {
          list.push({
            type: "warning",
            title: "Custos Fixos Elevados",
            body: "Seus custos fixos estão pesando muito no preço. Considere aumentar o volume de vendas para diluí-los.",
            tips: ["Aumentar volume de vendas.", "Revisar gastos fixos.", "Negociar contratos."],
          });
        }
      }
    }

    return list;
  }, [prices.netMargin, prices.totalTaxRate, prices.finalMargin, prices.fixedCostRateio, prices.paymentFeeAmount, prices.healthyPrice, marginNum, totalCostInput, labor, packaging, paymentMethod, useFixedCosts, fixedCostsData, effectiveCost]);

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-80 rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Calculadora de Precificação</h2>
          </div>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="gap-2">
              <X className="h-4 w-4" /> Cancelar edição
            </Button>
          )}
        </div>

        <ProductionModeSelector
          mode={productionMode}
          onChange={setProductionMode}
          lotQuantity={lotQuantity}
          onLotQuantityChange={setLotQuantity}
        />

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Dados do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do Produto *</label>
                <Input placeholder="Ex: Bolo de Chocolate" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria *</label>
                <Input placeholder="Ex: Alimentação" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">SKU</label>
                <Input placeholder="Opcional" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
                <Input placeholder="Opcional" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Custos Diretos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 grid grid-rows-[1fr_auto]">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <MonetaryInput label="Matéria-prima" value={rawMaterial} onChange={setRawMaterial} />
                  </div>
                  <TechnicalSheetModal onApply={(total) => setRawMaterial(total)} />
                </div>
                <MonetaryInput label="Embalagem" value={packaging} onChange={setPackaging} />
                <MonetaryInput label="Mão de obra" value={labor} onChange={setLabor} />
                <MonetaryInput label="Frete" value={freight} onChange={setFreight} />
                <MonetaryInput label="Outros custos" value={otherCosts} onChange={setOtherCosts} />
              </div>
              <div>
                <Separator />
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm font-semibold">TOTAL DE CUSTOS DIRETOS</span>
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency(totalCostInput)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-4 w-4 text-orange-400" />
                Taxas e Encargos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 grid grid-rows-[1fr_auto]">
              <div className="flex flex-col space-y-3">
                <PercentInput label="Impostos (%)" value={taxes} onChange={setTaxes} />
                <PercentInput label="Taxa marketplace (%)" value={marketplaceFee} onChange={setMarketplaceFee} />
                <PercentInput label="Taxa de Plataformas (%)" value={platformFee} onChange={setPlatformFee} />
                <PercentInput label="Comissão vendedor (%)" value={commission} onChange={setCommission} />
                <PercentInput label="Outros encargos (%)" value={otherFees} onChange={setOtherFees} />
              </div>
              <div>
                <Separator />
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm font-semibold">TOTAL DE TAXAS</span>
                  <span className="text-lg font-bold text-orange-400">{prices.totalTaxRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <FixedCostsCheckbox
          checked={useFixedCosts}
          onCheckedChange={setUseFixedCosts}
          fixedCostTotal={fixedCostsData?.total ?? 0}
          hasFixedCosts={fixedCostsData !== null}
          fixedCostRateio={prices.fixedCostRateio}
          estimatedUnits={estimatedUnitsPerMonth}
          onEstimatedUnitsChange={setEstimatedUnitsPerMonth}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Margem de Lucro Desejada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {marginPresets.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarginStr(String(m))}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    marginStr === String(m)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {m}%
                </button>
              ))}
            </div>
            {!prices.healthyValid && marginNum > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-400">Margem acima do limite matemático</p>
                    <p className="text-xs text-muted-foreground">
                      Com as taxas atuais de {prices.totalTaxRate.toFixed(1).replace('.', ',')}%, a maior margem líquida possível é de {Math.floor(100 - prices.totalTaxRate)}%.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Isso acontece porque impostos, taxas e comissões já consomem parte do valor da venda.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Se a soma entre taxas e margem atingir ou ultrapassar 100%, não existe preço de venda capaz de gerar essa margem.
                    </p>
                    <div className="pt-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">Para continuar:</p>
                      <p className="text-xs text-muted-foreground/80">• Reduza a margem desejada</p>
                      <p className="text-xs text-muted-foreground/80">ou</p>
                      <p className="text-xs text-muted-foreground/80">• Reduza as taxas e encargos do produto.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onChange={setPaymentMethod}
          creditCardRate={creditCardRate}
          onCreditCardRateChange={setCreditCardRate}
          debitCardRate={debitCardRate}
          onDebitCardRateChange={setDebitCardRate}
          installmentCount={installmentCount}
          onInstallmentCountChange={setInstallmentCount}
          installmentRate={installmentRate}
          onInstallmentRateChange={setInstallmentRate}
        />

        {totalCostInput > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-red-500/30">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Preço Mínimo</p>
                  <p className="text-2xl font-bold text-red-400">{formatPrice(prices.minPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Abaixo deste valor sua operação gera prejuízo.
                  </p>
                </CardContent>
              </Card>

              <Card className={`border-blue-500/30 ${prices.healthyValid ? 'ring-2 ring-blue-500/20 scale-[1.02]' : ''}`}>
                <CardContent className="p-6">
                  {prices.healthyValid ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Recomendado</Badge>
                      </div>
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Preço Saudável</p>
                      <p className="text-3xl font-bold text-blue-400">{formatPrice(prices.healthyPrice!)}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Preço recomendado para manter lucratividade sustentável.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preço Saudável</p>
                      <p className="text-2xl font-bold text-muted-foreground">Indisponível</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {marginNum > 0
                          ? "A margem desejada excede o limite matemático para as taxas atuais."
                          : "Informe uma margem de lucro desejada."}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/30">
                <CardContent className="p-6">
                  {prices.premiumValid ? (
                    <>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Preço Premium</p>
                      <p className="text-2xl font-bold text-emerald-400">{formatPrice(prices.premiumPrice!)}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Preço recomendado para posicionamento premium.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preço Premium</p>
                      <p className="text-2xl font-bold text-muted-foreground">Indisponível</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        A margem premium excede o limite matemático permitido para as taxas atuais.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <FinancialSummaryCard
              scenarios={prices.scenarios}
              selectedScenario={selectedScenario}
              onScenarioChange={setSelectedScenario}
            />

            <BreakEvenCard
              breakEvenUnits={prices.breakEvenUnits}
              useFixedCosts={useFixedCosts}
              effectiveCost={prices.effectiveCost}
              healthyPrice={prices.healthyPrice}
            />

            <ProLaboreSection
              value={proLaboreValue}
              onChange={setProLaboreValue}
              calculatedUnits={unitsForProLabore}
              useFixedCosts={useFixedCosts}
            />

            {insights.length > 0 && prices.healthyValid && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    Insights da IA Financeira
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, i) => {
                    const iconColor = insight.type === "danger" ? "text-red-400" : insight.type === "warning" ? "text-orange-400" : "text-emerald-400";
                    const bgColor = insight.type === "danger" ? "bg-red-500/10 border-red-500/20" : insight.type === "warning" ? "bg-orange-500/10 border-orange-500/20" : "bg-emerald-500/10 border-emerald-500/20";
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${bgColor} border`}>
                        <Lightbulb className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
                        <div>
                          <p className={`text-sm font-medium ${iconColor}`}>{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{insight.body}</p>
                          {insight.tips.length > 0 && (
                            <div className="mt-2 space-y-0.5">
                              <p className="text-xs font-medium text-muted-foreground">Possíveis alternativas:</p>
                              {insight.tips.map((tip, j) => (
                                <p key={j} className="text-xs text-muted-foreground/80">• {tip}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <DiscountSimulation
              result={discountResult}
              simulatedPrice={simulatedPrice}
              onSimulatedPriceChange={setSimulatedPrice}
              finalMargin={prices.finalMargin}
              healthyPrice={prices.healthyPrice}
            />
          </>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !category.trim() || totalCostInput <= 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {editingId ? "Atualizar" : "Salvar Produto"}
          </Button>
        </div>

        <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="pt-3">
                <p className="text-sm text-foreground mb-2">
                  Tem certeza que deseja excluir este produto?
                </p>
                <p className="text-xs text-muted-foreground">
                  Esta ação não poderá ser desfeita.
                </p>
                {deleteConfirm && (
                  <p className="text-sm font-medium mt-2 text-foreground">
                    {deleteConfirm.name}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Produtos Precificados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum produto cadastrado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Preencha o formulário acima e clique em Salvar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-medium text-muted-foreground p-4">Produto</th>
                      <th className="text-right font-medium text-muted-foreground p-4">Custo Total</th>
                      <th className="text-right font-medium text-muted-foreground p-4">Preço Saudável</th>
                      <th className="text-right font-medium text-muted-foreground p-4">Margem</th>
                      <th className="text-right font-medium text-muted-foreground p-4">Última Atualização</th>
                      <th className="text-center font-medium text-muted-foreground p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const cost = p.rawMaterial + p.packaging + p.labor + p.freight + p.otherCosts;
                      return (
                        <tr key={p.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground/60">{p.category}</div>
                          </td>
                          <td className="p-4 text-right font-medium">{formatCurrency(cost)}</td>
                          <td className="p-4 text-right font-medium text-blue-400">{formatCurrency(p.healthyPrice)}</td>
                          <td className="p-4 text-right font-medium text-emerald-400">{p.netMargin.toFixed(1)}%</td>
                          <td className="p-4 text-right text-muted-foreground text-xs">{formatDateBR(p.updatedAt)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(p)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Duplicar"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(p)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
