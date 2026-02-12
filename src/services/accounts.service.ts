import { supabase } from "@/lib/supabase";
import type {
  Account,
  AccountInsert,
  AccountUpdate,
  AccountWithProjection,
} from "@/types/database.types";

/**
 * Busca todas as contas do usuário com saldo atual e projetado
 */
export async function getAccounts(): Promise<AccountWithProjection[]> {
  try {
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(`Erro ao buscar contas: ${error.message}`);
    }

    if (!accounts) {
      return [];
    }

    // Calcular saldo projetado para cada conta
    const accountsWithProjection = await Promise.all(
      accounts.map(async (account) => {
        const projectedBalance = await calculateProjectedBalance(account.id);
        return {
          ...account,
          projected_balance: projectedBalance,
        };
      }),
    );

    return accountsWithProjection;
  } catch (error) {
    console.error("getAccounts error:", error);
    throw error;
  }
}

/**
 * Busca contas ativas
 */
export async function getActiveAccounts(): Promise<AccountWithProjection[]> {
  try {
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      throw new Error(`Erro ao buscar contas ativas: ${error.message}`);
    }

    if (!accounts) {
      return [];
    }

    // Calcular saldo projetado para cada conta
    const accountsWithProjection = await Promise.all(
      accounts.map(async (account) => {
        const projectedBalance = await calculateProjectedBalance(account.id);
        return {
          ...account,
          projected_balance: projectedBalance,
        };
      }),
    );

    return accountsWithProjection;
  } catch (error) {
    console.error("getActiveAccounts error:", error);
    throw error;
  }
}

/**
 * Busca uma conta por ID
 */
export async function getAccountById(
  id: string,
): Promise<AccountWithProjection> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar conta: ${error.message}`);
    }

    if (!data) {
      throw new Error("Conta não encontrada");
    }

    const projectedBalance = await calculateProjectedBalance(id);

    return {
      ...data,
      projected_balance: projectedBalance,
    };
  } catch (error) {
    console.error("getAccountById error:", error);
    throw error;
  }
}

/**
 * Cria uma nova conta
 */
export async function createAccount(data: AccountInsert): Promise<Account> {
  try {
    // Buscar usuário autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Validações
    if (!data.name || !data.type) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    if (data.name.length < 2 || data.name.length > 100) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    const { data: account, error } = await supabase
      .from("accounts")
      .insert({
        ...data,
        user_id: user.id,
        current_balance: data.initial_balance,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma conta com este nome");
      }
      throw new Error(`Erro ao criar conta: ${error.message}`);
    }

    if (!account) {
      throw new Error("Erro ao criar conta");
    }

    return account;
  } catch (error) {
    console.error("createAccount error:", error);
    throw error;
  }
}

/**
 * Atualiza uma conta
 */
export async function updateAccount(
  id: string,
  updates: AccountUpdate,
): Promise<Account> {
  try {
    // Validações
    if (
      updates.name !== undefined &&
      (updates.name.length < 2 || updates.name.length > 100)
    ) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    // @ts-ignore - Supabase type mismatch
    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma conta com este nome");
      }
      throw new Error(`Erro ao atualizar conta: ${error.message}`);
    }

    if (!data) {
      throw new Error("Conta não encontrada");
    }

    return data;
  } catch (error) {
    console.error("updateAccount error:", error);
    throw error;
  }
}

/**
 * Deleta uma conta (soft delete - marca como inativa)
 */
export async function deleteAccount(id: string): Promise<void> {
  try {
    // Verificar se a conta tem transações
    const { data: transactions, error: transactionsError } = await supabase
      .from("account_transactions")
      .select("id")
      .eq("account_id", id)
      .limit(1);

    if (transactionsError) {
      throw new Error(
        `Erro ao verificar transações: ${transactionsError.message}`,
      );
    }

    if (transactions && transactions.length > 0) {
      // Não permitir remover conta com transações, apenas arquivar
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao arquivar conta: ${error.message}`);
      }
    } else {
      // Se não tem transações, pode remover
      const { error } = await supabase.from("accounts").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro ao remover conta: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("deleteAccount error:", error);
    throw error;
  }
}

/**
 * Cria uma transferência entre contas
 */
