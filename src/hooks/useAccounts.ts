import * as accountsService from "@/services/accounts.service";
import type {
  Account,
  AccountInsert,
  AccountUpdate,
  AccountWithProjection,
} from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook para buscar todas as contas
 */
export function useAccounts() {
  return useQuery<AccountWithProjection[], Error>({
    queryKey: ["accounts"],
    queryFn: accountsService.getAccounts,
  });
}

/**
 * Hook para buscar contas ativas
 */
export function useActiveAccounts() {
  return useQuery<AccountWithProjection[], Error>({
    queryKey: ["accounts", "active"],
    queryFn: accountsService.getActiveAccounts,
  });
}

/**
 * Hook para buscar uma conta por ID
 */
export function useAccount(id: string) {
  return useQuery<AccountWithProjection, Error>({
    queryKey: ["account", id],
    queryFn: () => accountsService.getAccountById(id),
    enabled: !!id,
  });
}

/**
 * Hook para criar conta
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, AccountInsert>({
    mutationFn: accountsService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });
}

/**
 * Hook para atualizar conta
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, { id: string; updates: AccountUpdate }>({
    mutationFn: ({ id, updates }) => accountsService.updateAccount(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["account", variables.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar conta");
    },
  });
}

/**
 * Hook para remover conta (soft delete)
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: accountsService.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao arquivar conta");
    },
  });
}

/**
 * Hook para criar transferência entre contas
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      date: string;
      description: string;
      status?: "pending" | "paid";
      dueDate?: string;
    }
  >({
    mutationFn: ({
      fromAccountId,
      toAccountId,
      amount,
      date,
      description,
      status,
      dueDate,
    }) =>
      accountsService.createTransfer(
        fromAccountId,
        toAccountId,
        amount,
        date,
        description,
        status,
        dueDate,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar transferência");
    },
  });
}
