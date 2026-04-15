-- ============================================
-- SUPABASE SETUP - Sistema de Autenticação
-- ============================================

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Criar tabela de sessões (máximo 1 por usuário)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_fingerprint TEXT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id) -- GARANTE APENAS 1 SESSÃO POR USUÁRIO
);

-- 3. Criar tabela de logs de tentativas
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- login, logout, login_failed, session_hijack
  device_id VARCHAR(255),
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_logs_created ON auth_logs(created_at);

-- 5. Função para limpar sessões expiradas (executar automaticamente)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Criar usuário de teste (senha: teste123)
-- Hash bcrypt de "teste123": $2a$10$XQKvPp4xE.JMYxKqOWxLZO4wqVLLXMJO6GQmZUQWDXMPVXKVMXKVG
INSERT INTO users (email, password_hash, is_active) 
VALUES ('teste@exemplo.com', '$2a$10$XQKvPp4xE.JMYxKqOWxLZO4wqVLLXMJO6GQmZUQWDXMPVXKVMXKVG', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de acesso (apenas service_role pode acessar)
CREATE POLICY "Service role can do everything" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything" ON auth_logs FOR ALL USING (auth.role() = 'service_role');
