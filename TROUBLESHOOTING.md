# 🔧 GUIA DE TROUBLESHOOTING

## 🆘 Problemas Comuns e Soluções

---

## ❌ Problema 1: Device ID não aparece no painel

### Sintomas
- Panel verde aparece, mas está vazio
- Nada dentro da caixa branca

### Soluções

**1. Verifique o console (F12)**
```javascript
// Abra DevTools:
// 1. Clique no ícone da extensão
// 2. Pressione F12
// 3. Vá em Console
// 4. Procure por erros vermelhos
```

**2. Verifique se `utils.js` tem `getOrCreateDeviceId`**
```bash
grep -r "getOrCreateDeviceId" *.js
```

**3. Recarregue a extensão**
```
1. chrome://extensions
2. Clique em Recarregar
3. Abra o popup novamente
```

**4. Limpe o cache**
```
Ctrl+Shift+Delete
Selecione "Todos os tempos"
Clique "Limpar dados"
```

---

## ❌ Problema 2: Botão "COPIAR" não funciona

### Sintomas
- Clica no botão mas nada acontece
- Não vê "✅ Copiado!"

### Soluções

**1. Verifique permissões do Chrome**
```
chrome://extensions
Procure "Painel Lovable"
Clique em "Detalhes"
Verifique se tem permissões de storage e cookies
```

**2. Teste no console**
```javascript
// Abra o console (F12) e cole:
navigator.clipboard.writeText('teste').then(() => {
  console.log('Clipboard funcionando!');
}).catch(err => {
  console.log('Erro:', err);
});
```

**3. Verifique o ID do botão**
```
F12 → Elements
Procure por: id="copyDeviceIdBtn"
```

---

## ❌ Problema 3: Cores não são verdes

### Sintomas
- Panel ainda está roxo/indigo
- Logo não é verde

### Soluções

**1. Força refresh (hard refresh)**
```
Ctrl+F5 (no popup)
```

**2. Desabilite e habilite a extensão**
```
chrome://extensions
Clique em OFF
Clique em ON
```

**3. Verifique popup.html**
```
Procure por: #22c55e
Deve ter em:
- linha 18 (--primary-gradient)
- linha 594 (deviceIdPanel background)
- logo section
```

---

## ❌ Problema 4: Popup muito pequeno ou conteúdo cortado

### Sintomas
- Não vê o panel completo
- Conteúdo da esquerda está cortado

### Soluções

**1. Verifique largura em popup.html**
```
Procure: width: 800px;
Deve estar na linha ~40
```

**2. Aumente a largura se necessário**
```html
body {
  width: 1000px; /* tente aumentar aqui */
  height: 600px;
}
```

**3. Verifique zoom do navegador**
```
Ctrl+0 (reset zoom)
```

---

## ❌ Problema 5: Panel não aparece do lado direito

### Sintomas
- Panel aparece no topo ou no meio
- Não está alinhado à direita

### Soluções

**1. Verifique CSS do panel**
```css
/* Deve ter: */
position: fixed;
right: 0;
top: 0;
width: 350px;
```

**2. Procure por conflitos de z-index**
```
F12 → Elements
Clique no panel
Veja o z-index em Styles
Deve estar > 999998
```

---

## ❌ Problema 6: Device ID muda toda vez

### Sintomas
- Cada vez que abre é um ID diferente
- Não quer que mude

### Soluções

**1. Use FIXED_DEVICE_ID em deviceConfig.js**
```javascript
// Linha 21
export const FIXED_DEVICE_ID = 'seu-id-fixo-aqui';
export const DEVICE_ID_MODE = 'hybrid'; // ou 'fixed'
```

**2. Recarregue a extensão**
```
chrome://extensions → Recarregar
```

**3. Verifique Chrome Storage**
```javascript
// Console F12:
chrome.storage.local.get(['DEVICE_ID'], (result) => {
  console.log('Valor armazenado:', result.DEVICE_ID);
});
```

---

## ❌ Problema 7: Erros no console

### Sintomas
- Mensagens vermelhas em F12
- Típicos: "Cannot read property 'addEventListener' of null"

### Soluções

**1. Erro: "Cannot read property..."**
```
Significa que o elemento HTML não existe.
Verifique em popup.html:
- id="deviceIdPanel"
- id="deviceIdDisplay"
- id="copyDeviceIdBtn"
```

**2. Erro: "Uncaught SyntaxError"**
```
Corrija a sintaxe do JavaScript.
Procure por aspas faltantes ou pontos-e-vírgulas.
```

**3. Erro: "getOrCreateDeviceId is not defined"**
```
Verifique se utils.js importa deviceFingerprint.js
Verifique se popup.js importa utils.js
```

---

## ✅ Teste Rápido

Para verificar se tudo está funcionando:

```javascript
// Cole no console (F12):

// 1. Verifique se o panel existe
console.log('Panel existe?', !!document.getElementById('deviceIdPanel'));

// 2. Verifique o Device ID
document.addEventListener('DOMContentLoaded', async () => {
  const deviceId = await getOrCreateDeviceId();
  console.log('Device ID:', deviceId);
});

// 3. Teste o clipboard
navigator.clipboard.writeText('teste').then(() => {
  console.log('Clipboard OK');
});

// 4. Verifique Chrome Storage
chrome.storage.local.get(null, (result) => {
  console.log('Storage:', result);
});
```

---

## 🔍 Debug Avançado

### Ativar logs detalhados

Adicione ao popup.js:
```javascript
// Logo no início
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('%c[DEBUG]', 'color: #00ff00; font-weight: bold;', ...args);
  }
}

// Depois use:
log('Device ID carregado:', deviceId);
```

### Verificar Network

1. F12 → Network
2. Clique no popup
3. Procure por requisições
4. Verifique status (deve ser 200)

### Memory Leak

1. F12 → Memory
2. Tire um snapshot
3. Abra/feche popup várias vezes
4. Tire outro snapshot
5. Compare - deve ter pouca diferença

---

## 📞 Checklist de Debug

Antes de reportar um bug, verifique:

- [ ] Recarreguei a extensão? (chrome://extensions → Recarregar)
- [ ] Limpei o cache? (Ctrl+Shift+Delete)
- [ ] Verifiquei o console? (F12 → Console)
- [ ] Testei em outro navegador? (se possível)
- [ ] Os arquivos existem? (popup.html, popup.js, etc)
- [ ] A internet está funciona? (para clipboard)
- [ ] O Chrome está atualizado? (Help → About Chrome)

---

## 🆘 Último Recurso

Se nada funcionar:

**1. Remova e reinstale a extensão**
```
chrome://extensions
Clique em Remover na extensão
Reload do DevTools
Instale novamente
```

**2. Reinicie o Chrome**
```
Feche completamente o Chrome
Espere 10 segundos
Abra novamente
```

**3. Reinicie o Windows**
```
Não há o que fazer, mas às vezes ajuda!
```

---

## 📋 Quando Reportar um Bug

Se nada da lista ajudar, anote:

1. **O que tentou fazer?**
   - Ex: Copiar Device ID

2. **O que esperava?**
   - Ex: Ver "✅ Copiado!" no botão

3. **O que aconteceu?**
   - Ex: Nada mudou, botão travou

4. **Erros no console?**
   - Cole exatamente o erro (Ctrl+C no console)

5. **Screenshots**
   - Tire prints do que vê (F11 no Windows)

---

**Version:** 1.0.0
**Última atualização:** 28/01/2026
**Status:** ✅ Completo
