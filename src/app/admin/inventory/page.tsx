'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Product, getInventoryProducts, fetchProductsFromServer, addInventoryProduct,
  updateInventoryProduct, deleteInventoryProduct, resetInventoryToDefault, EMPTY_PRODUCT
} from '../../../data/inventory';
import '../admin.css';

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

type SortField = 'name' | 'price' | 'rating' | 'reviews';
type SortDir = 'asc' | 'desc';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormProduct>(toForm(EMPTY_PRODUCT));

  // View Modal state
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Delete Confirm Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setProducts(getInventoryProducts());
    fetchProductsFromServer().then(srv => { if (srv && srv.length) setProducts(srv); });
    const h = () => setProducts(getInventoryProducts());
    window.addEventListener('jevansrot_inventory_updated', h);
    return () => window.removeEventListener('jevansrot_inventory_updated', h);
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Open Add Product Modal
  const openAddModal = () => {
    setEditProduct(null);
    setForm(toForm(EMPTY_PRODUCT));
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setForm(toForm(p));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = fromForm(form);
    if (editProduct) {
      const updatedList = updateInventoryProduct(editProduct.id, data);
      setProducts(updatedList);
      notify(`"${form.name}" updated successfully!`);
    } else {
      addInventoryProduct(data);
      setProducts(getInventoryProducts());
      notify(`"${form.name}" added to inventory catalogue!`);
    }
    closeModal();
  };

  const handleDelete = (p: Product) => {
    const updated = deleteInventoryProduct(p.id);
    setProducts(updated);
    setDeleteConfirm(null);
    notify(`"${p.name}" removed from inventory.`);
  };

  // Toggle sort direction or field
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter & Sort calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.vendor.toLowerCase().includes(search.toLowerCase()) ||
          (p.slug && p.slug.toLowerCase().includes(search.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

        const matchesBadge = badgeFilter === 'all' || p.badge === badgeFilter;
        return matchesSearch && matchesBadge;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') diff = a.name.localeCompare(b.name);
        else if (sortField === 'price') diff = a.price - b.price;
        else if (sortField === 'rating') diff = a.rating - b.rating;
        else if (sortField === 'reviews') diff = a.reviews - b.reviews;
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [products, search, badgeFilter, sortField, sortDir]);

  // Inventory KPI metrics
  const totalValue = useMemo(() => products.reduce((acc, p) => acc + (p.price || 0), 0), [products]);
  const avgPrice = useMemo(() => (products.length ? Math.round(totalValue / products.length) : 0), [products, totalValue]);
  const avgRating = useMemo(() => {
    if (!products.length) return '0.0';
    const sum = products.reduce((acc, p) => acc + (p.rating || 0), 0);
    return (sum / products.length).toFixed(1);
  }, [products]);

  const f = form;
  const set = (key: keyof FormProduct, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <>
      {toast && (
        <div className="adm-toast">
          <div className="adm-toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Product Catalogue</div>
          <h1 className="adm-page-title">Inventory Management</h1>
          <p className="adm-page-desc">
            Organize products, update real-time stock pricing, adjust promotional discounts, and manage listings in table format.
          </p>
        </div>
        <div className="adm-page-actions">
          <button
            className="adm-btn adm-btn-secondary"
            onClick={() => {
              const reset = resetInventoryToDefault();
              setProducts(reset);
              notify('Reset inventory to default catalogue');
            }}
          >
            ↺ Reset Catalogue
          </button>
          <button className="adm-btn adm-btn-primary" onClick={openAddModal} id="inv-add-product-btn">
            + Add New Product
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#0284c7', '--kpi-bg': '#e0f2fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Products</div>
            <div className="adm-kpi-icon">📦</div>
          </div>
          <div className="adm-kpi-val">{products.length}</div>
          <div className="adm-kpi-footer">
            <span>{filteredProducts.length} matching current filter</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Catalogue Value</div>
            <div className="adm-kpi-icon">₹</div>
          </div>
          <div className="adm-kpi-val">₹{totalValue.toLocaleString()}</div>
          <div className="adm-kpi-footer">
            <span>Combined retail sale value</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Average Price</div>
            <div className="adm-kpi-icon">🏷️</div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#7c3aed' }}>₹{avgPrice.toLocaleString()}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Standard single unit average</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#f59e0b', '--kpi-bg': '#fef3c7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Average Rating</div>
            <div className="adm-kpi-icon">⭐</div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#d97706' }}>{avgRating} <span style={{ fontSize: 16, color: '#94a3b8' }}>/ 5.0</span></div>
          <div className="adm-kpi-footer">
            <span>Customer satisfaction score</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="adm-section-card" style={{ boxShadow: 'var(--shadow-md)', borderRadius: 14 }}>
        
        {/* Toolbar & Filters */}
        <div className="adm-toolbar" style={{ padding: '16px 20px', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
          {/* Badge Filter Tabs */}
          <div className="adm-status-tabs">
            <button
              className={`adm-tab-btn${badgeFilter === 'all' ? ' active' : ''}`}
              onClick={() => setBadgeFilter('all')}
            >
              All Items <span className="adm-tab-count">{products.length}</span>
            </button>
            {BADGE_OPTIONS.map(b => {
              const count = products.filter(p => p.badge === b.value).length;
              return (
                <button
                  key={b.value}
                  className={`adm-tab-btn${badgeFilter === b.value ? ' active' : ''}`}
                  onClick={() => setBadgeFilter(b.value)}
                >
                  {b.label} <span className="adm-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="adm-toolbar-right" style={{ gap: 10 }}>
            {/* Search Input */}
            <div className="adm-input-wrap" style={{ minWidth: 260 }}>
              <span className="adm-input-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                className="adm-input with-icon"
                placeholder="Search products by title, vendor, slug…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="inventory-search"
                style={{ paddingRight: search ? 30 : 12 }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              className="adm-select"
              value={`${sortField}-${sortDir}`}
              onChange={e => {
                const [fld, dir] = e.target.value.split('-') as [SortField, SortDir];
                setSortField(fld);
                setSortDir(dir);
              }}
              style={{ fontWeight: 600 }}
              title="Sort products list"
            >
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="name-asc">Product Name (A-Z)</option>
              <option value="name-desc">Product Name (Z-A)</option>
              <option value="rating-desc">Highest Rated (⭐)</option>
              <option value="reviews-desc">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Row */}
        {(search || badgeFilter !== 'all') && (
          <div className="adm-filter-bar">
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Showing <strong>{filteredProducts.length}</strong> of {products.length} products
              {search && <> matching &quot;<strong>{search}</strong>&quot;</>}
              {badgeFilter !== 'all' && <> in <strong>{BADGE_OPTIONS.find(b => b.value === badgeFilter)?.label}</strong></>}
            </div>
            <button
              onClick={() => { setSearch(''); setBadgeFilter('all'); }}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ padding: '3px 8px', fontSize: 11.5 }}
            >
              ✕ Clear Filters
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Thumb</th>
                <th
                  className="sortable"
                  onClick={() => toggleSort('name')}
                  title="Sort by Name"
                  style={{ width: '32%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Product Details
                    <span className={`adm-sort-icon${sortField === 'name' ? ' active' : ''}`}>
                      {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>
                <th
                  className="sortable"
                  onClick={() => toggleSort('price')}
                  title="Sort by Price"
                  style={{ width: '18%', textAlign: 'right' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Sale Price &amp; MRP
                    <span className={`adm-sort-icon${sortField === 'price' ? ' active' : ''}`}>
                      {sortField === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>
                <th style={{ width: '15%' }}>Badge &amp; Category</th>
                <th
                  className="sortable"
                  onClick={() => toggleSort('rating')}
                  title="Sort by Rating"
                  style={{ width: '14%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Rating
                    <span className={`adm-sort-icon${sortField === 'rating' ? ' active' : ''}`}>
                      {sortField === 'rating' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>
                <th style={{ width: '11%' }}>Stock Status</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div className="adm-empty-state">
                      <div className="adm-empty-icon">📦</div>
                      <div className="adm-empty-title">No products match your criteria</div>
                      <div className="adm-empty-desc">Try clearing your search query or reset the badge filter.</div>
                      <button
                        className="adm-btn adm-btn-primary"
                        onClick={openAddModal}
                        style={{ marginTop: 14 }}
                      >
                        + Add New Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} id={`inv-row-${p.id}`}>
                    {/* Thumbnail */}
                    <td>
                      <div style={{ position: 'relative', width: 48, height: 48 }}>
                        <Image
                          src={p.img}
                          alt={p.name}
                          width={48}
                          height={48}
                          className="inv-table-thumb"
                          onError={e => { (e.target as HTMLImageElement).src = '/jevansrot-logo.svg'; }}
                        />
                      </div>
                    </td>

                    {/* Product Name, Vendor & Slug */}
                    <td>
                      <div className="inv-prod-info">
                        <div className="inv-prod-title">{p.name}</div>
                        <div className="inv-prod-meta">
                          <span>by <strong>{p.vendor}</strong></span>
                          <span>•</span>
                          <span className="inv-slug-pill">{p.slug || p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="inv-price-main">₹{p.price.toLocaleString()}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 2 }}>
                        {p.compare > p.price && (
                          <span className="inv-price-strike">₹{p.compare.toLocaleString()}</span>
                        )}
                        {p.off && (
                          <span style={{ fontSize: 10.5, background: 'var(--green-bg)', color: 'var(--green)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                            {p.off}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Badge */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                        <span className={`inv-badge-chip ${p.badge}`}>
                          {p.badgeLabel || 'Featured'}
                        </span>
                        {p.isNew && (
                          <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rating & Reviews */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                        <span style={{ color: '#f59e0b' }}>★</span>
                        <span>{p.rating}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.reviews} verified reviews
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td>
                      <span className="inv-stock-tag">
                        <span className="dot"></span>
                        In Stock
                      </span>
                    </td>

                    {/* Actions: Edit (opens modal), View, Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="adm-cell-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          onClick={() => setViewProduct(p)}
                          title="Quick preview product"
                          style={{ padding: '6px 9px' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button
                          className="adm-btn adm-btn-primary adm-btn-sm"
                          onClick={() => openEditModal(p)}
                          id={`inv-edit-${p.id}`}
                          title="Edit this product"
                          style={{ padding: '6px 11px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          onClick={() => setDeleteConfirm(p)}
                          title="Delete product"
                          style={{ padding: '6px 9px' }}
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          EDIT / ADD PRODUCT MODAL (Centered Modal)
          ======================================================== */}
      {isModalOpen && (
        <div className="adm-modal-overlay" onClick={closeModal}>
          <div
            className="adm-modal"
            style={{ maxWidth: 720 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="adm-modal-header">
              <div>
                <div className="adm-modal-title">
                  {editProduct ? `✏️ Edit Product: ${editProduct.name}` : '➕ Add New Product'}
                </div>
                <div className="adm-modal-sub">
                  {editProduct
                    ? 'Modify details, pricing, image paths, and health benefits below.'
                    : 'Fill in the information to list a new health supplement in the catalogue.'}
                </div>
              </div>
              <button className="adm-modal-close" onClick={closeModal} title="Close modal">✕</button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit}>
              <div className="adm-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                
                {/* Section 1: Basic Details */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">1. Basic Information</div>
                  <div className="inv-modal-grid-2">
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="adm-form-label">Product Name *</label>
                      <input
                        className="adm-input"
                        required
                        value={f.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Jevansrot High Power Combo"
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">Vendor / Brand *</label>
                      <input
                        className="adm-input"
                        required
                        value={f.vendor}
                        onChange={e => set('vendor', e.target.value)}
                        placeholder="Jevansrot"
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">URL Slug</label>
                      <input
                        className="adm-input"
                        value={f.slug}
                        onChange={e => set('slug', e.target.value)}
                        placeholder="highpower-combo-3999"
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="adm-form-label">Description *</label>
                      <textarea
                        className="adm-input"
                        rows={3}
                        required
                        value={f.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Detailed description of supplement dosage, action, and key advantages…"
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Badges */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">2. Pricing &amp; Badges</div>
                  <div className="inv-modal-grid-2">
                    <div>
                      <label className="adm-form-label">Selling Price (₹) *</label>
                      <input
                        className="adm-input"
                        type="number"
                        min={0}
                        required
                        value={f.price || ''}
                        onChange={e => set('price', Number(e.target.value))}
                        placeholder="3499"
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">Original MRP / Compare (₹) *</label>
                      <input
                        className="adm-input"
                        type="number"
                        min={0}
                        required
                        value={f.compare || ''}
                        onChange={e => set('compare', Number(e.target.value))}
                        placeholder="4999"
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">Discount Label</label>
                      <input
                        className="adm-input"
                        value={f.off}
                        onChange={e => set('off', e.target.value)}
                        placeholder="e.g. 30% OFF"
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">Badge Style</label>
                      <select
                        className="adm-select"
                        style={{ width: '100%' }}
                        value={f.badge}
                        onChange={e => set('badge', e.target.value)}
                      >
                        {BADGE_OPTIONS.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="adm-form-label">Badge Label Text</label>
                      <input
                        className="adm-input"
                        value={f.badgeLabel}
                        onChange={e => set('badgeLabel', e.target.value)}
                        placeholder="Popular / Best Seller"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 26 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={f.isNew}
                          onChange={e => set('isNew', e.target.checked)}
                          style={{ accentColor: 'var(--g700)', width: 17, height: 17 }}
                        />
                        <span>Mark as New Arrival</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Media & Live Preview */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">3. Media &amp; Image Preview</div>
                  <div className="inv-modal-grid-2" style={{ alignItems: 'center' }}>
                    <div>
                      <label className="adm-form-label">Image Path / URL *</label>
                      <input
                        className="adm-input"
                        required
                        value={f.img}
                        onChange={e => set('img', e.target.value)}
                        placeholder="/products/boost-3499.webp"
                      />
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Recommended format: <code>/products/name.webp</code>
                      </div>
                    </div>
                    <div>
                      <label className="adm-form-label">Live Preview</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface2)', flexShrink: 0 }}>
                          <img
                            src={f.img || '/jevansrot-logo.svg'}
                            alt="preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).src = '/jevansrot-logo.svg'; }}
                          />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {f.img ? 'Image preview rendered above' : 'Enter image path to preview'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Ratings & Ingredients */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">4. Ratings &amp; Ingredients</div>
                  <div className="inv-modal-grid-2">
                    <div>
                      <label className="adm-form-label">Rating (0.0 to 5.0)</label>
                      <input
                        className="adm-input"
                        type="number"
                        step={0.1}
                        min={0}
                        max={5}
                        value={f.rating}
                        onChange={e => set('rating', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="adm-form-label">Total Verified Reviews</label>
                      <input
                        className="adm-input"
                        type="number"
                        min={0}
                        value={f.reviews}
                        onChange={e => set('reviews', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="adm-form-label">Key Ingredients (comma separated)</label>
                      <input
                        className="adm-input"
                        value={f.ingredients_text}
                        onChange={e => set('ingredients_text', e.target.value)}
                        placeholder="Ashwagandha, Shilajit, Safed Musli, Kaunch Beej"
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="adm-form-label">Key Health Benefits (comma separated)</label>
                      <input
                        className="adm-input"
                        value={f.benefits_text}
                        onChange={e => set('benefits_text', e.target.value)}
                        placeholder="Stamina Boost, Hormonal Balance, Pure Natural Wellness"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  id="inv-modal-save-btn"
                >
                  {editProduct ? '💾 Save Changes' : '✅ Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          PRODUCT VIEW PREVIEW MODAL
          ======================================================== */}
      {viewProduct && (
        <div className="adm-modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="adm-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">{viewProduct.name}</div>
              <button className="adm-modal-close" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
                <Image
                  src={viewProduct.img}
                  alt={viewProduct.name}
                  width={120}
                  height={120}
                  style={{ borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).src = '/jevansrot-logo.svg'; }}
                />
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                    {viewProduct.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 8 }}>
                    Brand: <strong>{viewProduct.vendor}</strong> • Slug: <code>{viewProduct.slug}</code>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--g700)' }}>
                      ₹{viewProduct.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>
                      ₹{viewProduct.compare.toLocaleString()}
                    </span>
                    <span style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                      {viewProduct.off}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    ⭐ {viewProduct.rating} / 5.0 ({viewProduct.reviews} verified reviews)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
                {viewProduct.description}
              </div>

              {viewProduct.ingredients && viewProduct.ingredients.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Key Ingredients
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {viewProduct.ingredients.map(i => (
                      <span key={i} style={{ background: 'var(--g50)', color: 'var(--g700)', border: '1px solid var(--g100)', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500 }}>
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewProduct.benefits && viewProduct.benefits.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Primary Benefits
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {viewProduct.benefits.map(b => (
                      <span key={b} style={{ background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500 }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button
                className="adm-btn adm-btn-secondary"
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  openEditModal(p);
                }}
              >
                ✏️ Edit Product
              </button>
              <button className="adm-btn adm-btn-primary" onClick={() => setViewProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">⚠️ Delete Product</div>
              <button className="adm-modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Are you sure you want to permanently delete <strong>&quot;{deleteConfirm.name}&quot;</strong> from your inventory catalogue?
              </p>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#b91c1c' }}>
                Note: This action removes the listing from store pages.
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
