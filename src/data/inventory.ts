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
    return Array.isArray(parsed) ? parsed : SEED_PRODUCTS;
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
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
        window.dispatchEvent(new Event('jevansrot_inventory_updated'));
      }
      return data.products;
    }
    return getInventoryProducts();
  } catch {
    return getInventoryProducts();
  }
}

export function addInventoryProduct(product: Omit<Product, 'id'>): Product {
  const all = getInventoryProducts();
  const newProduct: Product = {
    ...product,
    id: 'p' + Date.now(),
    slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + product.price,
  };
  saveInventoryProducts([newProduct, ...all]);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(err => console.error('Failed to sync product to server:', err));
  }

  return newProduct;
}

export function updateInventoryProduct(id: string, updates: Partial<Product>): Product[] {
  const all = getInventoryProducts();
  const updated = all.map(p => p.id === id ? { ...p, ...updates } : p);
  saveInventoryProducts(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(err => console.error('Failed to sync product update to server:', err));
  }

  return updated;
}

export function deleteInventoryProduct(id: string): Product[] {
  const all = getInventoryProducts();
  const updated = all.filter(p => p.id !== id);
  saveInventoryProducts(updated);

  // Sync to server
  if (typeof window !== 'undefined') {
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('Failed to sync product deletion to server:', err));
  }

  return updated;
}

export function resetInventoryToDefault(): Product[] {
  saveInventoryProducts(SEED_PRODUCTS);
  if (typeof window !== 'undefined') {
    fetch('/api/products/reset', { method: 'POST' }).catch(err => console.error(err));
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
  rating: 4.5,
  reviews: 0,
  isNew: false,
  description: '',
  ingredients: [],
  benefits: [],
};
