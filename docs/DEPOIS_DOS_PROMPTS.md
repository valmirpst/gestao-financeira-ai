## O que precisa fazer depois:

### 1. Adicionar Auth (1 prompt)

Adicione autenticação ao projeto:

1. Configurar Supabase Auth:
   - Email/senha
   - Magic link (opcional)

2. Criar páginas:
   - /login
   - /register
   - /forgot-password

3. Proteger rotas:
   - Redirecionar para /login se não autenticado
   - Middleware no router

4. Pegar user_id do Supabase:
   - const { data: { user } } = await supabase.auth.getUser()
   - Usar user.id em todas as queries

5. Atualizar RLS Policies:
   - Já existem no schema
   - Ativar no Supabase

Usar shadcn Form para login/registro.

###

-- Você executa isso no Supabase depois:
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- As policies já foram criadas no Prompt 1.1

### Testar

Criar 2 usuários diferentes
Cada um adiciona transações
Verificar que NÃO veem dados um do outro
