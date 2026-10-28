import { Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/preview" className={cn("inline-flex items-center gap-2.5 text-sm font-bold tracking-tight text-foreground sm:text-base", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Layers3 size={19} aria-hidden="true" />
      </span>
      Gestão Financeira
    </Link>
  );
}
