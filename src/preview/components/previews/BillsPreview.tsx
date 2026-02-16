import { CheckCircle, Clock, DollarSign, Receipt } from "lucide-react";

export function BillsPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl lg:rounded-2xl lg:p-4 dark:border-white/10 dark:bg-black/50 overflow-hidden">
      <div className="flex h-full flex-col gap-6 rounded-lg bg-slate-50 p-4 lg:p-6 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
        {/* Header Fidedigno ao Bills.tsx */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Contas a Pagar / Receber
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe seus compromissos financeiros
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg dark:bg-slate-800/50">
            <div className="px-4 py-1.5 rounded-md bg-white dark:bg-slate-700 text-xs font-bold shadow-sm">
              A Pagar
            </div>
            <div className="px-4 py-1.5 rounded-md text-xs text-slate-500 font-medium">
              A Receber
            </div>
          </div>
        </div>

        {/* Resumo Real das Contas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-white/5">
            <span className="text-xs text-slate-500 font-medium">
              Total Pendente
            </span>
            <div className="text-2xl font-bold mt-1">R$ 1.342,50</div>
          </div>
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
            <span className="text-xs text-red-600 font-bold uppercase tracking-wider">
              Vencido
            </span>
            <div className="text-2xl font-bold mt-1 text-red-600">
              R$ 342,50
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
              Pago este mês
            </span>
            <div className="text-2xl font-bold mt-1 text-emerald-600">
              R$ 2.450,00
            </div>
          </div>
        </div>

        {/* Lista de Contas (Simulando o TransactionCard usado no Mobile/Bills) */}
        <div className="space-y-3">
          {[
            {
              title: "Energia Elétrica",
              amount: "R$ 342,50",
              due: "15/03/2024",
              status: "Vencido",
              color: "red",
              icon: Receipt,
            },
            {
              title: "Aluguel Março",
              amount: "R$ 2.200,00",
              due: "20/03/2024",
              status: "Pendente",
              color: "slate",
              icon: DollarSign,
            },
            {
              title: "Assinatura Netflix",
              amount: "R$ 55,90",
              due: "10/03/2024",
              status: "Pago",
              color: "green",
              icon: CheckCircle,
            },
            {
              title: "Internet Fibra",
              amount: "R$ 119,90",
              due: "25/03/2024",
              status: "Pendente",
              color: "slate",
              icon: Clock,
            },
          ].map((bill, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-white/5 hover:border-blue-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    bill.status === "Vencido"
                      ? "bg-red-100 text-red-600"
                      : bill.status === "Pago"
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-slate-600"
                  } dark:opacity-80`}
                >
                  <bill.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-[150px] sm:max-w-none">
                    {bill.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">
                      Vencimento: {bill.due}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-sm font-bold ${bill.status === "Vencido" ? "text-red-600" : ""}`}
                >
                  {bill.amount}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    bill.status === "Vencido"
                      ? "bg-red-600 text-white"
                      : bill.status === "Pago"
                        ? "bg-green-600 text-white"
                        : "bg-slate-500 text-white"
                  }`}
                >
                  {bill.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
