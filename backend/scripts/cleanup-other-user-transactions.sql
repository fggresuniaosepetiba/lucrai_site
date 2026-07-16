-- Limpa registros de transacoes que NAO sao do usuario atual
-- (criados por seed/sistema com createdBy diferente)
-- 
-- Para usar:
--   1. Substitua 'SEU_EMAIL_AQUI' pelo seu email de usuario
--   2. Execute no banco de producao
--   3. Confirme que so os registros corretos serao afetados (SELECT primeiro)

-- Primeiro: verifique quantos registros serao afetados
SELECT COUNT(*) as registros_a_limpar
FROM "Transactions"
WHERE "CreatedBy" != 'SEU_EMAIL_AQUI'
  AND "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1);

-- Delete apenas se o SELECT acima mostrar registros que podem ser removidos
DELETE FROM "Transactions"
WHERE "CreatedBy" != 'SEU_EMAIL_AQUI'
  AND "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1);

-- Verifique o resultado
SELECT COUNT(*) as total_restante
FROM "Transactions"
WHERE "Company" = (SELECT "Company" FROM "Users" WHERE "Email" = 'SEU_EMAIL_AQUI' LIMIT 1);
