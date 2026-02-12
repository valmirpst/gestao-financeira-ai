PRD - Sistema de Gestão Financeira Pessoal
Stack Técnica

Frontend: TypeScript + React
UI Components: shadcn/ui
Backend: Supabase
Styling: Tailwind CSS

Modelo de Dados
Tabela: transactions
typescript{
id: string (uuid, primary key)
user_id: string (uuid, foreign key)
type: 'income' | 'expense'
amount: number (decimal, positivo)
category_id: string (uuid, foreign key, nullable)
description: string
date: date // data efetiva da transação
due_date: date (nullable) // data de vencimento
status: 'pending' | 'paid' | 'overdue' | 'cancelled' (default: 'paid')
is_recurring: boolean
recurrence_config: {
frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
interval: number
end_date: date | null
} | null
tags: string[]
payment_date: date (nullable) // data em que foi efetivamente paga
created_at: timestamp
updated_at: timestamp
}
Lógica de Status:

pending: transação agendada, ainda não paga (due_date no futuro ou presente)
paid: transação paga (payment_date preenchida)
overdue: transação vencida não paga (due_date no passado + status pending)
cancelled: transação cancelada

Regras:

Se payment_date for preenchida, status automaticamente vira paid e date recebe o valor de payment_date
Se due_date for no passado e status = 'pending', sistema atualiza automaticamente para overdue
due_date é obrigatório quando a transação é criada com status = 'pending'

Tabela: categories
typescript{
id: string (uuid, primary key)
user_id: string (uuid, foreign key)
name: string
type: 'income' | 'expense' | 'both'
color: string (hex color)
icon: string (nome do ícone)
parent_category_id: string (uuid, foreign key, nullable)
created_at: timestamp
}
Tabela: budgets
typescript{
id: string (uuid, primary key)
user_id: string (uuid, foreign key)
category_id: string (uuid, foreign key, nullable)
amount: number (decimal)
period: 'monthly' | 'yearly'
start_date: date
end_date: date | null
created_at: timestamp
updated_at: timestamp
}
Tabela: accounts
typescript{
id: string (uuid, primary key)
user_id: string (uuid, foreign key)
name: string
type: 'checking' | 'savings' | 'cash' | 'investment' | 'other'
initial_balance: number (decimal)
current_balance: number (decimal, calculado)
currency: string (default: 'BRL')
is_active: boolean
created_at: timestamp
updated_at: timestamp
}
Tabela: account_transactions
typescript{
id: string (uuid, primary key)
transaction_id: string (uuid, foreign key)
account_id: string (uuid, foreign key)
created_at: timestamp
}

Funcionalidades Principais

1. Dashboard (Página Inicial)
   Entrada de Dados:

Filtro de período (mês atual, últimos 30 dias, mês anterior, ano atual, período customizado)
Filtro por conta (todas, conta específica)

Saída de Dados:

Total de entradas no período
Total de saídas no período
Saldo líquido (entradas - saídas)
Comparação com período anterior (% de variação)
Contas a pagar vencidas (count + valor total)
Contas a pagar nos próximos 7 dias (count + valor total)
Contas a receber vencidas (count + valor total)
Contas a receber nos próximos 7 dias (count + valor total)
Gráfico de linha: evolução mensal das entradas vs saídas (últimos 6 meses)
Gráfico de pizza: distribuição de gastos por categoria (top 5 + outros)
Gráfico de barras: orçamento vs realizado por categoria
Lista de transações recentes (últimas 5)
Lista de próximos vencimentos (próximos 5)
Alertas de orçamentos excedidos
Projeção de saldo final do mês

Cálculos:
typescript// Saldo líquido (apenas transações pagas)
balance = sum(transactions where type='income' AND status='paid')

- sum(transactions where type='expense' AND status='paid')

// Comparação período anterior
previous_balance = cálculo do período anterior
variation_percentage = ((balance - previous_balance) / previous_balance) \* 100

// Orçamento vs realizado (apenas transações pagas)
budget_usage = (sum(expenses by category where status='paid') / budget.amount) \* 100

