import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductOverview } from "./ProductOverview";

export function HeroSection() {
  return (
    <section className="overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="hero-entrance max-w-xl">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#15352f] sm:text-5xl lg:text-6xl">
            Organize suas finanças <span className="text-emerald-700">em um só lugar.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            Registre receitas e despesas, acompanhe suas contas e veja como seu dinheiro está sendo usado.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#123e36] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
            >
              Criar minha conta <ArrowRight size={17} />
            </Link>
            <a
              href="#recursos"
              className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-slate-700 hover:text-emerald-800"
            >
              Ver recursos <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <ProductOverview />
      </div>
    </section>
  );
}
