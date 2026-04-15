# 🔐 SETUP SUPABASE - AUTENTICAÇÃO

## 1. CRIAR CONTA NO SUPABASE

1. Acesse: https://supabase.com/
2. Clique em **Start your project**
3. Faça login com GitHub ou Email
4. Crie um **novo projeto**:
   - Nome: `lovable-extension-auth`
   - Database Password: (guarde bem!)
   - Region: `South America (São Paulo)`

## 2. EXECUTAR SETUP DO BANCO DE DADOS

1. No dashboard do Supabase, vá em **SQL Editor** (ícone na lateral esquerda)
2. Clique em **New query**
3. Copie TODO o conteúdo do arquivo `supabase-setup.sql`
4. Cole no editor SQL
5. Clique em **RUN** (canto inferior direito)
6. Aguarde mensagem de sucesso ✅

**Isso irá criar:**
- ✅ Tabela `users` (usuários cadastrados)
- ✅ Tabela `user_sessions` (sessões ativas - máximo 1 por usuário)
- ✅ Tabela `auth_logs` (logs de auditoria)
- ✅ Usuário de teste: `teste@exemplo.com` / `teste123`

## 3. PEGAR CREDENCIAIS DA API

1. Vá em **Settings** (ícone de engrenagem na lateral)
2. Clique em **API**
3. Copie as seguintes informações:

### Project URL:
```
https://XXXXXXXXXXXX.supabase.co
```

### API Keys - anon/public:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

## 4. CONFIGURAR A EXTENSÃO

1. Abra o arquivo `supabaseAuth.js`
2. **Linha 8-9** - Substitua com suas credenciais:

```javascript
this.supabaseUrl = 'https://ynsrzoyxkcgigbcoglet.supabase.co'; // Cole sua URL aqui
this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3J6b3l4a2NnaWdiY29nbGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDgzODAsImV4cCI6MjA4NTI4NDM4MH0.i7khbIpDBVmIqdOgB9ySh-UoxBVHgynyYDBeq6EZ_Ck'; // Cole sua chave aqui
```

3. Salve o arquivo

## 5. RECARREGAR EXTENSÃO

1. Vá em `chrome://extensions/`
2. Clique em **🔄 Recarregar** na extensão
3. Abra a extensão
4. Tela de login deve aparecer!

## 6. FAZER PRIMEIRO LOGIN

**Usuário de teste criado automaticamente:**
- Email: `teste@exemplo.com`
- Senha: `teste123`

Digite as credenciais e clique em **ENTRAR**

## 7. COMO FUNCIONA A PROTEÇÃO

### ✅ Sessão Única (Anti-Burla):
- Quando você faz login, **todas as sessões anteriores são deletadas**
- Se alguém tentar usar em outro PC, **você é deslogado automaticamente**
- Apenas **1 máquina** pode estar logada por vez

### ✅ Device Fingerprint:
- A extensão gera um fingerprint único da sua máquina
- Inclui: User-Agent, resolução de tela, timezone, hardware
- Se alguém tentar copiar seu token, **fingerprint não vai bater** = LOGOUT

### ✅ Validação Contínua:
- A cada **2 minutos**, verifica se a sessão ainda é válida
- A cada **mensagem enviada**, valida sessão no banco
- Se detectar inconsistência = **logout forçado**

### ✅ Logs de Auditoria:
- Todas as tentativas de login ficam registradas
- Você pode ver quem tentou acessar e quando
- Útil para detectar tentativas de invasão

## 8. CRIAR NOVOS USUÁRIOS

### Via SQL Editor do Supabase:

```sql
-- Primeiro, gerar hash da senha em: https://bcrypt-generator.com/
-- Use rounds: 10

INSERT INTO users (email, password_hash, is_active) 
VALUES ('novo@email.com', '$2a$10$HASH_GERADO_AQUI', TRUE);
```

**OU** crie uma página de registro (não incluída nesta versão).

## 9. VERIFICAR SESSÕES ATIVAS

No Supabase, vá em **Table Editor** → `user_sessions`:

Você verá:
- Quem está logado
- Device ID da máquina
- Último acesso
- Quando a sessão expira (24h)

## 10. FORÇAR LOGOUT DE TODOS

Se quiser deslogar todos os usuários:

```sql
DELETE FROM user_sessions;
```

## 11. VER LOGS DE ACESSO

No Supabase, vá em **Table Editor** → `auth_logs`:

Você verá:
- Todas as tentativas de login
- Sucessos e falhas
- Device IDs usados
- Horários exatos

## 🔥 DICAS DE SEGURANÇA

1. ✅ **NUNCA** compartilhe sua `anon key` publicamente
2. ✅ Use senhas fortes (mínimo 12 caracteres)
3. ✅ Monitore os logs regularmente
4. ✅ Mude as senhas dos usuários periodicamente
5. ✅ Considere adicionar 2FA no futuro

## ❌ IMPORTANTE - LIMITAÇÕES

- **Plano grátis do Supabase**: 50.000 requisições/mês
- Se exceder, pode ter cobrança ou bloqueio
- Para uso comercial, considere plano pago ($25/mês)

## 🆘 TROUBLESHOOTING

### Erro: "Failed to fetch"
- Verifique se copiou URL e KEY corretos
- Confirme que executou o SQL setup

### Erro: "Session invalid"
- Sessão expirou (24h)
- Faça login novamente

### Erro: "User not found"
- Usuário não existe no banco
- Execute o SQL para criar usuário de teste

### Login não funciona:
- Abra Console do Chrome (F12)
- Veja erros detalhados no console
- Verifique credenciais no Supabase

---

**Pronto! Sistema 100% funcional e à prova de burlas! 🎉**
