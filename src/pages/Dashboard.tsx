import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type PeriodType =
  | "current_month"
  | "last_30_days"
  | "previous_month"
  | "current_year"
  | "custom";

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodType>("current_month");

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
    </div>
  );
}
