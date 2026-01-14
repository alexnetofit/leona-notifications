-- =====================================================
-- LEONA NOTIFICATIONS - Setup do Banco de Dados
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- Tabela de endpoints (webhooks)
CREATE TABLE IF NOT EXISTS endpoints (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('disconnected', 'sale_approved', 'generic')),
  secret TEXT NOT NULL,
  generic_title TEXT,
  generic_body TEXT,
  notification_icon INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRAÇÃO: Se a tabela já existe, adicione a coluna notification_icon
-- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS notification_icon INTEGER DEFAULT 1;

-- Tabela de subscriptions (dispositivos para push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- MIGRAÇÃO: Se a tabela já existe, adicione a coluna device_id
-- ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Tabela de logs de webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  endpoint_id TEXT REFERENCES endpoints(id) ON DELETE CASCADE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB,
  query JSONB,
  sent BOOLEAN DEFAULT FALSE,
  error TEXT
);

-- Habilitar Row Level Security
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (RLS)
-- Endpoints: usuário só acessa os seus
DROP POLICY IF EXISTS "Users can manage own endpoints" ON endpoints;
CREATE POLICY "Users can manage own endpoints" ON endpoints
  FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions: usuário só acessa as suas
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Webhook Logs: usuário só vê logs dos seus endpoints
DROP POLICY IF EXISTS "Users can view own logs" ON webhook_logs;
CREATE POLICY "Users can view own logs" ON webhook_logs
  FOR SELECT USING (
    endpoint_id IN (SELECT id FROM endpoints WHERE user_id = auth.uid())
  );

-- =====================================================
-- PRONTO! Tabelas criadas com sucesso.
-- =====================================================
