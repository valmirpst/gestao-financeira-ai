import { ArrowRight, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export function CallToActionSection() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-[#123e36] px-7 py-10 text-white sm:px-12 sm:py-12 md:flex-row md:items-center">
        <div>
          <CircleDollarSign className="mb-4 text-emerald-300" size={28} />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Comece a organizar seu dinheiro hoje.</h2>
          <p className="mt-3 text-emerald-100">Tenha suas informações financeiras sempre à mão.</p>
        </div>
        <Link
          to="/register"
          className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#123e36] transition-colors hover:bg-emerald-50"
        >
          Criar minha conta <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
