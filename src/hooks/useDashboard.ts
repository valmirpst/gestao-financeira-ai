import * as dashboardService from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook para buscar evolução mensal do dashboard.
 * @param months Quantidade de meses a buscar (default: 6)
 */
export function useMonthlyEvolution(months: number = 6) {
  return useQuery({
    queryKey: ["dashboard", "monthly-evolution", months],
    queryFn: () => dashboardService.getMonthlyEvolution(months),
  });
}
