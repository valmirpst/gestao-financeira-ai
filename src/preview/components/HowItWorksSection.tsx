const steps = [
  { title: "Crie sua conta", text: "Faça seu cadastro para acessar o aplicativo." },
  { title: "Adicione suas informações", text: "Cadastre contas, receitas e despesas e organize por categorias." },
  { title: "Acompanhe suas finanças", text: "Consulte saldos, vencimentos e relatórios quando precisar." },
];

export function HowItWorksSection() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[#15352f] sm:text-4xl">Como começar</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600">Você pode começar com o que já sabe e completar suas informações aos poucos.</p>
        </div>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">{index + 1}</span>
              <div><h3 className="font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
