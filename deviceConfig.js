// deviceConfig.js - Configuração de Device ID Fixo
// ============================================
// 
// INSTRUÇÕES:
// 1. Deixe FIXED_DEVICE_ID vazio para gerar automaticamente
// 2. OU coloque um ID fixo para usar em todos os PCs
//
// Exemplos:
// export const FIXED_DEVICE_ID = ''; // ← Gera automaticamente
// export const FIXED_DEVICE_ID = 'meu-pc-master-2024'; // ← Usa esse ID sempre

/**
 * DEVICE ID FIXO
 * 
 * Se preenchido, este ID será usado em TODOS os PCs que instalarem a extensão.
 * Perfeito para assistências técnicas que querem compartilhar a mesma licença.
 * 
 * Dica: Execute a extensão uma vez, copie o Device ID do console, 
 * e cole aqui para fixar esse ID.
 */
export const FIXED_DEVICE_ID = '';

/**
 * MODO DE OPERAÇÃO
 * 
 * 'fixed'  → Sempre usa FIXED_DEVICE_ID (se definido)
 * 'auto'   → Gera automaticamente baseado no PC
 * 'hybrid' → Usa fixo se definido, senão gera automaticamente
 */
export const DEVICE_ID_MODE = 'hybrid';

/**
 * PREFIXO DO DEVICE ID
 * 
 * Adiciona um prefixo ao ID para facilitar identificação
 * Ex: 'assistencia_' + deviceId = 'assistencia_abc123'
 */
export const DEVICE_ID_PREFIX = '';

/**
 * PERMITIR OVERRIDE VIA STORAGE
 * 
 * Se true, permite que o Device ID seja substituído
 * via Chrome Storage (útil para testes)
 */
export const ALLOW_STORAGE_OVERRIDE = false;

// ============================================
// Configurações Avançadas
// ============================================

/**
 * NOME DO COOKIE DE DEVICE ID
 */
export const DEVICE_COOKIE_NAME = 'lovable_device_id';

/**
 * TEMPO DE EXPIRAÇÃO DO COOKIE (em segundos)
 * Padrão: 10 anos
 */
export const COOKIE_EXPIRATION_SECONDS = 10 * 365 * 24 * 60 * 60;

/**
 * HABILITAR LOGS DE DEBUG
 */
export const DEBUG_DEVICE_ID = true;

/**
 * MENSAGENS DE LOG
 */
export const LOG_MESSAGES = {
  USING_FIXED: '🔒 Usando Device ID FIXO configurado',
  USING_COOKIE: '✅ Device ID recuperado do cookie',
  USING_STORAGE: '✅ Device ID recuperado do storage',
  USING_FINGERPRINT: '🔍 Device ID gerado via fingerprinting',
  GENERATING_NEW: '✨ Gerando novo Device ID',
  SAVED_COOKIE: '💾 Device ID salvo em cookie',
  SAVED_STORAGE: '💾 Device ID salvo em storage',
  ERROR: '❌ Erro ao obter Device ID'
};
