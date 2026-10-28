import { ArrowDownLeft, CalendarDays, PieChart, Wallet } from "lucide-react";

export function ProductOverview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-emerald-300/15 blur-3xl" />
      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.2)] sm:p-8">
        <div className="rounded-2xl bg-[#123e36] p-6 text-white sm:p-8">
          <Wallet className="text-emerald-200" size={26} />
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">Suas finanças organizadas</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-100">Acompanhe suas informações financeiras em um só lugar, no seu ritmo.</p>
        </div>
        <div className="mt-5 space-y-1">
          {[
            { icon: ArrowDownLeft, title: "Receitas e despesas", description: "Registre e categorize suas transações." },
            { icon: CalendarDays, title: "Contas e vencimentos", description: "Acompanhe seus compromissos." },
            { icon: PieChart, title: "Relatórios", description: "Visualize a evolução dos seus gastos." },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-4 rounded-xl px-2 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={19} /></span>
              <div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-sm text-slate-500">{description}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
