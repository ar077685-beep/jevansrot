export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Advance Paid' | 'Paid' | 'COD' | 'Failed' | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  advanceAmount: number; // Advance amount paid by customer
  remainAmount: number;  // Remaining amount to be paid/collected
  paymentMethod: 'UPI / QR' | 'Cash on Delivery' | 'Card / NetBanking' | 'WhatsApp';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
}

export const INITIAL_ORDERS: Order[] = [];

const DEMO_ORDER_IDS = new Set(['ord-101', 'ord-102', 'ord-103', 'ord-104', 'ord-105', 'ord-106']);

const STORAGE_KEY = 'jevansrot_orders_store';

function normalizeOrder(o: Partial<Order>): Order {
  const total = Number(o.total) || 0;
  const advance = typeof o.advanceAmount === 'number'
    ? o.advanceAmount
    : (o.paymentStatus === 'Paid' ? total : 0);
  const remain = typeof o.remainAmount === 'number'
    ? o.remainAmount
    : Math.max(0, total - advance);

  return {
    ...(o as Order),
    total,
    advanceAmount: advance,
    remainAmount: remain,
    paymentStatus: o.paymentStatus || 'Pending',
    status: o.status || 'Pending'
  };
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realOrders = parsed.filter((o: Partial<Order>) => o && o.id && !DEMO_ORDER_IDS.has(o.id));
      if (realOrders.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOrders));
      }
      return realOrders.map(normalizeOrder);
    }
    return [];
  } catch (err) {
    console.error('Failed to load orders from localStorage:', err);
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = orders.map(normalizeOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('jevansrot_orders_updated'));
  } catch (err) {
    console.error('Failed to save orders:', err);
  }
}

export async function fetchOrdersFromServer(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    if (data.success && Array.isArray(data.orders)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.orders));
        window.dispatchEvent(new Event('jevansrot_orders_updated'));
      }
      return data.orders.map(normalizeOrder);
    }
    return getStoredOrders();
  } catch {
    return getStoredOrders();
  }
}

export function createNewOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
  const current = getStoredOrders();
  const nextNum = 9842 + current.length;
  const total = Number(orderData.total) || 0;
  const advance = typeof orderData.advanceAmount === 'number' ? orderData.advanceAmount : 0;
  const remain = typeof orderData.remainAmount === 'number' ? orderData.remainAmount : Math.max(0, total - advance);

  const newOrder: Order = {
    ...orderData,
    total,
    advanceAmount: advance,
    remainAmount: remain,
    paymentStatus: orderData.paymentStatus || 'Pending',
    status: orderData.status || 'Pending',
    id: `ord-${Date.now()}`,
    orderNumber: `JEV-2026-${nextNum}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newOrder, ...current];
  saveOrders(updated);

  // Sync to server database in background
  if (typeof window !== 'undefined') {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(err => console.error('Failed to sync new order to server:', err));
  }

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus): Order[] {
  const current = getStoredOrders();
  const updated = current.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        status,
        ...(paymentStatus ? { paymentStatus } : {})
      };
    }
    return o;
  });
  saveOrders(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(paymentStatus ? { paymentStatus } : {}) }),
    }).catch(err => console.error('Failed to sync order status to server:', err));
  }

  return updated;
}

export function updateOrderPaymentAndDetails(
  orderId: string,
  updates: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    advanceAmount?: number;
    remainAmount?: number;
    notes?: string;
    trackingNumber?: string;
  }
): Order[] {
  const current = getStoredOrders();
  const updated = current.map(o => {
    if (o.id === orderId) {
      const adv = updates.advanceAmount !== undefined ? Number(updates.advanceAmount) : o.advanceAmount;
      const rem = updates.remainAmount !== undefined ? Number(updates.remainAmount) : Math.max(0, o.total - adv);
      
      let payStat = updates.paymentStatus || o.paymentStatus;
      if (!updates.paymentStatus && updates.advanceAmount !== undefined) {
        if (adv >= o.total && o.total > 0) payStat = 'Paid';
        else if (adv > 0) payStat = 'Advance Paid';
        else if (adv === 0) payStat = 'Pending';
      }

      return {
        ...o,
        ...updates,
        advanceAmount: adv,
        remainAmount: rem,
        paymentStatus: payStat
      };
    }
    return o;
  });
  saveOrders(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(err => console.error('Failed to sync payment updates to server:', err));
  }

  return updated;
}

export function deleteOrder(orderId: string): Order[] {
  const current = getStoredOrders();
  const updated = current.filter(o => o.id !== orderId);
  saveOrders(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    }).catch(err => console.error('Failed to sync order deletion to server:', err));
  }

  return updated;
}

export function resetOrdersToDefault(): Order[] {
  saveOrders(INITIAL_ORDERS);
  if (typeof window !== 'undefined') {
    fetch('/api/orders/reset', { method: 'POST' }).catch(err => console.error(err));
  }
  return INITIAL_ORDERS;
}
