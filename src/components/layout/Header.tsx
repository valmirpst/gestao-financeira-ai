import { useNavigationLinks } from "@/hooks/useNavigationLinks";
import { useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const navigation = useNavigationLinks();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <h2 className="text-lg font-semibold">
          {navigation.find((item) => item.href === location.pathname)?.name ||
            "Página"}
        </h2>
      </div>
    </header>
  );
}
