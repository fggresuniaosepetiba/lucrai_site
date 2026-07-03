import { db } from "@/database/dexie";
import type { SignatureConfig } from "@/types";

export const AssinaturaRepository = {
  async get(company: string): Promise<SignatureConfig | undefined> {
    return db.configuracoesAssinatura.get(company);
  },

  async save(company: string, config: SignatureConfig): Promise<void> {
    await db.configuracoesAssinatura.put({ ...config, id: company, company });
  },
};
