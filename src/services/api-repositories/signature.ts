import { api } from "@/services/api";
import type { ApiSignature } from "@/types/api";
import type { SignatureConfig } from "@/types";

function mapSignature(s: ApiSignature): SignatureConfig {
  return {
    id: s.id,
    company: s.company,
    imagemBase64: s.imagemBase64,
    nomeResponsavel: s.nomeResponsavel,
    cargo: s.cargo,
    permitirUso: s.permitirUso,
  };
}

export const SignatureRepositoryApi = {
  async get(): Promise<SignatureConfig | undefined> {
    try {
      const data = await api.get<ApiSignature>("/api/signature");
      return mapSignature(data);
    } catch {
      return undefined;
    }
  },

  async save(config: Omit<SignatureConfig, "id">): Promise<SignatureConfig> {
    const saved = await api.put<ApiSignature>("/api/signature", {
      imagemBase64: config.imagemBase64,
      nomeResponsavel: config.nomeResponsavel,
      cargo: config.cargo,
      permitirUso: config.permitirUso,
    });
    return mapSignature(saved);
  },
};
