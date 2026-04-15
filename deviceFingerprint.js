// deviceFingerprint.js - Sistema de identificação persistente de máquina

import { CONFIG } from './config.js';
import { 
  FIXED_DEVICE_ID, 
  DEVICE_ID_MODE, 
  DEVICE_ID_PREFIX,
  ALLOW_STORAGE_OVERRIDE,
  DEVICE_COOKIE_NAME,
  COOKIE_EXPIRATION_SECONDS,
  DEBUG_DEVICE_ID,
  LOG_MESSAGES
} from './deviceConfig.js';

/**
 * Gera fingerprint baseado em características do navegador e hardware
 * Persiste mesmo após reinstalação da extensão
 */
export class DeviceFingerprint {
  constructor() {
    this.fingerprintData = null;
  }

  /**
   * Coleta dados do navegador e hardware para criar fingerprint único
   */
  async collectFingerprint() {
    const data = {
      // Informações do navegador
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages.join(','),
      platform: navigator.platform,
      
      // Hardware
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      
      // Tela
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenDepth: screen.colorDepth,
      screenAvailWidth: screen.availWidth,
      screenAvailHeight: screen.availHeight,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // Canvas fingerprint
      canvas: await this.getCanvasFingerprint(),
      
      // WebGL fingerprint
      webgl: await this.getWebGLFingerprint(),
      
      // Plugins (se disponível)
      plugins: this.getPluginsInfo(),
    };

    this.fingerprintData = data;
    return data;
  }

  /**
   * Canvas fingerprinting - cada GPU renderiza de forma única
   */
  async getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Desenha texto com características específicas
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device Fingerprint 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Unique Machine ID', 4, 17);
      
      // Retorna hash dos dados do canvas
      const dataURL = canvas.toDataURL();
      return await this.simpleHash(dataURL);
    } catch (e) {
      return 'canvas-unavailable';
    }
  }

  /**
   * WebGL fingerprinting - identifica GPU/driver
   */
  async getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'webgl-unavailable';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
      
      return await this.simpleHash(`${vendor}|${renderer}`);
    } catch (e) {
      return 'webgl-unavailable';
    }
  }

  /**
   * Informações de plugins instalados
   */
  getPluginsInfo() {
    try {
      if (!navigator.plugins || navigator.plugins.length === 0) {
        return 'no-plugins';
      }
      
      const plugins = Array.from(navigator.plugins)
        .map(p => p.name)
        .sort()
        .join(',');
      
      return plugins.substring(0, 100); // Limita tamanho
    } catch (e) {
      return 'plugins-unavailable';
    }
  }

  /**
   * Hash simples para fingerprinting
   */
  async simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Gera ID único combinando todos os dados
   */
  async generateUniqueID() {
    const fp = await this.collectFingerprint();
    
    // Combina os dados mais estáveis
    const combined = [
      fp.userAgent,
      fp.platform,
      fp.hardwareConcurrency,
      fp.screenWidth + 'x' + fp.screenHeight,
      fp.canvas,
      fp.webgl,
      fp.timezone
    ].join('|');
    
    const hash = await this.simpleHash(combined);
    return `fp_${hash}`;
  }
}

/**
 * Gerenciador de Device ID persistente
 * Usa múltiplas camadas: Cookie + Storage + Fingerprint
 */
export class PersistentDeviceManager {
  constructor() {
    this.fingerprint = new DeviceFingerprint();
    this.cookieName = DEVICE_COOKIE_NAME;
    this.debug = DEBUG_DEVICE_ID;
  }

