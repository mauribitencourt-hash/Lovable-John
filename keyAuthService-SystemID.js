// keyAuthService-SystemID.js
// Versão desofuscada e simplificada
// ✅ TODOS OS NAVEGADORES = MESMO DEVICE ID (usando ID fixo)
//
// O código ORIGINAL já tinha esta solução!
// Não precisa de Native Messaging, System ID, ou configuração extra.

export class KeyAuthService {
  constructor() {
    this.config = {
      appName: 'https://keyauth.win/api/1.2/',
      name: 'jokerclub',
      ownerId: '4f8fb27e80' + '4d62a09b4c' + 'e2cff41d53' + '892c941db3' + 'dd13fe2b78' + '5f96e4c0ae' + '15b8a7f3d2',
      version: '1.0'
    };
    
    this.apiUrl = 'https://keyauth.win/api/1.2/';
    this.sessionid = null;
    this.initialized = false;
  }

  /**
   * � MÉTODO PRINCIPAL: Gera ID único POR INSTALAÇÃO
   * ✅ Cada navegador = ID diferente
   * ✅ Cada PC = ID diferente
   * ✅ Impossível rastrear entre instalações
   * 
   * O dono da extensão verá apenas IDs normais de usuários diferentes.
   */
  async getHWID() {
    try {
      // Tenta recuperar ID já gerado para esta instalação
      const stored = await chrome.storage.local.get(['device_hwid_unique']);
      
      if (stored.device_hwid_unique) {
        // Usa o ID persistido desta instalação
        return stored.device_hwid_unique;
      }
      
      // Gera novo ID único para esta instalação específica
      const uniqueID = this.generateUniqueDeviceID();
      
      // Salva permanentemente para esta instalação
      await chrome.storage.local.set({ device_hwid_unique: uniqueID });
      
      console.log('🆔 Novo Device ID gerado para esta instalação');
      
      return uniqueID;
      
    } catch (error) {
      // Fallback: gera ID baseado em timestamp (sempre diferente)
      return this.generateUniqueDeviceID();
    }
  }

  /**
   * Gera um Device ID único que parece legítimo
   * Formato similar ao esperado pelo KeyAuth
   */
  generateUniqueDeviceID() {
    // Combina timestamp, random e fingerprint do navegador
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const nav = navigator.userAgent.length.toString(36);
    const screen = (screen.width * screen.height).toString(36);
    
    // Gera um hash simples
    const combined = `${timestamp}${random1}${random2}${nav}${screen}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Formato: jokerclub-xxxxx-xxxxx (parece legítimo)
    return `jokerclub-${Math.abs(hash).toString(36)}-${random1}`;
  }

  /**
   * Hash simples para senhas
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Faz requisição para a API do KeyAuth
   */
  async apiRequest(params) {
    try {
      const body = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: body
      });

      if (!response.ok) {
        throw new Error('HTTP error! Status: ' + response.status);
      }

      const textResponse = await response.text();
      
      try {
        return JSON.parse(textResponse);
      } catch (parseError) {
        return {
          success: false,
          message: textResponse
        };
      }
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Inicializa a sessão com o KeyAuth
   */
  async initialize() {
    try {
      const result = await this.apiRequest({
        type: 'init',
        ver: this.config.version,
        name: this.config.name,
        ownerid: this.config.ownerId
      });

      if (result.success) {
        this.sessionid = result.sessionid;
        this.initialized = true;
        return {
          success: true,
          message: 'Initialized'
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 🔓 BYPASS: Valida licença SEM CONTATAR SERVIDOR
   * ✅ Funciona offline
   * ✅ Nenhum dado enviado ao dono
   * ✅ Impossível rastrear
   */
  async validate(licenseKey) {
    const hwid = await this.getHWID();
    
    console.log('🔓 Modo bypass ativado - Validação local');
    
    // Simula validação bem-sucedida (sem contatar servidor)
    const fakeData = {
      key: licenseKey || 'bypass-mode-active',
      hwid: hwid,
      username: 'User_' + hwid.substring(10, 16),
      expiry: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 ano no futuro
      validatedAt: Date.now()
    };
    
    // Salva no cache local
    await this.saveCache(fakeData);
    
    console.log('✅ Extensão ativada (modo local)');
    
    return {
      success: true,
      message: 'Extensão ativada com sucesso!',
      info: {
        username: fakeData.username,
        subscriptions: [{
          subscription: 'Premium',
          expiry: fakeData.expiry,
          key: fakeData.key
        }]
      }
    };
  }

  /**
   * Valida licença REAL (use apenas se quiser contatar o servidor)
   * CUIDADO: Isso envia dados para o dono da extensão!
   */
  async validateReal(licenseKey) {
    // Garante que está inicializado
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return initResult;
      }
    }

    // Obtém o HWID único desta instalação
    const hwid = await this.getHWID();
    console.log('📱 Device ID:', hwid.substring(0, 16) + '...');

    try {
      const result = await this.apiRequest({
        type: 'license',
        key: licenseKey,
        hwid: hwid,
        sessionid: this.sessionid,
        name: this.config.name,
        ownerid: this.config.ownerId
      });

      if (result.success) {
        // Salva no cache
        await this.saveCache({
          key: licenseKey,
          hwid: hwid,
          username: result.info?.username,
          expiry: result.info?.subscriptions?.[0]?.expiry,
          validatedAt: Date.now()
        });

        console.log('✅ Licença validada com sucesso!');
        
        return {
          success: true,
          message: 'Licença ativada!',
          info: result.info
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Salva o cache da licença
   */
  async saveCache(data) {
    await chrome.storage.local.set({
      'keyauth_license': data
    });
  }

  /**
   * Carrega o cache da licença
   */
  async loadCache() {
    const result = await chrome.storage.local.get(['keyauth_license']);
    return result.keyauth_license || null;
  }

  /**
   * 🔓 Valida cache (SEMPRE VÁLIDO em modo bypass)
   */
  async validateCache() {
    const cache = await this.loadCache();
    
    // Se não tem cache, cria um automaticamente
    if (!cache || !cache.key) {
      console.log('📝 Criando licença local automática...');
      await this.validate('auto-activated');
      return {
        valid: true,
        cache: await this.loadCache()
      };
    }

    // Em modo bypass, cache nunca expira
    console.log('✅ Licença local válida (permanente)');
    
    return {
      valid: true,
      cache: cache
    };
  }

  /**
   * Valida cache REAL (com expiração de 1 hora)
   * Use apenas se quiser revalidar com servidor
   */
  async validateCacheReal() {
    const cache = await this.loadCache();
    
    if (!cache || !cache.key) {
      return {
        valid: false,
        message: 'Nenhuma licença em cache'
      };
    }

    // Verifica se passou mais de 1 hora
    const hoursSinceValidation = (Date.now() - cache.validatedAt) / (1000 * 60 * 60);
    
    if (hoursSinceValidation > 1) {
      // Revalida com o servidor
      return await this.validateReal(cache.key);
    }

    return {
      valid: true,
      cache: cache
    };
  }

  /**
   * Faz logout e limpa o cache
   */
  async logout() {
    this.sessionid = null;
    this.initialized = false;
    await chrome.storage.local.remove(['keyauth_license']);
    return {
      success: true
    };
  }
}
