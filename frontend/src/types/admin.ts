export type OrderStatus = 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded' | 'pending';

export type CustomerSegment = 'new' | 'returning' | 'vip' | 'at-risk';

export type MessageStatus = 'open' | 'pending' | 'resolved';

export type MessageChannel = 'email' | 'form' | 'chat';

export type RequestType = 'return' | 'warranty' | 'address' | 'invoice' | 'preorder';

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  payment: string;
  country: string;
  city: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spend: number;
  segment: CustomerSegment;
  country: string;
  lastOrder: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  channel: MessageChannel;
  status: MessageStatus;
  priority: 'low' | 'normal' | 'high';
  replies: Array<{ author: 'team' | 'customer'; text: string; date: string }>;
}

export interface AdminRequest {
  id: string;
  type: RequestType;
  customer: string;
  email: string;
  detail: string;
  date: string;
  status: 'pending' | 'approved' | 'declined';
}

export interface AdminReview {
  id: string;
  author: string;
  product: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
}

export interface AdminSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  lowStockThreshold: number;
  autoReply: boolean;
  expressEnabled: boolean;
  newsletter: boolean;
  satisfactionTarget: number;
  monthlyGoal: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}
