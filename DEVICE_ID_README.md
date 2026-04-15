# 🔐 Sistema de Identificação Persistente de Máquina

## ✨ O Que Foi Implementado

Um sistema robusto de identificação que **sobrevive à reinstalação da extensão** e identifica a máquina física de forma única.

## 🎯 Como Funciona

### **3 Camadas de Persistência**

```
┌─────────────────────────────────────────────┐
│  1. COOKIE NO DOMÍNIO (Mais Persistente)    │
│     ↓ Expira em 10 anos                     │
│     ↓ Sobrevive desinstalação               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  2. CHROME STORAGE LOCAL                    │
│     ↓ Backup do cookie                      │
│     ↓ Limpo ao desinstalar                  │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  3. BROWSER FINGERPRINTING                  │
│     ↓ Identifica hardware/navegador         │
│     ↓ Gera ID baseado na máquina            │
└─────────────────────────────────────────────┘
```

## 🚀 Vantagens

✅ **Persiste após reinstalação** - Cookie no domínio lovable.dev  
✅ **Identifica máquina única** - Fingerprinting de hardware/GPU  
✅ **3 backups de dados** - Cookie + Storage + Fingerprint  
✅ **Compatível com código existente** - Drop-in replacement  
✅ **Logs detalhados** - Veja de onde vem o Device ID

## 📊 Dados de Fingerprinting

O sistema coleta:

### Hardware
- **CPU**: Número de cores (hardwareConcurrency)
- **RAM**: Memória disponível (deviceMemory)
- **GPU**: Identificação via WebGL (vendor/renderer)

### Tela
- Resolução (width × height)
- Profundidade de cor (colorDepth)
- Área disponível (availWidth × availHeight)

### Navegador
- User Agent completo
- Plataforma (Windows/Mac/Linux)
- Idioma e timezone

### Canvas Fingerprint
- Renderização única de cada GPU
- Hash do resultado

## 🔍 Testando o Sistema

### Console do DevTools

Abra a extensão e veja os logs:

```javascript
// Primeira vez (gera novo ID):
✨ Novo Device ID gerado: fp_abc123_xyz789

// Depois de reinstalar (recupera do cookie):
✅ Device ID recuperado do cookie: fp_abc123_xyz789
```

### Testar Persistência

1. **Instale a extensão**
   - Veja o log: "✨ Novo Device ID gerado"
   - Anote o ID gerado

2. **Desinstale e reinstale**
   - Veja o log: "✅ Device ID recuperado do cookie"
   - O ID deve ser o MESMO!

3. **Limpe cookies e reinstale**
   - O ID será baseado no fingerprint da máquina
   - Deve ser consistente para o mesmo PC

## 🛠️ API do Sistema

### Uso Normal (Automático)

```javascript
import { getOrCreateDeviceId } from './utils.js';

const deviceId = await getOrCreateDeviceId();
console.log('Device ID:', deviceId);
```

### Uso Avançado

```javascript
import { persistentDevice } from './deviceFingerprint.js';

// Obter info completa do dispositivo
const info = await persistentDevice.getDeviceInfo();
console.log('Device Info:', info);
/*
{
  deviceId: "fp_abc123_xyz789",
  fingerprint: { ... dados coletados ... },
  browser: { userAgent, platform, language },
  hardware: { cores: 8, memory: 8, screen: "1920x1080" },
  timestamp: "2026-01-28T..."
}
*/

// Resetar Device ID (para testes)
await persistentDevice.resetDeviceID();
console.log('Device ID resetado!');
```

## 🔐 Segurança e Privacidade

### O Que É Armazenado

```javascript
// Cookie no lovable.dev
{
  nome: "lovable_device_id",
  valor: "fp_abc123_xyz789",
  expira: "2036-01-28" // 10 anos
}

// Chrome Storage Local
{
  deviceId: "fp_abc123_xyz789"
}
```

### O Que NÃO É Armazenado

❌ Dados pessoais do usuário  
❌ Histórico de navegação  
❌ Senhas ou credenciais  
❌ Localização GPS  
❌ Arquivos do sistema

## 📋 Cenários de Uso

### Assistência Técnica (Seu Caso)

```
PC 1 → Instala extensão → Device ID: fp_aaa111
PC 2 → Instala extensão → Device ID: fp_bbb222
PC 3 → Instala extensão → Device ID: fp_ccc333

PC 1 → Reinstala extensão → Device ID: fp_aaa111 ✅ (Mesmo!)
```

### Rotatividade de Máquinas

- Cada PC terá seu próprio Device ID único
- Mesmo formatando, o fingerprint ajuda a re-identificar
- Cookie persiste no navegador entre reinstalações

## ⚙️ Configuração

### Alterar Nome do Cookie

Em `deviceFingerprint.js`:

```javascript
constructor() {
  this.fingerprint = new DeviceFingerprint();
  this.cookieName = 'seu_nome_aqui'; // ← Mude aqui
}
```

### Alterar Tempo de Expiração

Em `deviceFingerprint.js`, método `saveDeviceIDToCookie`:

```javascript
// 10 anos (padrão)
const expirationDate = Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60);

// Mudar para 1 ano:
const expirationDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
```

## 🐛 Troubleshooting

### Device ID muda toda vez

**Problema**: Cookie não está sendo salvo  
**Solução**: Verifique se tem permissão de cookies no manifest.json

### Erro "Cannot read fingerprint"

**Problema**: Canvas/WebGL bloqueado por extensões de privacidade  
**Solução**: Sistema automaticamente faz fallback para UUID

### Device ID diferente em navegadores diferentes

**Comportamento esperado**: Cada navegador tem seu próprio Device ID  
- Chrome: Device ID A
- Firefox: Device ID B
- Edge: Device ID C

## 📚 Arquivos Modificados

- ✨ **NOVO**: `deviceFingerprint.js` - Sistema completo
- 📝 **MODIFICADO**: `utils.js` - Usa novo sistema
- ✅ **COMPATÍVEL**: Todos os outros arquivos continuam funcionando

## 🎉 Pronto para Usar!

O sistema está completamente funcional e integrado. Não precisa modificar mais nada - apenas recarregue a extensão e teste!

---

**Dúvidas?** Consulte os logs do console para debug detalhado.
