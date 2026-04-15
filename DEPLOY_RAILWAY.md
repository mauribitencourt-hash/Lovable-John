# 🚂 Deploy no Railway - Backend Seguro

## 💰 Plano Grátis

Railway oferece:
- **$5 de crédito grátis** por mês
- Depois disso, cobra ~$0.000463/GB-h
- **Precisa cadastrar cartão** (mas só cobra se passar dos $5)
- Servidor fica online 24/7

## 🚀 Passo a Passo

### 1. Criar conta no Railway

1. Acesse: https://railway.app/
2. Clique em **Login**
3. Faça login com **GitHub**
4. Autorize o Railway a acessar seus repositórios

### 2. Criar novo projeto

1. No dashboard, clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Escolha o repositório: `joaouli123/Lovable`
4. Railway vai detectar automaticamente que é Node.js

### 3. Configurar Build

Railway vai detectar automaticamente, mas se precisar ajustar:

1. Clique no serviço criado
2. Vá em **Settings**
3. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 4. Adicionar Variáveis de Ambiente

1. No serviço, clique em **Variables**
2. Adicione as variáveis:

```
SUPABASE_URL=https://SEU_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUA_KEY_AQUI
PORT=3000
```

3. Clique em **Add Variable** para cada uma
4. Deploy automático vai começar

### 5. Pegar URL do serviço

1. Após deploy terminar (aguarde ~2 minutos)
2. Clique em **Settings**
3. Em **Networking**, clique em **Generate Domain**
4. Copie a URL gerada: `https://seu-projeto.up.railway.app`

### 6. Atualizar extensão

Edite `supabaseAuth.js` linha 8:

```javascript
this.backendUrl = 'https://seu-projeto.up.railway.app';
```

### 7. Recarregar extensão

1. Vá em `chrome://extensions/`
2. Clique em 🔄 Recarregar
3. Abra a extensão e teste o login!

## 📊 Monitorar uso

1. No Railway, vá em **Metrics**
2. Veja uso de CPU, RAM e tráfego
3. Dashboard mostra quanto já gastou dos $5

## 💡 Dicas para economizar créditos

### Limitar recursos:
1. Clique no serviço
2. **Settings** → **Resources**
3. Configure:
   - **Memory**: 512 MB (padrão é 8GB!)
   - **CPU**: 0.5 vCPU

### Sleeper (modo hibernação):
- Serviço "dorme" após 5 min sem requisições
- Acorda automaticamente quando alguém acessa
- **Primeiro acesso pode demorar ~10s** (cold start)

## 🔒 Segurança

### Proteger variáveis:
- Variáveis de ambiente ficam seguras no Railway
- **NUNCA** faça commit do `.env` local

### CORS adicional (opcional):
Se quiser restringir mais, edite `server.js`:

```javascript
app.use(cors({
  origin: 'chrome-extension://ID_DA_SUA_EXTENSAO'
}));
```

## 🆘 Troubleshooting

### Deploy falhou:
- Verifique logs em **Deployments** → **View Logs**
- Confirme que **Root Directory** está `/backend`

### Erro 404:
- Confirme que URL está certa
- Teste: `https://seu-projeto.up.railway.app/health`

### Cold start lento:
- Normal no plano grátis
- Primeiro acesso demora ~10s

### Acabaram os $5:
- Railway avisa por email
- Serviço para automaticamente
- Adicione cartão para continuar

## 🎯 Alternativas Gratuitas

### Render.com (Recomendado!)
- **Totalmente grátis** (não precisa cartão)
- 750h/mês grátis
- Cold start de 50s
- Deploy: https://render.com/

### Fly.io
- 3 VMs grátis
- Mais complexo de configurar

### Vercel
- Grátis ilimitado para hobbistas
- Mas funciona melhor com serverless

## 📦 Deploy Render (Alternativa)

1. Acesse: https://render.com/
2. Login com GitHub
3. **New** → **Web Service**
4. Conecte repositório `joaouli123/Lovable`
5. Configure:
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
6. Adicione variáveis de ambiente
7. Clique em **Create Web Service**
8. Copie URL gerada

**Vantagem Render:**
- ✅ 100% grátis
- ✅ Sem cartão necessário
- ❌ Cold start mais lento (50s)

**Vantagem Railway:**
- ✅ Cold start rápido (5s)
- ✅ Melhor performance
- ❌ Precisa cartão
- ❌ Cobra após $5/mês

---

**Qual prefere? Railway ($5 grátis) ou Render (grátis total)?**