// Projeção
average_daily_expense = total_expenses / days_passed
projected_month_expense = average_daily_expense \* days_in_month
pending_bills = sum(transactions where status='pending' AND type='expense' AND due_date <= end_of_month)
projected_balance = current_balance + projected_income - projected_month_expense - pending_bills

// Contas vencidas
overdue_bills_count = count(transactions where status='overdue' AND type='expense')
overdue_bills_total = sum(transactions where status='overdue' AND type='expense')

// Próximos vencimentos
upcoming_bills_count = count(transactions where
status='pending'
AND type='expense'
AND due_date BETWEEN today AND today + 7 days
)
upcoming_bills_total = sum(transactions where
status='pending'
AND type='expense'
AND due_date BETWEEN today AND today + 7 days
)

2. Gerenciamento de Transações
   2.1 Listagem de Transações
   Entrada de Dados:

Filtros: tipo (entrada/saída/todos), categoria, período, conta, tags, status (todas/pagas/pendentes/vencidas/canceladas)
Ordenação: data, valor, categoria, data de vencimento
Paginação: 50 itens por página

Saída de Dados:

Tabela com colunas: data, data vencimento, descrição, categoria, conta, tags, valor, status
Total do período filtrado
Total pendente (soma de transações com status pending/overdue)
Opções de ação: editar, duplicar, remover, marcar como pago (se pending/overdue)
Busca por descrição
Indicador visual de status:

Verde: paid
Amarelo: pending
Vermelho: overdue
Cinza: cancelled

2.2 Criar/Editar Transação
Entrada de Dados:
typescript{
type: 'income' | 'expense' (obrigatório)
amount: number (obrigatório, > 0)
description: string (obrigatório)
category_id: string (opcional)
account_id: string (obrigatório)
status: 'pending' | 'paid' (default: 'paid')

// Se status = 'paid'
payment_date: date (obrigatório, default: hoje)

// Se status = 'pending'
due_date: date (obrigatório)

tags: string[] (opcional)
is_recurring: boolean (default: false)
recurrence_config?: {
frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
interval: number (default: 1)
end_date: date | null
}
}
Validações:

amount deve ser número positivo
Se status = 'paid', payment_date é obrigatório
Se status = 'pending', due_date é obrigatório
payment_date não pode ser futura (mais de 1 dia no futuro)
Se is_recurring = true, recurrence_config é obrigatório
description deve ter entre 3 e 200 caracteres

Saída de Dados:

Mensagem de sucesso/erro
Transação criada/atualizada
Atualização automática do current_balance da conta (apenas se status = paid)

Lógica de Transações Recorrentes:

Ao criar transação recorrente, sistema cria apenas a primeira instância
Se recorrente com status = 'pending', próximas instâncias são criadas também como pending com due_date incrementado
Job/função processa criação de próximas instâncias baseado na frequência
Editar transação recorrente: opção de "editar apenas esta" ou "editar esta e futuras"

2.3 Marcar Transação como Paga
Entrada de Dados:
typescript{
transaction_id: string (obrigatório)
payment_date: date (default: hoje)
}
Lógica:

Atualiza payment_date com a data fornecida
Atualiza status para paid
Atualiza date com o valor de payment_date
Recalcula current_balance da conta associada
Se for transação recorrente, não afeta próximas instâncias

Validações:

transaction_id deve ser de uma transação com status pending/overdue
payment_date não pode ser futura

3. Contas a Pagar e Receber
   3.1 Listagem de Contas (/bills)
   Entrada de Dados:

Filtros:

Tipo: a pagar (expense), a receber (income), todos
Status: pendentes, vencidas, pagas, canceladas, todas
Período de vencimento (próximos 7 dias, próximos 30 dias, vencidas, customizado)
Categoria
Conta

Saída de Dados:

Lista ordenada por data de vencimento (mais próximas primeiro)
Para cada item:

Descrição
Categoria
Conta
Valor
Data de vencimento
Status (com indicador visual)
Dias até vencimento / Dias em atraso
Ação: "Marcar como Pago" (botão rápido)

Resumo no topo:

Total a pagar (pending + overdue)
Total a receber (pending + overdue)
Total vencido a pagar
Total vencido a receber

3.2 Ações Rápidas

