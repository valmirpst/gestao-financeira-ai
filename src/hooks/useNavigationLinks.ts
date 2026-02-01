import {
  FileText,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Tag,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";

export const useNavigationLinks = () => {
  const links = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Transações", href: "/transactions", icon: Receipt },
      { name: "Contas a Pagar", href: "/bills", icon: FileText },
      { name: "Categorias", href: "/categories", icon: Tag },
      { name: "Orçamentos", href: "/budgets", icon: PiggyBank },
      { name: "Contas", href: "/accounts", icon: Wallet },
    ],
    [],
  );

  return links;
};
