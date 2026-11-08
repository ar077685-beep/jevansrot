'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { getStoredOrders, fetchOrdersFromServer, Order } from '../../../data/orders';
import { getStoredCustomers, fetchCustomersFromServer, CustomerRecord, CUSTOMERS_EVENT } from '../../../data/customers';

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  provider: 'google' | 'email' | 'phone' | 'order' | string;
  city: string;
  state: string;
  orderCount: number;
  totalSpent: number;
  lastOrder?: string;
  createdAt: string;
  lastLogin: string;
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredCustomers, setRegisteredCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'google' | 'buyers' | 'new'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setOrders(getStoredOrders());
    setRegisteredCustomers(getStoredCustomers());

    try {
      const [srvOrders, srvCust] = await Promise.all([
        fetchOrdersFromServer(),
        fetchCustomersFromServer(),
      ]);
      if (srvOrders && srvOrders.length) setOrders(srvOrders);
      if (srvCust && srvCust.length) setRegisteredCustomers(srvCust);
    } catch (e) {
      console.warn('Error fetching fresh customers from server', e);
    }
  };

  useEffect(() => {
    loadData();

    const handleOrders = () => setOrders(getStoredOrders());
    const handleCust = () => setRegisteredCustomers(getStoredCustomers());

    window.addEventListener('jevansrot_orders_updated', handleOrders);
    window.addEventListener(CUSTOMERS_EVENT, handleCust);
    window.addEventListener('storage', handleCust);

    return () => {
      window.removeEventListener('jevansrot_orders_updated', handleOrders);
      window.removeEventListener(CUSTOMERS_EVENT, handleCust);
      window.removeEventListener('storage', handleCust);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Merge registered OAuth/Email customers + Order buyers into a single unified customer list
  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();

    // 1. Registered Customers (from Google OAuth, Email login, etc.)
    registeredCustomers.forEach(rc => {
      if (!rc || (!rc.email && !rc.phone)) return;
      const key = (rc.email || rc.phone || '').toLowerCase().trim();
      map.set(key, {
        id: rc.id || 'usr_' + key,
        name: rc.name || key.split('@')[0],
        email: rc.email || '',
        phone: rc.phone || '',
        avatar: rc.avatar || '',
        provider: rc.provider || 'google',
        city: rc.city || '—',
        state: rc.state || '—',
        orderCount: rc.orderCount || 0,
        totalSpent: rc.totalSpent || 0,
        lastOrder: rc.lastOrder,
        createdAt: rc.createdAt || new Date().toISOString(),
        lastLogin: rc.lastLogin || rc.createdAt || new Date().toISOString(),
      });
    });

    // 2. Orders: merge buyer info with registered records or create order buyer entry
    orders.forEach(ord => {
      if (!ord || !ord.customer) return;
      const emailKey = ord.customer.email ? ord.customer.email.toLowerCase().trim() : '';
      const phoneKey = ord.customer.phone ? ord.customer.phone.trim() : '';
      const key = emailKey || phoneKey;
      if (!key) return;

      const existing = (emailKey ? map.get(emailKey) : undefined) || (phoneKey ? map.get(phoneKey) : undefined);

      if (existing) {
        existing.orderCount = (existing.orderCount || 0) + 1;
        existing.totalSpent = (existing.totalSpent || 0) + (Number(ord.total) || 0);
        if ((!existing.phone || existing.phone === '') && ord.customer.phone) {
          existing.phone = ord.customer.phone;
        }
        if ((!existing.email || existing.email === '') && ord.customer.email) {
          existing.email = ord.customer.email;
        }
        if (existing.city === '—' && ord.customer.city) existing.city = ord.customer.city;
        if (existing.state === '—' && ord.customer.state) existing.state = ord.customer.state;
        if (!existing.lastOrder || new Date(ord.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = ord.createdAt;
        }
      } else {
        const row: CustomerRow = {
          id: 'ord_c_' + (ord.customer.phone || ord.id),
          name: ord.customer.name,
          email: ord.customer.email || '',
          phone: ord.customer.phone || '',
          avatar: '',
          provider: 'order',
          city: ord.customer.city || '—',
          state: ord.customer.state || '—',
          orderCount: 1,
          totalSpent: Number(ord.total) || 0,
          lastOrder: ord.createdAt,
          createdAt: ord.createdAt,
          lastLogin: ord.createdAt,
        };
        map.set(key, row);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
    });
  }, [registeredCustomers, orders]);

  // Filtering
  const filtered = useMemo(() => {
    return customers.filter(c => {
      // Type pill filter
      if (filterType === 'google' && c.provider !== 'google') return false;
      if (filterType === 'buyers' && c.orderCount === 0) return false;
      if (filterType === 'new' && c.orderCount > 0) return false;

      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q)
      );
    });
  }, [customers, search, filterType]);

  const googleCount = customers.filter(c => c.provider === 'google').length;
  const buyerCount = customers.filter(c => c.orderCount > 0).length;
  const repeatCount = customers.filter(c => c.orderCount > 1).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <>
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Customer Database & Accounts</div>
          <h1 className="adm-page-title">Customers</h1>
          <p className="adm-page-desc">
            {customers.length} total customer accounts ({googleCount} Google OAuth, {buyerCount} active buyers)
          </p>
        </div>
        <div className="adm-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {isRefreshing ? 'Refreshing…' : 'Sync Database'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Customers</div>
            <div className="adm-kpi-icon">👥</div>
          </div>
          <div className="adm-kpi-val">{customers.length}</div>
          <div className="adm-kpi-footer">
            <span className="adm-kpi-trend trend-up">All accounts</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#2563eb', '--kpi-bg': '#dbeafe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Google OAuth Users</div>
            <div className="adm-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
          </div>
          <div className="adm-kpi-val">{googleCount}</div>
          <div className="adm-kpi-footer">
            <span>Verified Google Sign-in</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Active Buyers</div>
            <div className="adm-kpi-icon">🛍️</div>
          </div>
          <div className="adm-kpi-val">{buyerCount}</div>
          <div className="adm-kpi-footer">
            <span>{repeatCount} repeat customers</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#ea580c', '--kpi-bg': '#ffedd5' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Customer LTV</div>
            <div className="adm-kpi-icon">₹</div>
          </div>
          <div className="adm-kpi-val">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="adm-kpi-footer">
            <span>Lifetime spent across orders</span>
          </div>
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="adm-section-card">
        <div className="adm-section-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="adm-section-title">All Customer Accounts</div>
            <div className="adm-section-desc">
              Showing {filtered.length} of {customers.length} registered customers
            </div>
          </div>

          {/* Quick Filter Tabs & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#f3f4f6', padding: 3, borderRadius: 8, gap: 2 }}>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                style={{
                  border: 'none',
                  background: filterType === 'all' ? '#fff' : 'transparent',
                  color: filterType === 'all' ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: filterType === 'all' ? 700 : 500,
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: filterType === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                All ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('google')}
                style={{
                  border: 'none',
                  background: filterType === 'google' ? '#fff' : 'transparent',
                  color: filterType === 'google' ? '#1d4ed8' : 'var(--text-muted)',
                  fontWeight: filterType === 'google' ? 700 : 500,
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: filterType === 'google' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Google ({googleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('buyers')}
                style={{
                  border: 'none',
                  background: filterType === 'buyers' ? '#fff' : 'transparent',
                  color: filterType === 'buyers' ? '#16a34a' : 'var(--text-muted)',
                  fontWeight: filterType === 'buyers' ? 700 : 500,
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: filterType === 'buyers' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Ordered ({buyerCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('new')}
                style={{
                  border: 'none',
                  background: filterType === 'new' ? '#fff' : 'transparent',
                  color: filterType === 'new' ? '#7c3aed' : 'var(--text-muted)',
                  fontWeight: filterType === 'new' ? 700 : 500,
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: filterType === 'new' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                New Users ({customers.length - buyerCount})
              </button>
            </div>

            <div className="adm-input-wrap" style={{ minWidth: 220 }}>
              <span className="adm-input-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                className="adm-input with-icon"
                placeholder="Search name, email, phone, city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>#</th>
                <th>Customer Name</th>
                <th>Account & Provider</th>
                <th>Contact Details</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="adm-empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <div className="adm-empty-icon" style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                      <div className="adm-empty-title" style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                        No customers found
                      </div>
                      <div className="adm-empty-desc" style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        {search ? 'Try clearing your search query.' : 'Customers who sign in with Google or place orders will appear here automatically.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id || c.email || c.phone || i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12 }}>
                      #{i + 1}
                    </td>

                    {/* Customer Name & Avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.avatar && c.avatar.startsWith('http') ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #e5e7eb',
                              flexShrink: 0,
                            }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: c.provider === 'google'
                                ? 'linear-gradient(135deg, #4285F4, #34A853)'
                                : 'linear-gradient(135deg, var(--g700), var(--g600))',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="adm-cell-main" style={{ fontWeight: 600, fontSize: 14 }}>
                            {c.name || 'Anonymous User'}
                          </div>
                          {c.orderCount > 1 ? (
                            <span style={{ fontSize: 10, background: 'var(--purple-bg)', color: 'var(--purple)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              ★ Repeat Buyer
                            </span>
                          ) : c.orderCount === 1 ? (
                            <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              First Purchase
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, background: '#f3f4f6', color: '#6b7280', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                              Registered (No Orders Yet)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Account & Provider Badge */}
                    <td>
                      {c.provider === 'google' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Google OAuth</span>
                        </div>
                      ) : c.provider === 'email' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          <span>✉️ Email Account</span>
                        </div>
                      ) : c.provider === 'phone' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          <span>📱 Phone Account</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          <span>🛍️ Guest Order</span>
                        </div>
                      )}
                    </td>

                    {/* Contact Details */}
                    <td>
                      <div className="adm-cell-main" style={{ fontSize: 13, color: 'var(--text)' }}>
                        {c.email || '—'}
                      </div>
                      <div className="adm-cell-sub" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {c.phone || (c.provider === 'google' ? 'Google Auth (No Phone)' : '—')}
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <div className="adm-cell-main" style={{ fontSize: 13 }}>
                        {c.city !== '—' ? c.city : 'Online Portal'}
                      </div>
                      <div className="adm-cell-sub" style={{ fontSize: 12 }}>
                        {c.state !== '—' ? c.state : 'Web User'}
                      </div>
                    </td>

                    {/* Orders count */}
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: c.orderCount > 0 ? 'var(--g700)' : 'var(--text-muted)',
                        }}
                      >
                        {c.orderCount}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td>
                      <strong style={{ color: c.totalSpent > 0 ? 'var(--text)' : 'var(--text-muted)', fontSize: 14 }}>
                        ₹{c.totalSpent.toLocaleString('en-IN')}
                      </strong>
                    </td>

                    {/* Last Active / Joined */}
                    <td>
                      <div className="adm-cell-sub" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {c.lastLogin || c.lastOrder || c.createdAt
                          ? new Date(c.lastLogin || c.lastOrder || c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
