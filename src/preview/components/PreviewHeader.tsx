import { Layers3 } from "lucide-react";
import { Link } from "react-router-dom";

export function PreviewHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10"
      >
        <Link to="/preview" className="flex items-center gap-2.5 text-sm font-bold tracking-tight sm:text-base">
          <span className="grid size-9 place-items-center rounded-xl bg-[#123e36] text-white">
            <Layers3 size={19} />
          </span>{" "}
          Gestão Financeira
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="#recursos"
            className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-emerald-800 sm:block"
          >
            Recursos
          </a>
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-emerald-800">
            Entrar
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[#123e36] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Criar conta
          </Link>
        </div>
      </nav>
    </header>
  );
}
