<!-- Você é um desenvolvedor full-stack especializado em TypeScript, React e Supabase.

Anexei o PRD completo de um sistema de gestão financeira (PRD.md).

Leia o PRD e crie o schema SQL completo para o Supabase incluindo:

1. CREATE TABLE para todas as tabelas (transactions, categories, budgets, accounts, account_transactions)
2. Indexes necessários para performance
3. Trigger para atualizar current_balance automaticamente
4. Function para marcar transações vencidas (mark_overdue_transactions)
5. Function para marcar transação como paga (mark_transaction_as_paid)
6. Políticas RLS básicas (apenas user_id = auth.uid())
7. Schedule do pg_cron para job diário

Organize em um arquivo SQL executável. -->

### ✅ Checkpoint: Execute o SQL no Supabase antes de continuar

<!-- Agora crie a estrutura completa do projeto React + TypeScript:

1. package.json com todas as dependências necessárias:
   - React + TypeScript
   - Vite
   - Supabase client
   - shadcn/ui (Tailwind v4, Radix)
   - React Query
   - React Hook Form + Zod
   - Recharts (para gráficos)
   - date-fns

2. Estrutura de pastas:
   /src
   /components
   - /ui (shadcn components)
   - /layout
   - /dashboard
   - /transactions
   - /bills
   - /categories
   - /budgets
   - /accounts

   /lib
   supabase.ts
   utils.ts
   /hooks
   /types
   database.types.ts
   /services
   /pages

3. Arquivos de configuração:
   - tsconfig.json
   - globals.css com "@import 'tailwindcss'"
   - vite.config.ts
   - components.json (shadcn)

4. Tipos TypeScript baseados no schema (database.types.ts)

5. Instruções de instalação e setup no README.md -->

### ✅ Checkpoint: Instale dependências e verifique se compila

<!-- Crie os arquivos base de configuração:

1. /src/lib/supabase.ts
   - Cliente do Supabase configurado
   - Tipos exportados

2. /src/lib/utils.ts
   - Funções utilitárias (cn, formatCurrency, formatDate, etc)

3. /src/types/index.ts
   - Tipos auxiliares (TransactionStatus, AccountType, etc)

4. /src/App.tsx
   - React Query Provider
   - Router básico (react-router-dom)
   - Layout base

5. /src/components/layout/Layout.tsx
   - Sidebar com navegação
   - Header
   - Container principal

Inclua navegação para: Dashboard, Transações, Contas a Pagar, Categorias, Orçamentos, Contas -->

### ✅ Checkpoint: Verifique se a navegação funciona

<!-- Instale e configure os seguintes componentes do shadcn/ui que vamos usar:

- button
- card
- input
- label
- select
- dialog
- form
- table
- badge
- alert
- calendar
- popover
- dropdown-menu
- tabs
- separator
- toast

Use: npx shadcn-ui@latest add [component]

Liste os comandos completos para eu executar. -->

### ✅ Checkpoint: Execute os comandos

<!-- Crie o service completo para transações em /src/services/transactions.service.ts:

Funções necessárias:

- getTransactions(filters) - com filtros de tipo, status, período, categoria, conta
- getTransactionById(id)
- createTransaction(data) - validar e criar
- updateTransaction(id, data)
- deleteTransaction(id)
- markAsPaid(id, paymentDate)
- getRecentTransactions(limit)

Use React Query para cache.
Inclua tratamento de erros completo.
Retorne tipos corretos do TypeScript. -->

###

<!-- Crie o service completo para categorias em /src/services/categories.service.ts:

Funções necessárias:

- getCategories() - retornar hierarquia pai/filho
- getCategoryById(id)
- createCategory(data)
- updateCategory(id, data)
- deleteCategory(id)
- createDefaultCategories() - criar categorias padrão do PRD

Inclua validações e tratamento de erros. -->

###

<!-- Crie o service completo para contas em /src/services/accounts.service.ts:

Funções necessárias:

- getAccounts() - incluir saldo atual e projetado
- getAccountById(id)
- createAccount(data)
- updateAccount(id, data)
- deleteAccount(id) - apenas marcar como inativa
- createTransfer(fromAccountId, toAccountId, amount, date, description)

Calcular saldo atual e projetado conforme PRD. -->

###

<!-- Crie a página Dashboard em /src/pages/Dashboard.tsx com:

1. Cards de Resumo (4 cards no topo):
   - Total de Entradas (mês atual, apenas paid)
   - Total de Saídas (mês atual, apenas paid)
   - Saldo Líquido
   - Comparação com mês anterior (%)

