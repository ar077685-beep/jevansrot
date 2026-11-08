export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider: 'google' | 'email' | 'phone' | 'order' | string;
  createdAt: string;
  lastLogin: string;
  city?: string;
  state?: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrder?: string;
}

const STORAGE_KEY = 'jevansrot_customers_store';
export const CUSTOMERS_EVENT = 'jevansrot_customers_updated';

export function getStoredCustomers(): CustomerRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCustomers(customers: CustomerRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new Event(CUSTOMERS_EVENT));
  } catch (err) {
    console.error('Failed to save customers to storage', err);
  }
}

export async function fetchCustomersFromServer(): Promise<CustomerRecord[]> {
  // 1. InfinityFree PHP MySQL API
  try {
    const phpRes = await fetch('/api.php?action=get_customers', { cache: 'no-store' });
    if (phpRes.ok) {
      const phpData = await phpRes.json();
      if (phpData.success && Array.isArray(phpData.customers)) {
        const local = getStoredCustomers();
        const mergedMap = new Map<string, CustomerRecord>();
        [...local, ...phpData.customers].forEach(c => {
          if (!c || !c.email) return;
          const key = c.email.toLowerCase().trim();
          const prev = mergedMap.get(key);
          mergedMap.set(key, { ...prev, ...c });
        });
        const merged = Array.from(mergedMap.values());
        saveStoredCustomers(merged);
        return merged;
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Next.js API route
  try {
    const res = await fetch('/api/customers', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        const local = getStoredCustomers();
        const mergedMap = new Map<string, CustomerRecord>();
        [...local, ...data.customers].forEach(c => {
          if (!c || !c.email) return;
          const key = c.email.toLowerCase().trim();
          const prev = mergedMap.get(key);
          mergedMap.set(key, { ...prev, ...c });
        });
        const merged = Array.from(mergedMap.values());
        saveStoredCustomers(merged);
        return merged;
      }
    }
  } catch {
    // Fallback to storage
  }

  return getStoredCustomers();
}

export async function syncCustomerProfile(customer: Partial<CustomerRecord> & { email: string; name: string }): Promise<void> {
  if (!customer.email) return;
  const now = new Date().toISOString();
  const cleanEmail = customer.email.toLowerCase().trim();

  const rec: CustomerRecord = {
    id: customer.id || 'usr_' + Math.random().toString(36).substring(2, 9),
    name: customer.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: customer.phone || '',
    avatar: customer.avatar || '',
    provider: customer.provider || 'google',
    createdAt: customer.createdAt || now,
    lastLogin: now,
  };

  // Immediate local update
  const local = getStoredCustomers();
  const map = new Map<string, CustomerRecord>();
  local.forEach(c => map.set(c.email.toLowerCase().trim(), c));
  const existing = map.get(cleanEmail);
  map.set(cleanEmail, {
    ...existing,
    ...rec,
    createdAt: existing?.createdAt || rec.createdAt,
    lastLogin: now,
  });
  saveStoredCustomers(Array.from(map.values()));

  // Sync to backends in background
  if (typeof window !== 'undefined') {
    // 1. Live PHP Backend (MySQL on InfinityFree)
    fetch('/api.php?action=sync_customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec),
    }).catch(err => console.warn('Customer PHP sync warning:', err));

    // 2. Local Next.js dev API
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec),
    }).catch(err => console.warn('Customer dev API sync warning:', err));
  }
}

