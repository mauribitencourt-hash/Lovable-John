# 🚀 INSTALAÇÃO SIMPLIFICADA - ID Fixo para Todos os Navegadores
# O código ORIGINAL já tinha esta solução implementada!

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     ID FIXO: MESMO EM TODOS OS NAVEGADORES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "ℹ️  O código ORIGINAL já usa ID fixo:" -ForegroundColor Yellow
Write-Host "   'jokerclub-fixed-hwid-00000001'" -ForegroundColor White
Write-Host ""
Write-Host "   Este ID é o MESMO em Chrome, Firefox, Edge, etc!" -ForegroundColor Green
Write-Host ""

# Pergunta se quer usar a versão desofuscada
Write-Host "📝 Opções:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Manter arquivo atual (ofuscado) - JÁ FUNCIONA!" -ForegroundColor White
Write-Host "2. Usar versão desofuscada (mais fácil de editar)" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Escolha (1 ou 2)"

if ($opcao -eq "2") {
    Write-Host ""
    Write-Host "🔄 Ativando versão desofuscada..." -ForegroundColor Yellow

    if (Test-Path "keyAuthService.js") {
        if (Test-Path "keyAuthService.ofuscado.js") {
            Remove-Item "keyAuthService.ofuscado.js" -Force
        }
        Rename-Item "keyAuthService.js" "keyAuthService.ofuscado.js"
        Write-Host "   ✅ Backup criado: keyAuthService.ofuscado.js" -ForegroundColor Green
    }

    if (Test-Path "keyAuthService-SystemID.js") {
        Copy-Item "keyAuthService-SystemID.js" "keyAuthService.js" -Force
        Write-Host "   ✅ Versão desofuscada ativada!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erro: keyAuthService-SystemID.js não encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✅ Mantendo arquivo atual (já funciona perfeitamente!)" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "              ✅ CONFIGURAÇÃO COMPLETA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 COMO FUNCIONA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Todos os navegadores usam o mesmo ID fixo:" -ForegroundColor White
Write-Host "  'jokerclub-fixed-hwid-00000001'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chrome  = jokerclub-fixed-hwid-00000001" -ForegroundColor White
Write-Host "Edge    = jokerclub-fixed-hwid-00000001  ← MESMO ID!" -ForegroundColor Green
Write-Host "Firefox = jokerclub-fixed-hwid-00000001  ← MESMO ID!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra chrome://extensions/ (ou edge://extensions/)" -ForegroundColor White
Write-Host "2. Clique em 'Recarregar' na sua extensão" -ForegroundColor White
Write-Host "3. Teste em diferentes navegadores" -ForegroundColor White
Write-Host "4. Todos usarão o MESMO Device ID!" -ForegroundColor White
Write-Host ""

Write-Host "💡 PERSONALIZAR O ID (Opcional):" -ForegroundColor Yellow
Write-Host ""
Write-Host "Edite keyAuthService.js e procure por:" -ForegroundColor White
Write-Host "  return 'jokerclub-fixed-hwid-00000001';" -ForegroundColor Cyan
Write-Host ""
Write-Host "Troque por qualquer ID que desejar!" -ForegroundColor White
Write-Host ""

Write-Host "📖 Para mais informações, leia: SAME_BROWSER_ALL_NAVEGADORES.md" -ForegroundColor Gray
Write-Host ""

# Pergunta se quer abrir o guia
$response = Read-Host "Deseja abrir o guia completo agora? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    if (Test-Path "SAME_BROWSER_ALL_NAVEGADORES.md") {
        Start-Process "SAME_BROWSER_ALL_NAVEGADORES.md"
    }
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
