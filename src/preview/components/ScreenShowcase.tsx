import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollReveal } from "../../components/ScrollReveal";
import { ScreenPreview } from "./ScreenPreview";

const screens = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Visão Geral Completa",
    description:
      "Acompanhe seu saldo, receitas, despesas e veja gráficos de evolução mensal. Tenha uma visão 360º das suas finanças em um único lugar.",
    features: [
      "Resumo financeiro em tempo real",
      "Gráficos de evolução mensal",
      "Próximos vencimentos destacados",
      "Últimas transações registradas",
    ],
  },
  {
    id: "transactions",
    label: "Transações",
    title: "Controle Total de Entradas e Saídas",
    description:
      "Registre, edite e acompanhe todas as suas transações financeiras. Filtre por categoria, conta, período e status para análises detalhadas.",
    features: [
      "Filtros avançados por categoria e período",
      "Criação rápida de receitas e despesas",
      "Transferências entre contas",
      "Edição e exclusão em massa",
    ],
  },
  {
    id: "bills",
    label: "Contas a Pagar",
    title: "Nunca Mais Perca um Vencimento",
    description:
      "Gerencie todas as suas contas a pagar em um único lugar. Visualize vencimentos próximos, marque como pago e tenha controle total dos seus compromissos.",
    features: [
      "Visualização por status (pendente, vencido, pago)",
      "Alertas de vencimento próximo",
      "Marcação rápida como pago",
      "Histórico completo de pagamentos",
    ],
  },
  {
    id: "categories",
    label: "Categorias",
    title: "Organize Seus Gastos de Forma Inteligente",
    description:
      "Crie e gerencie categorias personalizadas para entender melhor seus hábitos de consumo. Use subcategorias para um controle ainda mais detalhado.",
    features: [
      "Categorias personalizadas por tipo",
      "Subcategorias para detalhamento",
      "Cores e ícones personalizáveis",
      "Análise de gastos por categoria",
    ],
  },
  {
    id: "accounts",
    label: "Contas",
    title: "Múltiplas Contas em um Só Lugar",
    description:
      "Gerencie contas bancárias, carteiras digitais e dinheiro em espécie. Acompanhe saldos individuais e realize transferências entre contas.",
    features: [
      "Gerenciamento de múltiplas contas",
      "Saldo atualizado em tempo real",
      "Transferências entre contas",
      "Inclusão/exclusão de contas no saldo total",
    ],
  },
];

export function ScreenShowcase() {
  return (
    <section className="relative px-6 py-24 lg:py-32 bg-slate-950/50 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Animated header with scroll reveal */}
        <ScrollReveal className="text-center space-y-4 mb-16" duration={0.6}>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Conheça as{" "}
            <span className="bg-linear-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              principais telas
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Interface moderna e intuitiva para você gerenciar suas finanças com
            facilidade
          </p>
        </ScrollReveal>

        <Tabs defaultValue="dashboard" className="space-y-12">
          {/* Animated tabs container with scroll reveal */}
          <ScrollReveal
            className="flex md:justify-center overflow-hidden"
            delay={0.2}
          >
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
              <TabsList className="inline-flex h-auto p-1 bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl gap-2 min-w-full md:min-w-0">
                {screens.map((screen) => (
                  <TabsTrigger
                    key={screen.id}
                    value={screen.id}
                    className="shrink-0 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 data-[state=active]:scale-105 text-slate-400 rounded-lg md:rounded-xl py-2.5 px-4 md:py-3 md:px-6 text-sm font-medium transition-all duration-300 hover:scale-105 hover:text-slate-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {screen.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </ScrollReveal>

          {screens.map((screen) => (
            <TabsContent
              key={screen.id}
              value={screen.id}
              className="space-y-8"
            >
              <ScreenPreview screen={screen} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