export async function createTransfer(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  date: string,
  description: string,
  status: "pending" | "paid" = "paid",
  dueDate?: string,
): Promise<void> {
  try {
    // Validações
    if (!fromAccountId || !toAccountId || !amount || !date || !description) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    if (fromAccountId === toAccountId) {
      throw new Error("Não é possível transferir para a mesma conta");
    }

    if (amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    if (status === "pending" && !dueDate) {
      throw new Error(
        "Data de vencimento é obrigatória para transferências pendentes",
      );
    }

    // Gerar transfer_id único para vincular as duas transações
    const transferId = crypto.randomUUID();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Buscar ou criar categoria "Transferência"
    let transferCategoryId: string | null = null;
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", "Transferência")
      .limit(1);

    if (categories && categories.length > 0) {
      transferCategoryId = categories[0].id;
    } else {
      // Criar categoria "Transferência"
      const { data: newCategory } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: "Transferência",
          type: "both",
          color: "#64748b",
          icon: "arrow-right-left",
          parent_category_id: null,
        })
        .select("id")
        .single();

      if (newCategory) {
        transferCategoryId = newCategory.id;
      }
    }

    // Criar transação de saída (expense)
    const expenseData = {
      user_id: user.id,
      type: "expense" as const,
      amount,
      category_id: transferCategoryId,
      description: `Transferência: ${description}`,
      date: status === "paid" ? date : new Date().toISOString().split("T")[0],
      due_date: status === "pending" ? dueDate : null,
      status,
      is_recurring: false,
      recurrence_config: null,
      tags: ["transferência"],
      payment_date: status === "paid" ? date : null,
      transfer_id: transferId,
    };

    const { data: expenseTransaction, error: expenseError } = await supabase
      .from("transactions")
      .insert(expenseData)
      .select()
      .single();

    if (expenseError || !expenseTransaction) {
      throw new Error(
        `Erro ao criar transação de saída: ${expenseError?.message}`,
      );
    }

    // Vincular transação de saída à conta de origem
    const { error: expenseAccountError } = await supabase
      .from("account_transactions")
      .insert({
        transaction_id: expenseTransaction.id,
        account_id: fromAccountId,
      });

    if (expenseAccountError) {
      throw new Error(
        `Erro ao vincular conta de origem: ${expenseAccountError.message}`,
      );
    }

    // Criar transação de entrada (income)
    const incomeData = {
      user_id: user.id,
      type: "income" as const,
      amount,
      category_id: transferCategoryId,
      description: `Transferência: ${description}`,
      date: status === "paid" ? date : new Date().toISOString().split("T")[0],
      due_date: status === "pending" ? dueDate : null,
      status,
      is_recurring: false,
      recurrence_config: null,
      tags: ["transferência"],
      payment_date: status === "paid" ? date : null,
      transfer_id: transferId,
    };

    const { data: incomeTransaction, error: incomeError } = await supabase
      .from("transactions")
      .insert(incomeData)
      .select()
      .single();

    if (incomeError || !incomeTransaction) {
      throw new Error(
        `Erro ao criar transação de entrada: ${incomeError?.message}`,
      );
    }

    // Vincular transação de entrada à conta de destino
    const { error: incomeAccountError } = await supabase
      .from("account_transactions")
      .insert({
        transaction_id: incomeTransaction.id,
        account_id: toAccountId,
      });

    if (incomeAccountError) {
      throw new Error(
        `Erro ao vincular conta de destino: ${incomeAccountError.message}`,
      );
    }
  } catch (error) {
    console.error("createTransfer error:", error);
    throw error;
  }
}

/**
 * Calcula o saldo projetado de uma conta
 * Saldo projetado = saldo atual + receitas pendentes - despesas pendentes
 */
async function calculateProjectedBalance(accountId: string): Promise<number> {
  try {
    // Buscar conta para pegar saldo atual
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("current_balance")
      .eq("id", accountId)
      .single();

    if (accountError || !account) {
      return 0;
    }

    // Buscar transações pendentes e vencidas da conta
    const { data: accountTransactions, error: transactionsError } =
      await supabase
        .from("account_transactions")
        .select("transaction_id")
        .eq("account_id", accountId);

    if (transactionsError || !accountTransactions) {
      return account.current_balance;
    }

    const transactionIds = accountTransactions.map((at) => at.transaction_id);

    if (transactionIds.length === 0) {
      return account.current_balance;
    }

    const { data: pendingTransactions, error: pendingError } = await supabase
      .from("transactions")
      .select("type, amount")
      .in("id", transactionIds)
      .in("status", ["pending", "overdue"]);

    if (pendingError || !pendingTransactions) {
      return account.current_balance;
    }

    // Calcular total de receitas e despesas pendentes
    let pendingIncome = 0;
    let pendingExpense = 0;

    pendingTransactions.forEach((transaction) => {
      if (transaction.type === "income") {
        pendingIncome += transaction.amount;
      } else {
        pendingExpense += transaction.amount;
      }
    });

    // Saldo projetado = saldo atual + receitas pendentes - despesas pendentes
    return account.current_balance + pendingIncome - pendingExpense;
  } catch (error) {
    console.error("calculateProjectedBalance error:", error);
    return 0;
  }
}
/**
 * Força o recálculo do saldo de uma conta específica
 */
export async function recalculateAccountBalance(
  accountId: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc("recalculate_account_balance", {
      p_account_id: accountId,
    });

    if (error) {
      throw new Error(`Erro ao recalcular saldo: ${error.message}`);
    }
  } catch (error) {
    console.error("recalculateAccountBalance error:", error);
    throw error;
  }
}

/**
 * Força o recálculo de TODAS as contas
 */
export async function recalculateAllBalances(): Promise<void> {
  try {
    const { error } = await supabase.rpc("recalculate_all_account_balances");

    if (error) {
      throw new Error(`Erro ao recalcular saldos: ${error.message}`);
    }
  } catch (error) {
    console.error("recalculateAllBalances error:", error);
    throw error;
  }
}
