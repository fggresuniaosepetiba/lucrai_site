"use client";

import type { PaymentMethod } from "@/types";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/types";

interface Props {
  paymentMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  creditCardRate: number;
  onCreditCardRateChange: (rate: number) => void;
  debitCardRate: number;
  onDebitCardRateChange: (rate: number) => void;
  installmentCount: number;
  onInstallmentCountChange: (count: number) => void;
  installmentRate: number;
  onInstallmentRateChange: (rate: number) => void;
}

export function PaymentMethodSelector({
  paymentMethod, onChange,
  creditCardRate, onCreditCardRateChange,
  debitCardRate, onDebitCardRateChange,
  installmentCount, onInstallmentCountChange,
  installmentRate, onInstallmentRateChange,
}: Props) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Forma de Recebimento
      </p>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isActive = paymentMethod === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => onChange(method)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {PAYMENT_METHOD_LABELS[method]}
            </button>
          );
        })}
      </div>

      {(paymentMethod === "credito" || paymentMethod === "parcelado") && (
        <div className="animate-fade-in space-y-3 pl-1">
          {paymentMethod === "credito" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Taxa da operadora (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={creditCardRate || ""}
                onChange={(e) => onCreditCardRateChange(Math.min(Number(e.target.value) || 0, 100))}
                placeholder="Ex.: 3.99"
                className="flex h-8 w-28 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          )}

          {paymentMethod === "parcelado" && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Quantidade de parcelas
                </label>
                <input
                  type="number"
                  min={2}
                  max={48}
                  step={1}
                  value={installmentCount >= 2 ? installmentCount : ""}
                  onChange={(e) => onInstallmentCountChange(Math.max(2, parseInt(e.target.value) || 0))}
                  placeholder="Ex.: 6"
                  className="flex h-8 w-20 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Taxa da operadora (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={installmentRate || ""}
                  onChange={(e) => onInstallmentRateChange(Math.min(Number(e.target.value) || 0, 100))}
                  placeholder="Ex.: 2.5"
                  className="flex h-8 w-28 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {paymentMethod === "debito" && (
        <div className="animate-fade-in pl-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Taxa da operadora (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={debitCardRate || ""}
            onChange={(e) => onDebitCardRateChange(Math.min(Number(e.target.value) || 0, 100))}
            placeholder="Ex.: 1.99"
            className="flex h-8 w-28 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      )}
    </div>
  );
}
