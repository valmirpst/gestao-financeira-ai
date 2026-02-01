import * as categoriesService from "@/services/categories.service";
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
  CategoryWithParent,
} from "@/types/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook para buscar todas as categorias
 */
export function useCategories() {
  return useQuery<CategoryWithParent[], Error>({
    queryKey: ["categories"],
    queryFn: categoriesService.getCategories,
  });
}

/**
 * Hook para buscar uma categoria por ID
 */
export function useCategory(id: string) {
  return useQuery<Category, Error>({
    queryKey: ["category", id],
    queryFn: () => categoriesService.getCategoryById(id),
    enabled: !!id,
  });
}

/**
 * Hook para criar categoria
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CategoryInsert>({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/**
 * Hook para atualizar categoria
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { id: string; updates: CategoryUpdate }>({
    mutationFn: ({ id, updates }) =>
      categoriesService.updateCategory(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
  });
}

/**
 * Hook para deletar categoria
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/**
 * Hook para criar categorias padrão
 */
export function useCreateDefaultCategories() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: categoriesService.createDefaultCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