2. Filtro de período no topo:
   - Mês atual (default)
   - Últimos 30 dias
   - Mês anterior
   - Ano atual
   - Período customizado (date picker)

Use shadcn Card, Badge e Select.
Implemente cálculos conforme PRD. -->

### ✅ Checkpoint: Teste o Dashboard

<!-- Crie a página de listagem em /src/pages/Transactions.tsx:

1. Header com:
   - Título "Transações"
   - Botão "Nova Transação"
   - Resumo: Total do período filtrado

2. Filtros (barra lateral ou dropdown):
   - Tipo (todas/entrada/saída)
   - Status (todas/pagas/pendentes/vencidas/canceladas)
   - Período (date range)
   - Categoria (select)
   - Conta (select)
   - Busca por descrição

3. Tabela com colunas:
   - Data
   - Data Vencimento (se houver)
   - Descrição
   - Categoria (badge colorido)
   - Conta
   - Valor (vermelho para saída, verde para entrada)
   - Status (badge)
   - Ações (editar, deletar, marcar como pago se pending)

4. Paginação (50 itens por página)

Use shadcn Table, Button, Badge, Input, Select. -->

###

<!--
Crie o formulário de transação em /src/components/transactions/TransactionForm.tsx:

Campos:

1. Tipo (Radio ou Toggle): Entrada / Saída
2. Status (Radio ou Toggle): Pago / Pendente
3. Valor (Input number, format currency)
4. Descrição (Input text)
5. Categoria (Select com categorias do tipo selecionado)
6. Conta (Select)
7. Tags (Input com chips, opcional)

Campos condicionais:

- Se status = "Pago": mostrar campo "Data de Pagamento" (date picker, default: hoje)
- Se status = "Pendente": mostrar campo "Data de Vencimento" (date picker, obrigatório)

Use React Hook Form + Zod para validação.
Validações conforme PRD. -->

###

<!-- Continue o TransactionForm adicionando:

1. Toggle "Transação Recorrente" (checkbox)

Se marcado, mostrar:

- Frequência (select): Diária/Semanal/Mensal/Anual
- Repetir a cada X [frequência] (input number, default: 1)
- Data final (date picker, opcional)

2. Botões de ação:
   - Salvar (primary)
   - Cancelar (secondary)
   - Se editando: Deletar (destructive)

3. Criar modal/dialog para o formulário
4. Criar componente /src/components/transactions/TransactionDialog.tsx que usa o form

Toast de sucesso/erro após salvar. -->

### ✅ Checkpoint: Teste criar transações pagas e pendentes

<!--
Crie a página de categorias em /src/pages/Categories.tsx:

1. Lista agrupada por tipo (Entradas / Saídas)
2. Para cada categoria:
   - Ícone (colorido)
   - Nome
   - Cor (círculo)
   - Total gasto/recebido no mês (apenas paid)
   - Subcategorias (indentadas)
   - Botões: Editar, Deletar

3. Botão "Nova Categoria"

4. Dialog com formulário:
   - Nome (input)
   - Tipo (select): Entrada/Saída/Ambos
   - Cor (color picker ou preset de cores)
   - Ícone (select com preview)
   - Categoria Pai (select, opcional)

5. Ao criar usuário, criar categorias padrão do PRD

Use shadcn Dialog, Badge, Button. -->

### ✅ Checkpoint: Teste CRUD completo de categorias

<!-- Crie a página de contas em /src/pages/Accounts.tsx:

1. Lista de contas ativas
2. Para cada conta:
   - Nome
   - Tipo (badge)
   - Saldo atual (grande, verde/vermelho)
   - Saldo projetado (menor, com tooltip explicativo)
   - Botões: Editar, Transferir, Arquivar

3. Botão "Nova Conta"

4. Dialog com formulário:
   - Nome (input)
   - Tipo (select): Corrente/Poupança/Dinheiro/Investimento/Outro
   - Saldo Inicial (input number)
   - Moeda (select, default: BRL)

5. Dialog de Transferência:
   - Conta Origem (select)
   - Conta Destino (select)
   - Valor (input number)
   - Data (date picker)
   - Descrição (input)
   - Status (Pago/Pendente)
   - Se pendente: Data de Vencimento

Validações: não permitir transferência para mesma conta.
Criar 2 transações vinculadas com transfer_id. -->

### ✅ Checkpoint: Teste CRUD de contas e transferências

