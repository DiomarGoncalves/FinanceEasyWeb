-- Adicionar uma nova coluna (exemplo)
ALTER TABLE credit_cards ADD COLUMN example_column TEXT;

-- Modificar uma coluna existente (exemplo)
ALTER TABLE credit_cards ALTER COLUMN credit_limit TYPE NUMERIC(15, 2);

-- Verificar a estrutura da tabela
SELECT * FROM information_schema.columns WHERE table_name = 'credit_cards';
