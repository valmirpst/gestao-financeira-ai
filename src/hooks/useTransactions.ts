import type { TransactionFilters } from "@/services/transactions.service";
import * as transactionsService from "@/services/transactions.service";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionWithRelations,
} from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook para buscar transações com filtros
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery<TransactionWithRelations[], Error>({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsService.getTransactions(filters),
  });
}

/**
 * Hook para buscar uma transação por ID
 */
export function useTransaction(id: string) {
  return useQuery<Transaction, Error>({
    queryKey: ["transaction", id],
    queryFn: () => transactionsService.getTransactionById(id),
    enabled: !!id,
  });
}

/**
 * Hook para buscar transações recentes
 */
export function useRecentTransactions(limit: number = 5) {
  return useQuery<TransactionWithRelations[], Error>({
    queryKey: ["transactions", "recent", limit],
    queryFn: () => transactionsService.getRecentTransactions(limit),
  });
}

/**
 * Hook para criar transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, TransactionInsert>({
    mutationFn: transactionsService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation<
    Transaction,
    Error,
    { id: string; updates: TransactionUpdate }
  >({
    mutationFn: ({ id, updates }) =>
      transactionsService.updateTransaction(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", variables.id],
      });
    },
  });
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: transactionsService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Hook para marcar transação como paga
 */
export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; paymentDate?: string }>({
    mutationFn: ({ id, paymentDate }) =>
      transactionsService.markAsPaid(id, paymentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
