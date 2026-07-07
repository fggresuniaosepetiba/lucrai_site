# Variáveis de Ambiente — Railway

Copie e cole estas variáveis no Railway:

**Dashboard → Projeto → Variables → New Variable**

---

| Nome | Valor | Exemplo / Instrução |
|---|---|---|
| `ASPNETCORE_URLS` | `http://+:${PORT}` | Usa a porta que o Railway atribuir |
| `ConnectionStrings__Default` | (sua string do Neon) | `Host=ep-xxxx.us-east-2.aws.neon.tech;Port=5432;Database=lucrai;Username=lucrai_owner;Password=SEGREDO;SslMode=Require` |
| `Jwt__Key` | (32+ caracteres) | Gere em: https://generate-random.org/encryption-key-generator?count=1 |
| `Jwt__Issuer` | `lucrai-api` | Fixo |
| `Jwt__Audience` | `lucrai-frontend` | Fixo |
| `Cors__Origins` | `https://lucrai-site.vercel.app` | URL exata do frontend na Vercel |

---

## Como criar no Railway

1. **Variables → New Variable**
2. Escolher **"Add in bulk"** (ícone de engrenagem)
3. Colar o bloco abaixo (preenchendo os valores reais):

```
ASPNETCORE_URLS=http://+:${PORT}
ConnectionStrings__Default=Host=ep-xxxx.us-east-2.aws.neon.tech;Port=5432;Database=lucrai;Username=lucrai_owner;Password=SEU_PASSWORD;SslMode=Require
Jwt__Key=MINHA_CHAVE_SECRETA_COM_32_CARACTERES_OU_MAIS
Jwt__Issuer=lucrai-api
Jwt__Audience=lucrai-frontend
Cors__Origins=https://lucrai-site.vercel.app
```

4. Salvar
5. Ir em **Deployments → Redeploy** para aplicar

---

> **Connection String do Neon:** No dashboard do Neon, vá em **Connection Details → Connection String (ADO.NET)** — ela já vem com `SslMode=Require`.
