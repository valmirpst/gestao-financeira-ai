import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useCategories,
  useCreateDefaultCategories,
} from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/database.types";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Edit, Loader2, Plus, Tags } from "lucide-react";
import { useMemo, useState } from "react";

export default function Categories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);

  // Fetch data
  const { data: categories = [], isLoading } = useCategories();
  const {
    mutateAsync: createDefaultCategories,
    isPending: isCreatingDefaultCategories,
  } = useCreateDefaultCategories();

  // Get current month dates
  const today = new Date();
  const startDate = format(startOfMonth(today), "yyyy-MM-dd");
  const endDate = format(endOfMonth(today), "yyyy-MM-dd");

  // Fetch transactions for current month (paid only)
  const { data: transactions = [] } = useTransactions({
    start_date: startDate,
    end_date: endDate,
    status: "paid",
  });

  // Group categories by type
  const categoriesByType = useMemo(() => {
    const income: Category[] = [];
    const expense: Category[] = [];

    categories.forEach((cat) => {
      if (cat.type === "income" || cat.type === "both") {
        income.push(cat);
      }
      if (cat.type === "expense" || cat.type === "both") {
        expense.push(cat);
      }
    });

    return { income, expense };
  }, [categories]);

  // Calculate total for each category
  const getCategoryTotal = (categoryId: string) => {
    return transactions
      .filter((t) => t.category_id === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get subcategories
  const getSubcategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent_category_id === parentId);
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(undefined);
  };

  const handleCreateDefaultCategories = async () => {
    await createDefaultCategories(undefined);
  };

  // Render category item
  const renderCategory = (category: Category, isSubcategory = false) => {
    const total = getCategoryTotal(category.id);
    const subcategories = getSubcategories(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 rounded-lg transition-colors ${
            isSubcategory ? "ml-4 sm:ml-8 bg-muted/20" : ""
          }`}
        >
          {/* Top row on mobile: Icon, Name, Badge */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon and Color */}
            <div
              className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color + "20" }}
            >
              <div
                className="h-6 w-6 rounded"
                style={{ backgroundColor: category.color }}
              />
            </div>

            {/* Name and Type */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium truncate">{category.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {category.type === "income"
                    ? "Entrada"
                    : category.type === "expense"
                      ? "Saída"
                      : "Ambos"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Bottom row on mobile: Total and Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Total */}
            <div className="text-left sm:text-right">
              <p className="font-semibold">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">no mês</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEditDialog(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mt-1">
            {subcategories.map((sub) => renderCategory(sub, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Categorias
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Organize suas transações por categorias
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria cadastrada"
          description="Categorias ajudam a organizar suas transações. Você pode criar as suas ou usar nosso modelo padrão."
          action={
            <Button onClick={handleCreateDefaultCategories}>
              {isCreatingDefaultCategories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando categorias...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar categorias padrão
                </>
              )}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {/* Expense Categories */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {categoriesByType.expense.filter((cat) => !cat.parent_category_id)
                .length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma categoria de saída cadastrada
                </p>
              ) : (
                categoriesByType.expense
                  .filter((cat) => !cat.parent_category_id)
                  .map((cat) => renderCategory(cat))
              )}
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {categoriesByType.income.filter((cat) => !cat.parent_category_id)
                .length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma categoria de entrada cadastrada
                </p>
              ) : (
                categoriesByType.income
                  .filter((cat) => !cat.parent_category_id)
                  .map((cat) => renderCategory(cat))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        category={selectedCategory}
      />
    </div>
  );
}
