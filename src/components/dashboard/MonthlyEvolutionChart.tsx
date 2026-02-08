import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMonthlyEvolution } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthlyEvolutionChart() {
  const { data: chartData, isLoading } = useMonthlyEvolution(6);

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Resumo dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
        <CardDescription>
          Comparativo de Entradas e Saídas nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--popover-foreground))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{
                  color: "hsl(var(--muted-foreground))",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Entradas"
                stroke="#10b981"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ strokeWidth: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Saídas"
                stroke="#ef4444"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
