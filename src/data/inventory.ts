import { Product, products as SEED_PRODUCTS } from './products';
export type { Product };

const STORAGE_KEY = 'jevansrot_inventory_store';

export function getInventoryProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_PRODUCTS;
  } catch {
    return SEED_PRODUCTS;
  }
}

export function saveInventoryProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('jevansrot_inventory_updated'));
}

export async function fetchProductsFromServer(): Promise<Product[]> {
  // 1. Try PHP MySQL endpoint first (Live InfinityFree server)
  try {
    const phpRes = await fetch('/api.php?action=get_products', { cache: 'no-store' });
    if (phpRes.ok) {
      const phpData = await phpRes.json();
      if (phpData.success && Array.isArray(phpData.products) && phpData.products.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(phpData.products));
          window.dispatchEvent(new Event('jevansrot_inventory_updated'));
        }
        return phpData.products;
      }
    }
  } catch {
    // ignore and fallback to Next.js API route
  }

  // 2. Fallback to Next.js API route (Local Dev server)
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
          window.dispatchEvent(new Event('jevansrot_inventory_updated'));
        }
        return data.products;
      }
    }
  } catch {
    // fallback
  }

  return getInventoryProducts();
}

export function addInventoryProduct(product: Omit<Product, 'id'>): Product {
  const all = getInventoryProducts();
  const newProduct: Product = {
    ...product,
    id: 'p' + Date.now(),
    slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + product.price,
  };
  const updated = [newProduct, ...all];
  saveInventoryProducts(updated);

  // Sync to MySQL via api.php & local dev API
  if (typeof window !== 'undefined') {
    fetch('/api.php?action=save_product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(() => {});

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(() => {});
  }

  return newProduct;
}

export function updateInventoryProduct(id: string, updates: Partial<Product>): Product[] {
  const all = getInventoryProducts();
  let updatedProduct: Product | undefined;
  const updated = all.map(p => {
    if (p.id === id) {
      updatedProduct = { ...p, ...updates };
      return updatedProduct;
    }
    return p;
  });
  saveInventoryProducts(updated);

  // Sync to MySQL via api.php & local dev API
  if (typeof window !== 'undefined' && updatedProduct) {
    fetch('/api.php?action=save_product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    }).catch(err => console.error('Failed to sync product to PHP API:', err));

    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }

  return updated;
}

export function deleteInventoryProduct(id: string): Product[] {
  const all = getInventoryProducts();
  const updated = all.filter(p => p.id !== id);
  saveInventoryProducts(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api.php?action=delete_product&id=${encodeURIComponent(id)}`).catch(() => {});
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return updated;
}

export function resetInventoryToDefault(): Product[] {
  saveInventoryProducts(SEED_PRODUCTS);
  if (typeof window !== 'undefined') {
    fetch('/api.php?action=reset_products').catch(() => {});
    fetch('/api/products/reset', { method: 'POST' }).catch(() => {});
  }
  return SEED_PRODUCTS;
}

export const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  slug: '',
  name: '',
  vendor: 'Jevansrot',
  img: '/products/',
  price: 0,
  compare: 0,
  off: '',
  badge: 'b-pop',
  badgeLabel: 'Popular',
  rating: 4.8,
  reviews: 0,
  isNew: false,
  description: '',
  ingredients: [],
  benefits: [],
};
