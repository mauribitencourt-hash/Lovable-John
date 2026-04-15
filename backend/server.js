// ============================================
// BACKEND SEGURO - Autenticação
// ============================================
// As credenciais do Supabase ficam AQUI, não na extensão!

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Client (credenciais seguras no servidor)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// CORS - Permitir apenas extensões Chrome
app.use(cors({
  origin: function (origin, callback) {
    // Permitir extensões Chrome e localhost para testes
    if (!origin || origin.startsWith('chrome-extension://') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// ============================================
// ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend rodando!' });
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, deviceId, deviceFingerprint } = req.body;

    if (!email || !password || !deviceId || !deviceFingerprint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados incompletos' 
      });
    }

    // Hash da senha
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // 1. Buscar usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      // Log de falha
      await supabase.from('auth_logs').insert({
        email: email,
        action: 'login_failed',
        device_id: deviceId,
        success: false,
        error_message: 'Credenciais inválidas'
      });

      return res.status(401).json({ 
        success: false, 
        error: 'Email ou senha incorretos' 
      });
    }

    // 2. DELETAR SESSÕES ANTERIORES (força logout em outras máquinas)
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id);

    // 3. Criar nova sessão
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar sessão' 
      });
    }

    // 4. Log de sucesso
    await supabase.from('auth_logs').insert({
      user_id: user.id,
      email: email,
      action: 'login',
      device_id: deviceId,
      success: true
    });

    // 5. Retornar sessão
    res.json({ 
      success: true, 
      sessionToken: sessionToken,
      user: { 
        id: user.id, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// VALIDAR SESSÃO
app.post('/api/validate', async (req, res) => {
  try {
    const { sessionToken, deviceId, deviceFingerprint } = req.body;

    if (!sessionToken || !deviceId || !deviceFingerprint) {
      return res.status(400).json({ 
        valid: false, 
        reason: 'Dados incompletos' 
      });
    }

    // Buscar sessão
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('device_id', deviceId)
      .single();

    if (error || !session) {
      return res.json({ 
        valid: false, 
        reason: 'Sessão inválida' 
      });
    }

    // Verificar expiração
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', session.id);

      return res.json({ 
        valid: false, 
        reason: 'Sessão expirada' 
      });
    }

    // Verificar fingerprint (anti-falsificação)
    if (session.device_fingerprint !== deviceFingerprint) {
      // Log de tentativa de hijack
      await supabase.from('auth_logs').insert({
        user_id: session.user_id,
        action: 'session_hijack',
        device_id: deviceId,
        success: false,
        error_message: 'Fingerprint não confere'
      });

      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', session.id);

      return res.json({ 
        valid: false, 
        reason: 'Tentativa de acesso não autorizado detectada' 
      });
    }

    // Atualizar última atividade
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);

    res.json({ 
      valid: true, 
      userId: session.user_id 
    });

  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    res.status(500).json({ 
      valid: false, 
      reason: 'Erro interno' 
    });
  }
});

// LOGOUT
app.post('/api/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token não fornecido' 
      });
    }

    // Buscar sessão para pegar user_id
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, device_id')
      .eq('session_token', sessionToken)
      .single();

    // Deletar sessão
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken);

    // Log
    if (session) {
      await supabase.from('auth_logs').insert({
        user_id: session.user_id,
        action: 'logout',
        device_id: session.device_id,
        success: true
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Credenciais Supabase protegidas!`);
});
