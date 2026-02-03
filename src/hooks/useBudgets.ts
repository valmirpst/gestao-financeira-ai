import * as budgetsService from "@/services/budgets.service";
import type {
  Budget,
  BudgetInsert,
  BudgetUpdate,
  BudgetWithUsage,
} from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BUDGETS_QUERY_KEY = ["budgets"];

/**
 * Hook to fetch all budgets
 */
export function useBudgets() {
  return useQuery<BudgetWithUsage[]>({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: budgetsService.getBudgets,
  });
}

/**
 * Hook to fetch a single budget by ID
 */
export function useBudget(id: string) {
  return useQuery<BudgetWithUsage>({
    queryKey: [...BUDGETS_QUERY_KEY, id],
    queryFn: () => budgetsService.getBudgetById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, BudgetInsert>({
    mutationFn: budgetsService.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation<Budget, Error, { id: string; data: BudgetUpdate }>({
    mutationFn: ({ id, data }) => budgetsService.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: budgetsService.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
