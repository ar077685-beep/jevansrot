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
  img: '',
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

/**
 * Optimizes an image client-side to WebP/JPEG using Canvas.
 * Keeps aspect ratio, max width/height 1200px, quality 85%.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Failed to read image source'));
        return;
      }

      // If SVG, no need to rasterize/compress
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        resolve({ blob: file, dataUrl: src });
        return;
      }

      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width || 800;
        let height = img.height || 800;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, dataUrl: src });
          return;
        }

        // Smooth resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mime = 'image/webp';
        canvas.toBlob(
          (blob) => {
            const dataUrl = canvas.toDataURL(mime, quality);
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              resolve({ blob: file, dataUrl });
            }
          },
          mime,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = src;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a product image from the admin inventory modal.
 * 1. Optimizes client-side to lightweight WebP.
 * 2. Uploads to InfinityFree PHP API (/api.php?action=upload_image).
 * 3. Fallbacks to dev server API (/api/upload).
 * 4. Fallbacks to optimized Base64 data URL if server is unreachable.
 */
export async function uploadProductImage(
  file: File
): Promise<{ success: boolean; url: string; filename?: string; message?: string }> {
  let optimizedBlob: Blob = file;
  let dataUrl = '';

  try {
    const opt = await optimizeImageFile(file);
    optimizedBlob = opt.blob;
    dataUrl = opt.dataUrl;
  } catch (err) {
    console.warn('Image optimization warning, continuing with raw file:', err);
  }

  // Ensure dataUrl is always available for instant preview and fallback
  if (!dataUrl) {
    try {
      dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => resolve('');
        r.readAsDataURL(file);
      });
    } catch {}
  }

  const origExt = file.name.substring(file.name.lastIndexOf('.')) || '.webp';
  const cleanBase = file.name
    .substring(0, file.name.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9_-]/g, '') || 'prod';
  const fileName = `${cleanBase}_${Date.now()}${origExt === '.svg' ? '.svg' : '.webp'}`;

  const formData = new FormData();
  formData.append('image', optimizedBlob, fileName);
  formData.append('name', fileName);

  // 1. Try PHP API (InfinityFree / Live Hosting)
  try {
    const phpRes = await fetch('/api.php?action=upload_image', {
      method: 'POST',
      body: formData,
    });
    if (phpRes.ok) {
      const data = await phpRes.json();
      if (data && data.success && data.url) {
        return {
          success: true,
          url: data.url,
          filename: data.filename || fileName,
          message: data.message || 'Image uploaded successfully to server',
        };
      }
    }
  } catch (err) {
    console.warn('PHP upload unreachable, trying Next.js API route...', err);
  }

  // 1b. Try JSON Base64 to PHP API if FormData was blocked by server headers
  if (dataUrl) {
    try {
      const phpB64Res = await fetch('/api.php?action=upload_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, name: fileName }),
      });
      if (phpB64Res.ok) {
        const data = await phpB64Res.json();
        if (data && data.success && data.url) {
          return {
            success: true,
            url: data.url,
            filename: data.filename || fileName,
            message: 'Image uploaded successfully to server',
          };
        }
      }
    } catch {}
  }

  // 2. Try Next.js local dev API (/api/upload)
  try {
    const devRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (devRes.ok) {
      const data = await devRes.json();
      if (data && data.success && data.url) {
        return {
          success: true,
          url: data.url,
          filename: data.filename || fileName,
          message: 'Image uploaded successfully',
        };
      }
    }
  } catch (err) {
    console.warn('Dev upload route unreachable:', err);
  }

  // 3. Fallback: Optimized Data URL
  // If backend upload is unavailable, the optimized base64 allows instant rendering and saving
  if (dataUrl) {
    return {
      success: true,
      url: dataUrl,
      filename: fileName,
      message: 'Image processed and saved locally',
    };
  }

  return {
    success: false,
    url: '',
    message: 'Could not upload image. Please try another file or enter an image path.',
  };
}
