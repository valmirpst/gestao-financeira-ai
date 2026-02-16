import { ArrowDownCircle, ArrowUpCircle, Filter, Search } from "lucide-react";

export function TransactionsPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl lg:rounded-2xl lg:p-4 dark:border-white/10 dark:bg-black/50 overflow-hidden">
      <div className="flex h-full flex-col gap-6 rounded-lg bg-slate-50 p-4 lg:p-6 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
        {/* Header Fidedigno */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Transações</h3>
            <p className="text-xs text-slate-500">
              Gerencie seu histórico financeiro
            </p>
          </div>
          <div className="h-10 w-32 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
            Nova Transação
          </div>
        </div>

        {/* Filtros Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <div className="h-8 md:h-9 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 px-2 md:px-3 flex items-center text-[10px] md:text-xs text-slate-400">
            <Search className="h-3 md:h-3.5 w-3 md:w-3.5 mr-1.5 md:mr-2" />
            Buscar...
          </div>
          <div className="h-8 md:h-9 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 px-2 md:px-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
            Categorias <Filter className="h-3 w-3" />
          </div>
          <div className="h-8 md:h-9 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 px-2 md:px-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
            Contas <Filter className="h-3 w-3" />
          </div>
          <div className="h-8 md:h-9 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 px-2 md:px-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
            Tipos <Filter className="h-3 w-3" />
          </div>
        </div>

        {/* Tabela de Transações (Desktop) */}
        <div className="hidden md:block rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <div className="h-3.5 w-3.5 rounded border border-slate-300 dark:border-slate-600" />
                  </th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Conta</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  {
                    title: "Supermercado Mensal",
                    cat: "Alimentação",
                    acc: "Nubank",
                    val: "- R$ 450,20",
                    date: "15/03/2024",
                    status: "Pago",
                    color: "text-green-600",
                  },
                  {
                    title: "Salário Março",
                    cat: "Salário",
                    acc: "Bradesco",
                    val: "+ R$ 5.500,00",
                    date: "05/03/2024",
                    status: "Pago",
                    color: "text-green-600",
                  },
                  {
                    title: "Assinatura Netflix",
                    cat: "Lazer",
                    acc: "Inter",
                    val: "- R$ 55,90",
                    date: "10/03/2024",
                    status: "Pendente",
                    color: "text-slate-500",
                  },
                ].map((t, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="h-3.5 w-3.5 rounded border border-slate-300 dark:border-slate-600" />
                    </td>
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3 font-bold text-blue-500">
                      {t.cat}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.acc}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${t.val.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.val}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.date}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${t.status === "Pago" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* List View (Mobile) */}
        <div className="md:hidden space-y-3">
          {[
            {
              title: "Supermercado Mensal",
              cat: "Alimentação",
              val: "- R$ 450,20",
              date: "15 Mar",
              acc: "Nubank",
            },
            {
              title: "Salário Março",
              cat: "Salário",
              val: "+ R$ 5.500,00",
              date: "05 Mar",
              acc: "Bradesco",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{t.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {t.date} • {t.acc}
                  </span>
                </div>
                <div className="h-4 w-4 rounded border border-slate-300" />
              </div>
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[8px] font-bold text-slate-600">
                  {t.cat}
                </span>
                <span
                  className={`text-sm font-bold ${t.val.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {t.val}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary Fidedigno */}
        <div className="flex justify-end gap-6 pt-2">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium">
              Total Receitas: <span className="font-bold">R$ 7.900,00</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium">
              Total Despesas: <span className="font-bold">R$ 506,10</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
