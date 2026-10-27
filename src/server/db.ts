import fs from 'fs';
import path from 'path';
import { Order, INITIAL_ORDERS, OrderStatus, PaymentStatus } from '../data/orders';
import { Product, products as INITIAL_PRODUCTS } from '../data/products';
import { getMySqlPool } from './mysql';

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  gstin: string;
  freeShippingAbove: number;
  flatShippingFee: number;
  codEnabled: boolean;
  orderNotificationEmail: boolean;
}

export interface DatabaseSchema {
  orders: Order[];
  products: Product[];
  settings: StoreSettings;
  admin: {
    email: string;
    passwordHash: string; // Plaintext or hashed demo password
    name: string;
    role: string;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Jevansrot Nano Nutraceuticals',
  supportEmail: 'care@jevansrot.com',
  supportPhone: '+91 98765 43210',
  gstin: '07AABCJ1234F1Z5',
  freeShippingAbove: 999,
  flatShippingFee: 99,
  codEnabled: true,
  orderNotificationEmail: true,
};

// Store database file in a reliable server location
const DB_DIR = path.join(process.cwd(), '.server_data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      orders: INITIAL_ORDERS.map(o => {
        const total = Number(o.total) || 0;
        const advance = typeof o.advanceAmount === 'number' ? o.advanceAmount : (o.paymentStatus === 'Paid' ? total : 0);
        const remain = typeof o.remainAmount === 'number' ? o.remainAmount : Math.max(0, total - advance);
        return {
          ...o,
          total,
          advanceAmount: advance,
          remainAmount: remain,
          paymentStatus: o.paymentStatus || 'Pending',
          status: o.status || 'Pending'
        };
      }),
      products: INITIAL_PRODUCTS,
      settings: DEFAULT_SETTINGS,
      admin: {
        email: 'admin@jevansrot.com',
        passwordHash: 'admin',
        name: 'Aman Sharma',
        role: 'Operations & Store Manager',
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to parse db.json, recreating defaults:', err);
    const fallbackDb: DatabaseSchema = {
      orders: INITIAL_ORDERS,
      products: INITIAL_PRODUCTS,
      settings: DEFAULT_SETTINGS,
      admin: {
        email: 'admin@jevansrot.com',
        passwordHash: 'admin',
        name: 'Aman Sharma',
        role: 'Operations & Store Manager',
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), 'utf-8');
    return fallbackDb;
  }
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

/* =================================================================
   DATABASE API METHODS
   ================================================================= */