<!-- Crie a página /src/pages/Bills.tsx (Contas a Pagar/Receber):

1. Cards de resumo no topo (4 cards):
   - Total a Pagar (pending + overdue)
   - Total Vencido a Pagar (overdue)
   - Total a Receber (pending + overdue)
   - Total Vencido a Receber (overdue)

2. Filtros:
   - Tipo: A Pagar / A Receber / Todos (tabs)
   - Status: Pendentes / Vencidas / Todas
   - Período de vencimento (próximos 7 dias, 30 dias, vencidas, customizado)
   - Categoria
   - Conta

3. Lista/Tabela ordenada por data de vencimento:
   - Descrição
   - Categoria (badge)
   - Conta
   - Valor
   - Data de Vencimento
   - Dias restantes / Dias em atraso (badge colorido)
   - Status (badge)
   - Ação rápida: "Marcar como Pago" (botão icon)

Use shadcn Tabs para alternar entre A Pagar/A Receber. -->

###

<!-- Crie o componente /src/components/bills/MarkAsPaidDialog.tsx:

Dialog simples para marcar transação como paga:

1. Mostrar detalhes da transação:
   - Descrição
   - Valor
   - Data de vencimento
   - Dias em atraso (se houver)

2. Campo "Data de Pagamento" (date picker, default: hoje)

3. Botões:
   - Confirmar (primary, chama markAsPaid)
   - Cancelar (secondary)

4. Após confirmar:
   - Toast de sucesso
   - Atualizar lista
   - Se pago com atraso, mostrar mensagem "Pago com X dias de atraso"

Integrar na listagem de Bills e Transactions. -->

### ✅ Checkpoint: Teste marcar pendentes como pagas

<!-- Atualize o Dashboard (/src/pages/Dashboard.tsx) para incluir:

1. Seção "Próximos Vencimentos" (abaixo das transações recentes):
   - Lista dos próximos 5 vencimentos
   - Para cada: descrição, valor, vencimento, dias restantes, botão "Marcar como Pago"

2. Melhorar cards de alerta:
   - Se houver contas vencidas, destacar em vermelho
   - Click no card leva para /bills com filtro aplicado

3. Adicionar indicador no menu lateral:
   - Badge com count de contas vencidas no item "Contas a Pagar" -->

### ✅ Checkpoint: Verifique alertas e vencimentos no Dashboard

<!-- Crie o service de orçamentos em /src/services/budgets.service.ts:

Funções:

- getBudgets() - retornar orçamentos ativos com cálculo de uso
- getBudgetById(id)
- createBudget(data)
- updateBudget(id, data)
- deleteBudget(id)
- getBudgetUsage(budgetId) - calcular spent, percentage, days_remaining

Cálculo conforme PRD (apenas transações paid). -->

###

<!-- Crie a página /src/pages/Budgets.tsx:

1. Lista de orçamentos ativos
2. Para cada orçamento:
   - Categoria (ou "Geral")
   - Período (Mensal/Anual)
   - Barra de progresso (valor gasto / valor orçado)
   - Porcentagem (cores: verde <80%, amarelo 80-100%, vermelho >100%)
   - Valor gasto / Valor orçado
   - Dias restantes no período
   - Botões: Editar, Deletar

3. Botão "Novo Orçamento"

4. Dialog com formulário:
   - Categoria (select, opcional = orçamento geral)
   - Valor (input number)
   - Período (select): Mensal/Anual
   - Data de Início (date picker)
   - Data Final (date picker, opcional)

5. Alert se orçamento excedido

Use shadcn Progress para barra de progresso.
Validar para não permitir sobreposição de períodos. -->

###

<!-- Agora, vamos melhorar o dashboard. Não tendo a ver diretamente com os budgets.
Logo, siga este prompt:

Adicione gráficos ao Dashboard usando Recharts:

1. Gráfico de Linha (Evolução Mensal):
   - Últimos 6 meses
   - 2 linhas: Entradas (verde) e Saídas (vermelho)
   - Dados: apenas transações paid
   - Tooltip com valores formatados
   - Legend

Criar componente /src/components/dashboard/MonthlyEvolutionChart.tsx

Use LineChart do recharts.
Responsivo. -->

###

Adicione mais gráficos ao Dashboard:

1. Gráfico de Pizza (Distribuição por Categoria):
   - Top 5 categorias + "Outros"
   - Apenas despesas paid do período filtrado
   - Cores das categorias
   - Tooltip com nome, valor e %
   - Legend

