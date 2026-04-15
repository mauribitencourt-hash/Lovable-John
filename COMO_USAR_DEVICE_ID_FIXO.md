# 🔧 Como Usar Device ID Fixo

## 📋 Guia Rápido para Assistência Técnica

Este sistema permite que você use **o mesmo Device ID em todos os PCs** da sua assistência técnica.

---

## 🚀 Método 1: ID Fixo Simples (RECOMENDADO)

### Passo 1: Gerar Seu Device ID

1. **Instale a extensão** em qualquer PC
2. **Abra o popup** da extensão
3. **Abra o Console** (F12 → Console)
4. **Copie o Device ID** que aparece no log:
   ```
   ✨ Gerando novo Device ID: fp_abc123_xyz789
   ```

### Passo 2: Fixar o ID

1. **Abra o arquivo**: `deviceConfig.js`
2. **Cole seu ID** na linha 20:
   ```javascript
   export const FIXED_DEVICE_ID = 'fp_abc123_xyz789'; // ← Seu ID aqui!
   ```
3. **Salve o arquivo**

### Passo 3: Pronto! 🎉

Agora **TODOS os PCs** que instalarem esta extensão usarão o mesmo Device ID!

---

## 🎯 Método 2: ID Personalizado

Você pode criar seu próprio ID customizado:

```javascript
// Em deviceConfig.js:
export const FIXED_DEVICE_ID = 'assistencia-joao-2024';
```

Qualquer texto funciona! Por exemplo:
- `assistencia-joao-2024`
- `pc-master-licenca-unica`
- `empresa-xyz-shared-id`

---

## 🔀 Método 3: ID com Prefixo (Organização)

Se quiser identificar facilmente os IDs da sua assistência:

```javascript
// Em deviceConfig.js:
export const FIXED_DEVICE_ID = ''; // Deixe vazio para gerar automático
export const DEVICE_ID_PREFIX = 'assistencia_'; // Adiciona prefixo
```

Resultado: Cada PC terá um ID tipo `assistencia_fp_abc123`

---

## ⚙️ Modos de Operação

No arquivo `deviceConfig.js`, linha 35:

```javascript
export const DEVICE_ID_MODE = 'hybrid'; // ← Mude aqui
```

### Opções:

| Modo | Comportamento |
|------|--------------|
| `'hybrid'` | Usa fixo se configurado, senão gera automático **(PADRÃO)** |
| `'fixed'` | Sempre usa o ID fixo (erro se não configurado) |
| `'auto'` | Sempre gera automaticamente (ignora ID fixo) |

---

## 🧪 Testando o Sistema

### Ver Qual ID Está Sendo Usado

No console do DevTools:

```javascript
import { persistentDevice } from './deviceFingerprint.js';

// Ver configuração atual
const config = persistentDevice.getConfiguredDeviceID();
console.log(config);

// Ver Device ID ativo
const deviceId = await persistentDevice.getOrCreateDeviceID();
console.log('Device ID Ativo:', deviceId);
```

### Resetar e Testar Novamente

```javascript
// Resetar
await persistentDevice.resetDeviceID();

// Recarregar extensão
// Verificar se pegou o ID fixo
```

---

## 💼 Cenários Práticos

### Cenário 1: Assistência com Licença Única

**Objetivo**: Todos os PCs compartilham a mesma licença

```javascript
// deviceConfig.js
export const FIXED_DEVICE_ID = 'licenca-master-assistencia-2024';
export const DEVICE_ID_MODE = 'fixed';
```

✅ **Resultado**: Todos os PCs = Mesmo Device ID = Mesma licença

---

### Cenário 2: Identificar PCs Individualmente, mas com Controle

**Objetivo**: Cada PC tem ID único, mas você controla o formato

```javascript
// deviceConfig.js
export const FIXED_DEVICE_ID = ''; // Vazio = gera automático
export const DEVICE_ID_PREFIX = 'assistencia_tecnica_';
export const DEVICE_ID_MODE = 'auto';
```

✅ **Resultado**:
- PC 1: `assistencia_tecnica_fp_aaa111`
- PC 2: `assistencia_tecnica_fp_bbb222`
- PC 3: `assistencia_tecnica_fp_ccc333`

---

### Cenário 3: Mix de PCs com IDs Fixos e Automáticos

**Objetivo**: Alguns PCs compartilham, outros são únicos

**Solução**: Use duas versões da extensão:

**Versão A** (compartilhada):
```javascript
export const FIXED_DEVICE_ID = 'pc-compartilhado';
```

**Versão B** (individual):
```javascript
export const FIXED_DEVICE_ID = '';
```

---

## 📊 Verificação Visual

Quando você abre o popup, verá no console:

### Com ID Fixo:
```
🔒 Usando Device ID FIXO configurado: assistencia-joao-2024
💾 Device ID salvo em cookie
💾 Device ID salvo em storage
```

### Sem ID Fixo:
```
✅ Device ID recuperado do cookie: fp_abc123_xyz789
💾 Device ID salvo em storage
```

### Primeiro Uso:
```
✨ Gerando novo Device ID: fp_abc123_xyz789
💾 Device ID salvo em cookie
💾 Device ID salvo em storage
```

---

## 🔧 Configurações Avançadas

No arquivo `deviceConfig.js`:

### Desabilitar Logs de Debug

```javascript
export const DEBUG_DEVICE_ID = false; // ← Desliga os logs coloridos
```

### Mudar Nome do Cookie

```javascript
export const DEVICE_COOKIE_NAME = 'meu_cookie_device';
```

### Mudar Tempo de Expiração

```javascript
// Padrão: 10 anos
export const COOKIE_EXPIRATION_SECONDS = 10 * 365 * 24 * 60 * 60;

// 1 ano:
export const COOKIE_EXPIRATION_SECONDS = 365 * 24 * 60 * 60;

// Permanente (100 anos):
export const COOKIE_EXPIRATION_SECONDS = 100 * 365 * 24 * 60 * 60;
```

---

## ❓ FAQ

### P: Preciso configurar em todos os PCs?

**R:** Não! Configure o `deviceConfig.js` uma vez, depois copie a pasta da extensão para todos os PCs.

### P: Posso mudar o ID depois?

**R:** Sim! Mude no `deviceConfig.js`, recarregue a extensão, e chame:
```javascript
await persistentDevice.resetDeviceID();
```

### P: O ID fixo funciona após reinstalar?

**R:** Sim! O ID fica no código da extensão, não depende de nada externo.

### P: E se eu não configurar nada?

**R:** A extensão funciona normalmente, gerando IDs automáticos únicos por PC.

### P: Posso usar emojis no ID?

**R:** Tecnicamente sim, mas não recomendado. Use apenas letras, números, hífens e underscores.

---

## ✅ Checklist de Configuração

- [ ] Copiei meu Device ID do console
- [ ] Colei no `deviceConfig.js` na variável `FIXED_DEVICE_ID`
- [ ] Salvei o arquivo
- [ ] Recarreguei a extensão (chrome://extensions)
- [ ] Testei no console e vi a mensagem "🔒 Usando Device ID FIXO"
- [ ] Distribui a extensão para outros PCs

---

## 🎉 Pronto!

Seu sistema está configurado! Todos os PCs da assistência usarão o mesmo Device ID.

**Dúvidas?** Verifique os logs no console ou consulte o README principal.
