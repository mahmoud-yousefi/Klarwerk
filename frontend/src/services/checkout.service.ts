export interface AddressFormValues {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  note?: string;
}

export type DemoPaymentMethod = 'invoice' | 'paypal' | 'card' | 'sepa';
export type DemoShippingMethod = 'standard' | 'express';

export interface DemoOrder {
  id: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  customer: AddressFormValues;
  shippingMethod: DemoShippingMethod;
  shippingLabel: string;
  paymentMethod: DemoPaymentMethod;
  paymentLabel: string;
  subtotal: number;
  shipping: number;
  total: number;
  vatIncluded: number;
  status: 'demo_confirmed';
}

const ORDERS_KEY = 'klarwerk.orders.v1';

const readOrders = (): DemoOrder[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getDemoOrder = (id: string) => readOrders().find((order) => order.id === id);

const persistOrder = (order: DemoOrder) => {
  const orders = [order, ...readOrders()].slice(0, 10);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  customer: AddressFormValues;
  shippingMethod: DemoShippingMethod;
  paymentMethod: DemoPaymentMethod;
  shippingLabel: string;
  paymentLabel: string;
  expressPrice: number;
  standardPrice: number;
  freeShippingFrom: number;
  vatRate: number;
  productLookup: (id: string) => {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    availability: string;
  } | undefined;
}

/**
 * Demo checkout. Prices are always recalculated here from the catalog – the
 * client never dictates totals. When the Express API is connected this call
 * moves to POST /checkout/orders with the same payload shape.
 */
export function createDemoOrder(input: CreateOrderInput): DemoOrder {
  if (!input.items.length) throw new Error('EMPTY_CART');

  const items = input.items.map((line) => {
    const product = input.productLookup(line.productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    if (product.availability === 'out_of_stock') throw new Error('OUT_OF_STOCK');
    const available = Math.max(product.stock, 0);
    const max = product.availability === 'preorder' ? 5 : available;
    if (line.quantity < 1 || line.quantity > max) throw new Error('INVALID_QUANTITY');
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      image: product.images[0] ?? '',
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping =
    input.shippingMethod === 'express'
      ? input.expressPrice
      : subtotal >= input.freeShippingFrom
        ? 0
        : input.standardPrice;
  const total = subtotal + shipping;
  const vatIncluded = Math.round((total - total / (1 + input.vatRate)) * 100) / 100;

  const order: DemoOrder = {
    id: `KW-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    items,
    customer: input.customer,
    shippingMethod: input.shippingMethod,
    shippingLabel: input.shippingLabel,
    paymentMethod: input.paymentMethod,
    paymentLabel: input.paymentLabel,
    subtotal,
    shipping,
    total,
    vatIncluded,
    status: 'demo_confirmed',
  };

  persistOrder(order);
  return order;
}
