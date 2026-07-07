# Guia de Teste: Troca de Senha Obrigatória + Planos + SuperAdmin

## Pré-requisitos

- Docker Desktop (ou Docker Engine)
- .NET 10 SDK
- Node.js 22
- Git

## Setup do Banco de Dados

O PostgreSQL roda em container Docker. Execute:

```bash
docker run -d --name lucrai-postgres ^
  -e POSTGRES_USER=lucrai ^
  -e POSTGRES_PASSWORD=lucrai123 ^
  -e POSTGRES_DB=lucrai ^
  -p 5432:5432 ^
  postgres:18
```

Para parar/iniciar depois:

```bash
docker stop lucrai-postgres
docker start lucrai-postgres
```

## Executar o Backend

```bash
cd backend/src/Lucrai.API
dotnet run 
ou
dotnet run --launch-profile http
```

O backend inicia em `http://localhost:5099`.

Na primeira execução, as migrations são aplicadas e os seed users são criados automaticamente.

## Executar o Frontend

Em outro terminal:

```bash
npm run dev
```

O frontend inicia em `http://localhost:3000`.

> **Importante**: limpe o IndexedDB/localStorage do navegador antes de testar
> (F12 → Application → IndexedDB → botão direito → Delete, e também limpe localStorage).

## Usuários para Teste

| Login | Senha | Nome | Cargo | Plano |
|---|---|---|---|---|
| `joao.ribeiro` | `123` | João Ribeiro | Owner | SuperAdmin |
| `vitoria.justo` | `123` | Vitória Justo | Admin | SuperAdmin |
| `fellype.gabriel` | `123` | Fellype Gabriel | Admin | SuperAdmin |
| `eduardo.contador` | `123` | Eduardo Contador | Admin | SuperAdmin |
| `lucrai.adm` | `Lucrai@1` | Gabriel Fellype | Admin | SuperAdmin |

> O usuário `lucrai.adm` é mantido para compatibilidade com testes automatizados.

## O que Testar

### 1. Primeiro Login (Troca de Senha Obrigatória)

1. Acesse `http://localhost:3000`
2. Faça login com qualquer um dos usuários acima
3. O sistema deve redirecionar para `/trocar-senha`
4. A nova senha deve atender à política:
   - Mínimo 6 caracteres
   - Pelo menos 1 letra maiúscula
   - Pelo menos 1 letra minúscula
   - Pelo menos 1 número
   - Pelo menos 1 caractere especial (`! @ # $ % & *`)
5. Após trocar a senha, o usuário é redirecionado para o dashboard
6. Logout e login novamente com a nova senha devem funcionar

### 2. SuperAdmin (Visão Cross-Company)

- Todos os seed users têm `Plan = SuperAdmin` e `Company = "Lucraí"`
- SuperAdmins veem dados de todas as empresas
- SuperAdmins são gratuitos (sem cobrança)
- No frontend, aparece um badge "Super Admin" no header/sidebar

### 3. Migrations

As seguintes migrations foram aplicadas ao banco:

- `AddUserPlanAndMustChangePassword` — adiciona campos `Plan` e `MustChangePassword`
- `FixUserPlanAndMustChangePasswordDefaults` — corrige defaults dos campos

## Executar Testes Automatizados

```bash
dotnet test backend/tests/Lucrai.API.Tests
```

Todos os 83 testes devem passar.


