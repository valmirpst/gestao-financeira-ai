# 💰 Sistema de Gestão Financeira Pessoal

Sistema completo de gestão financeira pessoal com controle de receitas, despesas, contas a pagar/receber, orçamentos e múltiplas contas bancárias.

## 🚀 Stack Técnica

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Date Utils**: date-fns
- **Routing**: React Router DOM

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase (gratuita)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd gestao-financeira
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a **URL do projeto** e a **anon key**

#### 3.2. Execute o schema SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/schema.sql` deste projeto
3. Copie todo o conteúdo e cole no editor SQL
4. Clique em **Run** para executar

Isso criará:

- ✅ Todas as tabelas (transactions, categories, budgets, accounts, account_transactions)
- ✅ Índices para performance
- ✅ Triggers para atualização automática de saldo
- ✅ Functions (mark_overdue_transactions, mark_transaction_as_paid)
- ✅ Políticas RLS (Row Level Security)
- ✅ Job diário para marcar transações vencidas

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 5. Instale os componentes do shadcn/ui

```bash
npx shadcn-ui@latest init
```

Quando solicitado, confirme as configurações (já estão pré-configuradas no `components.json`).

Instale os componentes necessários:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add calendar
```

## 🏃 Executando o projeto

### Modo de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

### Preview da build de produção

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
gestao-financeira/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── layout/          # Layout components (Header, Sidebar, etc)
│   │   ├── dashboard/       # Componentes do dashboard
│   │   ├── transactions/    # Componentes de transações
│   │   ├── bills/           # Componentes de contas a pagar/receber
│   │   ├── categories/      # Componentes de categorias
│   │   ├── budgets/         # Componentes de orçamentos
│   │   └── accounts/        # Componentes de contas bancárias
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase
│   │   └── utils.ts         # Funções utilitárias
│   ├── hooks/               # Custom React hooks
│   ├── types/
│   │   └── database.types.ts # Tipos TypeScript do banco
│   ├── services/            # Services para API calls
│   ├── pages/               # Páginas da aplicação
│   ├── index.css            # Estilos globais (Tailwind v4)
│   └── main.tsx             # Entry point
├── supabase/
│   └── schema.sql           # Schema completo do banco
├── package.json
├── tsconfig.json
├── vite.config.ts
├── components.json          # Configuração shadcn/ui
└── README.md
```

## 🎯 Funcionalidades Principais

### ✅ Dashboard

- Resumo financeiro (entradas, saídas, saldo)
- Gráficos de evolução mensal
- Distribuição de gastos por categoria
- Orçamento vs realizado
- Alertas de contas vencidas
- Próximos vencimentos

### ✅ Transações

- Registro de receitas e despesas
- Status: pago, pendente, vencido, cancelado
- Transações recorrentes
- Tags e categorização
- Múltiplas contas
- Transferências entre contas

### ✅ Contas a Pagar/Receber

- Listagem de pendências
- Filtros por vencimento
- Marcar como pago com um clique
- Indicadores visuais de urgência

### ✅ Categorias

- Categorias personalizadas
- Hierarquia (categorias pai/filha)
- Cores e ícones customizados

### ✅ Orçamentos

- Orçamentos mensais/anuais
- Por categoria ou geral
- Acompanhamento de progresso
- Alertas de excedente

### ✅ Contas Bancárias

- Múltiplas contas
- Saldo atual e projetado
- Transferências entre contas
- Tipos: corrente, poupança, dinheiro, investimento

## 🔐 Autenticação

O sistema usa Supabase Auth. Para configurar:

1. No dashboard do Supabase, vá em **Authentication** > **Providers**
2. Habilite **Email** provider
3. Configure as URLs de redirecionamento conforme necessário

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Usuários só acessam seus próprios dados
- ✅ Validações no frontend e backend
- ✅ Autenticação via Supabase Auth

## 📊 Jobs Automáticos

O sistema possui um job diário (pg_cron) que:

- Marca transações pendentes como vencidas quando `due_date < hoje`
- Executa automaticamente às 00:00 (meia-noite)

## 🎨 Temas

O sistema suporta modo claro e escuro automaticamente via shadcn/ui.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação do [Supabase](https://supabase.com/docs)
2. Consulte a documentação do [shadcn/ui](https://ui.shadcn.com)
3. Abra uma issue neste repositório

---

Desenvolvido com ❤️ usando React + TypeScript + Supabase
