-- =====================================================
-- SCHEMA SQL COMPLETO - SISTEMA DE GESTÃO FINANCEIRA
-- =====================================================
-- Stack: Supabase (PostgreSQL)
-- Versão: 1.0
-- Data: 2026-01-30
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar pg_cron para jobs agendados
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- 2. TABELAS
-- =====================================================

-- -----------------------------------------------------
-- Tabela: categories
-- -----------------------------------------------------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon VARCHAR(50) NOT NULL,
  parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name),
  CONSTRAINT no_self_reference CHECK (id != parent_category_id)
);

-- -----------------------------------------------------
-- Tabela: accounts
-- -----------------------------------------------------
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'investment', 'other')),
  initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_account_name_per_user UNIQUE (user_id, name)
);

-- -----------------------------------------------------
-- Tabela: transactions
-- -----------------------------------------------------
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description VARCHAR(200) NOT NULL CHECK (LENGTH(description) >= 3),
  date DATE NOT NULL,
  due_date DATE,
  status VARCHAR(10) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_config JSONB,
  tags TEXT[] DEFAULT '{}',
  payment_date DATE,
  transfer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT due_date_required_when_pending CHECK (
    (status = 'pending' AND due_date IS NOT NULL) OR 
    (status != 'pending')
  ),
  CONSTRAINT payment_date_required_when_paid CHECK (
    (status = 'paid' AND payment_date IS NOT NULL) OR 
    (status != 'paid')
  ),
  CONSTRAINT recurrence_config_required_when_recurring CHECK (
    (is_recurring = TRUE AND recurrence_config IS NOT NULL) OR 
    (is_recurring = FALSE)
  ),
  CONSTRAINT payment_date_not_future CHECK (
    payment_date IS NULL OR payment_date <= CURRENT_DATE + INTERVAL '1 day'
  )
);

-- -----------------------------------------------------
-- Tabela: account_transactions (relação N:N)
-- -----------------------------------------------------
CREATE TABLE account_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_transaction_account UNIQUE (transaction_id, account_id)
);

-- -----------------------------------------------------
-- Tabela: budgets
-- -----------------------------------------------------
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(10) NOT NULL CHECK (period IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT end_date_after_start_date CHECK (end_date IS NULL OR end_date > start_date)
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);

-- Índices para accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);

-- Índices para transactions (mais críticos)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_payment_date ON transactions(payment_date);
CREATE INDEX idx_transactions_transfer_id ON transactions(transfer_id);

-- Índice composto para queries comuns
CREATE INDEX idx_transactions_user_status_date ON transactions(user_id, status, date);
CREATE INDEX idx_transactions_user_type_status ON transactions(user_id, type, status);
CREATE INDEX idx_transactions_pending_overdue ON transactions(status, due_date) WHERE status IN ('pending', 'overdue');

-- Índices para account_transactions
CREATE INDEX idx_account_transactions_transaction_id ON account_transactions(transaction_id);
CREATE INDEX idx_account_transactions_account_id ON account_transactions(account_id);

-- Índices para budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: update_account_balance_from_account_transactions
-- Atualiza o saldo da conta quando account_transactions muda
-- IMPORTANTE: Esta função é chamada ANTES do CASCADE, garantindo
-- que o account_id seja capturado corretamente
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- Function: update_account_balance_on_transaction_change
-- Atualiza o saldo quando status, valor ou tipo da transação muda
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- Function: mark_overdue_transactions
-- Marca transações pendentes como vencidas (overdue)
-- Executada diariamente via pg_cron
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION mark_overdue_transactions()
RETURNS void AS $$
BEGIN
  UPDATE transactions
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Function: recalculate_all_account_balances
-- Recalcula o saldo de todas as contas baseado nas transações pagas
-- Útil para corrigir inconsistências
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_all_account_balances()
RETURNS void AS $$
BEGIN
  WITH balance_calculations AS (
    SELECT 
      a.id,
      a.name,
      a.current_balance as old_balance,
      a.initial_balance + COALESCE(SUM(
        CASE 
          WHEN t.type = 'income' THEN t.amount 
          ELSE -t.amount 
        END
      ), 0) as calculated_balance
    FROM accounts a
    LEFT JOIN account_transactions at ON a.id = at.account_id
    LEFT JOIN transactions t ON at.transaction_id = t.id AND t.status = 'paid'
    GROUP BY a.id, a.name, a.current_balance, a.initial_balance
  )
  UPDATE accounts
  SET 
    current_balance = bc.calculated_balance,
    updated_at = NOW()
  FROM balance_calculations bc
  WHERE accounts.id = bc.id
    AND accounts.current_balance != bc.calculated_balance;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Function: recalculate_account_balance
