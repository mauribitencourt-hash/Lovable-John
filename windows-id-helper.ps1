# windows-id-helper.ps1
# Script de Helper para obter informações do Windows
# Funciona com Native Messaging da extensão Chrome
# Para instalar: Copiar este arquivo para C:\Program Files\JokerClub\windows-id-helper.ps1

# Função para ler entrada JSON do stdin
function Read-HostJson {
    $input = Read-Host
    try {
        return $input | ConvertFrom-Json
    } catch {
        return $null
    }
}

# Função para enviar resposta JSON
function Send-Json {
    param([object]$Object)
    $json = $Object | ConvertTo-Json -Compress
    Write-Output $json
}

# Função para obter informações do sistema
function Get-SystemInfo {
    try {
        # SID do usuário atual
        $userSid = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
        
        # Hostname
        $hostname = [System.Net.Dns]::GetHostName()
        
        # Username
        $username = $env:USERNAME
        
        # MachineGuid (UUID único da máquina)
        $machineGuid = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Cryptography' -Name 'MachineGuid' -ErrorAction SilentlyContinue).MachineGuid
        
        # Serial do disco (apenas primeiro disco)
        $diskSerial = $null
        try {
            $diskSerial = (Get-WmiObject -Class Win32_PhysicalMedia -ErrorAction SilentlyContinue | Select-Object -First 1).SerialNumber
        } catch {}
        
        # Domínio (se conectado)
        $domain = $env:USERDOMAIN
        
        # Versão do Windows
        $osVersion = [System.Environment]::OSVersion.VersionString
        
        return @{
            success = $true
            sid = $userSid
            hostname = $hostname
            username = $username
            machineGuid = $machineGuid
            diskSerial = $diskSerial
            domain = $domain
            osVersion = $osVersion
            timestamp = (Get-Date).ToUniversalTime().ToString('o')
        }
    } catch {
        return @{
            success = $false
            error = $_.Exception.Message
        }
    }
}

# Main loop
try {
    while ($true) {
        $message = Read-HostJson
        
        if ($null -ne $message) {
            switch ($message.action) {
                'getSystemInfo' {
                    $response = Get-SystemInfo
                    Send-Json $response
                    break
                }
                'ping' {
                    Send-Json @{ success = $true; pong = $true }
                    break
                }
                default {
                    Send-Json @{ success = $false; error = 'Unknown action' }
                }
            }
        }
    }
} catch {
    Send-Json @{ success = $false; error = $_.Exception.Message }
}
