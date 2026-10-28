import { CalendarDays, PieChart, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Saiba quanto você tem",
    description:
      "Reúna suas contas e acompanhe entradas, saídas e saldo em um só lugar.",
  },
  {
    icon: CalendarDays,
    title: "Organize seus compromissos",
    description:
      "Veja o que está por vencer e acompanhe suas contas a pagar e a receber.",
  },
  {
    icon: PieChart,
    title: "Entenda para onde vai",
    description:
      "Categorize suas transações e acompanhe seus gastos ao longo do tempo.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="recursos"
      className="border-y border-slate-200 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#15352f] sm:text-4xl">
            O que você pode fazer
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-[#f8faf8] p-7"
            >
              <div>
                <span className="grid size-11 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Icon size={22} />
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
