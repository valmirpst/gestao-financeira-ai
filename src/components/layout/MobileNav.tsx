import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigationLinks } from "@/hooks/useNavigationLinks";
import { useTransactions } from "@/hooks/useTransactions";
import { cn, parseDateSafe } from "@/lib/utils";
import { addDays, format, isPast } from "date-fns";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function MobileNav() {
  const navigation = useNavigationLinks();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Buscar contas vencidas para mostrar badge (igual sidebar)
  const today = new Date();
  const { data: upcomingBills = [] } = useTransactions({
    start_date: format(today, "yyyy-MM-dd"),
    end_date: format(addDays(today, 30), "yyyy-MM-dd"),
  });

  const overdueCount = useMemo(() => {
    return upcomingBills.filter(
      (t) =>
        (t.status === "overdue" ||
          (t.due_date && isPast(parseDateSafe(t.due_date)))) &&
        t.status !== "paid",
    ).length;
  }, [upcomingBills]);

  // Main items for bottom bar (top 4 or specific ones)
  const bottomNavItems = navigation.slice(0, 4);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2 md:hidden">
        <nav className="flex items-center justify-around">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/bills" && overdueCount > 0;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                      {overdueCount}
                    </span>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Hamburger Menu Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="base"
                size="none"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "[&_svg]:size-5",
                )}
              >
                <Menu className="h-5 w-5" />
                <span>Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-left">
                  <Link to="/preview">
                    <h1 className="text-xl font-bold">Gestão Financeira</h1>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <motion.nav
                className="flex flex-col p-4 space-y-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  const showBadge = item.href === "/bills" && overdueCount > 0;

                  return (
                    <motion.div key={item.name} variants={itemVariant}>
                      <Link
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
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
                    </motion.div>
                  );
                })}
              </motion.nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
}