Marcar como Pago: Um clique abre modal com payment_date preenchida (default: hoje), confirmar paga a conta
Editar: Abre formulário completo
Cancelar: Muda status para cancelled
Duplicar: Cria nova conta baseada na atual

4. Gerenciamento de Categorias
   4.1 Listagem de Categorias
   Saída de Dados:

Lista agrupada por tipo (entradas/saídas)
Exibição hierárquica (categorias pai e filhas)
Para cada categoria: nome, cor, ícone, total gasto/recebido no mês atual

4.2 Criar/Editar Categoria
Entrada de Dados:
typescript{
name: string (obrigatório, único por usuário)
type: 'income' | 'expense' | 'both' (obrigatório)
color: string (obrigatório, hex color)
icon: string (obrigatório)
parent_category_id: string | null (opcional)
}
Validações:

name entre 2 e 50 caracteres
color em formato hex válido (#RRGGBB)
parent_category_id deve ser de uma categoria existente do mesmo tipo
Não permitir loops (categoria filha sendo pai de sua própria categoria pai)

Categorias Padrão (sugestão ao criar usuário):
typescript// Despesas
['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Contas Fixas', 'Outros']

// Receitas
['Salário', 'Investimentos', 'Freelance', 'Outros']

5. Gerenciamento de Orçamentos
   5.1 Criar/Editar Orçamento
   Entrada de Dados:
   typescript{
   category_id: string | null (null = orçamento geral)
   amount: number (obrigatório, > 0)
   period: 'monthly' | 'yearly' (obrigatório)
   start_date: date (obrigatório)
   end_date: date | null (opcional)
   }
   Validações:

amount deve ser positivo
end_date deve ser posterior a start_date
Não permitir orçamentos sobrepostos para mesma categoria

5.2 Visualização de Orçamentos
Saída de Dados:

Lista de orçamentos ativos
Para cada orçamento:

Categoria (ou "Geral")
Período
Valor orçado
Valor gasto (apenas transações pagas)
Porcentagem utilizada
Indicador visual (verde < 80%, amarelo 80-100%, vermelho > 100%)
Dias restantes no período

Cálculo:
typescript// Valor gasto no período do orçamento (apenas transações pagas)
spent = sum(transactions where
type='expense'
AND status='paid'
AND (category_id = budget.category_id OR budget.category_id IS NULL)
AND date >= current_period_start
AND date <= current_period_end
)

// Porcentagem
percentage = (spent / budget.amount) \* 100

6. Gerenciamento de Contas
   6.1 Criar/Editar Conta
   Entrada de Dados:
   typescript{
   name: string (obrigatório, único por usuário)
   type: 'checking' | 'savings' | 'cash' | 'investment' | 'other'
   initial_balance: number (obrigatório)
   currency: string (default: 'BRL')
   is_active: boolean (default: true)
   }
   Validações:

name entre 2 e 100 caracteres
initial_balance pode ser negativo

Cálculo de Saldo Atual:
typescript// Apenas transações pagas afetam o saldo
current_balance = initial_balance

- sum(transactions where type='income' AND status='paid' AND account_id = this.id)

* sum(transactions where type='expense' AND status='paid' AND account_id = this.id)
  6.2 Visualização de Contas
  Saída de Dados:

Lista de contas ativas
Para cada conta:

Nome
Tipo
Saldo atual
Saldo projetado (saldo atual - contas pendentes)
Indicador visual (verde se positivo, vermelho se negativo)

Cálculo de Saldo Projetado:
typescriptprojected_balance = current_balance

- sum(transactions where type='income' AND status IN ('pending', 'overdue') AND account_id = this.id)

* sum(transactions where type='expense' AND status IN ('pending', 'overdue') AND account_id = this.id)
  6.3 Transferência entre Contas
  Entrada de Dados:
  typescript{
  from_account_id: string (obrigatório)
  to_account_id: string (obrigatório)
  amount: number (obrigatório, > 0)
  date: date (obrigatório)
  description: string (obrigatório)
  status: 'pending' | 'paid' (default: 'paid')
  due_date: date (condicional: se status = pending)
  }
  Lógica:

Cria 2 transações vinculadas:

Expense na conta origem
Income na conta destino

Ambas com categoria especial "Transferência"
Ambas com mesmo status e datas
Vinculadas por um transfer_id comum (adicionar campo na tabela)

Fluxos Principais
Fluxo 1: Registrar Nova Despesa Paga

Usuário clica em "Nova Transação" ou botão "+" rápido
Seleciona tipo "Despesa"
Status default é "Pago"
Preenche: valor, descrição, categoria, conta, data de pagamento
(Opcional) Adiciona tags
(Opcional) Marca como recorrente e configura frequência
Clica em "Salvar"
Sistema valida dados
Sistema cria transação com status=paid
Sistema atualiza saldo da conta
Sistema exibe mensagem de sucesso
Sistema redireciona para lista de transações ou dashboard

Fluxo 2: Registrar Conta a Pagar (Pendente)

Usuário clica em "Nova Transação" ou acessa "/bills"
Seleciona tipo "Despesa"
Alterna status para "Pendente"
Preenche: valor, descrição, categoria, conta, data de vencimento
(Opcional) Marca como recorrente (sistema criará próximos vencimentos automaticamente)
Clica em "Salvar"
Sistema cria transação com status=pending
Sistema NÃO atualiza saldo da conta (ainda não foi paga)
Transação aparece na lista de contas a pagar

Fluxo 3: Pagar uma Conta Pendente

Usuário acessa "/bills" ou vê alerta no dashboard
Localiza conta pendente na lista
Clica em "Marcar como Pago"
Modal abre com data de pagamento (default: hoje)
Usuário confirma ou ajusta data
Clica em "Confirmar"
Sistema atualiza status para paid
Sistema atualiza saldo da conta
Transação some da lista de pendentes
Aparece na lista de transações pagas

Fluxo 4: Consultar Gastos do Mês

Usuário acessa Dashboard
Sistema calcula automaticamente:

Total de despesas pagas do mês atual
Total de receitas pagas do mês atual
Total de contas pendentes/vencidas
Saldo líquido

Sistema exibe gráficos atualizados (apenas transações pagas)
Sistema exibe alertas de contas vencidas
Usuário pode alterar período usando filtro de data
Sistema recalcula e atualiza visualizações

Fluxo 5: Configurar Orçamento Mensal

Usuário acessa "Orçamentos"
Clica em "Novo Orçamento"
Seleciona categoria (ou deixa geral)
Define valor mensal
Define data de início
Clica em "Salvar"
Sistema cria orçamento
Dashboard passa a exibir progresso do orçamento (baseado em transações pagas)

Fluxo 6: Verificar Próximos Vencimentos

Usuário acessa Dashboard ou "/bills"
Sistema lista próximos vencimentos (próximos 7 dias)
Cada item mostra: descrição, valor, vencimento, dias restantes
Usuário pode clicar em qualquer item para:

Marcar como pago
Editar
Visualizar detalhes

Casos Extremos

1. Transações

Data futura: Aceitar até 1 dia no futuro (para lançamentos do dia seguinte), rejeitar além disso
Valor zero: Rejeitar transações com valor = 0
Valor muito alto: Alertar usuário se valor > 10x a média histórica, mas permitir
Categoria deletada: Se categoria for deletada, transações associadas ficam sem categoria (null)
Conta deletada: Não permitir remover conta com transações; forçar "arquivar" (is_active = false)
Edição de transação antiga: Permitir, mas alertar se for > 90 dias no passado
Pagar com atraso: payment_date > due_date é permitido, mostrar "Pago com X dias de atraso"
Pagar adiantado: payment_date < due_date é permitido, mostrar "Pago X dias antes do vencimento"
Cancelar conta pendente: Muda status para cancelled, não afeta saldo
Editar conta paga: Permitir, mas alertar usuário que pode desconciliar o saldo

2. Transações Recorrentes

Data final no passado: Não criar novas instâncias
Recorrência pendente: Ao criar próxima instância, manter como pending com novo due_date incrementado
Edição de recorrência:

"Editar apenas esta": quebra vínculo, transação se torna única
"Editar esta e futuras": atualiza config, futuras instâncias seguem nova regra

Remover recorrência: Opção de remover apenas uma instância ou toda a série
Pagar instância recorrente: Não afeta próximas instâncias, apenas a atual muda para paid

3. Orçamentos

Sem transações na categoria: Exibir 0% utilizado
Orçamento excedido: Exibir porcentagem > 100% em vermelho com alerta
Múltiplos orçamentos: Validar para não permitir sobreposição de períodos na mesma categoria
Categoria sem orçamento: Não exibir na seção de orçamentos
Transações pendentes: NÃO contam para o cálculo do orçamento (apenas pagas)

4. Contas

Saldo negativo: Permitir e exibir claramente em vermelho
Saldo projetado negativo: Alertar usuário sobre possível estouro
Conta sem transações: Saldo atual = saldo inicial, saldo projetado = saldo inicial
Transferência entre mesma conta: Rejeitar
Transferência com contas inativas: Alertar mas permitir
Transferência pendente: Criar ambas transações como pending, pagar uma não paga automaticamente a outra

5. Categorias

Categoria sem uso: Permitir remover
Categoria com transações: Ao remover, confirmar ação e setar transactions.category_id = null
Subcategorias órfãs: Se categoria pai for deletada, subcategorias sobem um nível (parent_category_id = null)
Hierarquia profunda: Limitar a 2 níveis (pai > filho, sem neto)

6. Contas a Pagar/Receber

Vencimento no passado: Sistema automaticamente marca como overdue
Múltiplas contas vencidas: Exibir todas com destaque vermelho
Conta paga após vencimento: Permitir e registrar atraso
Editar data de vencimento: Permitir, recalcula status automaticamente
Converter paga em pendente: Não permitir (uma vez paga, permanece paga)

7. Filtros e Buscas

Período sem transações: Exibir "Nenhuma transação encontrada" com sugestão de ajustar filtros
Busca sem resultados: Exibir mensagem amigável
Filtros combinados muito restritivos: Permitir "limpar todos os filtros" com um clique

8. Performance

Muitas transações: Implementar paginação e lazy loading
Gráficos com muitos dados: Agregar dados por período (diário → semanal → mensal)
Cálculos pesados: Cachear resultados de dashboard por 5 minutos
Atualização de status overdue: Job executado diariamente para marcar transações vencidas

9. Job Automático de Status

Execução: Diariamente às 00:00
Lógica:

typescriptUPDATE transactions
SET status = 'overdue'
WHERE status = 'pending'
AND due_date < CURRENT_DATE

Estrutura de Páginas

1. /dashboard (Página Inicial)

Cards de resumo (entradas, saídas, saldo)
Cards de contas pendentes e vencidas
Gráficos principais
Transações recentes
Próximos vencimentos
Alertas de orçamento

2. /transactions

Listagem com filtros (incluindo status)
Botão de nova transação
Opções de ação por item
Ação rápida "Marcar como Pago" para pendentes

3. /transactions/new e /transactions/:id/edit

Formulário de transação
Toggle entre Pago/Pendente
Campos condicionais baseados em status
Validação em tempo real

4. /bills (Contas a Pagar/Receber)

Listagem focada em transações pendentes/vencidas
Filtros específicos (tipo, status, período de vencimento)
Resumo de valores pendentes
Ação rápida "Marcar como Pago"
Indicadores visuais de urgência

5. /categories

Lista de categorias
CRUD inline ou modal

6. /budgets

Lista de orçamentos ativos
Progresso visual (baseado em transações pagas)
CRUD de orçamentos

7. /accounts

Lista de contas
Saldo atual e saldo projetado de cada conta
Opção de transferência
CRUD de contas

Queries Supabase Necessárias
typescript// 1. Buscar transações com filtros
const { data } = await supabase
.from('transactions')
.select(`     *,
    category:categories(*),
    account:account_transactions(account:accounts(*))
  `)
.eq('user_id', userId)
.gte('date', startDate)
.lte('date', endDate)
.order('date', { ascending: false })

// 2. Calcular total por tipo (apenas pagas)
const { data } = await supabase
.rpc('calculate_totals', {
p_user_id: userId,
p_start_date: startDate,
p_end_date: endDate,
p_type: 'expense',
p_status: 'paid'
})

// 3. Buscar gastos por categoria (apenas pagas)
const { data } = await supabase
.from('transactions')
.select('category_id, categories(name, color), amount')
.eq('type', 'expense')
.eq('status', 'paid')
.eq('user_id', userId)
.gte('date', startDate)
.lte('date', endDate)

// 4. Buscar contas pendentes/vencidas
const { data } = await supabase
.from('transactions')
.select(`     *,
    category:categories(*),
    account:account_transactions(account:accounts(*))
  `)
.eq('user_id', userId)
.in('status', ['pending', 'overdue'])
.order('due_date', { ascending: true })

// 5. Buscar próximos vencimentos
const { data } = await supabase
.from('transactions')
.select('\*')
.eq('user_id', userId)
.eq('status', 'pending')
.gte('due_date', today)
.lte('due_date', sevenDaysFromNow)
.order('due_date', { ascending: true })

// 6. Atualizar saldo da conta (trigger no Supabase)
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
UPDATE accounts
SET current_balance = initial_balance +
(SELECT COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0)
FROM transactions t
JOIN account_transactions at ON t.id = at.transaction_id
WHERE at.account_id = NEW.account_id
AND t.status = 'paid')
WHERE id = NEW.account_id;
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

