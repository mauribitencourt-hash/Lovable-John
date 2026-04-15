// ============================================
// SUPABASE AUTH - Sistema de Sessão Única
// ============================================
// AGORA CHAMA O BACKEND - Credenciais seguras no servidor!

export class SupabaseAuth {
  constructor() {
    // URL do seu backend (NÃO TEM CREDENCIAIS AQUI!)
    this.backendUrl = 'http://localhost:3000'; // Mude para seu servidor quando fizer deploy
  }

  // Gera fingerprint único da máquina (difícil de falsificar)
  async getDeviceFingerprint() {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform,
      navigator.vendor || 'unknown'
    ];

    const text = components.join('|');
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Gera device ID único (inclui timestamp para renovação periódica)
  async getDeviceId() {
    let deviceId = await chrome.storage.local.get('permanent_device_id');
    
    if (!deviceId.permanent_device_id) {
      const fingerprint = await this.getDeviceFingerprint();
      const randomPart = crypto.randomUUID();
      deviceId.permanent_device_id = `${fingerprint}-${randomPart}`;
      await chrome.storage.local.set({ permanent_device_id: deviceId.permanent_device_id });
    }
    
    return deviceId.permanent_device_id;
  }

  // Hash de senha simples (bcrypt seria melhor no backend)
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // LOGIN - Chama o backend
  async login(email, password) {
    try {
      const deviceId = await this.getDeviceId();
      const deviceFingerprint = await this.getDeviceFingerprint();

      // Chamar backend (credenciais ficam no servidor!)
      const response = await fetch(`${this.backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceId,
          deviceFingerprint
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Salvar sessão localmente
      await chrome.storage.local.set({
        session_token: data.sessionToken,
        user_id: data.user.id,
        user_email: data.user.email,
        device_id: deviceId,
        logged_in: true
      });

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  }

  // VALIDAR SESSÃO - Chamado a cada ação
  async validateSession() {
    try {
      const stored = await chrome.storage.local.get(['session_token', 'device_id', 'user_id']);
      
      if (!stored.session_token || !stored.device_id || !stored.user_id) {
        return { valid: false, reason: 'Sessão não encontrada' };
      }

      const deviceFingerprint = await this.getDeviceFingerprint();

      // Buscar sessão ativa no banco
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', stored.session_token)
        .eq('user_id', stored.user_id)
        .eq('device_id', stored.device_id)
        .single();

      if (error || !session) {
        await this.logout();
        return { valid: false, reason: 'Sessão inválida ou expirada' };
      }

      // Verificar expiração
      if (new Date(session.expires_at) < new Date()) {
        await this.logout();
        return { valid: false, reason: 'Sessão expirada' };
      } o backend
  async validateSession() {
    try {
      const stored = await chrome.storage.local.get(['session_token', 'device_id', 'user_id']);
      
      if (!stored.session_token || !stored.device_id || !stored.user_id) {
        return { valid: false, reason: 'Sessão não encontrada' };
      }

      const deviceFingerprint = await this.getDeviceFingerprint();

      // Chamar backend para validar
      const response = await fetch(`${this.backendUrl}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: stored.session_token,
          deviceId: stored.device_id,
          deviceFingerprint
        })
      });

      const - Chama o backend
  async logout() {
    try {
      const stored = await chrome.storage.local.get('session_token');

      if (stored.session_token) {
        // Chamar backend para deletar sessão
        await fetch(`${this.backendUrl}/api/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: stored.session_token
          })
        }); stored = await chrome.storage.local.get('logged_in');
    return stored.logged_in === true;
  }

  // Registrar tentativas de acesso (auditoria)
  async logAuthAttempt(userId, email, action, deviceId, success, errorMessage) {
    try {
      await this.supabase
        .from('auth_logs')
        .insert({
          user_id: userId,
          email: email,
          action: action,
          device_id: deviceId,
          user_agent: navigator.userAgent,
          success: success,
          error_message: errorMessage
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }Verificar se está logado (verificação rápida local)
  async isLoggedIn() {
    const stored = await chrome.storage.local.get('logged_in');
    return stored.logged_in === true;