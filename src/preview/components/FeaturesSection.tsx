import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  PieChart,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Controle de Transações",
    description:
      "Registre todas as suas receitas e despesas com categorias personalizadas e filtros avançados.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Calendar,
    title: "Contas a Pagar",
    description:
      "Acompanhe vencimentos, receba alertas e nunca mais perca um prazo importante.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCard,
    title: "Múltiplas Contas",
    description:
      "Gerencie várias contas bancárias e cartões em um único lugar com transferências entre contas.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: PieChart,
    title: "Categorias Inteligentes",
    description:
      "Organize seus gastos por categorias e subcategorias para entender melhor seus hábitos.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Relatórios Visuais",
    description:
      "Visualize sua evolução financeira com gráficos interativos e dashboards personalizados.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Projeções Financeiras",
    description:
      "Veja projeções de saldo futuro e tome decisões mais informadas sobre seus gastos.",
    gradient: "from-teal-500 to-green-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-6 py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Tudo que você precisa para
            <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              gerenciar suas finanças
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ferramentas completas para você ter controle total do seu dinheiro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Gradient glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl bg-linear-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl -z-10"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                />

                <div className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} p-3 shadow-lg`}
                  >
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
