import type { CategoryId, LocalizedString } from '@/types/catalog';

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

export type InvoiceStatus = 'paid' | 'open' | 'overdue' | 'draft';

export interface AdminInvoice {
  id: string;
  customer: string;
  email: string;
  amount: number;
  vat: number;
  issued: string;
  due: string;
  status: InvoiceStatus;
}

export interface FinanceMonth {
  month: string;
  revenue: number;
  cogs: number;
  opex: number;
  marketing: number;
  refunds: number;
}

export interface PayoutEntry {
  id: string;
  provider: string;
  amount: number;
  date: string;
  status: 'pending' | 'settled';
}

/* ------------------------------------------------------------------ */
/* Operations & inventory                                              */
/* ------------------------------------------------------------------ */

export type WarehouseId = 'HAM' | 'BER' | 'MUC';

export type ZoneKind =
  | 'receiving'
  | 'storage'
  | 'picking'
  | 'packing'
  | 'dispatch'
  | 'returns'
  | 'office';

export interface WarehouseZone {
  id: string;
  code: string;
  name: LocalizedString;
  kind: ZoneKind;
  /** Position and size in percent of the floor-plan viewBox. */
  x: number;
  y: number;
  w: number;
  h: number;
  capacity: number;
  /** Fixed occupancy for operational zones; storage is derived from stock. */
  baseUsed: number;
}

export interface Warehouse {
  id: WarehouseId;
  code: string;
  name: LocalizedString;
  city: string;
  manager: string;
  slaHours: number;
  temperature: LocalizedString;
  zones: WarehouseZone[];
}

export type StockStatus = 'healthy' | 'low' | 'critical' | 'out' | 'overstock';

export interface StockRow {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  category: CategoryId;
  image: string;
  price: number;
  warehouse: WarehouseId;
  zone: string;
  bin: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  incoming: number;
  velocity: number;
  coverDays: number;
  value: number;
  status: StockStatus;
}

export interface StockOverride {
  onHand: number;
  warehouse: WarehouseId;
}

export type MovementType = 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  date: string;
  type: MovementType;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  fromWarehouse?: WarehouseId;
  toWarehouse?: WarehouseId;
  reference: string;
  operator: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: LocalizedString;
  country: string;
  leadTimeDays: number;
  onTimeRate: number;
  qualityScore: number;
  spendYtd: number;
  contact: string;
  email: string;
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'in_transit' | 'received' | 'delayed';

export interface PurchaseOrderLine {
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  eta: string;
  warehouse: WarehouseId;
  units: number;
  value: number;
  lines: PurchaseOrderLine[];
}

export type FulfillmentStage =
  | 'received'
  | 'picking'
  | 'packing'
  | 'labeling'
  | 'dispatch'
  | 'delivered'
  | 'exception';

export type ExceptionReason = 'address' | 'stock' | 'damage' | 'customs';

export interface FulfillmentJob {
  id: string;
  orderId: string;
  customer: string;
  city: string;
  country: string;
  stage: FulfillmentStage;
  warehouse: WarehouseId;
  items: number;
  value: number;
  slaDue: string;
  started: string;
  carrier: string;
  priority: 'standard' | 'express';
  exceptionReason?: ExceptionReason;
}

export interface CarrierPerformance {
  id: string;
  name: string;
  onTime: number;
  transitHours: number;
  volume: number;
  color: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'hub' | 'city';
  warehouse?: WarehouseId;
  volume: number;
}

export interface Shift {
  id: string;
  name: LocalizedString;
  window: string;
  staff: number;
  pickRate: number;
  active: boolean;
}

export interface RestockInput {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  warehouse: WarehouseId;
  zone: string;
  onHand: number;
}