// 7. Job automático para marcar contas vencidas
CREATE OR REPLACE FUNCTION mark_overdue_transactions()
RETURNS void AS
$$

BEGIN
UPDATE transactions
SET status = 'overdue'
WHERE status = 'pending'
AND due_date < CURRENT_DATE;
END;

$$
LANGUAGE plpgsql;

// Agendar job diário (usar pg_cron no Supabase)
SELECT cron.schedule(
  'mark-overdue-daily',
  '0 0 * * *',
  $$SELECT mark_overdue_transactions()$$
);

// 8. Marcar transação como paga
CREATE OR REPLACE FUNCTION mark_transaction_as_paid(
  p_transaction_id uuid,
  p_payment_date date
)
RETURNS void AS
$$

BEGIN
UPDATE transactions
SET
status = 'paid',
payment_date = p_payment_date,
date = p_payment_date,
updated_at = NOW()
WHERE id = p_transaction_id
AND status IN ('pending', 'overdue');
END;

$$
LANGUAGE plpgsql;

Considerações de UX

Ações Rápidas:

Botão flutuante "+" para nova transação de qualquer tela
Botão "Marcar como Pago" com um clique em listas de pendentes


Feedback Visual:

Loading states, animações suaves, toasts de sucesso/erro
Badges coloridos para status (verde/amarelo/vermelho/cinza)
Contador de dias até vencimento / dias em atraso


