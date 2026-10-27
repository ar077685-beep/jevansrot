'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated, logoutAdmin, getAdminUser, AdminUser } from '../../utils/adminAuth';
import { getStoredOrders } from '../../data/orders';
import './admin.css';

/* ── Icons ── */
const icons = {
  dashboard: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  orders:    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  inventory: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  customers: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  analytics: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  store:     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user:      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevL:     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  bell:      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const NAV_MAIN = [
  { key: 'dashboard',  label: 'Dashboard',  href: '/admin',            icon: 'dashboard'  },
  { key: 'orders',     label: 'Orders',      href: '/admin/orders',     icon: 'orders'     },
  { key: 'inventory',  label: 'Inventory',   href: '/admin/inventory',  icon: 'inventory'  },
  { key: 'customers',  label: 'Customers',   href: '/admin/customers',  icon: 'customers'  },
  { key: 'analytics',  label: 'Analytics',   href: '/admin/analytics',  icon: 'analytics'  },
];

const NAV_OTHER = [
  { key: 'settings',   label: 'Settings',    href: '/admin/settings',   icon: 'settings'   },
  { key: 'store',      label: 'View Store',  href: '/',                 icon: 'store'      },
  { key: 'user',       label: 'User Portal', href: '/user',             icon: 'user'       },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const isLoginPage = Boolean(pathname && (pathname.startsWith('/admin/login') || pathname === '/admin/login/'));

  useEffect(() => {
    setMounted(true);
    if (pathname && (pathname.startsWith('/admin/login') || pathname === '/admin/login/')) return;

    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
      return;
    }
    setAdminUser(getAdminUser());
    const orders = getStoredOrders();
    setPendingCount(orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length);

    const handler = () => {
      const updated = getStoredOrders();
      setPendingCount(updated.filter(o => o.status === 'Pending' || o.status === 'Processing').length);
    };
    window.addEventListener('jevansrot_orders_updated', handler);
    return () => window.removeEventListener('jevansrot_orders_updated', handler);
  }, [router, pathname]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  };

  // If on login page, directly render login page without sidebar or delay
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state when checking authentication
  if (!mounted || !isAdminAuthenticated()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081a0e', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Loading Admin Panel…</div>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <div className="adm-root">
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar${collapsed ? ' collapsed' : ''}`}>
        {/* Brand */}
        <div className="adm-sb-brand">
          <div className="adm-sb-brand-icon">🌿</div>
          <div className="adm-sb-brand-text">
            <div className="adm-sb-brand-name">Jevansrot</div>
            <div className="adm-sb-brand-sub">Admin Suite</div>
          </div>
          <button className="adm-sb-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" id="sidebar-toggle-btn">
            {collapsed ? icons.chevR : icons.chevL}
          </button>
        </div>

        {/* User */}
        <div className="adm-sb-user">
          <div className="adm-sb-avatar">{adminUser?.name?.charAt(0) ?? 'A'}</div>
          <div className="adm-sb-user-info">
            <div className="adm-sb-user-name">{adminUser?.name ?? 'Administrator'}</div>
            <div className="adm-sb-user-role">{adminUser?.role ?? 'Super Admin'}</div>
          </div>
          <div className="adm-sb-online-dot"></div>
        </div>

        {/* Nav */}
        <nav className="adm-sb-nav">
          <div className="adm-sb-section-label">Main Menu</div>
          {NAV_MAIN.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className={`adm-nav-item${isActive(item.href) ? ' active' : ''}`}
              id={`sidebar-nav-${item.key}`}
            >
              <span className="adm-nav-icon">{icons[item.icon as keyof typeof icons]}</span>
              <span className="adm-nav-label">{item.label}</span>
              {item.key === 'orders' && pendingCount > 0 && (
                <span className="adm-nav-badge">{pendingCount}</span>
              )}
              <span className="adm-nav-tooltip">{item.label}</span>
            </Link>
          ))}

          <div className="adm-sb-divider"></div>
          <div className="adm-sb-section-label">Other</div>
          {NAV_OTHER.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className={`adm-nav-item${isActive(item.href) ? ' active' : ''}`}
              id={`sidebar-nav-${item.key}`}
            >
              <span className="adm-nav-icon">{icons[item.icon as keyof typeof icons]}</span>
              <span className="adm-nav-label">{item.label}</span>
              <span className="adm-nav-tooltip">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="adm-sb-footer">
          <button className="adm-sb-logout" onClick={handleLogout} id="sidebar-logout-btn">
            <span className="adm-nav-icon">{icons.logout}</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`adm-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <div className="adm-breadcrumb">
              <span style={{ color: 'var(--text-muted)' }}>Admin</span>
              <span style={{ color: 'var(--text-xmuted)', margin: '0 4px' }}>/</span>
              <span>{NAV_MAIN.find(n => isActive(n.href))?.label ?? NAV_OTHER.find(n => isActive(n.href))?.label ?? 'Dashboard'}</span>
            </div>
          </div>
          <div className="adm-topbar-right">
            <Link href="/" className="adm-topbar-icon-btn" title="View Store">{icons.store}</Link>
            <div className="adm-topbar-icon-btn" title="Notifications" style={{ position: 'relative' }}>
              {icons.bell}
              {pendingCount > 0 && <span className="adm-notif-dot"></span>}
            </div>
            <div className="adm-topbar-avatar" title={adminUser?.name ?? 'Admin'}>
              {adminUser?.name?.charAt(0) ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="adm-page">
          {children}
        </main>
      </div>
    </div>
  );
}
