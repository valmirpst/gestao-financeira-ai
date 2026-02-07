import { supabase } from "@/lib/supabase";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Busca dados de evolução mensal (entradas vs saídas) dos últimos meses
 */
export async function getMonthlyEvolution(months: number = 6) {
  try {
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, months - 1));
    const endDate = endOfMonth(today);

    // Buscar transações
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("date, type, amount")
      .eq("status", "paid")
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString());

    if (error) {
      throw new Error(`Erro ao buscar evolução mensal: ${error.message}`);
    }

    // Inicializar array de meses com valores zerados
    const monthlyDataMap = new Map<
      string,
      { fullDate: Date; name: string; income: number; expense: number }
    >();

    for (let i = 0; i < months; i++) {
      const date = subMonths(today, months - 1 - i);
      const key = format(date, "yyyy-MM");
      monthlyDataMap.set(key, {
        fullDate: date,
        name: format(date, "MMM/yy", { locale: ptBR }),
        income: 0,
        expense: 0,
      });
    }

    // Processar transações
    transactions?.forEach((transaction) => {
      const key = transaction.date.substring(0, 7); // yyyy-MM
      const entry = monthlyDataMap.get(key);

      if (entry) {
        if (transaction.type === "income") {
          entry.income += Number(transaction.amount);
        } else if (transaction.type === "expense") {
          entry.expense += Number(transaction.amount);
        }
      }
    });

    return Array.from(monthlyDataMap.values());
  } catch (error) {
    console.error("getMonthlyEvolution error:", error);
    throw error;
  }
}
