import { supabase } from "@/lib/supabase";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionWithRelations,
} from "@/types/database.types";

export interface TransactionFilters {
  type?: "income" | "expense";
  status?: "pending" | "paid" | "overdue" | "cancelled";
  category_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Busca transações com filtros
 */
export async function getTransactions(
  filters?: TransactionFilters,
): Promise<TransactionWithRelations[]> {
  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*),
        account_transactions(account:accounts(*))
      `,
      )
      .order("date", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    // Filtrar por account_id requer uma abordagem diferente
    // pois a relação é através da tabela account_transactions
    let transactionIds: string[] | undefined;
    if (filters?.account_id) {
      const { data: accountTransactions } = await supabase
        .from("account_transactions")
        .select("transaction_id")
        .eq("account_id", filters.account_id);

      if (accountTransactions) {
        transactionIds = accountTransactions.map((at) => at.transaction_id);
        if (transactionIds.length > 0) {
          query = query.in("id", transactionIds);
        } else {
          // Se não há transações para esta conta, retornar array vazio
          return [];
        }
      }
    }

    if (filters?.start_date) {
      query = query.gte("date", filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte("date", filters.end_date);
    }

    if (filters?.search) {
      query = query.ilike("description", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }

    // Transform account_transactions array to single account object
    const transformedData = (data || []).map((transaction: any) => {
      const accountTransactions = transaction.account_transactions;
      return {
        ...transaction,
        account: accountTransactions?.[0]?.account || null,
        account_transactions: undefined, // Remove the intermediate table data
      };
    });

    return transformedData;
  } catch (error) {
    console.error("getTransactions error:", error);
    throw error;
  }
}

/**
 * Busca uma transação por ID
 */
export async function getTransactionById(id: string): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar transação: ${error.message}`);
    }

    if (!data) {
      throw new Error("Transação não encontrada");
    }

    return data;
  } catch (error) {
    console.error("getTransactionById error:", error);
    throw error;
  }
}

/**
 * Cria uma nova transação
 */
export async function createTransaction(
  data: TransactionInsert & { account_id?: string },
): Promise<Transaction> {
  try {
    // Buscar usuário autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Validações
    if (!data.type || !data.amount || !data.description) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    if (data.amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    if (data.status === "paid" && !data.payment_date) {
      throw new Error("Data de pagamento é obrigatória para transações pagas");
    }

    // Extrair account_id dos dados (não faz parte da tabela transactions)
    const { account_id, ...transactionData } = data;

    // Criar a transação
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        ...transactionData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    if (!transaction) {
      throw new Error("Erro ao criar transação");
    }

    // Se account_id foi fornecido e não é vazio, criar a relação na tabela account_transactions
    if (account_id && account_id !== "") {
      const { error: accountTransactionError } = await supabase
        .from("account_transactions")
        .insert({
          transaction_id: transaction.id,
          account_id: account_id,
        });

      if (accountTransactionError) {
        // Se falhar ao criar a relação, deletar a transação criada
        await supabase.from("transactions").delete().eq("id", transaction.id);
        throw new Error(
          `Erro ao vincular conta à transação: ${accountTransactionError.message}`,
        );
      }
    }

    return transaction;
  } catch (error) {
    console.error("createTransaction error:", error);
    throw error;
  }
}

/**
 * Atualiza uma transação
 */
export async function updateTransaction(
  id: string,
  updates: TransactionUpdate & { account_id?: string },
): Promise<Transaction> {
  try {
    // Validações
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    if (updates.status === "paid" && !updates.payment_date) {
      throw new Error("Data de pagamento é obrigatória para transações pagas");
    }

    // Extrair account_id dos updates (não faz parte da tabela transactions)
    const { account_id, ...transactionUpdates } = updates;

    // Atualizar a transação
    const { data, error } = await supabase
      .from("transactions")
      .update(transactionUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }

    if (!data) {
      throw new Error("Transação não encontrada");
    }

    // Se account_id foi fornecido e não é vazio, atualizar a relação na tabela account_transactions
    if (account_id !== undefined && account_id !== "") {
      // Primeiro, deletar a relação existente
      await supabase
        .from("account_transactions")
        .delete()
        .eq("transaction_id", id);

      // Depois, criar a nova relação
      const { error: accountTransactionError } = await supabase
        .from("account_transactions")
        .insert({
          transaction_id: id,
          account_id: account_id,
        });

      if (accountTransactionError) {
        throw new Error(
          `Erro ao atualizar conta da transação: ${accountTransactionError.message}`,
        );
      }
    }

    return data;
  } catch (error) {
    console.error("updateTransaction error:", error);
    throw error;
  }
}

/**
 * Deleta uma transação
 */
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }
  } catch (error) {
    console.error("deleteTransaction error:", error);
    throw error;
  }
}

/**
 * Marca transação como paga
 */
export async function markAsPaid(
  id: string,
  paymentDate?: string,
): Promise<void> {
  try {
    const date = paymentDate || new Date().toISOString().split("T")[0];

    const { error } = await supabase.rpc("mark_transaction_as_paid", {
      p_transaction_id: id,
      p_payment_date: date,
    });

    if (error) {
      throw new Error(`Erro ao marcar transação como paga: ${error.message}`);
    }
  } catch (error) {
    console.error("markAsPaid error:", error);
    throw error;
  }
}

/**
 * Busca transações recentes
 */
export async function getRecentTransactions(
  limit: number = 5,
): Promise<TransactionWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        category:categories(*),
        account_transactions(account:accounts(*))
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar transações recentes: ${error.message}`);
    }

    // Transform account_transactions array to single account object
    const transformedData = (data || []).map((transaction: any) => {
      const accountTransactions = transaction.account_transactions;
      return {
        ...transaction,
        account: accountTransactions?.[0]?.account || null,
        account_transactions: undefined, // Remove the intermediate table data
      };
    });

    return transformedData;
  } catch (error) {
    console.error("getRecentTransactions error:", error);
    throw error;
  }
}
