"use client";

import { useMemo } from "react";
import type { ProductionMode, PaymentMethod, FixedCost } from "@/types";

export type ScenarioType = "minimo" | "saudavel" | "premium";

export interface PricingInputs {
  rawMaterial: number;
  packaging: number;
  labor: number;
  freight: number;
  otherCosts: number;
  taxes: number;
  marketplaceFee: number;
  platformFee: number;
  commission: number;
  otherFees: number;
  desiredMargin: number;
  productionMode: ProductionMode;
  lotQuantity: number;
  useFixedCosts: boolean;
  fixedCosts: FixedCost | null;
  estimatedUnitsPerMonth: number;
  paymentMethod: PaymentMethod;
  creditCardRate: number;
  debitCardRate: number;
  installmentCount: number;
  installmentRate: number;
}

export interface ScenarioData {
  price: number;
  grossProfit: number;
  netProfit: number;
  finalMargin: number;
}

export interface PricingResults {
  minPrice: number;
  healthyPrice: number | null;
  premiumPrice: number | null;
  netMargin: number;
  maxMarginPct: number;
  maxAllowedMargin: number;
  marginValid: boolean;
  healthyValid: boolean;
  premiumValid: boolean;
  effectiveCost: number;
  totalCostBeforeFees: number;
  totalTaxRate: number;
  fixedCostRateio: number;
  paymentFeeAmount: number;
  grossProfit: number;
  netProfit: number;
  profitInReais: number;
  finalMargin: number;
  breakEvenUnits: number | null;
  unitsForProLabore: number | null;
  scenarios: Record<ScenarioType, ScenarioData | null>;
}

function calculatePrices(totalCost: number, totalTaxRate: number, desiredMargin: number) {
  if (totalCost <= 0) {
    return {
      minPrice: 0, healthyPrice: null, premiumPrice: null,
      netMargin: 0, maxMarginPct: 0, maxAllowedMargin: 0,
      marginValid: false, healthyValid: false, premiumValid: false,
    };
  }
  const taxDec = totalTaxRate / 100;

  const maxMarginPct = Math.max(0, 100 - totalTaxRate);
  const maxAllowedMargin = Math.floor(maxMarginPct);

  const minDenom = Math.max(1 - taxDec - 0.10, 0.001);
  const minPrice = totalCost / minDenom;

  const healthyValid = desiredMargin > 0 && desiredMargin < maxAllowedMargin;
  const healthyPrice = healthyValid ? totalCost / (1 - taxDec - desiredMargin / 100) : null;

  const premiumMargin = desiredMargin + 15;
  const premiumValid = desiredMargin > 0 && premiumMargin < maxMarginPct;
  const premiumPrice = premiumValid ? totalCost / (1 - taxDec - premiumMargin / 100) : null;

  const marginValid = healthyValid;

  return {
    minPrice, healthyPrice, premiumPrice,
    netMargin: desiredMargin, maxMarginPct, maxAllowedMargin,
    marginValid, healthyValid, premiumValid,
  };
}

function getPaymentFee(
  paymentMethod: PaymentMethod,
  healthyPrice: number | null,
  creditCardRate: number,
  debitCardRate: number,
  installmentCount: number,
  installmentRate: number
): number {
  if (healthyPrice === null || healthyPrice <= 0) return 0;

  switch (paymentMethod) {
    case "credito":
      return healthyPrice * (creditCardRate / 100);
    case "debito":
      return healthyPrice * (debitCardRate / 100);
    case "parcelado":
      return healthyPrice * ((installmentRate * installmentCount) / 100);
    default:
      return 0;
  }
}

function computeScenario(
  price: number | null,
  totalCostBeforeFees: number,
  fixedCostRateio: number,
  totalTaxRate: number,
  paymentFeeAmount: number
): ScenarioData | null {
  if (price === null || price <= 0) return null;
  const taxAmount = price * (totalTaxRate / 100);
  const grossProfit = price - totalCostBeforeFees;
  const netProfit = price - totalCostBeforeFees - fixedCostRateio - taxAmount - paymentFeeAmount;
  const finalMargin = price > 0 ? (netProfit / price) * 100 : 0;
  return { price, grossProfit, netProfit, finalMargin };
}

function getPaymentFeeForPrice(
  price: number,
  paymentMethod: PaymentMethod,
  healthyPrice: number | null,
  creditCardRate: number,
  debitCardRate: number,
  installmentCount: number,
  installmentRate: number
): number {
  if (price <= 0) return 0;
  const ratio = healthyPrice && healthyPrice > 0 ? price / healthyPrice : 1;
  const baseFee = getPaymentFee(
    paymentMethod,
    healthyPrice,
    creditCardRate,
    debitCardRate,
    installmentCount,
    installmentRate
  );
  return baseFee * ratio;
}

