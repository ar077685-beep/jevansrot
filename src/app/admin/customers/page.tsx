'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { getStoredOrders, Order } from '../../../data/orders';

interface CustomerRow {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setOrders(getStoredOrders());
    const h = () => setOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', h);
    return () => window.removeEventListener('jevansrot_orders_updated', h);
  }, []);

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    orders.forEach(ord => {
      const key = ord.customer.phone;
      if (map.has(key)) {
        const row = map.get(key)!;
        row.orderCount += 1;
        row.totalSpent += ord.total;
        if (new Date(ord.createdAt) > new Date(row.lastOrder)) row.lastOrder = ord.createdAt;
      } else {
        map.set(key, {
          name: ord.customer.name,
          phone: ord.customer.phone,
          email: ord.customer.email,
          city: ord.customer.city,
          state: ord.customer.state,
          orderCount: 1,
          totalSpent: ord.total,
          lastOrder: ord.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = customers.filter(c =>
    !search.trim() || [c.name, c.phone, c.email, c.city].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Customer Database</div>
          <h1 className="adm-page-title">Customers</h1>
          <p className="adm-page-desc">{customers.length} unique customers across all orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top"><div className="adm-kpi-label">Total Customers</div></div>
          <div className="adm-kpi-val">{customers.length}</div>
          <div className="adm-kpi-footer"><span className="adm-kpi-trend trend-up">Unique buyers</span></div>
        </div>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top"><div className="adm-kpi-label">Avg. Order Value</div></div>
          <div className="adm-kpi-val">₹{customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.totalSpent / c.orderCount, 0) / customers.length).toLocaleString() : 0}</div>
          <div className="adm-kpi-footer"><span>Per order</span></div>
        </div>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#0284c7', '--kpi-bg': '#e0f2fe' } as React.CSSProperties}>
          <div className="adm-kpi-top"><div className="adm-kpi-label">Repeat Buyers</div></div>
          <div className="adm-kpi-val">{customers.filter(c => c.orderCount > 1).length}</div>
          <div className="adm-kpi-footer"><span>Ordered more than once</span></div>
        </div>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#ea580c', '--kpi-bg': '#ffedd5' } as React.CSSProperties}>
          <div className="adm-kpi-top"><div className="adm-kpi-label">Top City</div></div>
          <div className="adm-kpi-val" style={{ fontSize: 22 }}>{
            (() => {
              const cityMap = new Map<string, number>();
              customers.forEach(c => cityMap.set(c.city, (cityMap.get(c.city) ?? 0) + 1));
              return Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
            })()
          }</div>
          <div className="adm-kpi-footer"><span>Most orders</span></div>
        </div>
      </div>

      <div className="adm-section-card">
        <div className="adm-section-header">
          <div>
            <div className="adm-section-title">All Customers</div>
            <div className="adm-section-desc">{filtered.length} of {customers.length} customers</div>
          </div>
          <div className="adm-input-wrap" style={{ minWidth: 240 }}>
            <span className="adm-input-icon">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" className="adm-input with-icon" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Contact</th><th>Location</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty-state"><div className="adm-empty-icon">👥</div><div className="adm-empty-title">No customers yet</div><div className="adm-empty-desc">Customers appear automatically from orders</div></div></td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.phone}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--g700), var(--g600))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="adm-cell-main">{c.name}</div>
                        {c.orderCount > 1 && <span style={{ fontSize: 11, background: 'var(--purple-bg)', color: 'var(--purple)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Repeat</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="adm-cell-main">{c.phone}</div>
                    <div className="adm-cell-sub">{c.email}</div>
                  </td>
                  <td><div className="adm-cell-main">{c.city}</div><div className="adm-cell-sub">{c.state}</div></td>
                  <td><span style={{ fontWeight: 700, fontSize: 16, color: 'var(--g700)' }}>{c.orderCount}</span></td>
                  <td><strong style={{ color: 'var(--text)', fontSize: 14 }}>₹{c.totalSpent.toLocaleString()}</strong></td>
                  <td><div className="adm-cell-sub">{new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
