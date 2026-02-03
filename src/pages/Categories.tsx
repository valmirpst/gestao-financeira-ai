import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCategories,
  useCreateDefaultCategories,
} from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/database.types";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Edit, Loader2, Plus } from "lucide-react";
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
          className={`flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors ${
            isSubcategory ? "ml-8 bg-muted/20" : ""
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Icon and Color */}
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color + "20" }}
            >
              <div
                className="h-6 w-6 rounded"
                style={{ backgroundColor: category.color }}
              />
            </div>

            {/* Name and Type */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{category.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {category.type === "income"
                    ? "Entrada"
                    : category.type === "expense"
                      ? "Saída"
                      : "Ambos"}
                </Badge>
              </div>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">no mês</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categorias
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
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
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
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
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