-- Recalcula o saldo de uma conta específica
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_account_balance(p_account_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET 
    current_balance = initial_balance + COALESCE((
      SELECT SUM(
        CASE 
          WHEN t.type = 'income' THEN t.amount 
          ELSE -t.amount 
        END
      )
      FROM transactions t
      JOIN account_transactions at ON t.id = at.transaction_id
      WHERE at.account_id = p_account_id
        AND t.status = 'paid'
    ), 0),
    updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Function: mark_transaction_as_paid
-- Marca uma transação como paga e atualiza campos relacionados
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION mark_transaction_as_paid(
  p_transaction_id UUID,
  p_payment_date DATE DEFAULT CURRENT_DATE
)
RETURNS void AS $$
BEGIN
  -- Validação: payment_date não pode ser futura (além de 1 dia)
  IF p_payment_date > CURRENT_DATE + INTERVAL '1 day' THEN
    RAISE EXCEPTION 'Payment date cannot be more than 1 day in the future';
  END IF;

  -- Atualiza a transação
  UPDATE transactions
  SET
    status = 'paid',
    payment_date = p_payment_date,
    date = p_payment_date,
    updated_at = NOW()
  WHERE id = p_transaction_id
    AND status IN ('pending', 'overdue');

  -- Verifica se alguma linha foi atualizada
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or not in pending/overdue status';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Function: update_updated_at_column
-- Atualiza automaticamente o campo updated_at
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- Trigger: Atualizar saldo da conta quando account_transactions muda
-- IMPORTANTE: Triggers em account_transactions ao invés de transactions
-- para capturar account_id ANTES do CASCADE
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- Trigger: Atualizar saldo quando transação muda (status, valor, tipo)
-- -----------------------------------------------------
CREATE TRIGGER trigger_update_balance_on_transaction_change
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (
    (OLD.status != NEW.status) OR 
    (OLD.amount != NEW.amount) OR 
    (OLD.type != NEW.type)
  )
  EXECUTE FUNCTION update_account_balance_on_transaction_change();

-- -----------------------------------------------------
-- Trigger: Atualizar updated_at automaticamente
-- -----------------------------------------------------
CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- Políticas RLS para categories
-- -----------------------------------------------------
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para accounts
-- -----------------------------------------------------
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para transactions
-- -----------------------------------------------------
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para account_transactions
-- -----------------------------------------------------
CREATE POLICY "Users can view their own account_transactions"
  ON account_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = account_transactions.transaction_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own account_transactions"
  ON account_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = account_transactions.transaction_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own account_transactions"
  ON account_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = account_transactions.transaction_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own account_transactions"
  ON account_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = account_transactions.transaction_id
        AND t.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- Políticas RLS para budgets
-- -----------------------------------------------------
CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. AGENDAMENTO DE JOBS (pg_cron)
-- =====================================================

-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- -----------------------------------------------------
-- Job: Marcar transações vencidas diariamente às 00:00
-- -----------------------------------------------------
SELECT cron.schedule(
  'mark-overdue-transactions-daily',
  '0 0 * * *', -- Executa diariamente à meia-noite
  $$SELECT mark_overdue_transactions()$$
);

-- -----------------------------------------------------
-- Função: Processar Recorrências
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS void AS $$
DECLARE
  r RECORD;
  next_run_date DATE;
  new_next_run_date DATE;
  new_transaction_id UUID;
  v_frequency TEXT;
  v_interval INT;
BEGIN
  -- Selecionar transações recorrentes agendadas para hoje ou antes
  FOR r IN 
    SELECT * FROM transactions 
    WHERE is_recurring = TRUE 
    AND (recurrence_config->>'next_run')::DATE <= CURRENT_DATE
  LOOP
    
    v_frequency := r.recurrence_config->>'frequency';
    v_interval := COALESCE((r.recurrence_config->>'interval')::INT, 1);
    next_run_date := (r.recurrence_config->>'next_run')::DATE;
    
    -- Calcular PRÓXIMA data de execução (para atualizar a original)
    CASE v_frequency
      WHEN 'daily' THEN new_next_run_date := next_run_date + v_interval;
      WHEN 'weekly' THEN new_next_run_date := next_run_date + (v_interval * 7);
      WHEN 'monthly' THEN new_next_run_date := next_run_date + INTERVAL '1 month' * v_interval;
      WHEN 'yearly' THEN new_next_run_date := next_run_date + INTERVAL '1 year' * v_interval;
      ELSE new_next_run_date := NULL;
    END CASE;

    IF new_next_run_date IS NOT NULL THEN
      -- Inserir nova transação (Filha)
      INSERT INTO transactions (
        user_id, type, amount, category_id, description, 
        date, due_date, status, 
        is_recurring, recurrence_config, 
        tags, payment_date
      ) VALUES (
        r.user_id, r.type, r.amount, r.category_id, r.description,
        -- Date (Competência): Será a data agendada (next_run_date)
        next_run_date,
        -- Due Date (Vencimento): Se pendente, é a data agendada. Se paga, nulo.
        CASE WHEN r.status = 'pending' THEN next_run_date ELSE NULL END,
        -- Status: Mantém o original
        r.status, 
        -- Is Recurring: Filha não é recorrente (falso)
        FALSE, 
        NULL, 
        r.tags,
        -- Payment Date: Se paga, é a data agendada.
        CASE WHEN r.status = 'paid' THEN next_run_date ELSE NULL END
      ) RETURNING id INTO new_transaction_id;
      
      -- Copiar vínculo com conta (account_transactions)
      INSERT INTO account_transactions (account_id, transaction_id)
      SELECT account_id, new_transaction_id
      FROM account_transactions
      WHERE transaction_id = r.id;

      -- Atualizar a transação original com a NOVA próxima data
      UPDATE transactions 
      SET recurrence_config = jsonb_set(
        recurrence_config, 
        '{next_run}', 
        to_jsonb(to_char(new_next_run_date, 'YYYY-MM-DD'))
      ),
      updated_at = NOW()
      WHERE id = r.id;
      
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- Job: Processar Recorrências diariamente às 03:00
-- -----------------------------------------------------
SELECT cron.schedule(
  'process-recurring-transactions', 
  '0 3 * * *', 
  $$SELECT process_recurring_transactions()$$
);

-- =====================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE categories IS 'Categorias de receitas e despesas do usuário';
COMMENT ON TABLE accounts IS 'Contas bancárias e carteiras do usuário';
COMMENT ON TABLE transactions IS 'Transações financeiras (receitas e despesas)';
COMMENT ON TABLE account_transactions IS 'Relação entre transações e contas';
COMMENT ON TABLE budgets IS 'Orçamentos definidos por categoria e período';

COMMENT ON COLUMN transactions.status IS 'Status: pending (agendada), paid (paga), overdue (vencida), cancelled (cancelada)';
COMMENT ON COLUMN transactions.due_date IS 'Data de vencimento (obrigatória para status pending)';
COMMENT ON COLUMN transactions.payment_date IS 'Data efetiva do pagamento (obrigatória para status paid)';
COMMENT ON COLUMN transactions.date IS 'Data efetiva da transação (igual a payment_date quando paga)';
COMMENT ON COLUMN transactions.recurrence_config IS 'Configuração de recorrência em formato JSON: {frequency, interval, end_date}';
COMMENT ON COLUMN transactions.transfer_id IS 'UUID para vincular transferências entre contas (mesma transferência = mesmo transfer_id)';

COMMENT ON COLUMN accounts.current_balance IS 'Saldo atual calculado automaticamente baseado em transações pagas';
COMMENT ON COLUMN accounts.initial_balance IS 'Saldo inicial da conta';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
