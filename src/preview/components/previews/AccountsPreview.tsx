import { Badge } from "@/components/ui/badge";
import { CreditCard, MoreVertical, Plus, Wallet } from "lucide-react";

export function AccountsPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl lg:rounded-2xl lg:p-4 dark:border-white/10 dark:bg-black/50 overflow-hidden">
      <div className="flex h-full flex-col gap-6 rounded-lg bg-slate-50 p-4 lg:p-6 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
        {/* Header fidedigno ao Accounts.tsx */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Contas</h3>
            <p className="text-xs text-slate-500">
              Gerencie seus saldos e contas bancárias
            </p>
          </div>
          <div className="flex gap-2">
            <div className="h-10 px-4 rounded-md border border-slate-200 bg-white dark:bg-slate-800 dark:border-white/10 flex items-center justify-center text-xs font-bold gap-2">
              Transferir
            </div>
            <div className="h-10 px-4 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold gap-2">
              <Plus className="h-4 w-4" /> Nova Conta
            </div>
          </div>
        </div>

        {/* Grid de Contas (Simulando o renderAccountCard da página real) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Nubank Silver",
              balance: "R$ 5.420,00",
              type: "checking",
              bank: "Nubank",
              color: "#8b5cf6",
            },
            {
              name: "Investimentos Bradesco",
              balance: "R$ 15.130,00",
              type: "investment",
              bank: "Bradesco",
              color: "#ef4444",
            },
            {
              name: "Carteira (Dinheiro)",
              balance: "R$ 450,00",
              type: "cash",
              bank: "Dinheiro",
              color: "#10b981",
            },
          ].map((acc, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden dark:bg-slate-900 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                    {acc.type === "cash" ? (
                      <Wallet className="h-5 w-5 text-slate-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold uppercase tracking-wider"
                  >
                    {acc.type === "checking"
                      ? "Corrente"
                      : acc.type === "investment"
                        ? "Investimento"
                        : "Dinheiro"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {acc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {acc.bank}
                  </p>
                </div>

                <div className="mt-6 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Saldo Atual
                  </span>
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {acc.balance}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-[10px] text-slate-500 font-medium border-t border-slate-100 dark:border-white/5">
                <span>Clique para editar</span>
                <MoreVertical className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Informação Adicional Fidedigna */}
        <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
            Os saldos exibidos são baseados nas transações registradas em cada
            conta. Você pode sincronizar os saldos a qualquer momento no menu de
            cada conta.
          </p>
        </div>
      </div>
    </div>
  );
}
