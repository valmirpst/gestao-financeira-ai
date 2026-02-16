import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl lg:rounded-2xl lg:p-4 dark:border-white/10 dark:bg-black/50 overflow-hidden">
      <div className="flex h-full flex-col gap-6 rounded-lg bg-slate-50 p-4 lg:p-6 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
        {/* Header com Simulação de Filtro */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Dashboard</h3>
            <p className="text-xs text-slate-500">
              Visão geral das suas finanças
            </p>
          </div>
          <div className="h-9 w-40 rounded-md border border-slate-200 bg-white dark:bg-slate-800 dark:border-white/10 flex items-center px-3 text-xs text-slate-500">
            Mês atual
          </div>
        </div>

        {/* Grid de Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-white/5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500 text-xs font-medium dark:text-slate-400">
                Entradas
              </span>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">R$ 8.240</div>
            <p className="text-[10px] text-slate-500 mt-1">Receitas pagas</p>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-white/5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500 text-xs font-medium dark:text-slate-400">
                Saídas
              </span>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">R$ 4.150</div>
            <p className="text-[10px] text-slate-500 mt-1">Despesas pagas</p>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-white/5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500 text-xs font-medium dark:text-slate-400">
                Saldo
              </span>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">R$ 4.090</div>
            <p className="text-[10px] text-slate-500 mt-1">Líquido</p>
          </div>
        </div>

        {/* Cards de Alerta de Contas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-slate-900 font-bold text-xs dark:text-slate-100 flex items-center">
                Contas a Pagar
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px]">
                  2 vencidas
                </span>
              </span>
              <DollarSign className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">R$ 1.250,00</div>
            <p className="text-xs text-red-600 mt-1 font-medium">
              R$ 450,00 vencido
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-white/5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-slate-900 font-bold text-xs dark:text-slate-100">
                Contas a Receber
              </span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">R$ 2.450,00</div>
            <p className="text-xs text-slate-500 mt-1">
              Clique para ver detalhes
            </p>
          </div>
        </div>

        {/* Próximos Vencimentos - Responsivo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Próximos Vencimentos</span>
            <span className="text-[10px] text-blue-600 font-medium md:hidden">
              Ver todos
            </span>
          </div>

          {/* Table View (Desktop) */}
          <div className="hidden md:block rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse min-w-125">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Venc.</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    {
                      desc: "Aluguel",
                      cat: "Moradia",
                      color: "#3b82f6",
                      val: "R$ 2.200,00",
                      date: "20/03",
                      status: "Pendente",
                      stColor: "bg-slate-900",
                    },
                    {
                      desc: "Internet",
                      cat: "Contas",
                      color: "#f59e0b",
                      val: "R$ 119,90",
                      date: "25/03",
                      status: "Pendente",
                      stColor: "bg-slate-900",
                    },
                    {
                      desc: "Energia",
                      cat: "Contas",
                      color: "#f59e0b",
                      val: "R$ 342,50",
                      date: "15/03",
                      status: "Atrasado",
                      stColor: "bg-red-600",
                    },
                  ].map((bill, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{bill.desc}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-sm border text-[9px] font-bold"
                          style={{ borderColor: bill.color, color: bill.color }}
                        >
                          {bill.cat}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {bill.val}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{bill.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-bold text-white ${bill.stColor}`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card View (Mobile) */}
          <div className="md:hidden space-y-3">
            {[
              {
                desc: "Aluguel",
                cat: "Moradia",
                val: "R$ 2.200,00",
                date: "Vence hoje",
                color: "#3b82f6",
              },
              {
                desc: "Internet",
                cat: "Contas",
                val: "R$ 119,90",
                date: "Vence em 5 dias",
                color: "#f59e0b",
              },
              {
                desc: "Energia",
                cat: "Contas",
                val: "R$ 342,50",
                date: "Atrasado 2 dias",
                color: "#ef4444",
              },
            ].map((bill, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-white/5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{bill.desc}</span>
                    <span
                      className={`text-[10px] font-medium ${bill.date.includes("Atrasado") ? "text-red-500" : "text-slate-500"}`}
                    >
                      {bill.date}
                    </span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className="px-1.5 py-0.5 rounded-sm border text-[8px] font-bold"
                    style={{ borderColor: bill.color, color: bill.color }}
                  >
                    {bill.cat}
                  </span>
                  <span className="text-sm font-bold">{bill.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