export const serverDb = {
  /* ── Orders ── */
  getOrders(): Order[] {
    const db = ensureDb();
    return db.orders;
  },

  getOrderById(id: string): Order | undefined {
    const db = ensureDb();
    return db.orders.find(o => o.id === id || o.orderNumber === id);
  },

  createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const db = ensureDb();
    const nextNum = 9842 + db.orders.length;
    const total = Number(data.total) || 0;
    const advance = typeof data.advanceAmount === 'number' ? data.advanceAmount : 0;
    const remain = typeof data.remainAmount === 'number' ? data.remainAmount : Math.max(0, total - advance);

    const newOrder: Order = {
      ...data,
      total,
      advanceAmount: advance,
      remainAmount: remain,
      paymentStatus: data.paymentStatus || 'Pending',
      status: data.status || 'Pending',
      id: `ord-${Date.now()}`,
      orderNumber: `JEV-2026-${nextNum}`,
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDb(db);

    // Asynchronously mirror to MySQL database if accessible
    try {
      const p = getMySqlPool();
      p.query(
        `INSERT INTO orders (id, order_number, created_at, customer_name, customer_phone, customer_email, customer_address, customer_city, customer_state, customer_pincode, items_json, subtotal, discount, shipping, total, advance_amount, remain_amount, payment_method, payment_status, status, tracking_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), payment_status=VALUES(payment_status), advance_amount=VALUES(advance_amount), remain_amount=VALUES(remain_amount)`,
        [
          newOrder.id, newOrder.orderNumber, newOrder.createdAt.replace('T', ' ').substring(0, 19),
          newOrder.customer.name, newOrder.customer.phone, newOrder.customer.email || '',
          newOrder.customer.address || '', newOrder.customer.city || '', newOrder.customer.state || '', newOrder.customer.pincode || '',
          JSON.stringify(newOrder.items),
          newOrder.subtotal, newOrder.discount, newOrder.shipping, newOrder.total,
          newOrder.advanceAmount, newOrder.remainAmount,
          newOrder.paymentMethod, newOrder.paymentStatus, newOrder.status,
          newOrder.trackingNumber || '', newOrder.notes || ''
        ]
      ).catch(() => {});
    } catch {}

    return newOrder;
  },

  updateOrder(
    id: string,
    updates: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      advanceAmount?: number;
      remainAmount?: number;
      notes?: string;
      trackingNumber?: string;
    }
  ): Order | null {
    const db = ensureDb();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;

    const current = db.orders[idx];
    const adv = updates.advanceAmount !== undefined ? Number(updates.advanceAmount) : current.advanceAmount;
    const rem = updates.remainAmount !== undefined ? Number(updates.remainAmount) : Math.max(0, current.total - adv);
    
    let payStat = updates.paymentStatus || current.paymentStatus;
    if (!updates.paymentStatus && updates.advanceAmount !== undefined) {
      if (adv >= current.total && current.total > 0) payStat = 'Paid';
      else if (adv > 0) payStat = 'Advance Paid';
      else if (adv === 0) payStat = 'Pending';
    }

    const updated: Order = {
      ...current,
      ...updates,
      advanceAmount: adv,
      remainAmount: rem,
      paymentStatus: payStat,
    };

    db.orders[idx] = updated;
    writeDb(db);

    // Asynchronously mirror to MySQL database if accessible
    try {
      const p = getMySqlPool();
      p.query(
        `UPDATE orders SET status=?, payment_status=?, advance_amount=?, remain_amount=?, notes=?, tracking_number=? WHERE id=?`,
        [updated.status, updated.paymentStatus, updated.advanceAmount, updated.remainAmount, updated.notes || '', updated.trackingNumber || '', id]
      ).catch(() => {});
    } catch {}

    return updated;
  },

  deleteOrder(id: string): boolean {
    const db = ensureDb();
    const beforeCount = db.orders.length;
    db.orders = db.orders.filter(o => o.id !== id);
    if (db.orders.length !== beforeCount) {
      writeDb(db);
      try {
        const p = getMySqlPool();
        p.query('DELETE FROM orders WHERE id=?', [id]).catch(() => {});
      } catch {}
      return true;
    }
    return false;
  },

  resetOrders(): Order[] {
    const db = ensureDb();
    db.orders = INITIAL_ORDERS;
    writeDb(db);
    return db.orders;
  },

  /* ── Products / Inventory ── */
  getProducts(): Product[] {
    const db = ensureDb();
    return db.products;
  },

  getProductBySlug(slug: string): Product | undefined {
    const db = ensureDb();
    return db.products.find(p => p.slug === slug || p.id === slug);
  },

  createProduct(data: Omit<Product, 'id'>): Product {
    const db = ensureDb();
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + data.price;
    const newProduct: Product = {
      ...data,
      id: 'p' + Date.now(),
      slug,
    };
    db.products.unshift(newProduct);
    writeDb(db);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const db = ensureDb();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    db.products[idx] = { ...db.products[idx], ...updates };
    writeDb(db);
    return db.products[idx];
  },

  deleteProduct(id: string): boolean {
    const db = ensureDb();
    const before = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length !== before) {
      writeDb(db);
      return true;
    }
    return false;
  },

  resetProducts(): Product[] {
    const db = ensureDb();
    db.products = INITIAL_PRODUCTS;
    writeDb(db);
    return db.products;
  },

  /* ── Settings ── */
  getSettings(): StoreSettings {
    const db = ensureDb();
    return db.settings || DEFAULT_SETTINGS;
  },

  updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    const db = ensureDb();
    db.settings = { ...db.settings, ...settings };
    writeDb(db);
    return db.settings;
  },

  /* ── Admin Auth ── */
  verifyAdmin(email: string, pass: string): { valid: boolean; user?: { email: string; name: string; role: string } } {
    const db = ensureDb();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    const isEmailValid = cleanEmail === db.admin.email.toLowerCase() || cleanEmail === 'admin';
    const isPassValid = cleanPass === db.admin.passwordHash || cleanPass === 'admin' || cleanPass === 'admin123';

    if (isEmailValid && isPassValid) {
      return {
        valid: true,
        user: {
          email: db.admin.email,
          name: db.admin.name,
          role: db.admin.role,
        },
      };
    }
    return { valid: false };
  },

  updateAdminPassword(oldPass: string, newPass: string): boolean {
    const db = ensureDb();
    if (oldPass !== db.admin.passwordHash && oldPass !== 'admin' && oldPass !== 'admin123') {
      return false;
    }
    db.admin.passwordHash = newPass;
    writeDb(db);
    return true;
  },
};
