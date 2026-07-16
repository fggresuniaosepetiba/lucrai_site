-- LIMPEZA: Remove registros de transacoes que NAO sao do usuario atual
-- 
-- COMO USAR:
--   1. Substitua 'SEU_EMAIL_AQUI' pelo seu email de login
--   2. Execute cada bloco em ordem, um de cada vez
--   3. PASSO 2: so prossiga se o COUNT parecer correto

-- PASSO 1: Descubra seu UserId (apenas para conferencia)
SELECT "Id" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI';

-- PASSO 2: Confira quantas transacoes serao afetadas
SELECT COUNT(*) FROM "Transactions"
WHERE "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1)
  AND "CreatedBy" != (SELECT "Id" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1);

-- PASSO 3: Delete as transacoes (so execute se o PASSO 2 fez sentido)
DELETE FROM "Transactions"
WHERE "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1)
  AND "CreatedBy" != (SELECT "Id" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1);

-- PASSO 4: (opcional) Deletar AuditLogs desses registros
DELETE FROM "AuditLogs"
WHERE "EntityType" = 'transaction'
  AND "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1)
  AND "DisplayId" IN ('#001', '#002', '#003', '#004', '#005');
