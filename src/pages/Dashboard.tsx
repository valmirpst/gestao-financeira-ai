import { MarkAsPaidDialog } from "@/components/bills/MarkAsPaidDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDateSafe } from "@/lib/utils";
import type { Transaction } from "@/types/database.types";
import {
  addDays,
  differenceInDays,
  endOfMonth,
  endOfYear,
  format,
  isPast,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PeriodType =
  | "current_month"
  | "last_30_days"
  | "previous_month"
  | "current_year"
  | "custom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodType>("current_month");
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Calcular datas do período selecionado
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();

    switch (period) {
      case "current_month":
        return {
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      case "last_30_days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          startDate: format(thirtyDaysAgo, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
      case "previous_month":
        const previousMonth = subMonths(today, 1);
        return {
          startDate: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
        };
      case "current_year":
        return {
          startDate: format(startOfYear(today), "yyyy-MM-dd"),
          endDate: format(endOfYear(today), "yyyy-MM-dd"),
        };
      default:
        return {
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(endOfMonth(today), "yyyy-MM-dd"),
        };
    }
  }, [period]);

  // Buscar transações do período atual
  const { data: currentTransactions = [], isLoading } = useTransactions({
    start_date: startDate,
    end_date: endDate,
    status: "paid",
  });

  // Buscar próximos vencimentos (próximos 30 dias)
  const today = new Date();
  const { data: upcomingBills = [] } = useTransactions({
    start_date: format(today, "yyyy-MM-dd"),
    end_date: format(addDays(today, 30), "yyyy-MM-dd"),
  });

  // Filtrar apenas pendentes e vencidas, ordenar por data
  const upcomingBillsFiltered = useMemo(() => {
    return upcomingBills
      .filter((t) => t.status === "pending" || t.status === "overdue")
      .sort((a, b) => {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [upcomingBills]);

  // Contar contas vencidas
  const overdueCount = useMemo(() => {
    return upcomingBills.filter(
      (t) =>
        (t.status === "overdue" ||
          (t.due_date && isPast(new Date(t.due_date)))) &&
        t.status !== "paid",
    ).length;
  }, [upcomingBills]);

  // Calcular totais de contas a pagar/receber
  const billsSummary = useMemo(() => {
    const toPay = upcomingBills
      .filter(
        (t) =>
          t.type === "expense" &&
          (t.status === "pending" || t.status === "overdue"),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueToPay = upcomingBills
      .filter(
        (t) =>
          t.type === "expense" &&
          (t.status === "overdue" ||
            (t.due_date && isPast(new Date(t.due_date)))),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const toReceive = upcomingBills
      .filter(
        (t) =>
          t.type === "income" &&
          (t.status === "pending" || t.status === "overdue"),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueToReceive = upcomingBills
      .filter(
        (t) =>
          t.type === "income" &&
          (t.status === "overdue" ||
            (t.due_date && isPast(new Date(t.due_date)))),
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return { toPay, overdueToPay, toReceive, overdueToReceive };
  }, [upcomingBills]);

  // Calcular datas do período anterior para comparação
  const { startDate: prevStartDate, endDate: prevEndDate } = useMemo(() => {
    const today = new Date();

    switch (period) {
      case "current_month":
        const previousMonth = subMonths(today, 1);
        return {
          startDate: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
        };
      case "last_30_days":
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(today.getDate() - 60);
        const thirtyOneDaysAgo = new Date(today);
        thirtyOneDaysAgo.setDate(today.getDate() - 31);
        return {
          startDate: format(sixtyDaysAgo, "yyyy-MM-dd"),
          endDate: format(thirtyOneDaysAgo, "yyyy-MM-dd"),
        };
      case "previous_month":
        const twoMonthsAgo = subMonths(today, 2);
        return {
          startDate: format(startOfMonth(twoMonthsAgo), "yyyy-MM-dd"),
          endDate: format(endOfMonth(twoMonthsAgo), "yyyy-MM-dd"),
        };
      case "current_year":
        const previousYear = new Date(today.getFullYear() - 1, 0, 1);
        return {
          startDate: format(startOfYear(previousYear), "yyyy-MM-dd"),
          endDate: format(endOfYear(previousYear), "yyyy-MM-dd"),
        };
      default:
        const prevMonth = subMonths(today, 1);
        return {
          startDate: format(startOfMonth(prevMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(prevMonth), "yyyy-MM-dd"),
        };
    }
  }, [period]);

  // Buscar transações do período anterior
  const { data: previousTransactions = [] } = useTransactions({
    start_date: prevStartDate,
    end_date: prevEndDate,
    status: "paid",
  });

  // Calcular totais do período atual
  const currentIncome = useMemo(() => {
    return currentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentTransactions]);

  const currentExpense = useMemo(() => {
    return currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentTransactions]);

  const currentBalance = useMemo(() => {
    return currentIncome - currentExpense;
  }, [currentIncome, currentExpense]);

  // Calcular totais do período anterior
  const previousBalance = useMemo(() => {
    const prevIncome = previousTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = previousTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return prevIncome - prevExpense;
  }, [previousTransactions]);

  // Calcular variação percentual
  const variationPercentage = useMemo(() => {
    if (previousBalance === 0) return 0;
    return (
      ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100
    );
  }, [currentBalance, previousBalance]);

  const isPositiveVariation = variationPercentage >= 0;

  // Get days info
  const getDaysInfo = (dueDate: string | null) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const days = differenceInDays(due, today);

    if (days < 0) {
      return {
        text: `${Math.abs(days)}d atraso`,
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    } else if (days === 0) {
      return {
        text: "Hoje",
        variant: "default" as const,
        icon: Clock,
      };
    } else {
      return {
        text: `${days}d`,
        variant: "secondary" as const,
        icon: Clock,
      };
    }
  };

  // Handle mark as paid
  const handleOpenMarkAsPaidDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setMarkAsPaidDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>

        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as PeriodType)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Mês atual</SelectItem>
            <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
            <SelectItem value="previous_month">Mês anterior</SelectItem>
            <SelectItem value="current_year">Ano atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total de Entradas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Entradas
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : formatCurrency(currentIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas pagas no período
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total de Saídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Saídas
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "..." : formatCurrency(currentExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Despesas pagas no período
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Saldo Líquido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {isLoading ? "..." : formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas - Saídas
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Comparação com período anterior */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
            {isPositiveVariation ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold ${
                  isPositiveVariation ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLoading
                  ? "..."
                  : `${isPositiveVariation ? "+" : ""}${variationPercentage.toFixed(1)}%`}
              </span>
              <Badge variant={isPositiveVariation ? "default" : "destructive"}>
                {isPositiveVariation ? "Positivo" : "Negativo"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Alerta - Contas a Pagar/Receber */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* A Pagar */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            billsSummary.overdueToPay > 0
              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
              : ""
          }`}
          onClick={() => navigate("/bills?tab=expense")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contas a Pagar
              {overdueCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueCount} vencida{overdueCount > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${billsSummary.overdueToPay > 0 ? "text-red-600" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                billsSummary.overdueToPay > 0 ? "text-red-600" : ""
              }`}
            >
              {formatCurrency(billsSummary.toPay)}
            </div>
            {billsSummary.overdueToPay > 0 && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                {formatCurrency(billsSummary.overdueToPay)} vencido
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>

        {/* A Receber */}
        <Card
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => navigate("/bills?tab=income")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contas a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(billsSummary.toReceive)}
            </div>
            {billsSummary.overdueToReceive > 0 && (
              <p className="text-sm text-amber-600 mt-1 font-medium">
                {formatCurrency(billsSummary.overdueToReceive)} vencido
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Vencimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBillsFiltered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma conta pendente nos próximos 30 dias
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBillsFiltered.map((bill) => {
                  const daysInfo = getDaysInfo(bill.due_date);
                  const DaysIcon = daysInfo?.icon;

                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        {bill.description}
                      </TableCell>
                      <TableCell>
                        {bill.category && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: bill.category.color,
                              color: bill.category.color,
                            }}
                          >
                            {bill.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                      <TableCell>
                        {bill.due_date ? formatDateSafe(bill.due_date) : "-"}
                      </TableCell>
                      <TableCell>
                        {daysInfo && (
                          <Badge variant={daysInfo.variant}>
                            {DaysIcon && <DaysIcon className="h-3 w-3 mr-1" />}
                            {daysInfo.text}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenMarkAsPaidDialog(bill)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <MarkAsPaidDialog
        transaction={selectedTransaction}
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
      />
    </div>
  );
}
