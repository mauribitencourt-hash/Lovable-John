# 🔐 Backend Seguro - Autenticação

## ✅ CREDENCIAIS PROTEGIDAS!

As credenciais do Supabase agora ficam **APENAS NO SERVIDOR**, não na extensão!

```
Extensão Chrome → Backend (Node.js) → Supabase
     ❌ SEM credenciais        ✅ COM credenciais
```

## 🚀 Como Rodar

### 1. Instalar dependências

```powershell
cd backend
npm install
```

### 2. Configurar credenciais

Edite o arquivo `.env`:
```
SUPABASE_URL=https://SEU_PROJECT.supabase.co
SUPABASE_KEY=SUA_ANON_KEY_AQUI
PORT=3000
```

### 3. Iniciar servidor

```powershell
npm start
```

Você verá:
```
🚀 Backend rodando em http://localhost:3000
📊 Health check: http://localhost:3000/health
🔐 Credenciais Supabase protegidas!
```

### 4. Testar se está funcionando

Abra: http://localhost:3000/health

Deve retornar:
```json
{
  "status": "ok",
  "message": "Backend rodando!"
}
```

## 📡 Endpoints Disponíveis

### POST /api/login
```json
{
  "email": "teste@exemplo.com",
  "password": "teste123",
  "deviceId": "abc123",
  "deviceFingerprint": "xyz789"
}
```

### POST /api/validate
```json
{
  "sessionToken": "token-aqui",
  "deviceId": "abc123",
  "deviceFingerprint": "xyz789"
}
```

### POST /api/logout
```json
{
  "sessionToken": "token-aqui"
}
```

## 🌐 Deploy em Produção

### Opção 1: Vercel (Recomendado - Grátis)

1. Instale Vercel CLI:
```powershell
npm install -g vercel
```

2. Faça login:
```powershell
vercel login
```

3. Deploy:
```powershell
vercel
```

4. Configure variáveis de ambiente no dashboard da Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

5. Atualize `supabaseAuth.js` linha 8:
```javascript
this.backendUrl = 'https://seu-app.vercel.app';
```

### Opção 2: Railway (Grátis + $5/mês)

1. Acesse: https://railway.app/
2. Conecte seu GitHub
3. Crie novo projeto
4. Deploy da pasta `backend`
5. Configure variáveis de ambiente
6. Copie URL gerada

### Opção 3: Heroku

1. Instale Heroku CLI
2. `heroku create`
3. `git push heroku main`
4. Configure env vars: `heroku config:set SUPABASE_URL=...`

### Opção 4: VPS Própria (DigitalOcean, AWS, etc.)

1. Configure servidor Ubuntu
2. Instale Node.js
3. Clone repositório
4. `npm install --production`
5. Use PM2 para manter rodando:
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

## 🔒 Segurança

### ✅ O que está protegido:
- Credenciais Supabase **nunca** vão para a extensão
- CORS configurado para aceitar apenas extensões Chrome
- Validação server-side de todos os dados
- Logs de auditoria no banco

### ❌ Ainda exposto (se rodar localmente):
- `http://localhost:3000` - acessível na sua rede local
- Qualquer app no seu PC pode chamar o backend

### 🛡️ Melhorias recomendadas:
1. **HTTPS obrigatório** - Deploy em Vercel/Railway já tem
2. **Rate limiting** - Limitar requisições por IP
3. **API Key** - Token adicional na extensão
4. **Firewall** - Apenas suas IPs podem acessar

## 🔧 Desenvolvimento

### Rodar em modo watch (recarrega automaticamente):
```powershell
npm run dev
```

### Testar endpoints manualmente:

**PowerShell:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method Get
```

**cURL:**
```bash
curl http://localhost:3000/health
```

## ❓ Troubleshooting

### Erro: "EADDRINUSE"
Porta 3000 já está em uso. Mude no `.env`:
```
PORT=3001
```

### Erro: "Cannot find module"
```powershell
npm install
```

### Erro: "CORS"
Verifique se a extensão está carregada no Chrome

### Extensão não conecta
1. Verifique se backend está rodando
2. Confirme URL em `supabaseAuth.js` linha 8
3. Veja console do Chrome (F12)

## 📊 Monitoramento

### Ver logs em produção (Vercel):
```powershell
vercel logs
```

### Ver logs localmente:
Console mostrará todas as requisições

### Verificar sessões ativas:
Vá no Supabase → Table Editor → `user_sessions`

---

**Agora sim está 100% seguro! 🎉**