  /**
   * Loga mensagem se debug está ativado
   */
  log(message, data = null) {
    if (this.debug) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Obtém ou cria Device ID persistente
   * Ordem de prioridade:
   * 1. Device ID FIXO (se configurado no deviceConfig.js)
   * 2. Cookie do domínio (sobrevive reinstalação)
   * 3. Chrome Storage Local
   * 4. Gera novo baseado em fingerprint
   */
  async getOrCreateDeviceID() {
    try {
      // 1. PRIORIDADE MÁXIMA: Device ID Fixo configurado
      if (FIXED_DEVICE_ID && (DEVICE_ID_MODE === 'fixed' || DEVICE_ID_MODE === 'hybrid')) {
        const fixedId = this.applyPrefix(FIXED_DEVICE_ID);
        this.log(LOG_MESSAGES.USING_FIXED, fixedId);
        
        // Salva em ambos os locais para manter consistência
        await this.saveToStorage(fixedId);
        await this.saveDeviceIDToCookie(fixedId);
        
        return fixedId;
      }

      // 2. Tenta ler do cookie do domínio Lovable
      const cookieDeviceId = await this.getDeviceIDFromCookie();
      if (cookieDeviceId && (!ALLOW_STORAGE_OVERRIDE || !FIXED_DEVICE_ID)) {
        this.log(LOG_MESSAGES.USING_COOKIE, cookieDeviceId);
        await this.saveToStorage(cookieDeviceId);
        return cookieDeviceId;
      }

      // 3. Tenta ler do Chrome Storage
      const storageDeviceId = await this.getDeviceIDFromStorage();
      if (storageDeviceId && (!ALLOW_STORAGE_OVERRIDE || !FIXED_DEVICE_ID)) {
        this.log(LOG_MESSAGES.USING_STORAGE, storageDeviceId);
        await this.saveDeviceIDToCookie(storageDeviceId);
        return storageDeviceId;
      }

      // 4. Gera novo baseado em fingerprint da máquina
      const fingerprintId = await this.fingerprint.generateUniqueID();
      const timestamp = Date.now().toString(36);
      const rawId = `${fingerprintId}_${timestamp}`;
      const deviceId = this.applyPrefix(rawId);
      
      this.log(LOG_MESSAGES.GENERATING_NEW, deviceId);
      
      // Salva em ambos os locais
      await this.saveToStorage(deviceId);
      await this.saveDeviceIDToCookie(deviceId);
      
      return deviceId;
    } catch (error) {
      this.log(LOG_MESSAGES.ERROR, error);
      // Fallback: UUID aleatório
      const fallbackId = this.applyPrefix(crypto.randomUUID());
      await this.saveToStorage(fallbackId);
      return fallbackId;
    }
  }

  /**
   * Aplica prefixo ao Device ID se configurado
   */
  applyPrefix(deviceId) {
    if (DEVICE_ID_PREFIX && !deviceId.startsWith(DEVICE_ID_PREFIX)) {
      return `${DEVICE_ID_PREFIX}${deviceId}`;
    }
    return deviceId;
  }

  /**
   * Lê Device ID do cookie do domínio lovable.dev
   * Persiste mesmo após desinstalar extensão
   */
  async getDeviceIDFromCookie() {
    try {
      const cookie = await chrome.cookies.get({
        url: CONFIG.COOKIE_DOMAIN,
        name: this.cookieName
      });
      
      return cookie?.value || null;
    } catch (error) {
      this.log('⚠️ Erro ao ler cookie de device ID:', error);
      return null;
    }
  }

  /**
   * Salva Device ID como cookie no domínio lovable.dev
   * Expira em 10 anos (praticamente permanente)
   */
  async saveDeviceIDToCookie(deviceId) {
    try {
      const expirationDate = Math.floor(Date.now() / 1000) + COOKIE_EXPIRATION_SECONDS;
      
      await chrome.cookies.set({
        url: CONFIG.COOKIE_DOMAIN,
        name: this.cookieName,
        value: deviceId,
        expirationDate: expirationDate,
        path: '/',
        secure: true,
        sameSite: 'lax'
      });
      
      this.log(LOG_MESSAGES.SAVED_COOKIE);
      return true;
    } catch (error) {
      this.log('⚠️ Erro ao salvar cookie de device ID:', error);
      return false;
    }
  }

  /**
   * Lê Device ID do Chrome Storage
   */
  async getDeviceIDFromStorage() {
    return new Promise(resolve => {
      chrome.storage.local.get(['deviceId'], result => {
        resolve(result.deviceId || null);
      });
    });
  }

  /**
   * Salva Device ID no Chrome Storage
   */
  async saveToStorage(deviceId) {
    return new Promise(resolve => {
      chrome.storage.local.set({ deviceId }, () => {
        this.log(LOG_MESSAGES.SAVED_STORAGE);
        resolve();
      });
    });
  }

  /**
   * Obtém informações detalhadas do dispositivo
   */
  async getDeviceInfo() {
    const deviceId = await this.getOrCreateDeviceID();
    const fp = await this.fingerprint.collectFingerprint();
    
    return {
      deviceId,
      fingerprint: fp,
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      },
      hardware: {
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        screen: `${screen.width}x${screen.height}`
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Força regeneração do Device ID (para testes)
   */
  async resetDeviceID() {
    // Remove cookie
    try {
      await chrome.cookies.remove({
        url: CONFIG.COOKIE_DOMAIN,
        name: this.cookieName
      });
    } catch (e) {}
    
    // Remove storage
    await new Promise(resolve => {
      chrome.storage.local.remove(['deviceId'], resolve);
    });
    
    this.log('🔄 Device ID resetado - Recarregue a extensão para gerar novo');
  }

  /**
   * Obtém o Device ID configurado (para debug)
   */
  getConfiguredDeviceID() {
    return {
      fixed: FIXED_DEVICE_ID || '(não configurado)',
      mode: DEVICE_ID_MODE,
      prefix: DEVICE_ID_PREFIX || '(sem prefixo)',
      allowOverride: ALLOW_STORAGE_OVERRIDE,
      cookieName: this.cookieName,
      expirationSeconds: COOKIE_EXPIRATION_SECONDS,
      debugEnabled: this.debug
    };
  }
}

// Exporta instância singleton
export const persistentDevice = new PersistentDeviceManager();

// Função de conveniência (compatível com código existente)
export async function getOrCreateDeviceId() {
  return await persistentDevice.getOrCreateDeviceID();
}
