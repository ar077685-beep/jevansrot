'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getStoredOrders, fetchOrdersFromServer, Order } from '../../data/orders';
import { getInventoryProducts, fetchProductsFromServer } from '../../data/inventory';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOrders(getStoredOrders());
    setProductCount(getInventoryProducts().length);
    fetchOrdersFromServer().then(srv => { if (srv && srv.length) setOrders(srv); });
    fetchProductsFromServer().then(p => { if (p && p.length) setProductCount(p.length); });
    const h = () => setOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', h);
    return () => window.removeEventListener('jevansrot_orders_updated', h);
  }, []);

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const revenue = validOrders.reduce((s, o) => s + o.total, 0);
    const advanceCollected = validOrders.reduce((s, o) => s + (o.advanceAmount || 0), 0);
    const remainingToCollect = validOrders.reduce((s, o) => {
      const rem = o.remainAmount !== undefined ? o.remainAmount : Math.max(0, o.total - (o.advanceAmount || 0));
      return s + rem;
    }, 0);
    const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customer.phone)).size;
    return {
      revenue,
      advanceCollected,
      remainingToCollect,
      pending,
      delivered,
      cancelled,
      uniqueCustomers,
      total: orders.length
    };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const statusColor: Record<string, string> = {
    Pending: 'badge-pending', Processing: 'badge-processing',
    Shipped: 'badge-shipped', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
  };

  const payColor: Record<string, string> = {
    Paid: 'pay-paid', 'Advance Paid': 'pay-advance', COD: 'pay-cod',
    Pending: 'pay-pending', Failed: 'pay-failed', Refunded: 'pay-refunded'
  };

  if (!mounted) return null;

  return (
    <>
      {/* Page header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Good morning ☀️</div>
          <h1 className="adm-page-title">Dashboard Overview</h1>
          <p className="adm-page-desc">Welcome to the Jevansrot admin control centre</p>
        </div>
        <div className="adm-page-actions">
          <Link href="/admin/orders" className="adm-btn adm-btn-secondary">View All Orders</Link>
          <Link href="/admin/inventory" className="adm-btn adm-btn-primary">+ Add Product</Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Revenue</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">₹{stats.revenue.toLocaleString()}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-up">↑ 18.2%</span> vs last week</div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#0284c7', '--kpi-bg': '#e0f2fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Orders</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">{stats.total}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-up">↑ {stats.delivered} delivered</span></div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#ea580c', '--kpi-bg': '#ffedd5' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Needs Attention</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">{stats.pending}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-warn">⚡ Pending / Processing</span></div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Advance Collected</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#7c3aed' }}>₹{stats.advanceCollected.toLocaleString()}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-up">Upfront paid via UPI/Card</span></div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#ea580c', '--kpi-bg': '#ffedd5' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Remaining to Collect</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#ea580c' }}>₹{stats.remainingToCollect.toLocaleString()}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-warn">Pending / COD balance</span></div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#0891b2', '--kpi-bg': '#cffafe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Products Live</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">{productCount}</div>
          <div className="adm-kpi-footer">
            <Link href="/admin/inventory" style={{ color: '#0891b2', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>Manage Inventory →</Link>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#dc2626', '--kpi-bg': '#fee2e2' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Cancelled Orders</div>
            <div className="adm-kpi-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">{stats.cancelled}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-red">Cancellation rate tracked</span></div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders + Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Recent Orders */}
        <div className="adm-section-card">
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">Recent Orders & Payment Breakdown</div>
              <div className="adm-section-desc">Advance vs Remaining amount status for recent orders</div>
            </div>
            <Link href="/admin/orders" className="adm-btn adm-btn-secondary adm-btn-sm">View All Orders →</Link>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Advance / Remain</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No orders yet</td></tr>
                ) : recentOrders.map(ord => {
                  const adv = ord.advanceAmount || 0;
                  const rem = ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - adv);
                  return (
                    <tr key={ord.id}>
                      <td><span style={{ fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: 13 }}>{ord.orderNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{ord.customer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ord.customer.city}</div>
                      </td>
                      <td><strong>₹{ord.total.toLocaleString()}</strong></td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Adv: ₹{adv.toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>|</span>
                          <span style={{ color: rem > 0 ? '#ea580c' : '#16a34a', fontWeight: 600 }}>Due: ₹{rem.toLocaleString()}</span>
                        </div>
                      </td>
                      <td><span className={`adm-pay-tag ${payColor[ord.paymentStatus] ?? ''}`}>{ord.paymentStatus}</span></td>
                      <td><span className={`adm-badge ${statusColor[ord.status] ?? ''}`}><span className="adm-badge-dot"></span>{ord.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-section-card">
            <div className="adm-section-header">
              <div className="adm-section-title">Quick Actions</div>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '📦 Manage Orders', href: '/admin/orders', desc: 'Update & track all orders' },
                { label: '🏪 Manage Inventory', href: '/admin/inventory', desc: 'Add / edit products' },
                { label: '👥 View Customers', href: '/admin/customers', desc: 'Customer list & details' },
                { label: '📊 Analytics', href: '/admin/analytics', desc: 'Revenue & sales insights' },
                { label: '⚙️ Settings', href: '/admin/settings', desc: 'Store configuration' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ display: 'block', padding: '11px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--g600)'; (e.currentTarget as HTMLElement).style.background = 'var(--g50)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
