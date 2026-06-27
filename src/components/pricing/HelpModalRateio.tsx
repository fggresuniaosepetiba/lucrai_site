"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpModalRateio() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="O que são custos fixos e como funciona o rateio?"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>O que são custos fixos e como funciona o rateio?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">1. O que são custos fixos?</h4>
            <p>
              São os gastos que sua empresa tem todo mês, independentemente de quanto você vende.
              Mesmo que você não venda nada, o aluguel, a conta de luz e o contador precisam ser pagos.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">2. O que é rateio?</h4>
            <p>
              Rateio é a divisão desses custos fixos entre os produtos que você vende.
              Em vez de colocar o custo total de um gasto (como a internet) no preço de um único
              produto, você divide esse valor por todos os produtos que pretende vender no mês.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              3. Por que não devo somar o custo inteiro ao preço de um produto?
            </h4>
            <p>
              Imagine que você paga R$ 200,00 de internet por mês e vende 100 produtos.
              Se colocar os R$ 200,00 no preço de um único produto, ele ficará artificialmente caro.
              O correto é dividir: R$ 200,00 ÷ 100 produtos = R$ 2,00 por produto.
              Assim, cada produto &quot;paga&quot; sua parte justa.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">4. Exemplo prático:</h4>
            <p>
              Seus custos fixos mensais somam R$ 3.000,00 e você estima vender 200 unidades por mês.
              <br />
              Rateio = R$ 3.000,00 ÷ 200 = <strong className="text-foreground">R$ 15,00 por unidade</strong>.
              <br />
              Esse valor entra no custo do produto para garantir que sua empresa não opere no prejuízo.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
