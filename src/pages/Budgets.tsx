import { BudgetDialog } from "@/components/budgets/BudgetDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBudgets, useDeleteBudget } from "@/hooks/useBudgets";
import { formatCurrency } from "@/lib/utils";
import type { BudgetWithUsage } from "@/types/database.types";
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Budgets() {
  const { data: budgets = [], isLoading } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithUsage | null>(
    null,
  );

  const handleEdit = (budget: BudgetWithUsage) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este orçamento?")) {
      return;
    }

    try {
      await deleteBudget.mutateAsync(id);
      toast.success("Orçamento deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar orçamento");
    }
  };

  const handleNewBudget = () => {
    setSelectedBudget(null);
    setDialogOpen(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 80) return "bg-green-500";
    if (percentage < 100) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPercentageBadgeVariant = (percentage: number) => {
    if (percentage < 80) return "default";
    if (percentage < 100) return "secondary";
    return "destructive";
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      monthly: "Mensal",
      weekly: "Semanal",
      yearly: "Anual",
      custom: "Personalizado",
    };
    return labels[period] || period;
  };

  // Check if there are any exceeded budgets
  const exceededBudgets = budgets.filter((b) => b.percentage > 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">
            Controle seus gastos definindo limites por categoria
          </p>
        </div>
        <Button onClick={handleNewBudget}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Alert for exceeded budgets */}
      {exceededBudgets.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Orçamentos Excedidos</AlertTitle>
          <AlertDescription>
            Você tem {exceededBudgets.length} orçamento
            {exceededBudgets.length > 1 ? "s" : ""} que excedeu
            {exceededBudgets.length > 1 ? "ram" : "u"} o limite definido.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && budgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum orçamento criado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro orçamento para começar a controlar seus gastos
            </p>
            <Button onClick={handleNewBudget}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Orçamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Budgets List */}
      {!isLoading && budgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progressColor = getProgressColor(budget.percentage);
            const badgeVariant = getPercentageBadgeVariant(budget.percentage);

            return (
              <Card key={budget.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {budget.category?.name || "Geral"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          {getPeriodLabel(budget.period)}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={badgeVariant} className="ml-2">
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Progress
                        value={Math.min(budget.percentage, 100)}
                        className="h-3"
                      />
                      <div
                        className={`absolute top-0 left-0 h-3 rounded-full transition-all ${progressColor}`}
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="text-muted-foreground">
                        de {formatCurrency(budget.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {budget.percentage > 100
                        ? "Orçamento excedido"
                        : budget.days_remaining === 0
                          ? "Último dia"
                          : `Faltam ${budget.days_remaining} ${budget.days_remaining === 1 ? "dia" : "dias"}`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Budget Dialog */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={selectedBudget}
      />
    </div>
  );
}
