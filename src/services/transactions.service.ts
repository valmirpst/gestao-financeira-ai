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
        account:account_transactions(account:accounts(*))
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

    if (filters?.account_id) {
      query = query.eq("account_id", filters.account_id);
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

    return data || [];
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
  data: TransactionInsert,
): Promise<Transaction> {
  try {
    // Validações
    if (!data.type || !data.amount || !data.description) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    if (data.amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    if (data.status === "pending" && !data.due_date) {
      throw new Error(
        "Data de vencimento é obrigatória para transações pendentes",
      );
    }

    if (data.status === "paid" && !data.payment_date) {
      throw new Error("Data de pagamento é obrigatória para transações pagas");
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    if (!transaction) {
      throw new Error("Erro ao criar transação");
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
  updates: TransactionUpdate,
): Promise<Transaction> {
  try {
    // Validações
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error("O valor deve ser maior que zero");
    }

    if (updates.status === "pending" && !updates.due_date) {
      throw new Error(
        "Data de vencimento é obrigatória para transações pendentes",
      );
    }

    if (updates.status === "paid" && !updates.payment_date) {
      throw new Error("Data de pagamento é obrigatória para transações pagas");
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }

    if (!data) {
      throw new Error("Transação não encontrada");
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
        account:account_transactions(account:accounts(*))
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar transações recentes: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("getRecentTransactions error:", error);
    throw error;
  }
}
