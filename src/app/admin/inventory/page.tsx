'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Product, getInventoryProducts, fetchProductsFromServer, addInventoryProduct,
  updateInventoryProduct, deleteInventoryProduct, resetInventoryToDefault, EMPTY_PRODUCT
} from '../../../data/inventory';

const BADGE_OPTIONS = [
  { value: 'b-pop', label: '⭐ Popular' },
  { value: 'b-off', label: '🏷️ Sale / Off' },
  { value: 'b-new', label: '✨ New' },
  { value: 'b-hot', label: '🔥 Hot' },
];

type FormProduct = Omit<Product, 'id'> & { ingredients_text: string; benefits_text: string };

function toForm(p: Omit<Product, 'id'>): FormProduct {
  return {
    ...p,
    ingredients_text: (p.ingredients ?? []).join(', '),
    benefits_text: (p.benefits ?? []).join(', '),
  };
}

function fromForm(f: FormProduct): Omit<Product, 'id'> {
  return {
    ...f,
    ingredients: f.ingredients_text.split(',').map(s => s.trim()).filter(Boolean),
    benefits: f.benefits_text.split(',').map(s => s.trim()).filter(Boolean),
  };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormProduct>(toForm(EMPTY_PRODUCT));
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(getInventoryProducts());
    fetchProductsFromServer().then(srv => { if (srv && srv.length) setProducts(srv); });
    const h = () => setProducts(getInventoryProducts());
    window.addEventListener('jevansrot_inventory_updated', h);
    return () => window.removeEventListener('jevansrot_inventory_updated', h);
  }, []);

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const openAdd = () => {
    setEditProduct(null);
    setForm(toForm(EMPTY_PRODUCT));
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm(toForm(p));
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditProduct(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = fromForm(form);
    if (editProduct) {
      setProducts(updateInventoryProduct(editProduct.id, data));
      notify(`"${form.name}" updated successfully`);
    } else {
      addInventoryProduct(data);
      setProducts(getInventoryProducts());
      notify(`"${form.name}" added to inventory`);
    }
    closeDrawer();
  };

  const handleDelete = (p: Product) => {
    setProducts(deleteInventoryProduct(p.id));
    setDeleteConfirm(null);
    notify(`"${p.name}" removed from inventory`);
  };

  const filtered = products.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const f = form;
  const set = (key: keyof FormProduct, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <>
      {toast && <div className="adm-toast"><div className="adm-toast-icon">✓</div><span>{toast}</span></div>}

      {/* Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Product Catalogue</div>
          <h1 className="adm-page-title">Inventory Management</h1>
          <p className="adm-page-desc">{products.length} products in catalogue — add, edit or remove listings</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => { setProducts(resetInventoryToDefault()); notify('Reset to default products'); }}>
            ↺ Reset
          </button>
          <button className="adm-btn adm-btn-primary" onClick={openAdd} id="inv-add-product-btn">
            + Add New Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="adm-input-wrap" style={{ maxWidth: 360 }}>
          <span className="adm-input-icon">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" className="adm-input with-icon" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="inv-product-grid">
        {filtered.length === 0 ? (
          <div className="adm-section-card" style={{ gridColumn: '1/-1' }}>
            <div className="adm-empty-state">
              <div className="adm-empty-icon">📦</div>
              <div className="adm-empty-title">No products found</div>
              <div className="adm-empty-desc">Add your first product or adjust the search</div>
              <button className="adm-btn adm-btn-primary" onClick={openAdd} style={{ marginTop: 16 }}>+ Add Product</button>
            </div>
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="inv-product-card" id={`inv-card-${p.id}`}>
            <div className="inv-card-img-wrap">
              <Image src={p.img} alt={p.name} width={200} height={200} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="inv-card-badge">{p.badgeLabel}</span>
            </div>
            <div className="inv-card-body">
              <div className="inv-card-name">{p.name}</div>
              <div className="inv-card-vendor">{p.vendor}</div>
              <div className="inv-card-desc">{p.description.substring(0, 80)}…</div>
              <div className="inv-card-price-row">
                <span className="inv-card-price">₹{p.price.toLocaleString()}</span>
                <span className="inv-card-compare">₹{p.compare.toLocaleString()}</span>
                <span className="inv-card-off">{p.off}</span>
              </div>
              <div className="inv-card-meta">
                <span>⭐ {p.rating} ({p.reviews} reviews)</span>
                {p.isNew && <span className="inv-new-tag">NEW</span>}
              </div>
            </div>
            <div className="inv-card-actions">
              <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => setViewProduct(p)}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={() => openEdit(p)} id={`inv-edit-${p.id}`}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
              <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setDeleteConfirm(p)}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="inv-drawer-overlay" onClick={closeDrawer}>
          <div className="inv-drawer" onClick={e => e.stopPropagation()}>
            <div className="inv-drawer-header">
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text)' }}>
                  {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {editProduct ? `Editing: ${editProduct.name}` : 'Fill in the details to add a new product to the catalogue'}
                </div>
              </div>
              <button className="adm-modal-close" onClick={closeDrawer}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="inv-drawer-body">
              {/* Basic Info */}
              <div className="inv-form-section">
                <div className="inv-form-section-title">Basic Information</div>
                <div className="inv-form-grid">
                  <div className="inv-form-field" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Product Name *</label>
                    <input className="adm-input" required value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jevansrot Boost Medicine" />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Vendor / Brand *</label>
                    <input className="adm-input" required value={f.vendor} onChange={e => set('vendor', e.target.value)} placeholder="e.g. Jevansrot" />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">URL Slug</label>
                    <input className="adm-input" value={f.slug} onChange={e => set('slug', e.target.value)} placeholder="boost-3499 (auto-generated if blank)" />
                  </div>
                  <div className="inv-form-field" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Description *</label>
                    <textarea className="adm-input" rows={3} required value={f.description} onChange={e => set('description', e.target.value)} placeholder="Describe your product…" style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="inv-form-section">
                <div className="inv-form-section-title">Pricing & Discount</div>
                <div className="inv-form-grid">
                  <div className="inv-form-field">
                    <label className="adm-form-label">Sale Price (₹) *</label>
                    <input className="adm-input" type="number" min={0} required value={f.price || ''} onChange={e => set('price', Number(e.target.value))} placeholder="3499" />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Original / Compare Price (₹) *</label>
                    <input className="adm-input" type="number" min={0} required value={f.compare || ''} onChange={e => set('compare', Number(e.target.value))} placeholder="4999" />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Discount Label</label>
                    <input className="adm-input" value={f.off} onChange={e => set('off', e.target.value)} placeholder="30% OFF" />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Badge Type</label>
                    <select className="adm-select" style={{ width: '100%' }} value={f.badge} onChange={e => set('badge', e.target.value)}>
                      {BADGE_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Badge Label</label>
                    <input className="adm-input" value={f.badgeLabel} onChange={e => set('badgeLabel', e.target.value)} placeholder="Popular" />
                  </div>
                  <div className="inv-form-field" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
                    <input type="checkbox" id="isNew" checked={f.isNew} onChange={e => set('isNew', e.target.checked)} style={{ accentColor: 'var(--g700)', width: 16, height: 16 }} />
                    <label htmlFor="isNew" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Mark as New Arrival</label>
                  </div>
                </div>
              </div>

              {/* Image & Ratings */}
              <div className="inv-form-section">
                <div className="inv-form-section-title">Media & Ratings</div>
                <div className="inv-form-grid">
                  <div className="inv-form-field" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Product Image Path *</label>
                    <input className="adm-input" required value={f.img} onChange={e => set('img', e.target.value)} placeholder="/products/boost-3499.webp" />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Use /products/filename.webp — upload image to jevansrot-app/public/products/</div>
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Rating (0–5)</label>
                    <input className="adm-input" type="number" step={0.1} min={0} max={5} value={f.rating} onChange={e => set('rating', parseFloat(e.target.value))} />
                  </div>
                  <div className="inv-form-field">
                    <label className="adm-form-label">Number of Reviews</label>
                    <input className="adm-input" type="number" min={0} value={f.reviews} onChange={e => set('reviews', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Ingredients & Benefits */}
              <div className="inv-form-section">
                <div className="inv-form-section-title">Ingredients & Benefits</div>
                <div className="inv-form-grid">
                  <div className="inv-form-field" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Key Ingredients (comma-separated)</label>
                    <input className="adm-input" value={f.ingredients_text} onChange={e => set('ingredients_text', e.target.value)} placeholder="Ashwagandha, Ginseng, Vitamin B Complex" />
                  </div>
                  <div className="inv-form-field" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Key Benefits (comma-separated)</label>
                    <input className="adm-input" value={f.benefits_text} onChange={e => set('benefits_text', e.target.value)} placeholder="Boosts Energy, Improves Focus, Reduces Fatigue" />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {f.img && (
                <div className="inv-form-section">
                  <div className="inv-form-section-title">Image Preview</div>
                  <div style={{ width: 120, height: 120, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface2)' }}>
                    <img src={f.img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = '/jevansrot-logo.svg'; }} />
                  </div>
                </div>
              )}

              <div className="inv-drawer-footer">
                <button type="button" className="adm-btn adm-btn-ghost" onClick={closeDrawer}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" id="inv-save-btn">
                  {editProduct ? '💾 Save Changes' : '✅ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">⚠️ Delete Product</div>
              <button className="adm-modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Are you sure you want to remove <strong>&quot;{deleteConfirm.name}&quot;</strong> from the inventory? This action cannot be undone.
              </p>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      {viewProduct && (
        <div className="adm-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">{viewProduct.name}</div>
              <button className="adm-modal-close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <Image src={viewProduct.img} alt={viewProduct.name} width={140} height={140} style={{ borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{viewProduct.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>by {viewProduct.vendor}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--g700)' }}>₹{viewProduct.price.toLocaleString()}</span>
                    <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>₹{viewProduct.compare.toLocaleString()}</span>
                    <span style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{viewProduct.off}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>⭐ {viewProduct.rating} · {viewProduct.reviews} reviews</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{viewProduct.description}</div>
              {viewProduct.ingredients && viewProduct.ingredients.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Ingredients</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {viewProduct.ingredients.map(i => <span key={i} style={{ background: 'var(--g50)', color: 'var(--g700)', border: '1px solid var(--g100)', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500 }}>{i}</span>)}
                  </div>
                </div>
              )}
              {viewProduct.benefits && viewProduct.benefits.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Benefits</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {viewProduct.benefits.map(b => <span key={b} style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500 }}>{b}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => { setViewProduct(null); openEdit(viewProduct); }}>✏️ Edit Product</button>
              <button className="adm-btn adm-btn-primary" onClick={() => setViewProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