Temas: Modo claro/escuro
Responsividade: Mobile-first, funcional em todos os dispositivos
Confirmações: Sempre pedir confirmação antes de remover
Atalhos: Enter para salvar, ESC para cancelar em formulários
Estados Vazios: Mensagens amigáveis e call-to-actions quando não houver dados
Alertas Proativos:

Notificação visual no dashboard se houver contas vencidas
Badge com contador de pendentes no menu de navegação
Cores diferenciadas para urgência (vermelho para vencidas, amarelo para vencendo em 3 dias)


Formulários Inteligentes:

Ao selecionar status "Pendente", mostrar campo de vencimento
Ao selecionar status "Pago", mostrar campo de data de pagamento
Validação em tempo real de datas




Campos Adicionais Necessários
Adicionar à tabela transactions:
typescripttransfer_id: string (uuid, nullable) // para vincular transferências

Regras de Negócio Importantes

Saldo da conta: Apenas transações com status = 'paid' afetam o saldo atual
Saldo projetado: Inclui todas as transações pendentes e vencidas
Orçamentos: Calculados apenas sobre transações pagas
Gráficos: Exibem apenas transações pagas
Transações recorrentes pendentes: Próximas instâncias são criadas como pending
Status overdue: Atualizado automaticamente por job diário
Pagar transação: Atualiza status, adiciona payment_date, atualiza date, recalcula saldo
Cancelar transação: Muda status para cancelled, não afeta saldo
Transferências: Criadas sempre em par (saída + entrada) com mesmo status
$$
