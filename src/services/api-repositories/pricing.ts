import { api } from "@/services/api";
import type { ApiPricingProduct } from "@/types/api";
import type { PricingProduct } from "@/types";

export const PricingRepositoryApi = {
  async getAll(): Promise<PricingProduct[]> {
    const data = await api.get<ApiPricingProduct[]>("/api/pricing");
    return data.map(mapPricing);
  },

  async getById(id: string): Promise<PricingProduct | undefined> {
    try {
      const data = await api.get<ApiPricingProduct>(`/api/pricing/${id}`);
      return mapPricing(data);
    } catch {
      return undefined;
    }
  },

  async create(
    data: Omit<PricingProduct, "id" | "createdAt" | "updatedAt" | "company" | "createdBy">,
  ): Promise<PricingProduct> {
    const created = await api.post<ApiPricingProduct>("/api/pricing", {
      name: data.name,
      category: data.category,
      sku: data.sku ?? null,
      description: data.description ?? null,
      rawMaterial: data.rawMaterial,
      packaging: data.packaging,
      labor: data.labor,
      freight: data.freight,
      otherCosts: data.otherCosts,
      taxes: data.taxes,
      cardFee: data.platformFee,
      marketplaceFee: data.marketplaceFee,
      commission: data.commission,
      otherFees: data.otherFees,
      desiredMargin: data.desiredMargin,
    });
    return mapPricing(created);
  },

  async update(id: string, data: Partial<PricingProduct>): Promise<void> {
    await api.put(`/api/pricing/${id}`, {
      name: data.name,
      category: data.category,
      sku: data.sku ?? null,
      description: data.description ?? null,
      rawMaterial: data.rawMaterial,
      packaging: data.packaging,
      labor: data.labor,
      freight: data.freight,
      otherCosts: data.otherCosts,
      taxes: data.taxes,
      cardFee: data.platformFee,
      marketplaceFee: data.marketplaceFee,
      commission: data.commission,
      otherFees: data.otherFees,
      desiredMargin: data.desiredMargin,
    });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/pricing/${id}`);
  },
};

function mapPricing(p: ApiPricingProduct): PricingProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    sku: p.sku ?? undefined,
    description: p.description ?? undefined,
    rawMaterial: p.rawMaterial,
    packaging: p.packaging,
    labor: p.labor,
    freight: p.freight,
    otherCosts: p.otherCosts,
    taxes: p.taxes,
    marketplaceFee: p.marketplaceFee,
    platformFee: p.cardFee,
    commission: p.commission,
    otherFees: p.otherFees,
    desiredMargin: p.desiredMargin,
    minPrice: p.minPrice,
    healthyPrice: p.healthyPrice,
    premiumPrice: p.premiumPrice,
    netMargin: p.netMargin,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    company: p.company,
    createdBy: p.createdBy,
  };
}
