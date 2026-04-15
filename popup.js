// popup.js - VERSÃO COM AUTENTICAÇÃO SUPABASE
import { AppState } from './storage.js';
import { AuthService } from './authService.js';
import { UploadService } from './uploadService.js';
import { MessageService } from './messageService.js';
import { KeyAuthService } from './keyAuthService.js';
import { SupabaseAuth } from './supabaseAuth.js';
import { getOrCreateDeviceId } from './utils.js';

class PopupApp {
  constructor() {
    this.state = new AppState();
    this.authService = new AuthService(this.state);
    this.keyAuthService = new KeyAuthService();
    this.supabaseAuth = new SupabaseAuth();
    this.messageService = new MessageService(this.state, this.authService);
    this.uploadService = new UploadService(this.state, this.authService);
    this.chatMode = false;
    
    // Elementos DOM
    this.elements = {
      history: document.getElementById('history'),
      message: document.getElementById('message'),
      sendBtn: document.getElementById('sendBtn'),
      status: document.getElementById('status'),
      uploadInput: document.getElementById('uploadInput'),
      uploadBtn: document.getElementById('uploadBtn'),
      fileInfo: document.getElementById('fileInfo'),
      clearFileBtn: document.getElementById('clearFileBtn'),
      chatModeBtn: document.getElementById('chatModeBtn'),
      authOverlay: document.getElementById('authOverlay'),
      emailInput: document.getElementById('emailInput'),
      passwordInput: document.getElementById('passwordInput'),
      loginBtn: document.getElementById('loginBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      authStatus: document.getElementById('authStatus')
    };
  }

  async initialize() {
    try {
      // Verificar se está logado
      const isLoggedIn = await this.supabaseAuth.isLoggedIn();
      
      if (!isLoggedIn) {
        this.showLoginScreen();
        return;
      }

      // Validar sessão no Supabase
      const validation = await this.supabaseAuth.validateSession();
      
      if (!validation.valid) {
        this.showLoginScreen();
        this.setAuthStatus(validation.reason, false);
        return;
      }

      // Sessão válida - continuar normalmente
      this.hideLoginScreen();

      // Auto-valida bypass KeyAuth
      await this.keyAuthService.validate('AUTO-BYPASS-jZ8aNp-Fe9h8m-PuLJjh-zPLia1-KXUrlA-6fmBJu');

      // Carrega estado
      await this.state.load();

      // Chat mode
      const chatModeData = await chrome.storage.local.get(['chatMode']);
      this.chatMode = chatModeData.chatMode || false;

      await this.state.save();

      // Setup listeners
      this.setupEventListeners();
      this.updateChatModeUI();
      
      // Validar sessão periodicamente (a cada 2 minutos)
      setInterval(async () => {
        const validation = await this.supabaseAuth.validateSession();
        if (!validation.valid) {
          this.showLoginScreen();
          this.setAuthStatus('Sessão expirada. Faça login novamente.', false);
        }
      }, 2 * 60 * 1000);
      
      this.setStatus('Extensão pronta!');
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.setStatus('Erro: ' + error.message);
    }
  }

  setupEventListeners() {
    // Login button
    if (this.elements.loginBtn) {
      this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
    }
    
    // Logout button
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    // Enter key no password
    if (this.elements.passwordInput) {
      this.elements.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleLogin();
        }
      });
    }
    
    // Send button
    if (this.elements.sendBtn) {
      this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
    }
    
    // Message input (Enter key)
    if (this.elements.message) {
      this.elements.message.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Upload button
    if (this.elements.uploadBtn && this.elements.uploadInput) {
      this.elements.uploadBtn.addEventListener('click', () => {
        this.elements.uploadInput.click();
      });
      
      this.elements.uploadInput.addEventListener('change', () => this.handleFileUpload());
    }

    // Clear file button
    if (this.elements.clearFileBtn) {
      this.elements.clearFileBtn.addEventListener('click', () => {
        this.state.clearFile();
        this.updateFileDisplay();
        this.elements.clearFileBtn.classList.add('hidden');
        this.elements.uploadInput.value = '';
        this.state.save();
      });
    }

    // Chat mode toggle
    if (this.elements.chatModeBtn) {
      this.elements.chatModeBtn.addEventListener('click', () => this.toggleChatMode());
    }
  }

  async toggleChatMode() {
    // Validar sessão antes
    const validation = await this.supabaseAuth.validateSession();
    if (!validation.valid) {
      this.showLoginScreen();
      this.setAuthStatus('Sessão expirada', false);
      return;
    }
    
    this.chatMode = !this.chatMode;
    await chrome.storage.local.set({ chatMode: this.chatMode });
    this.updateChatModeUI();
    this.setStatus(this.chatMode ? 'Chat Mode: ON' : 'Chat Mode: OFF');
    setTimeout(() => this.setStatus(''), 2000);
  }

  updateChatModeUI() {
    if (!this.elements.chatModeBtn) return;
    
    if (this.chatMode) {
      this.elements.chatModeBtn.classList.add('active');
      this.elements.chatModeBtn.title = 'Chat Mode: ON';
    } else {
      this.elements.chatModeBtn.classList.remove('active');
      this.elements.chatModeBtn.title = 'Chat Mode: OFF';
    }
  }

  async handleSendMessage() {
    if (!this.elements.sendBtn || this.elements.sendBtn.disabled) return;

    // Validar sessão antes de enviar
    const validation = await this.supabaseAuth.validateSession();
    if (!validation.valid) {
      this.showLoginScreen();
      this.setAuthStatus('Sessão expirada. Faça login novamente.', false);
      return;
    }

    const messageText = this.elements.message?.value?.trim();
    if (!messageText) {
      this.setStatus('Digite uma mensagem para enviar.');
      return;
    }

    this.addUserMessage(messageText);
    this.elements.message.value = '';
    this.disableSendButton(true);
    this.setStatus('Processando...');

    try {
      const response = await this.messageService.sendMessage(messageText, this.chatMode);
      
      this.state.clearFile();
      await this.state.save();
      this.updateFileDisplay();

      if (this.elements.clearFileBtn) {
        this.elements.clearFileBtn.classList.add('hidden');
      }

      if (response.type === 'info') {
        this.addBotMessage('Processamento iniciado.');
        this.setStatus('Mensagem enviada com sucesso!');
      } else {
        this.addBotMessage('✓ ' + (response.type || 'Mensagem enviada para o servidor!'));
        this.setStatus('Concluído');
      }
    } catch (error) {
      const errorMsg = error.message || String(error);
      this.setStatus('❌ ' + errorMsg);
      this.addBotMessage('❌ ' + errorMsg);
    } finally {
      this.disableSendButton(false);
    }
  }

  async handleFileUpload() {
    const selectedFile = this.elements.uploadInput?.files?.[0];
    if (!selectedFile) {
      this.setStatus('Selecione um arquivo.');
      return;
    }

    if (this.elements.clearFileBtn) {
      this.elements.clearFileBtn.classList.remove('hidden');
    }

    this.setStatus('Enviando arquivo...');

    try {
      await this.uploadService.uploadFile(selectedFile);
      this.updateFileDisplay();
      this.setStatus('Arquivo anexado!');
      
      if (this.elements.clearFileBtn) {
        this.elements.clearFileBtn.classList.remove('hidden');
      }
    } catch (error) {
      const errorMsg = error.message || String(error);
      this.setStatus('❌ Erro: ' + errorMsg);
    }
  }

  // UI Methods
  showLoginScreen() {
    if (this.elements.authOverlay) {
      this.elements.authOverlay.style.display = 'flex';
    }
    if (this.elements.loginBtn) {
      this.elements.loginBtn.classList.remove('hidden');
    }
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.classList.add('hidden');
    }
  }

  hideLoginScreen() {
    if (this.elements.authOverlay) {
      this.elements.authOverlay.style.display = 'none';
    }
  }

  setAuthStatus(message, isSuccess = false) {
    if (!this.elements.authStatus) return;
    this.elements.authStatus.textContent = message;
    this.elements.authStatus.className = isSuccess ? 'auth-status success' : 'auth-status';
  }

  async handleLogin() {
    const email = this.elements.emailInput?.value?.trim();
    const password = this.elements.passwordInput?.value;

    if (!email || !password) {
      this.setAuthStatus('Preencha todos os campos', false);
      return;
    }

    this.setAuthStatus('Autenticando...', false);
    this.elements.loginBtn.disabled = true;

    try {
      const result = await this.supabaseAuth.login(email, password);

      if (result.success) {
        this.setAuthStatus('✓ Login realizado!', true);
        this.hideLoginScreen();
        
        // Reinicializar app
        await this.initialize();
      } else {
        this.setAuthStatus(result.error || 'Erro ao fazer login', false);
      }
    } catch (error) {
      this.setAuthStatus('Erro: ' + error.message, false);
    } finally {
      this.elements.loginBtn.disabled = false;
    }
  }

  async handleLogout() {
    try {
      await this.supabaseAuth.logout();
      this.showLoginScreen();
      this.setAuthStatus('Logout realizado com sucesso', true);
      
      // Limpar histórico
      if (this.elements.history) {
        this.elements.history.innerHTML = '';
      }
    } catch (error) {
      this.setAuthStatus('Erro ao fazer logout', false);
    }
  }

  addUserMessage(text) {
    if (!this.elements.history) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble user';
    bubble.textContent = text;
    this.elements.history.appendChild(bubble);
    this.elements.history.scrollTop = this.elements.history.scrollHeight;
  }

  addBotMessage(text) {
    if (!this.elements.history) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble bot';
    bubble.textContent = text;
    this.elements.history.appendChild(bubble);
    this.elements.history.scrollTop = this.elements.history.scrollHeight;
  }

  setStatus(text) {
    if (!this.elements.status) return;
    this.elements.status.textContent = text;
  }

  disableSendButton(disabled) {
    if (this.elements.sendBtn) {
      this.elements.sendBtn.disabled = disabled;
    }
  }

  updateFileDisplay() {
    if (!this.elements.fileInfo) return;
    
    if (this.state.uploadedFile?.id) {
      const fileNameDisplay = document.getElementById('fileNameDisplay');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = '✓ ' + (this.state.uploadedFile.name || 'arquivo');
      }
      this.elements.fileInfo.classList.remove('hidden');
    } else {
      this.elements.fileInfo.classList.add('hidden');
    }
  }
}

// Inicialização
(async () => {
  const app = new PopupApp();
  await app.initialize();
})();

// Device ID Display
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const deviceId = await getOrCreateDeviceId();
    const deviceIdDisplay = document.getElementById('deviceIdDisplay');
    if (deviceIdDisplay) {
      deviceIdDisplay.textContent = deviceId;
    }
    
    // Botão copiar
    const copyBtn = document.getElementById('copyDeviceIdBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(deviceId).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = '✅ Copiado!';
          copyBtn.style.background = '#4ade80';
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
          }, 2000);
        }).catch(err => {
          console.error('Erro ao copiar:', err);
        });
      });
    }

    console.log('🆔 Device ID:', deviceId);
  } catch (error) {
    console.error('Erro ao carregar Device ID:', error);
  }
});
