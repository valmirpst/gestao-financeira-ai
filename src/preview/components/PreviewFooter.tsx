import { Link } from "react-router-dom";

export function PreviewFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row">
        <span className="font-semibold text-slate-700">Gestão Financeira</span>
        <span>Mais clareza para suas decisões financeiras.</span>
        <Link to="/login" className="font-medium text-slate-600 hover:text-emerald-800">
          Já tenho uma conta
        </Link>
      </div>
    </footer>
  );
}
