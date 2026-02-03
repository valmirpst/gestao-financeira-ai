-- =====================================================
-- CORREÇÃO: TRIGGERS PARA ATUALIZAR SALDO DAS CONTAS
-- =====================================================
-- Problema: Os triggers em 'transactions' não funcionam porque
-- quando uma transação é deletada, o CASCADE deleta account_transactions
-- ANTES do trigger executar, então não consegue encontrar o account_id.
--
-- Solução: Mover os triggers para account_transactions

-- =====================================================
-- 1. REMOVER TRIGGERS ANTIGOS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_account_balance_on_insert ON transactions;
DROP TRIGGER IF EXISTS trigger_update_account_balance_on_update ON transactions;
DROP TRIGGER IF EXISTS trigger_update_account_balance_on_delete ON transactions;

-- =====================================================
-- 2. CRIAR NOVA FUNÇÃO OTIMIZADA
-- =====================================================

CREATE OR REPLACE FUNCTION update_account_balance_from_account_transactions()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
  v_transaction_status VARCHAR(10);
BEGIN
  -- Determina o account_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    v_account_id := OLD.account_id;
    
    -- Busca o status da transação que está sendo deletada
    SELECT status INTO v_transaction_status
    FROM transactions
    WHERE id = OLD.transaction_id;
    
  ELSIF TG_OP = 'INSERT' THEN
    v_account_id := NEW.account_id;
    
    -- Busca o status da transação que está sendo inserida
    SELECT status INTO v_transaction_status
    FROM transactions
    WHERE id = NEW.transaction_id;
    
  ELSE -- UPDATE
    -- Para UPDATE, pode ter mudado de conta
    v_account_id := NEW.account_id;
    
    SELECT status INTO v_transaction_status
    FROM transactions
    WHERE id = NEW.transaction_id;
    
    -- Se mudou de conta, atualiza a conta antiga também
    IF OLD.account_id != NEW.account_id THEN
      UPDATE accounts
      SET 
        current_balance = initial_balance + (
          SELECT COALESCE(SUM(
            CASE 
              WHEN t.type = 'income' THEN t.amount 
              ELSE -t.amount 
            END
          ), 0)
          FROM transactions t
          JOIN account_transactions at ON t.id = at.transaction_id
          WHERE at.account_id = OLD.account_id
            AND t.status = 'paid'
        ),
        updated_at = NOW()
      WHERE id = OLD.account_id;
    END IF;
  END IF;

  -- Atualiza o saldo da conta (nova ou atual)
  UPDATE accounts
  SET 
    current_balance = initial_balance + (
      SELECT COALESCE(SUM(
        CASE 
          WHEN t.type = 'income' THEN t.amount 
          ELSE -t.amount 
        END
      ), 0)
      FROM transactions t
      JOIN account_transactions at ON t.id = at.transaction_id
      WHERE at.account_id = v_account_id
        AND t.status = 'paid'
    ),
    updated_at = NOW()
  WHERE id = v_account_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CRIAR TRIGGERS EM account_transactions
-- =====================================================

CREATE TRIGGER trigger_update_balance_on_account_transaction_insert
  AFTER INSERT ON account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_from_account_transactions();

CREATE TRIGGER trigger_update_balance_on_account_transaction_delete
  BEFORE DELETE ON account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_from_account_transactions();

CREATE TRIGGER trigger_update_balance_on_account_transaction_update
  AFTER UPDATE ON account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_from_account_transactions();

-- =====================================================
-- 4. CRIAR TRIGGER PARA MUDANÇAS NA TRANSAÇÃO
-- =====================================================
-- Este trigger atualiza quando o status, valor ou tipo da transação muda

CREATE OR REPLACE FUNCTION update_account_balance_on_transaction_change()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Busca a conta associada a esta transação
  SELECT account_id INTO v_account_id
  FROM account_transactions
  WHERE transaction_id = NEW.id
  LIMIT 1;

  -- Se encontrou a conta, atualiza o saldo
  IF v_account_id IS NOT NULL THEN
    UPDATE accounts
    SET 
      current_balance = initial_balance + (
        SELECT COALESCE(SUM(
          CASE 
            WHEN t.type = 'income' THEN t.amount 
            ELSE -t.amount 
          END
        ), 0)
        FROM transactions t
        JOIN account_transactions at ON t.id = at.transaction_id
        WHERE at.account_id = v_account_id
          AND t.status = 'paid'
      ),
      updated_at = NOW()
    WHERE id = v_account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance_on_transaction_change
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (
    (OLD.status != NEW.status) OR 
    (OLD.amount != NEW.amount) OR 
    (OLD.type != NEW.type)
  )
  EXECUTE FUNCTION update_account_balance_on_transaction_change();

-- =====================================================
-- 5. RECALCULAR TODOS OS SALDOS
-- =====================================================

SELECT * FROM recalculate_all_account_balances();

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================
