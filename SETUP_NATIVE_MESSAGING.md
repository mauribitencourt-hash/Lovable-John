# Configuração do Native Messaging para System-wide Device ID

## 📋 O que é?
O Native Messaging permite que a extensão Chrome se comunique com scripts PowerShell rodando no Windows, capturando dados do sistema como SID do usuário, hostname, UUID da máquina, etc.

## 🔧 Passos de Instalação

### Passo 1: Copiar o Script PowerShell
```powershell
# Criar o diretório se não existir
New-Item -ItemType Directory -Force -Path "C:\Program Files\JokerClub"

# Copiar o arquivo windows-id-helper.ps1
Copy-Item -Path ".\windows-id-helper.ps1" -Destination "C:\Program Files\JokerClub\windows-id-helper.ps1"
```

### Passo 2: Criar o Arquivo de Manifesto do Native Host
Crie o arquivo: `C:\Program Files\JokerClub\native-manifest.json`

Conteúdo:
```json
{
  "name": "com.jokerclub.windows_id_helper",
  "description": "Ajudante do Windows para obter informações de Device ID",
  "path": "C:\\Program Files\\JokerClub\\windows-id-helper.ps1",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://COLE_AQUI_SEU_EXTENSION_ID/"
  ]
}
```

**Importante:** Substitua `COLE_AQUI_SEU_EXTENSION_ID` pelo ID real da extensão!

Para obter seu Extension ID:
1. Vá para `chrome://extensions`
2. Procure "Painel Lovable"
3. Copie o ID mostrado

### Passo 3: Registrar no Windows Registry
Execute este comando PowerShell **como Administrador**:

```powershell
# Criar chave no registry
$regPath = "HKLM:\SOFTWARE\Google\Chrome\NativeMessagingHosts\com.jokerclub.windows_id_helper"
$regPathEdge = "HKLM:\SOFTWARE\Microsoft\Edge\NativeMessagingHosts\com.jokerclub.windows_id_helper"

# Para Chrome
New-Item -Path $regPath -Force
Set-ItemProperty -Path $regPath -Name "(Default)" -Value "C:\Program Files\JokerClub\native-manifest.json"

# Para Edge (opcional)
New-Item -Path $regPathEdge -Force
Set-ItemProperty -Path $regPathEdge -Name "(Default)" -Value "C:\Program Files\JokerClub\native-manifest.json"

Write-Host "✅ Native Messaging registrado com sucesso!"
```

### Passo 4: Definir Permissões do Script
```powershell
# Permitir que o script seja executado
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Desbloquear o arquivo se necessário
Unblock-File -Path "C:\Program Files\JokerClub\windows-id-helper.ps1"
```

## 🧪 Teste de Funcionamento

### Teste 1: Verificar se o Script Funciona
```powershell
# Execute o script diretamente
C:\Program Files\JokerClub\windows-id-helper.ps1

# Digite e pressione Enter:
# {"action":"getSystemInfo"}

# Deve retornar algo como:
# {"success":true,"sid":"S-1-5-21-xxx","hostname":"PC-NAME",...}
```

### Teste 2: Verificar Console do Chrome
1. Abra `chrome://extensions`
2. Clique em "Inspecionar views" → "background page"
3. Vá para a aba "Console"
4. Procure por mensagens como:
   - ✅ "📡 Tentando comunicar com Native Messaging..."
   - ✅ "📨 Resposta do Native Messaging:"
   - ✅ "✅ System Device ID gerado com sucesso"

## ⚠️ Possíveis Problemas

### "Native Messaging desconectado"
- Verifique se o arquivo está em `C:\Program Files\JokerClub\`
- Verifique se o Registry foi registrado corretamente
- Reinicie o Chrome completamente

### "Permission Denied" ao tentar executar
```powershell
# Mude a política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script não retorna dados
- Abra PowerShell como Administrador
- Teste o script manualmente
- Verifique se não há erros de sintaxe

## 🔄 Como Funciona

1. **Primeira execução:** 
   - Extension pede dados ao PowerShell via Native Messaging
   - Dados capturam: SID, Hostname, MachineGuid, etc
   - Sistema gera hash SHA-256 com esses dados
   - ID é armazenado permanentemente

2. **Próximas execuções:**
   - Device ID é recuperado do Chrome Storage Local
   - Mesmo ID em qualquer navegador no mesmo PC

3. **Se a extensão é reinstalada:**
   - O novo Storage está vazio
   - Sistema gera novo ID
   - Será um ID **diferente** (máquina nova)

## 📊 Dados Coletados

O sistema coleta:
- ✅ **SID do Usuário** - Identificador único do Windows
- ✅ **Hostname** - Nome do computador
- ✅ **MachineGuid** - UUID único da máquina
- ✅ **Username** - Nome do usuário
- ✅ **DiskSerial** - Serial do primeiro disco (se disponível)
- ✅ **Domain** - Domínio (se em rede corporativa)
- ✅ **OS Version** - Versão do Windows

## 🔐 Privacidade

- Dados são combinados em um hash SHA-256 (irreversível)
- Hash final é armazenado apenas localmente
- Nenhum dado é enviado para servidores externos
- Funciona totalmente offline

## 📝 Desinstalação

Se precisar remover:

```powershell
# Remover do Registry
Remove-Item "HKLM:\SOFTWARE\Google\Chrome\NativeMessagingHosts\com.jokerclub.windows_id_helper" -Force
Remove-Item "HKLM:\SOFTWARE\Microsoft\Edge\NativeMessagingHosts\com.jokerclub.windows_id_helper" -Force

# Remover arquivos
Remove-Item "C:\Program Files\JokerClub" -Recurse -Force

Write-Host "✅ Removido com sucesso!"
```

## ✅ Checklist Final

- [ ] Arquivo `windows-id-helper.ps1` copiado para `C:\Program Files\JokerClub\`
- [ ] Arquivo `native-manifest.json` criado e configurado
- [ ] Extension ID adicionado no manifesto
- [ ] Registry registrado (Chrome e/ou Edge)
- [ ] Execução de PowerShell permitida
- [ ] Console do Chrome mostra mensagens de sucesso
- [ ] Device ID aparece na extensão

---

**Se tudo funcionar:** Você terá um Device ID único por máquina Windows, funcionando em qualquer navegador! 🎉
