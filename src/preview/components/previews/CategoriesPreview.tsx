import { Edit, Plus, Tags } from "lucide-react";

export function CategoriesPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl lg:rounded-2xl lg:p-4 dark:border-white/10 dark:bg-black/50 overflow-hidden">
      <div className="flex h-full flex-col gap-6 rounded-lg bg-slate-50 p-4 lg:p-6 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
        {/* Header fidedigno ao Categories.tsx */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Categorias</h3>
            <p className="text-xs text-slate-500">
              Organize suas transações por categorias
            </p>
          </div>
          <div className="h-10 w-40 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Nova Categoria
          </div>
        </div>

        {/* Grid de categorias no estilo real (Cards do UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Alimentação",
              color: "#10b981",
              subs: ["Supermercado", "Restaurantes", "Lanches"],
              type: "Despesa",
            },
            {
              name: "Moradia",
              color: "#3b82f6",
              subs: ["Aluguel", "Energia", "Água", "Internet"],
              type: "Despesa",
            },
            {
              name: "Lazer",
              color: "#f59e0b",
              subs: ["Cinema", "Viagens", "Hobbies"],
              type: "Despesa",
            },
            {
              name: "Investimentos",
              color: "#8b5cf6",
              subs: ["Ações", "Cripto", "Tesouro"],
              type: "Receita",
            },
            {
              name: "Salário",
              color: "#06b6d4",
              subs: ["Empresa Principal", "Bônus"],
              type: "Receita",
            },
          ].map((cat, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-white/5 shadow-sm"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Tags className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <h4 className="text-sm font-bold">{cat.name}</h4>
                </div>
                <Edit className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.map((sub, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-medium text-slate-600 dark:bg-slate-700 dark:border-white/5 dark:text-slate-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${cat.type === "Receita" ? "text-green-600" : "text-blue-600"}`}
                  >
                    {cat.type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    R$ 1.250,50 total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
