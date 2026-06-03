"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { PricingRepository } from "@/database/repositories/pricing";
import { migrateDisplayIds, fixCompanyName } from "@/database/dexie";
import { seedDefaultCategories } from "@/database/seed";
import type { PricingProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
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

function calculatePrices(totalCost: number, totalTaxRate: number, desiredMargin: number) {
  if (totalCost <= 0) {
    return { minPrice: 0, healthyPrice: 0, premiumPrice: 0, netMargin: 0, maxMarginPct: 0, marginValid: false };
  }
  const taxDec = totalTaxRate / 100;
  const marginDec = desiredMargin / 100;

  const maxMarginPct = Math.max(0, 100 - totalTaxRate);
  const marginValid = desiredMargin > 0 && desiredMargin < maxMarginPct;

  if (!marginValid) {
    return { minPrice: 0, healthyPrice: 0, premiumPrice: 0, netMargin: desiredMargin, maxMarginPct, marginValid };
  }

  const minDenom = Math.max(1 - taxDec - 0.10, 0.001);
  const minPrice = totalCost / minDenom;

  const healthyDenom = 1 - taxDec - marginDec;
  const healthyPrice = totalCost / healthyDenom;

  const premiumMarginPct = Math.min(desiredMargin + 15, maxMarginPct - 0.5);
  const premiumDec = premiumMarginPct / 100;
  const premiumPrice = totalCost / (1 - taxDec - premiumDec);

  return { minPrice, healthyPrice, premiumPrice, netMargin: desiredMargin, maxMarginPct, marginValid };
}

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
    const num = parseInt(raw) / 100;
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
          step={0.1}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
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
  const [cardFee, setCardFee] = useState(0);
  const [marketplaceFee, setMarketplaceFee] = useState(0);
  const [commission, setCommission] = useState(0);
  const [otherFees, setOtherFees] = useState(0);

  const [marginStr, setMarginStr] = useState("");
  const [lastWasPreset, setLastWasPreset] = useState(true);

  const marginNum = Number(marginStr) || 0;

  const totalCost = rawMaterial + packaging + labor + freight + otherCosts;
  const totalTaxRate = taxes + cardFee + marketplaceFee + commission + otherFees;

  const prices = useMemo(
    () => calculatePrices(totalCost, totalTaxRate, marginNum),
    [totalCost, totalTaxRate, marginNum]
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
    loadProducts();
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
    setCardFee(0);
    setMarketplaceFee(0);
    setCommission(0);
    setOtherFees(0);
    setMarginStr("");
    setLastWasPreset(true);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) return;

    const data = {
      name: name.trim(),
      category: category.trim(),
      sku: sku.trim() || undefined,
      description: description.trim() || undefined,
      rawMaterial, packaging, labor, freight, otherCosts,
      taxes, cardFee, marketplaceFee, commission, otherFees,
      desiredMargin: marginNum,
      minPrice: prices.minPrice,
      healthyPrice: prices.healthyPrice,
      premiumPrice: prices.premiumPrice,
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
    setCardFee(p.cardFee);
    setMarketplaceFee(p.marketplaceFee);
    setCommission(p.commission);
    setOtherFees(p.otherFees);
    setMarginStr(String(p.desiredMargin));
    setLastWasPreset(true);
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
      taxes: p.taxes, cardFee: p.cardFee, marketplaceFee: p.marketplaceFee,
      commission: p.commission, otherFees: p.otherFees,
      desiredMargin: p.desiredMargin,
      minPrice: p.minPrice, healthyPrice: p.healthyPrice,
      premiumPrice: p.premiumPrice, netMargin: p.netMargin,
    };
    await PricingRepository.create(data, company, userName);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    await PricingRepository.delete(id);
    loadProducts();
  };

  const marginPresets = [20, 30, 40, 50];

  const insights = useMemo(() => {
    const list: { type: "danger" | "warning" | "success" | "info"; title: string; body: string; tips: string[] }[] = [];

    if (totalCost > 0) {
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

      if (totalTaxRate > 20) {
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

      if (prices.netMargin >= 10 && prices.netMargin <= 50 && totalTaxRate <= 20) {
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
    }

    return list;
  }, [prices.netMargin, totalTaxRate, marginNum, totalCost]);

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

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Dados do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Custos Diretos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MonetaryInput label="Matéria-prima" value={rawMaterial} onChange={setRawMaterial} />
              <MonetaryInput label="Embalagem" value={packaging} onChange={setPackaging} />
              <MonetaryInput label="Mão de obra" value={labor} onChange={setLabor} />
              <MonetaryInput label="Frete" value={freight} onChange={setFreight} />
              <MonetaryInput label="Outros custos" value={otherCosts} onChange={setOtherCosts} />
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold">TOTAL DE CUSTOS DIRETOS</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(totalCost)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-4 w-4 text-orange-400" />
                Taxas e Encargos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PercentInput label="Impostos (%)" value={taxes} onChange={setTaxes} />
              <PercentInput label="Taxa da maquininha (%)" value={cardFee} onChange={setCardFee} />
              <PercentInput label="Taxa marketplace (%)" value={marketplaceFee} onChange={setMarketplaceFee} />
              <PercentInput label="Comissão vendedor (%)" value={commission} onChange={setCommission} />
              <PercentInput label="Outros encargos (%)" value={otherFees} onChange={setOtherFees} />
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold">TOTAL DE TAXAS</span>
                <span className="text-lg font-bold text-orange-400">{totalTaxRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Margem Desejada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {marginPresets.map((m) => (
                <button
                  key={m}
                  onClick={() => { setLastWasPreset(true); setMarginStr(String(m)); }}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    lastWasPreset && marginStr === String(m)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {m}%
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-muted-foreground">ou</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={marginStr}
                  onChange={(e) => { setLastWasPreset(false); setMarginStr(e.target.value.replace(/\D/g, "")); }}
                  placeholder=""
                  className="flex h-9 w-20 rounded-lg border border-input bg-background px-3 py-2 text-center text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {totalCost > 0 && (
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

              <Card className="border-blue-500/30 ring-2 ring-blue-500/20 scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Recomendado</Badge>
                  </div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Preço Saudável</p>
                  <p className="text-3xl font-bold text-blue-400">{formatPrice(prices.healthyPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Preço recomendado para manter lucratividade sustentável.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-500/30">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Preço Premium</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatPrice(prices.premiumPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Preço recomendado para posicionamento premium.
                  </p>
                </CardContent>
              </Card>
            </div>

            {insights.length > 0 && (
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
          </>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !category.trim() || totalCost <= 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {editingId ? "Atualizar" : "Salvar Produto"}
          </Button>
        </div>

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
                                onClick={() => handleDelete(p.id)}
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
