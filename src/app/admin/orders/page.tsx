'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Order, OrderStatus, PaymentStatus,
  getStoredOrders, fetchOrdersFromServer, updateOrderStatus, updateOrderPaymentAndDetails, deleteOrder,
  createNewOrder, INITIAL_ORDERS
} from '../../../data/orders';

const statusClass: Record<string, string> = {
  Pending: 'badge-pending',
  Processing: 'badge-processing',
  Shipped: 'badge-shipped',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

const payClass: Record<string, string> = {
  Paid: 'pay-paid',
  'Advance Paid': 'pay-advance',
  COD: 'pay-cod',
  Pending: 'pay-pending',
  Failed: 'pay-failed',
  Refunded: 'pay-refunded',
};

type SortField = 'date' | 'total' | 'advance' | 'remain' | 'customer';
type SortDir = 'asc' | 'desc';
type PaymentPill = 'all' | 'unpaid' | 'advance' | 'cleared' | 'cod';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [payFilter, setPayFilter] = useState<'All' | PaymentStatus>('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentPill, setPaymentPill] = useState<PaymentPill>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Selected order for detailed modal
  const [selected, setSelected] = useState<Order | null>(null);
  const [editAdvance, setEditAdvance] = useState<number>(0);
  const [editRemain, setEditRemain] = useState<number>(0);
  const [editPayStatus, setEditPayStatus] = useState<PaymentStatus>('Pending');
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>('Pending');
  const [editTracking, setEditTracking] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getStoredOrders());
    fetchOrdersFromServer().then(srv => { if (srv && srv.length) setOrders(srv); });
    const h = () => setOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', h);
    return () => window.removeEventListener('jevansrot_orders_updated', h);
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Open modal and load order state into editor
  const openModal = (ord: Order) => {
    setSelected(ord);
    const adv = ord.advanceAmount || 0;
    const rem = ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - adv);
    setEditAdvance(adv);
    setEditRemain(rem);
    setEditPayStatus(ord.paymentStatus || 'Pending');
    setEditOrderStatus(ord.status);
    setEditTracking(ord.trackingNumber || '');
    setEditNotes(ord.notes || '');
  };

  // When advance amount changes in modal, auto-calc remaining amount
  const handleAdvanceChange = (advVal: number) => {
    if (!selected) return;
    const clampedAdv = Math.max(0, advVal);
    const calculatedRemain = Math.max(0, selected.total - clampedAdv);
    setEditAdvance(clampedAdv);
    setEditRemain(calculatedRemain);
    
    // Auto update payment status recommendation
    if (clampedAdv >= selected.total && selected.total > 0) {
      setEditPayStatus('Paid');
    } else if (clampedAdv > 0) {
      setEditPayStatus('Advance Paid');
    } else if (clampedAdv === 0) {
      setEditPayStatus('Pending');
    }
  };

  // Quick presets
  const handlePresetFullPaid = () => {
    if (!selected) return;
    setEditAdvance(selected.total);
    setEditRemain(0);
    setEditPayStatus('Paid');
  };

  const handlePresetAdvance = (amount: number) => {
    if (!selected) return;
    const adv = Math.min(selected.total, amount);
    setEditAdvance(adv);
    setEditRemain(Math.max(0, selected.total - adv));
    setEditPayStatus(adv >= selected.total ? 'Paid' : 'Advance Paid');
  };

  const handlePresetPending = () => {
    if (!selected) return;
    setEditAdvance(0);
    setEditRemain(selected.total);
    setEditPayStatus('Pending');
  };

  // Save changes from modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const updated = updateOrderPaymentAndDetails(selected.id, {
      advanceAmount: editAdvance,
      remainAmount: editRemain,
      paymentStatus: editPayStatus,
      status: editOrderStatus,
      trackingNumber: editTracking,
      notes: editNotes,
    });
    setOrders(updated);
    notify(`Order ${selected.orderNumber} updated! Advance: ₹${editAdvance}, Remain: ₹${editRemain}`);
    setSelected(null);
  };

  // Direct row update for Order Status
  const handleQuickStatus = (id: string, s: OrderStatus) => {
    const updated = updateOrderStatus(id, s);
    setOrders(updated);
    notify(`Order status → ${s}`);
  };

  // Direct row update for Payment Status
  const handleQuickPayStatus = (id: string, ps: PaymentStatus) => {
    const current = orders.find(o => o.id === id);
    if (!current) return;
    let newAdv = current.advanceAmount;
    let newRem = current.remainAmount;

    if (ps === 'Paid') {
      newAdv = current.total;
      newRem = 0;
    } else if (ps === 'Pending' && newAdv === current.total) {
      newAdv = 0;
      newRem = current.total;
    }

    const updated = updateOrderPaymentAndDetails(id, {
      paymentStatus: ps,
      advanceAmount: newAdv,
      remainAmount: newRem,
    });
    setOrders(updated);
    notify(`Payment status → ${ps}`);
  };

  const handleDelete = (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete order ${num}?`)) return;
    setOrders(deleteOrder(id));
    if (selected?.id === id) setSelected(null);
    notify(`Order ${num} deleted`);
  };

  const handleSimulate = () => {
    const names = ['Kavita Mehra', 'Deepak Joshi', 'Ananya Roy', 'Sunil Narang', 'Rohit Malhotra', 'Meenakshi Iyer'];
    const cities = [
      { city: 'Delhi', state: 'Delhi', pin: '110001' },
      { city: 'Pune', state: 'Maharashtra', pin: '411001' },
      { city: 'Jaipur', state: 'Rajasthan', pin: '302001' },
      { city: 'Lucknow', state: 'Uttar Pradesh', pin: '226001' }
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const loc = cities[Math.floor(Math.random() * cities.length)];
    const billTotal = 3499;

    const created = createNewOrder({
      customer: {
        name,
        phone: '+91 ' + Math.floor(7000000000 + Math.random() * 2999999999),
        email: name.replace(' ', '.').toLowerCase() + '@example.com',
        address: `${Math.floor(Math.random() * 200) + 1}, Sunshine Apt`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pin
      },
      items: [{
        id: 'p1',
        name: 'Jevansrot Boost Medicine',
        price: 3499,
        quantity: 1,
        img: '/products/boost-3499.webp'
      }],
      subtotal: 3499,
      discount: 0,
      shipping: 0,
      total: billTotal,
      advanceAmount: 0,
      remainAmount: billTotal,
      paymentMethod: 'UPI / QR',
      paymentStatus: 'Pending',
      status: 'Pending',
      notes: 'New order placed via online store. Payment verification pending in panel.',
    });
    setOrders(getStoredOrders());
    notify(`New order placed: ${created.orderNumber} (Pending)`);
  };

  // Toggle sorting by column
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'customer' ? 'asc' : 'desc');
    }
  };

  // Metrics summary
  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalBilled = orders.reduce((sum, o) => sum + o.total, 0);
    const totalAdvance = orders.reduce((sum, o) => sum + (o.advanceAmount || 0), 0);
    const totalRemaining = orders.reduce((sum, o) => {
      const rem = o.remainAmount !== undefined ? o.remainAmount : Math.max(0, o.total - (o.advanceAmount || 0));
      return sum + (o.status !== 'Cancelled' ? rem : 0);
    }, 0);
    
    // Counts for pill filters
    const unpaidCount = orders.filter(o => (o.advanceAmount || 0) === 0 && o.status !== 'Cancelled').length;
    const advanceCount = orders.filter(o => (o.advanceAmount || 0) > 0 && (o.remainAmount ?? (o.total - (o.advanceAmount || 0))) > 0).length;
    const clearedCount = orders.filter(o => (o.remainAmount ?? (o.total - (o.advanceAmount || 0))) <= 0 && o.total > 0).length;
    const codCount = orders.filter(o => o.paymentMethod === 'Cash on Delivery').length;

    return { totalOrders, totalBilled, totalAdvance, totalRemaining, unpaidCount, advanceCount, clearedCount, codCount };
  }, [orders]);

  // Filtering + Sorting
  const filtered = useMemo(() => {
    let result = orders.filter(ord => {
      // Status Tab filter
      if (statusFilter !== 'All' && ord.status !== statusFilter) return false;
      
      // Payment Select filter
      if (payFilter !== 'All' && ord.paymentStatus !== payFilter) return false;
      
      // Payment Pill filter
      if (paymentPill === 'unpaid') {
        const adv = ord.advanceAmount || 0;
        if (adv > 0) return false;
      } else if (paymentPill === 'advance') {
        const adv = ord.advanceAmount || 0;
        const rem = ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - adv);
        if (adv === 0 || rem === 0) return false;
      } else if (paymentPill === 'cleared') {
        const adv = ord.advanceAmount || 0;
        const rem = ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - adv);
        if (rem > 0 || ord.total === 0) return false;
      } else if (paymentPill === 'cod') {
        if (ord.paymentMethod !== 'Cash on Delivery') return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const t = new Date(ord.createdAt).getTime(), now = Date.now();
        if (timeFilter === 'today' && now - t > 86400000) return false;
        if (timeFilter === 'week' && now - t > 7 * 86400000) return false;
        if (timeFilter === 'month' && now - t > 30 * 86400000) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesOrd = ord.orderNumber.toLowerCase().includes(q);
        const matchesName = ord.customer.name.toLowerCase().includes(q);
        const matchesPhone = ord.customer.phone.toLowerCase().includes(q);
        const matchesCity = ord.customer.city.toLowerCase().includes(q);
        const matchesItems = ord.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchesOrd && !matchesName && !matchesPhone && !matchesCity && !matchesItems) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'date') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortField === 'total') {
        valA = a.total;
        valB = b.total;
      } else if (sortField === 'advance') {
        valA = a.advanceAmount || 0;
        valB = b.advanceAmount || 0;
      } else if (sortField === 'remain') {
        valA = a.remainAmount !== undefined ? a.remainAmount : Math.max(0, a.total - (a.advanceAmount || 0));
        valB = b.remainAmount !== undefined ? b.remainAmount : Math.max(0, b.total - (b.advanceAmount || 0));
      } else if (sortField === 'customer') {
        valA = a.customer.name.toLowerCase();
        valB = b.customer.name.toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, statusFilter, payFilter, paymentPill, timeFilter, search, sortField, sortDir]);

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'All' || payFilter !== 'All' || paymentPill !== 'all' || timeFilter !== 'all';

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPayFilter('All');
    setPaymentPill('all');
    setTimeFilter('all');
    setSortField('date');
    setSortDir('desc');
  };

  const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

  return (
    <>
      {toast && (
        <div className="adm-toast">
          <div className="adm-toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Financial & Order Management</div>
          <h1 className="adm-page-title">Orders & Payment Tracking</h1>
          <p className="adm-page-desc">Track advance payments, remaining balances, and update order statuses in real-time</p>
        </div>
        <div className="adm-page-actions">
          <button className="adm-btn adm-btn-secondary" onClick={() => { fetchOrdersFromServer().then(s => { if (s) setOrders(s); }); notify('Orders reloaded'); }}>
            ↻ Refresh Orders
          </button>
          <button className="adm-btn adm-btn-primary" onClick={handleSimulate} id="orders-simulate-btn">
            + Place New Order (Pending)
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#0284c7', '--kpi-bg': '#e0f2fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Orders</div>
            <div className="adm-kpi-icon">📦</div>
          </div>
          <div className="adm-kpi-val">{summary.totalOrders}</div>
          <div className="adm-kpi-footer">
            <span>{summary.unpaidCount} unpaid • {summary.advanceCount} partial advance</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Total Billed</div>
            <div className="adm-kpi-icon">₹</div>
          </div>
          <div className="adm-kpi-val">₹{summary.totalBilled.toLocaleString()}</div>
          <div className="adm-kpi-footer">
            <span>Gross order value across all orders</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Advance Collected</div>
            <div className="adm-kpi-icon">💰</div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#7c3aed' }}>₹{summary.totalAdvance.toLocaleString()}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Received upfront via UPI/Cards</span>
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#ea580c', '--kpi-bg': '#ffedd5' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Remaining to Collect</div>
            <div className="adm-kpi-icon">⏳</div>
          </div>
          <div className="adm-kpi-val" style={{ color: '#ea580c' }}>₹{summary.totalRemaining.toLocaleString()}</div>
          <div className="adm-kpi-footer">
            <span style={{ color: '#ea580c', fontWeight: 600 }}>Due upon doorstep delivery / COD</span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="adm-section-card" style={{ boxShadow: 'var(--shadow-md)', borderRadius: 14 }}>
        
        {/* ROW 1: Delivery Status Tabs & Search + Selectors */}
        <div className="adm-toolbar" style={{ padding: '16px 20px', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
          <div className="adm-status-tabs">
            {TABS.map(tab => {
              const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
              return (
                <button
                  key={tab}
                  className={`adm-tab-btn${statusFilter === tab ? ' active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                  id={`orders-tab-${tab.toLowerCase()}`}
                >
                  {tab} <span className="adm-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="adm-toolbar-right" style={{ gap: 10 }}>
            {/* Search Input */}
            <div className="adm-input-wrap" style={{ minWidth: 230 }}>
              <span className="adm-input-icon">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                className="adm-input with-icon"
                placeholder="Search Order ID, name, phone, item…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="orders-search"
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

            {/* Payment Status Dropdown */}
            <select
              className="adm-select"
              value={payFilter}
              onChange={e => setPayFilter(e.target.value as any)}
              title="Filter by Payment Status"
              style={{ fontWeight: 600 }}
            >
              <option value="All">All Payment States</option>
              <option value="Pending">⚠️ Pending (Unpaid)</option>
              <option value="Advance Paid">🟣 Advance Paid</option>
              <option value="Paid">🟢 Fully Paid</option>
              <option value="COD">🟠 Cash on Delivery</option>
              <option value="Failed">🔴 Failed</option>
              <option value="Refunded">⚪ Refunded</option>
            </select>

            {/* Time Filter Dropdown */}
            <select
              className="adm-select"
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
            >
              <option value="all">📅 All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Sort Selector */}
            <select
              className="adm-select"
              value={`${sortField}-${sortDir}`}
              onChange={e => {
                const [f, d] = e.target.value.split('-') as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
              }}
              title="Sort orders list"
              style={{ fontWeight: 600 }}
            >
              <option value="date-desc">Newest Orders First</option>
              <option value="date-asc">Oldest Orders First</option>
              <option value="remain-desc">Highest Remaining Due (Priority)</option>
              <option value="advance-desc">Highest Advance Paid</option>
              <option value="total-desc">Highest Bill Amount</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Header Filter Bar with Quick Pills and Filter Summary */}
        <div className="adm-filter-bar">
          <div className="adm-filter-pills">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>
              Payment Quick Filters:
            </span>
            <button
              className={`adm-filter-pill${paymentPill === 'all' ? ' active' : ''}`}
              onClick={() => setPaymentPill('all')}
            >
              <span>All Orders</span>
              <span className="adm-filter-count">{orders.length}</span>
            </button>
            <button
              className={`adm-filter-pill${paymentPill === 'unpaid' ? ' active' : ''}`}
              onClick={() => setPaymentPill('unpaid')}
              style={{ borderColor: paymentPill === 'unpaid' ? '#dc2626' : undefined }}
            >
              <span>⚠️ Unpaid / Pending</span>
              <span className="adm-filter-count" style={{ color: paymentPill === 'unpaid' ? '#fff' : '#dc2626' }}>{summary.unpaidCount}</span>
            </button>
            <button
              className={`adm-filter-pill${paymentPill === 'advance' ? ' active' : ''}`}
              onClick={() => setPaymentPill('advance')}
              style={{ borderColor: paymentPill === 'advance' ? '#7c3aed' : undefined }}
            >
              <span>🟣 Partial Advance</span>
              <span className="adm-filter-count" style={{ color: paymentPill === 'advance' ? '#fff' : '#7c3aed' }}>{summary.advanceCount}</span>
            </button>
            <button
              className={`adm-filter-pill${paymentPill === 'cleared' ? ' active' : ''}`}
              onClick={() => setPaymentPill('cleared')}
              style={{ borderColor: paymentPill === 'cleared' ? '#16a34a' : undefined }}
            >
              <span>🟢 Fully Settled</span>
              <span className="adm-filter-count" style={{ color: paymentPill === 'cleared' ? '#fff' : '#16a34a' }}>{summary.clearedCount}</span>
            </button>
            <button
              className={`adm-filter-pill${paymentPill === 'cod' ? ' active' : ''}`}
              onClick={() => setPaymentPill('cod')}
            >
              <span>🟠 Cash on Delivery</span>
              <span className="adm-filter-count">{summary.codCount}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing <strong>{filtered.length}</strong> of {orders.length} orders
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>✕</span> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                {/* Column 1: Order ID & Date (Sortable) */}
                <th
                  className="sortable"
                  onClick={() => toggleSort('date')}
                  title="Click to sort by Date"
                  style={{ width: '16%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Order ID &amp; Date
                    <span className={`adm-sort-icon${sortField === 'date' ? ' active' : ''}`}>
                      {sortField === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>

                {/* Column 2: Customer (Sortable) */}
                <th
                  className="sortable"
                  onClick={() => toggleSort('customer')}
                  title="Click to sort by Customer Name"
                  style={{ width: '18%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Customer Details
                    <span className={`adm-sort-icon${sortField === 'customer' ? ' active' : ''}`}>
                      {sortField === 'customer' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>

                {/* Column 3: Items */}
                <th style={{ width: '18%' }}>
                  Ordered Items
                </th>

                {/* Column 4: Total Bill (Sortable) */}
                <th
                  className="sortable"
                  onClick={() => toggleSort('total')}
                  title="Click to sort by Total Amount"
                  style={{ textAlign: 'right', width: '11%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                    Total Bill
                    <span className={`adm-sort-icon${sortField === 'total' ? ' active' : ''}`}>
                      {sortField === 'total' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>

                {/* Column 5: Advance Paid (Sortable) */}
                <th
                  className="sortable"
                  onClick={() => toggleSort('advance')}
                  title="Click to sort by Advance Paid"
                  style={{ textAlign: 'right', width: '11%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                    Advance Paid
                    <span className={`adm-sort-icon${sortField === 'advance' ? ' active' : ''}`}>
                      {sortField === 'advance' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>

                {/* Column 6: Remaining Amount (Sortable) */}
                <th
                  className="sortable"
                  onClick={() => toggleSort('remain')}
                  title="Click to sort by Remaining Due"
                  style={{ textAlign: 'right', width: '12%' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                    Remaining Due
                    <span className={`adm-sort-icon${sortField === 'remain' ? ' active' : ''}`}>
                      {sortField === 'remain' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </span>
                </th>

                {/* Column 7: Payment Status */}
                <th style={{ width: '12%' }}>
                  Payment Status
                </th>

                {/* Column 8: Delivery Status */}
                <th style={{ width: '12%' }}>
                  Delivery Status
                </th>

                {/* Column 9: Actions */}
                <th style={{ textAlign: 'center', width: '12%' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="adm-empty-state">
                      <div className="adm-empty-icon">📦</div>
                      <div className="adm-empty-title">No orders match current filters</div>
                      <div className="adm-empty-desc">Try clearing your search query or reset the filter pills</div>
                      {hasActiveFilters && (
                        <button
                          onClick={resetAllFilters}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ marginTop: 12 }}
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(ord => {
                  const adv = ord.advanceAmount || 0;
                  const rem = ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - adv);
                  const isSettled = rem <= 0 && ord.total > 0;
                  const initials = ord.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={ord.id} id={`ord-row-${ord.id}`}>
                      {/* Order info */}
                      <td>
                        <div className="adm-order-code">
                          {ord.orderNumber}
                        </div>
                        <div className="adm-cell-sub" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <span>🕒</span>
                          <span>{new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="adm-cust-avatar">{initials}</div>
                          <div>
                            <div className="adm-cell-main">{ord.customer.name}</div>
                            <div className="adm-cell-sub" style={{ fontFamily: 'monospace', fontSize: 11.5 }}>
                              {ord.customer.phone}
                            </div>
                            <div className="adm-cell-sub" style={{ color: '#94a3b8' }}>
                              📍 {ord.customer.city}, {ord.customer.state}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div className="adm-thumb-row">
                          {ord.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="adm-thumb" title={item.name}>
                              <Image src={item.img} alt={item.name} width={40} height={40} style={{ objectFit: 'cover' }} />
                              {item.quantity > 1 && <span className="adm-thumb-qty">{item.quantity}</span>}
                            </div>
                          ))}
                          {ord.items.length > 2 && <span className="adm-thumb-more">+{ord.items.length - 2}</span>}
                        </div>
                        <div className="adm-cell-sub" style={{ marginTop: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ord.items.map(i => i.name).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a', fontFamily: 'Space Grotesk, sans-serif' }}>
                          ₹{ord.total.toLocaleString()}
                        </div>
                        <div className="adm-cell-sub">{ord.paymentMethod}</div>
                      </td>

                      {/* Advance Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: 13.5,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: adv > 0 ? '#7c3aed' : 'var(--text-muted)'
                        }}>
                          ₹{adv.toLocaleString()}
                        </div>
                        {adv > 0 ? (
                          <span style={{ fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '1px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>
                            ✓ Advance Recd
                          </span>
                        ) : (
                          <span style={{ fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic' }}>₹0 paid</span>
                        )}
                      </td>

                      {/* Remaining Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: 13.5,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: isSettled ? '#16a34a' : rem > 0 ? '#ea580c' : 'var(--text)'
                        }}>
                          ₹{rem.toLocaleString()}
                        </div>
                        {isSettled ? (
                          <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>
                            ✓ Settled (₹0)
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, background: '#ffedd5', color: '#ea580c', padding: '1px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>
                            ⏳ Due Collect
                          </span>
                        )}
                      </td>

                      {/* Payment Status Dropdown */}
                      <td>
                        <span className={`adm-pay-tag ${payClass[ord.paymentStatus] ?? ''}`}>
                          {ord.paymentStatus}
                        </span>
                        <div>
                          <select
                            className="adm-status-select"
                            value={ord.paymentStatus}
                            onChange={e => handleQuickPayStatus(ord.id, e.target.value as PaymentStatus)}
                            title="Quick update payment status"
                            style={{ width: '100%', marginTop: 5, fontSize: 11, background: '#ffffff' }}
                          >
                            <option value="Pending">⚠️ Pending</option>
                            <option value="Advance Paid">🟣 Advance Paid</option>
                            <option value="Paid">🟢 Fully Paid</option>
                            <option value="COD">🟠 COD</option>
                            <option value="Failed">🔴 Failed</option>
                            <option value="Refunded">⚪ Refunded</option>
                          </select>
                        </div>
                      </td>

                      {/* Delivery Status */}
                      <td>
                        <span className={`adm-badge ${statusClass[ord.status] ?? ''}`}>
                          <span className="adm-badge-dot"></span>
                          {ord.status}
                        </span>
                        <div>
                          <select
                            className="adm-status-select"
                            value={ord.status}
                            onChange={e => handleQuickStatus(ord.id, e.target.value as OrderStatus)}
                            title="Quick update order delivery status"
                            style={{ width: '100%', marginTop: 5, fontSize: 11, background: '#ffffff' }}
                          >
                            {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="adm-cell-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="adm-btn adm-btn-primary adm-btn-sm"
                            onClick={() => openModal(ord)}
                            title="Update Advance, Remaining Amount & Status"
                            style={{ whiteSpace: 'nowrap', padding: '6px 12px' }}
                          >
                            ✏️ Update
                          </button>
                          <button
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            onClick={() => handleDelete(ord.id, ord.orderNumber)}
                            title="Delete Order"
                            style={{ padding: '6px 8px' }}
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Order & Payment Update Modal */}
      {selected && (
        <div className="adm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="adm-modal-header">
              <div>
                <div className="adm-modal-title">Manage Order: {selected.orderNumber}</div>
                <div className="adm-modal-sub">
                  Customer: <strong>{selected.customer.name}</strong> • Placed on {new Date(selected.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="adm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* FINANCIAL MANAGEMENT BOX */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #edf5ef)',
                  border: '2px solid #246b3a33',
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--g800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💳</span> Payment & Financial Settlement
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                      Total Bill: <span style={{ fontSize: 16, color: 'var(--text)' }}>₹{selected.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Advance & Remaining Amount Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6 }}>
                        💰 Advance Paid (₹)
                      </label>
                      <input
                        type="number"
                        className="adm-input"
                        value={editAdvance}
                        min="0"
                        max={selected.total}
                        onChange={e => handleAdvanceChange(Number(e.target.value))}
                        style={{ fontWeight: 700, fontSize: 15, borderColor: '#7c3aed88' }}
                        required
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                        Upfront token/full payment received
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: editRemain > 0 ? '#ea580c' : '#16a34a', marginBottom: 6 }}>
                        ⏳ Remaining Due (₹)
                      </label>
                      <input
                        type="number"
                        className="adm-input"
                        value={editRemain}
                        min="0"
                        onChange={e => setEditRemain(Number(e.target.value))}
                        style={{ fontWeight: 700, fontSize: 15, borderColor: editRemain > 0 ? '#ea580c88' : '#16a34a88' }}
                        required
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                        Balance amount to collect on delivery
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Quick One-Click Presets:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        onClick={handlePresetFullPaid}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #16a34a',
                          background: '#dcfce7',
                          color: '#16a34a',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Full Paid (₹{selected.total})
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetAdvance(500)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #7c3aed',
                          background: '#ede9fe',
                          color: '#7c3aed',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + ₹500 Token Advance
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetAdvance(1000)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #7c3aed',
                          background: '#ede9fe',
                          color: '#7c3aed',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + ₹1,000 Token Advance
                      </button>

                      <button
                        type="button"
                        onClick={handlePresetPending}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #ca8a04',
                          background: '#fef9c3',
                          color: '#ca8a04',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ⚠️ Mark Unpaid / Pending
                      </button>
                    </div>
                  </div>

                  {/* Payment Status Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
                      Payment Status State
                    </label>
                    <select
                      className="adm-select"
                      style={{ width: '100%', fontWeight: 600 }}
                      value={editPayStatus}
                      onChange={e => setEditPayStatus(e.target.value as PaymentStatus)}
                    >
                      <option value="Pending">⚠️ Pending (Order placed, awaiting advance verification)</option>
                      <option value="Advance Paid">🟣 Advance Paid (Token/Partial payment collected)</option>
                      <option value="Paid">🟢 Fully Paid (100% payment settled)</option>
                      <option value="COD">🟠 Cash on Delivery (Full payment on delivery)</option>
                      <option value="Failed">🔴 Payment Failed</option>
                      <option value="Refunded">⚪ Refunded</option>
                    </select>
                  </div>
                </div>

                {/* ORDER STATUS & LOGISTICS */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Order Status & Logistics</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Delivery Status
                      </label>
                      <select
                        className="adm-select"
                        style={{ width: '100%' }}
                        value={editOrderStatus}
                        onChange={e => setEditOrderStatus(e.target.value as OrderStatus)}
                      >
                        {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Tracking Number / AWB
                      </label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="e.g. DELHIVERY-984102"
                        value={editTracking}
                        onChange={e => setEditTracking(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Admin Notes / Remarks
                    </label>
                    <textarea
                      className="adm-input"
                      rows={2}
                      placeholder="e.g. ₹500 received via GPay on 27 Oct, balance ₹2,999 to collect on delivery."
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Customer Shipping Address</div>
                  <div className="adm-info-grid">
                    <div className="adm-info-field"><label>Name</label><span>{selected.customer.name}</span></div>
                    <div className="adm-info-field"><label>Phone</label><span>{selected.customer.phone}</span></div>
                    <div className="adm-info-field"><label>Email</label><span>{selected.customer.email}</span></div>
                    <div className="adm-info-field"><label>City / State</label><span>{selected.customer.city}, {selected.customer.state} ({selected.customer.pincode})</span></div>
                    <div className="adm-info-field" style={{ gridColumn: 'span 2' }}>
                      <label>Address</label><span>{selected.customer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Purchased Items</div>
                  {selected.items.map((item, i) => (
                    <div key={i} className="adm-modal-item">
                      <Image src={item.img} alt={item.name} width={48} height={48} className="adm-modal-item-img" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setSelected(null)}>
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ padding: '8px 20px', fontWeight: 700 }}>
                  💾 Save Payment & Order Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
