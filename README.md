# Leona Notifications

PWA para receber notificações push em tempo real via webhooks.

![Leona Notifications](public/image/logo.svg)

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + Database)
- **Web Push** (VAPID)
- **PWA** (manifest + service worker)

## Funcionalidades

- Login com Magic Link (sem senha)
- Criação de endpoints de webhook
- 3 tipos de notificação:
  - **Desconexão**: Alerta quando uma instância desconecta
  - **Venda Aprovada**: Notifica vendas com valor
  - **Genérico**: Mensagem personalizada
- Push notifications em tempo real
- Suporte a múltiplos dispositivos por usuário
- PWA instalável no celular

---

## Setup

### 1. Clonar o Repositório

```bash
git clone https://github.com/alexnetofit/leona-notifications.git
cd leona-notifications
npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o SQL abaixo para criar as tabelas:

```sql
-- Tabela de endpoints
CREATE TABLE endpoints (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('disconnected', 'sale_approved', 'generic')),
  secret TEXT NOT NULL,
  generic_title TEXT,
  generic_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de subscriptions (dispositivos)
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Tabela de logs de webhook
CREATE TABLE webhook_logs (
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

-- Políticas de acesso
CREATE POLICY "Users can manage own endpoints" ON endpoints
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON webhook_logs
  FOR SELECT USING (
    endpoint_id IN (SELECT id FROM endpoints WHERE user_id = auth.uid())
  );
```

3. Em **Authentication > URL Configuration**, configure:
   - Site URL: `https://seu-dominio.vercel.app`
   - Redirect URLs: `https://seu-dominio.vercel.app/**`

### 3. Gerar Chaves VAPID

As chaves VAPID são usadas para autenticar o envio de push notifications.

```bash
npx web-push generate-vapid-keys
```

Copie as chaves geradas (Public Key e Private Key).

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# VAPID (gerado no passo anterior)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-vapid-public-key
VAPID_PRIVATE_KEY=sua-vapid-private-key

# App URL (sem barra no final)
APP_URL=https://seu-dominio.vercel.app
```

### 5. Rodar Localmente

```bash
npm run dev
```

Acesse http://localhost:3000

---

## Deploy na Vercel

1. Push o código para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy!

---

## Uso dos Webhooks

### URL do Webhook

Cada endpoint gera uma URL no formato:

```
POST ou GET
https://seu-dominio.vercel.app/api/webhook/{endpoint_id}?token={secret}
```

### Exemplos de Teste com cURL

#### Desconexão

```bash
curl -X POST "https://notifications.leonaflow.com/api/webhook/SEU_ENDPOINT_ID?token=SEU_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "disconnected",
    "instance_number": "5511999999999",
    "instance_name": "Minha Conexão"
  }'
```

**Notificação gerada:**
- Título: 🚨 Atenção! Minha Conexão desconectou!
- Corpo: O número 5511999999999 precisa de atenção

#### Venda Aprovada

```bash
curl "https://notifications.leonaflow.com/api/webhook/SEU_ENDPOINT_ID?token=SEU_SECRET&valor=R$%20197,00"
```

**Notificação gerada:**
- Título: 🤑 Venda Aprovada!
- Corpo: Valor: R$ 197,00

#### Genérico

```bash
curl -X POST "https://notifications.leonaflow.com/api/webhook/SEU_ENDPOINT_ID?token=SEU_SECRET"
```

**Notificação gerada:**
- Título e corpo definidos na criação do endpoint

---

## Notas Importantes

### iOS (iPhone/iPad)

⚠️ **Push notifications no iOS só funcionam se o app estiver instalado como PWA.**

Para instalar:
1. Abra o Safari
2. Acesse o app
3. Toque em Compartilhar → Adicionar à Tela de Início
4. Abra o app pela Tela de Início
5. Ative as notificações

### Permissões

- O usuário precisa autorizar notificações no navegador
- Cada dispositivo precisa ser registrado separadamente
- As subscriptions são salvas no banco e persistem entre sessões

### Segurança

- Cada endpoint tem um `secret` único
- Tokens inválidos retornam 401
- RLS garante que usuários só acessam seus próprios dados

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── push/
│   │   │   ├── subscribe/route.ts
│   │   │   └── unsubscribe/route.ts
│   │   └── webhook/
│   │       └── [endpointId]/route.ts
│   ├── dashboard/page.tsx
│   ├── endpoints/new/page.tsx
│   ├── login/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx
├── components/
│   ├── CopyButton.tsx
│   ├── EndpointCard.tsx
│   ├── Header.tsx
│   └── PushPermission.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── push.ts
│   └── utils.ts
├── types/index.ts
└── middleware.ts
```

---

## Licença

MIT

---

Desenvolvido com ❤️ para receber notificações em tempo real.
