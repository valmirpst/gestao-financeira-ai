-- =====================================================
-- DROP ALL - RESET COMPLETO DO BANCO DE DADOS
-- =====================================================
-- ATENÇÃO: Este script apaga TUDO. Use com cuidado!
-- =====================================================

-- =====================================================
-- 1. REMOVER JOBS AGENDADOS (pg_cron)
-- =====================================================

-- Remove jobs do pg_cron (se existirem)
DO $$ 
BEGIN
  -- Remove job de processar recorrências
  PERFORM cron.unschedule('process-recurring-transactions');
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Remove job de marcar transações vencidas
  PERFORM cron.unschedule('mark-overdue-transactions-daily');
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- 2. REMOVER TRIGGERS
-- =====================================================

-- Triggers de updated_at
DROP TRIGGER IF EXISTS trigger_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS trigger_accounts_updated_at ON accounts;

-- Trigger de atualização de saldo quando transação muda
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction_change ON transactions;

-- Triggers de atualização de saldo via account_transactions
DROP TRIGGER IF EXISTS trigger_update_balance_on_account_transaction_update ON account_transactions;
DROP TRIGGER IF EXISTS trigger_update_balance_on_account_transaction_delete ON account_transactions;
DROP TRIGGER IF EXISTS trigger_update_balance_on_account_transaction_insert ON account_transactions;

-- =====================================================
-- 3. REMOVER FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS process_recurring_transactions();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS mark_transaction_as_paid(UUID, DATE);
DROP FUNCTION IF EXISTS recalculate_account_balance(UUID);
DROP FUNCTION IF EXISTS recalculate_all_account_balances();
DROP FUNCTION IF EXISTS mark_overdue_transactions();
DROP FUNCTION IF EXISTS update_account_balance_on_transaction_change();
DROP FUNCTION IF EXISTS update_account_balance_from_account_transactions();

-- =====================================================
-- 4. REMOVER POLÍTICAS RLS
-- =====================================================

-- Políticas para budgets
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;

-- Políticas para account_transactions
DROP POLICY IF EXISTS "Users can delete their own account_transactions" ON account_transactions;
DROP POLICY IF EXISTS "Users can update their own account_transactions" ON account_transactions;
DROP POLICY IF EXISTS "Users can insert their own account_transactions" ON account_transactions;
DROP POLICY IF EXISTS "Users can view their own account_transactions" ON account_transactions;

-- Políticas para transactions
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

-- Políticas para accounts
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;

-- Políticas para categories
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;

-- =====================================================
-- 5. REMOVER TABELAS (ordem reversa respeitando dependências)
-- =====================================================

-- Tabelas dependentes primeiro
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS account_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- 6. REMOVER EXTENSÕES (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo se quiser remover as extensões também
-- ATENÇÃO: Isso pode afetar outros schemas que usam essas extensões!

-- DROP EXTENSION IF EXISTS pg_cron CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- =====================================================
-- FIM DO RESET
-- =====================================================

-- Mensagem de confirmação
DO $$ 
BEGIN 
  RAISE NOTICE 'Database reset completed successfully! All objects have been dropped.';
END $$;
