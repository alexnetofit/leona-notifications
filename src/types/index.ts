export type EndpointType = 'disconnected' | 'sale_approved' | 'generic';

export interface Endpoint {
  id: string;
  user_id: string;
  name: string;
  type: EndpointType;
  secret: string;
  generic_title: string | null;
  generic_body: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

export interface WebhookLog {
  id: number;
  endpoint_id: string;
  received_at: string;
  payload: Record<string, unknown> | null;
  query: Record<string, unknown> | null;
  sent: boolean;
  error: string | null;
}

export interface DisconnectedPayload {
  event: 'disconnected';
  instance_number: string;
  instance_name: string;
  timestamp?: string;
  timestamp_humanized?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  data: {
    url: string;
  };
}
