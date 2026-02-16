import { Badge } from "@/components/ui/badge";
import { useNavigationLinks } from "@/hooks/useNavigationLinks";
import { useTransactions } from "@/hooks/useTransactions";
import { cn, parseDateSafe } from "@/lib/utils";
import { addDays, format, isPast } from "date-fns";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const navigation = useNavigationLinks();
  const location = useLocation();

  // Buscar contas vencidas (próximos 30 dias para pegar as vencidas)
  const today = new Date();
  const { data: upcomingBills = [] } = useTransactions({
    start_date: format(today, "yyyy-MM-dd"),
    end_date: format(addDays(today, 30), "yyyy-MM-dd"),
  });

  // Contar contas vencidas
  const overdueCount = useMemo(() => {
    return upcomingBills.filter(
      (t) =>
        (t.status === "overdue" ||
          (t.due_date && isPast(parseDateSafe(t.due_date)))) &&
        t.status !== "paid",
    ).length;
  }, [upcomingBills]);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/preview">
            <h1 className="text-xl font-bold">Gestão Financeira</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/bills" && overdueCount > 0;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-100",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <Badge variant="destructive" className="ml-auto">
                    {overdueCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