export function usePricingCalculations(inputs: PricingInputs): PricingResults {
  return useMemo(() => {
    const {
      rawMaterial, packaging, labor, freight, otherCosts,
      taxes, marketplaceFee, platformFee, commission, otherFees,
      desiredMargin,
      productionMode, lotQuantity,
      useFixedCosts, fixedCosts, estimatedUnitsPerMonth,
      paymentMethod, creditCardRate, debitCardRate, installmentCount, installmentRate,
    } = inputs;

    const effectiveLotQty = productionMode === "lote" && lotQuantity > 0 ? lotQuantity : 1;

    const rm = productionMode === "lote" ? rawMaterial / effectiveLotQty : rawMaterial;
    const pk = productionMode === "lote" ? packaging / effectiveLotQty : packaging;
    const lb = productionMode === "lote" ? labor / effectiveLotQty : labor;
    const fr = productionMode === "lote" ? freight / effectiveLotQty : freight;
    const oc = productionMode === "lote" ? otherCosts / effectiveLotQty : otherCosts;

    const totalCostBeforeFees = rm + pk + lb + fr + oc;
    const totalTaxRate = taxes + marketplaceFee + platformFee + commission + otherFees;

    let fixedCostRateio = 0;
    if (useFixedCosts && fixedCosts && estimatedUnitsPerMonth > 0) {
      fixedCostRateio = fixedCosts.total / estimatedUnitsPerMonth;
    }

    const effectiveCost = totalCostBeforeFees + fixedCostRateio;

    const prices = calculatePrices(effectiveCost, totalTaxRate, desiredMargin);

    const paymentFeeAmount = getPaymentFee(
      paymentMethod,
      prices.healthyPrice,
      creditCardRate,
      debitCardRate,
      installmentCount,
      installmentRate
    );

    const grossProfit = prices.healthyPrice !== null
      ? prices.healthyPrice - totalCostBeforeFees
      : 0;

    const taxAmount = prices.healthyPrice !== null
      ? prices.healthyPrice * (totalTaxRate / 100)
      : 0;

    const netProfit = prices.healthyPrice !== null
      ? prices.healthyPrice - totalCostBeforeFees - fixedCostRateio - taxAmount - paymentFeeAmount
      : 0;

    const profitInReais = netProfit;

    const finalMargin = prices.healthyPrice !== null && prices.healthyPrice > 0
      ? (netProfit / prices.healthyPrice) * 100
      : 0;

    const scenarios: Record<ScenarioType, ScenarioData | null> = {
      minimo: computeScenario(
        prices.minPrice > 0 ? prices.minPrice : null,
        totalCostBeforeFees,
        fixedCostRateio,
        totalTaxRate,
        getPaymentFeeForPrice(prices.minPrice, paymentMethod, prices.healthyPrice, creditCardRate, debitCardRate, installmentCount, installmentRate)
      ),
      saudavel: computeScenario(
        prices.healthyPrice,
        totalCostBeforeFees,
        fixedCostRateio,
        totalTaxRate,
        paymentFeeAmount
      ),
      premium: computeScenario(
        prices.premiumPrice,
        totalCostBeforeFees,
        fixedCostRateio,
        totalTaxRate,
        getPaymentFeeForPrice(prices.premiumPrice ?? 0, paymentMethod, prices.healthyPrice, creditCardRate, debitCardRate, installmentCount, installmentRate)
      ),
    };

    let breakEvenUnits: number | null = null;
    if (useFixedCosts && fixedCosts && prices.healthyPrice !== null) {
      const lucroPorUnidade = prices.healthyPrice - effectiveCost;
      if (lucroPorUnidade > 0) {
        breakEvenUnits = Math.ceil(fixedCosts.total / lucroPorUnidade);
      }
    }

    const unitsForProLabore: number | null = null;

    return {
      ...prices,
      effectiveCost,
      totalCostBeforeFees,
      totalTaxRate,
      fixedCostRateio,
      paymentFeeAmount,
      grossProfit,
      netProfit,
      profitInReais,
      finalMargin,
      breakEvenUnits,
      unitsForProLabore,
      scenarios,
    };
  }, [inputs]);
}

export function calculateUnitsForProLabore(
  proLaboreValue: number,
  fixedCosts: FixedCost | null,
  lucroLiquidoPorUnidade: number
): number | null {
  if (proLaboreValue <= 0 || lucroLiquidoPorUnidade <= 0) return null;
  const totalFixos = fixedCosts?.total ?? 0;
  return Math.ceil((totalFixos + proLaboreValue) / lucroLiquidoPorUnidade);
}

export function calculateDiscountSimulation(
  simulatedPrice: number,
  healthyPrice: number | null,
  effectiveCost: number,
  paymentFeeAmount: number,
  finalMargin: number
) {
  if (simulatedPrice <= 0 || healthyPrice === null || healthyPrice <= 0) {
    return null;
  }

  const lucroLiquidoSimulado = simulatedPrice - effectiveCost - paymentFeeAmount;
  const margemSimulada = simulatedPrice > 0
    ? (lucroLiquidoSimulado / simulatedPrice) * 100
    : 0;

  const lucroOriginal = healthyPrice - effectiveCost - paymentFeeAmount;
  const diferencaLucro = lucroLiquidoSimulado - lucroOriginal;
  const diferencaMargem = margemSimulada - finalMargin;

  return {
    lucroLiquidoSimulado,
    margemSimulada,
    reducaoMargem: -diferencaMargem,
    impactoFinanceiro: diferencaLucro,
  };
}
