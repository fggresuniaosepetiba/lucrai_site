-- MOVE registros #001-#005 da empresa "Lucraí" para a lixeira
-- Estes sao registros de seed que pertencem a outro createdBy
--
-- EXECUTE EM ORDEM: PASSO 1 -> PASSO 2 -> PASSO 3

-- PASSO 1: Confira quais registros serao afetados
SELECT "Id", "DisplayId", "Description", "Value", "Date", "CreatedBy"
FROM "Transactions"
WHERE "DisplayId" IN ('#001', '#002', '#003', '#004', '#005')
  AND "Company" = 'Lucraí';

-- PASSO 2: Move para a lixeira (DeletedItems) e remove de Transactions
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT * FROM "Transactions"
        WHERE "DisplayId" IN ('#001', '#002', '#003', '#004', '#005')
          AND "Company" = 'Lucraí'
    LOOP
        INSERT INTO "DeletedItems" (
            "Id",
            "OriginalId",
            "DisplayId",
            "EntryType",
            "Type",
            "Value",
            "CategoryId",
            "CategoryName",
            "Description",
            "Date",
            "Observation",
            "Amount",
            "Category",
            "ExpectedDate",
            "Notes",
            "Status",
            "CancelledReason",
            "CancelledAt",
            "CancelledBy",
            "CreatedAt",
            "UpdatedAt",
            "Company",
            "DeletedAt",
            "Reason",
            "RestoreUntil"
        ) VALUES (
            gen_random_uuid(),
            rec."Id",
            rec."DisplayId",
            0,
            rec."Type",
            rec."Value",
            rec."CategoryId",
            rec."CategoryName",
            rec."Description",
            rec."Date",
            rec."Observation",
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NOW(),
            NOW(),
            rec."Company",
            NOW(),
            'Registro orfao de seed',
            NOW() + INTERVAL '30 days'
        );

        DELETE FROM "Transactions"
        WHERE "Id" = rec."Id";
    END LOOP;
END $$;

-- PASSO 3: Confira o resultado
SELECT COUNT(*) as registros_movidos_para_lixeira
FROM "DeletedItems"
WHERE "DisplayId" IN ('#001', '#002', '#003', '#004', '#005')
  AND "Reason" = 'Registro orfao de seed';
