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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'JEV-2026-9841',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    customer: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      address: 'Plot 42, Green Avenue, Sector 15',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001'
    },
    items: [
      {
        id: 'p1',
        name: 'Jevansrot Boost Medicine',
        price: 3499,
        quantity: 1,
        img: '/products/boost-3499.webp'
      },
      {
        id: 'p2',
        name: 'High Power Combo',
        price: 3999,
        quantity: 1,
        img: '/products/highpower-combo-3999.webp'
      }
    ],
    subtotal: 7498,
    discount: 750,
    shipping: 0,
    total: 6748,
    advanceAmount: 2000,
    remainAmount: 4748,
    paymentMethod: 'UPI / QR',
    paymentStatus: 'Advance Paid',
    status: 'Processing',
    trackingNumber: 'DELHIVERY-984102',
    notes: 'Advance of ₹2,000 received via UPI. Remaining ₹4,748 due upon delivery.'
  },
  {
    id: 'ord-102',
    orderNumber: 'JEV-2026-9840',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    customer: {
      name: 'Priya Patel',
      phone: '+91 91234 56789',
      email: 'priya.patel@example.com',
      address: 'Flat 402, Shivalik Residency, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054'
    },
    items: [
      {
        id: 'p3',
        name: 'Insane Power Combo',
        price: 2999,
        quantity: 1,
        img: '/products/Insane-combo-2999.webp'
      }
    ],
    subtotal: 2999,
    discount: 0,
    shipping: 0,
    total: 2999,
    advanceAmount: 2999,
    remainAmount: 0,
    paymentMethod: 'UPI / QR',
    paymentStatus: 'Paid',
    status: 'Shipped',
    trackingNumber: 'BLUEDART-554190',
    notes: 'Full payment cleared online. Dispatched via BlueDart Air.'
  },
  {
    id: 'ord-103',
    orderNumber: 'JEV-2026-9839',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    customer: {
      name: 'Amit Verma',
      phone: '+91 99887 76655',
      email: 'amit.verma@example.com',
      address: '22B, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    items: [
      {
        id: 'p1',
        name: 'Jevansrot Boost Medicine',
        price: 3499,
        quantity: 2,
        img: '/products/boost-3499.webp'
      }
    ],
    subtotal: 6998,
    discount: 700,
    shipping: 0,
    total: 6298,
    advanceAmount: 0,
    remainAmount: 6298,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
    notes: 'Order placed, payment pending. Call before dispatch to confirm advance or COD.'
  },
  {
    id: 'ord-104',
    orderNumber: 'JEV-2026-9838',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    customer: {
      name: 'Vikramjit Singh',
      phone: '+91 98112 23344',
      email: 'vikram.singh@example.com',
      address: 'House 54, Sector 9D',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160009'
    },
    items: [
      {
        id: 'p2',
        name: 'High Power Combo',
        price: 3999,
        quantity: 1,
        img: '/products/highpower-combo-3999.webp'
      }
    ],
    subtotal: 3999,
    discount: 400,
    shipping: 0,
    total: 3599,
    advanceAmount: 3599,
    remainAmount: 0,
    paymentMethod: 'UPI / QR',
    paymentStatus: 'Paid',
    status: 'Delivered',
    trackingNumber: 'DELHIVERY-771239',
    notes: 'Delivered successfully with OTP verification.'
  },
  {
    id: 'ord-105',
    orderNumber: 'JEV-2026-9837',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 1.25 days ago
    customer: {
      name: 'Dr. Sneha Reddy',
      phone: '+91 97001 12233',
      email: 'dr.sneha@example.com',
      address: 'Villa 18, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033'
    },
    items: [
      {
        id: 'p1',
        name: 'Jevansrot Boost Medicine',
        price: 3499,
        quantity: 1,
        img: '/products/boost-3499.webp'
      },
      {
        id: 'p3',
        name: 'Insane Power Combo',
        price: 2999,
        quantity: 1,
        img: '/products/Insane-combo-2999.webp'
      }
    ],
    subtotal: 6498,
    discount: 650,
    shipping: 0,
    total: 5848,
    advanceAmount: 1500,
    remainAmount: 4348,
    paymentMethod: 'UPI / QR',
    paymentStatus: 'Advance Paid',
    status: 'Delivered',
    trackingNumber: 'EKART-901238',
    notes: 'Token advance ₹1,500 collected online. Balance collected on delivery.'
  },
  {
    id: 'ord-106',
    orderNumber: 'JEV-2026-9836',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    customer: {
      name: 'Rajesh Gupta',
      phone: '+91 94123 45678',
      email: 'rajesh.gupta@example.com',
      address: '701, Sea View Apartments, Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400018'
    },
    items: [
      {
        id: 'p2',
        name: 'High Power Combo',
        price: 3999,
        quantity: 1,
        img: '/products/highpower-combo-3999.webp'
      }
    ],
    subtotal: 3999,
    discount: 0,
    shipping: 0,
    total: 3999,
    advanceAmount: 0,
    remainAmount: 3999,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Failed',
    status: 'Cancelled',
    notes: 'Customer cancelled due to incorrect address entry.'
  }
];

const STORAGE_KEY = 'jevansrot_orders_store';

function normalizeOrder(o: any): Order {
  const total = Number(o.total) || 0;
  const advance = typeof o.advanceAmount === 'number'
    ? o.advanceAmount
    : (o.paymentStatus === 'Paid' ? total : 0);
  const remain = typeof o.remainAmount === 'number'
    ? o.remainAmount
    : Math.max(0, total - advance);

  return {
    ...o,
    total,
    advanceAmount: advance,
    remainAmount: remain,
    paymentStatus: o.paymentStatus || 'Pending',
    status: o.status || 'Pending'
  };
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeOrder);
    }
    return INITIAL_ORDERS;
  } catch (err) {
    console.error('Failed to load orders from localStorage:', err);
    return INITIAL_ORDERS;
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