2. Gráfico de Barras (Orçamento vs Realizado):
   - Categorias com orçamento
   - 2 barras por categoria: Orçado (cinza) e Realizado (colorido)
   - Se realizado > orçado, barra vermelha
   - Tooltip

Criar componentes:

- /src/components/dashboard/CategoryDistributionChart.tsx
- /src/components/dashboard/BudgetComparisonChart.tsx

Use PieChart e BarChart do recharts.

### ✅ Checkpoint: Verifique todos os gráficos

<!-- Implemente a lógica de transações recorrentes:

1. Function no Supabase (SQL):
   - create_recurring_transactions()
   - Verificar transações recorrentes
   - Se passou da próxima data, criar instância
   - Manter status (se original é pending, próxima também é)
   - Incrementar due_date se pendente, date se paga

2. Schedule com pg_cron:
   - Executar diariamente às 00:00

3. Adicionar botão manual no UI (admin):
   - "Processar Recorrências" para teste

Testar criando uma transação recorrente mensal. -->

###

Melhore os filtros em Transactions e Bills:

1. Criar componente /src/components/shared/AdvancedFilters.tsx:
   - Sidebar ou Popover com todos os filtros
   - Múltiplas categorias (checkbox)
   - Múltiplas contas (checkbox)
   - Range de valor (min - max)
   - Tags (multiselect)
   - Aplicar filtros
   - Limpar todos os filtros (botão)

2. Mostrar chips dos filtros ativos
3. Salvar filtros no localStorage (opcional)

Usar shadcn Popover, Checkbox, Slider.

###

<!-- Implemente melhorias de experiência:

1. Loading States:
   - Skeleton loader para listas
   - Spinner em botões durante ações

2. Empty States:
   - Mensagens amigáveis quando não há dados
   - Ilustração + CTA (ex: "Adicione sua primeira transação")

3. Confirmações:
   - Dialog de confirmação antes de deletar (AlertDialog)
   - Avisos ao editar transações antigas (>90 dias)

4. Atalhos de Teclado:
   - Ctrl+N / Cmd+N: Nova transação
   - Escape: Fechar dialogs
   - Enter: Salvar forms

5. Toast Notifications:
   - Sucesso, erro, info
   - Undo para deleções (opcional)

Use shadcn Skeleton, AlertDialog, Toast. -->

###

<!-- Implemente tema claro/escuro:

1. Configurar Tailwind para dark mode (class strategy)
2. Criar contexto ThemeProvider
3. Toggle no header ou sidebar
4. Salvar preferência no localStorage
5. Ajustar cores de todos os componentes

Testar todas as páginas em ambos os modos. -->

###

Ajuste todos os componentes para mobile:

1. Dashboard:
   - Cards em coluna única
   - Gráficos responsivos
   - Scroll horizontal em tabelas

2. Forms:
   - Full screen em mobile
   - Inputs com tamanho adequado

3. Sidebar:
   - Bottom navigation em mobile
   - Hamburger menu

4. Tabelas:
   - Card view em mobile ao invés de table
   - Swipe actions

Testar em 320px, 375px, 768px, 1024px.

###

Reforce validações e tratamento de erros:

1. Validações frontend (Zod schemas):
   - Valores positivos
   - Datas válidas
   - Campos obrigatórios
   - Formatos (CPF, moeda, etc)

2. Tratamento de erros do Supabase:
   - Mensagens amigáveis
   - Logs no console (dev)
   - Fallbacks

3. Retry automático em falhas de rede
4. Offline detection (toast informando)

Usar React Query error boundaries.

###

Otimize a aplicação:

1. React Query:
   - Cache strategy adequada
   - Stale time otimizado
   - Prefetch em hover

2. Lazy loading:
   - Páginas (React.lazy + Suspense)
   - Imagens (se houver)

3. Debounce em buscas (300ms)

4. Virtualização em listas longas (react-window)

5. Memo em componentes pesados

6. Indexes no Supabase para queries frequentes

Medir performance com React DevTools.

###

Adicione testes e documentação:

1. Testes unitários (Vitest):
   - Funções de cálculo (saldo, orçamento, etc)
   - Formatadores (currency, date)
   - Validações

2. Documentação:
   - README com setup e arquitetura
   - Comentários JSDoc em funções complexas
   - Storybook para componentes UI (opcional)

3. Scripts no package.json:
   - test, test:watch, test:coverage
   - lint, format

Focar testes nas regras de negócio críticas.

### ✅ Checkpoint Final: Teste completo da aplicação
