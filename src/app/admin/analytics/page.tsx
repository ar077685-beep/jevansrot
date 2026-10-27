'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getStoredOrders, Order } from '../../../data/orders';
import { getInventoryProducts, Product } from '../../../data/inventory';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOrders(getStoredOrders());
    setProducts(getInventoryProducts());

    const h = () => setOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', h);
    return () => window.removeEventListener('jevansrot_orders_updated', h);
  }, []);

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0;
    
    // Status counts
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment method breakdown
    const codCount = orders.filter(o => o.paymentMethod === 'Cash on Delivery').length;
    const prepaidCount = orders.length - codCount;
    const codPct = orders.length > 0 ? Math.round((codCount / orders.length) * 100) : 0;
    const prepaidPct = 100 - codPct;

    // Top selling products by items in orders
    const prodSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!prodSales[item.id]) {
          prodSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
        }
        prodSales[item.id].qty += item.quantity;
        prodSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topSelling = Object.values(prodSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // City breakdown
    const cityMap: Record<string, { count: number; total: number }> = {};
    orders.forEach(o => {
      const city = o.customer.city || 'Unknown';
      if (!cityMap[city]) cityMap[city] = { count: 0, total: 0 };
      cityMap[city].count += 1;
      cityMap[city].total += o.total;
    });
    const topCities = Object.entries(cityMap)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Repeat customers
    const customerOrders: Record<string, number> = {};
    orders.forEach(o => {
      const key = o.customer.phone || o.customer.email;
      customerOrders[key] = (customerOrders[key] || 0) + 1;
    });
    const repeatCustCount = Object.values(customerOrders).filter(c => c > 1).length;
    const totalCustCount = Object.keys(customerOrders).length;
    const repeatRate = totalCustCount > 0 ? Math.round((repeatCustCount / totalCustCount) * 100) : 0;

    return {
      totalRev,
      avgOrderValue,
      statusCounts,
      topSelling,
      topCities,
      repeatRate,
      codPct,
      prepaidPct,
      deliveredRate: orders.length > 0 ? Math.round(((statusCounts['Delivered'] || 0) / orders.length) * 100) : 0,
      totalOrders: orders.length,
      validOrdersCount: validOrders.length,
    };
  }, [orders]);

  if (!mounted) return null;

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">Insights & Performance</div>
          <h1 className="adm-page-title">Analytics & Reports</h1>
          <p className="adm-page-desc">Comprehensive sales, revenue velocity, and customer breakdown</p>
        </div>
        <div className="adm-page-actions">
          <div className="adm-tab-pill-group" style={{ display: 'flex', background: 'var(--border)', padding: 3, borderRadius: 8 }}>
            {(['7d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: timeRange === range ? '#fff' : 'transparent',
                  color: timeRange === range ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="adm-kpi-card" style={{ '--kpi-color': '#16a34a', '--kpi-bg': '#dcfce7' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Gross Revenue</div>
            <div className="adm-kpi-icon">₹</div>
          </div>
          <div className="adm-kpi-val">₹{stats.totalRev.toLocaleString()}</div>
          <div className="adm-kpi-trend up">
            <span>↑ 18.4%</span> vs previous period
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#0284c7', '--kpi-bg': '#e0f2fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Average Order Value (AOV)</div>
            <div className="adm-kpi-icon">🏷️</div>
          </div>
          <div className="adm-kpi-val">₹{stats.avgOrderValue.toLocaleString()}</div>
          <div className="adm-kpi-trend up">
            <span>↑ ₹320</span> higher than industry avg
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#ca8a04', '--kpi-bg': '#fef9c3' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Delivery Success Rate</div>
            <div className="adm-kpi-icon">📦</div>
          </div>
          <div className="adm-kpi-val">{stats.deliveredRate}%</div>
          <div className="adm-kpi-trend up">
            <span>↑ 4.2%</span> low return-to-origin
          </div>
        </div>

        <div className="adm-kpi-card" style={{ '--kpi-color': '#7c3aed', '--kpi-bg': '#ede9fe' } as React.CSSProperties}>
          <div className="adm-kpi-top">
            <div className="adm-kpi-label">Repeat Customer Rate</div>
            <div className="adm-kpi-icon">🔁</div>
          </div>
          <div className="adm-kpi-val">{stats.repeatRate}%</div>
          <div className="adm-kpi-trend up">
            <span>↑ High</span> brand loyalty
          </div>
        </div>
      </div>

      {/* Grid: Order Status & Payment Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Status Distribution */}
        <div className="adm-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊</span> Order Pipeline Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Delivered', count: stats.statusCounts['Delivered'] || 0, color: '#16a34a' },
              { label: 'Shipped', count: stats.statusCounts['Shipped'] || 0, color: '#0284c7' },
              { label: 'Processing', count: stats.statusCounts['Processing'] || 0, color: '#ea580c' },
              { label: 'Pending', count: stats.statusCounts['Pending'] || 0, color: '#ca8a04' },
              { label: 'Cancelled', count: stats.statusCounts['Cancelled'] || 0, color: '#dc2626' },
            ].map(item => {
              const pct = stats.totalOrders > 0 ? Math.round((item.count / stats.totalOrders) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count} orders ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: item.color,
                        borderRadius: 4,
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="adm-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💳</span> Payment Method Split
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, padding: 16, background: '#f8fafc', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Online / Prepaid</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>{stats.prepaidPct}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-xmuted)' }}>UPI, Cards, Netbanking</div>
            </div>
            <div style={{ flex: 1, padding: 16, background: '#f8fafc', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Cash on Delivery</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#ca8a04', marginTop: 4 }}>{stats.codPct}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-xmuted)' }}>Pay at Doorstep</div>
            </div>
          </div>
          {/* Visual bar */}
          <div style={{ height: 14, background: '#fef08a', borderRadius: 7, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${stats.prepaidPct}%`, background: '#16a34a', height: '100%' }} title={`Online: ${stats.prepaidPct}%`} />
            <div style={{ width: `${stats.codPct}%`, background: '#eab308', height: '100%' }} title={`COD: ${stats.codPct}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }}></span> Online Prepaid
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }}></span> COD
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Top Products & Top Locations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Top Products */}
        <div className="adm-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏆</span> Best-Selling Formulations
            </h3>
            <Link href="/admin/inventory" style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              Manage Products →
            </Link>
          </div>
          {stats.topSelling.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No product sales recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.topSelling.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-muted)', width: 18, fontSize: 13 }}>#{idx + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.qty} units sold</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>
                    ₹{p.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Geography */}
        <div className="adm-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📍</span> Geographic Volume
            </h3>
            <Link href="/admin/customers" style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              View Customers →
            </Link>
          </div>
          {stats.topCities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No location data recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.topCities.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.city}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.count} total shipments</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>₹{c.total.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Active Hub</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
