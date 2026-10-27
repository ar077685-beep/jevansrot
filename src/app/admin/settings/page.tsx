'use client';
import React, { useState, useEffect } from 'react';
import { getAdminUser, AdminUser } from '../../../utils/adminAuth';
import { resetOrdersToDefault, getStoredOrders } from '../../../data/orders';
import { resetInventoryToDefault, getInventoryProducts } from '../../../data/inventory';

interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  gstin: string;
  freeShippingAbove: number;
  flatShippingFee: number;
  codEnabled: boolean;
  orderNotificationEmail: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Jevansrot Nano Nutraceuticals',
  supportEmail: 'care@jevansrot.com',
  supportPhone: '+91 98765 43210',
  gstin: '07AABCJ1234F1Z5',
  freeShippingAbove: 999,
  flatShippingFee: 99,
  codEnabled: true,
  orderNotificationEmail: true,
};

export default function SettingsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    setAdminUser(getAdminUser());
    const stored = localStorage.getItem('jevansrot_store_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // default
      }
    }
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jevansrot_store_settings', JSON.stringify(settings));
    notify('Store preferences successfully updated!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    // In a real app we'd verify old password against backend
    setPwSuccess('Password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    notify('Security credentials updated');
  };

  const handleExportData = () => {
    const orders = getStoredOrders();
    const inventory = getInventoryProducts();
    const backup = {
      exportDate: new Date().toISOString(),
      orders,
      inventory,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jevansrot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Store data backup downloaded successfully!');
  };

  const handleResetOrders = () => {
    if (window.confirm('Are you sure you want to restore original sample orders? Any custom orders will be replaced.')) {
      resetOrdersToDefault();
      notify('Orders reset to default seed data.');
    }
  };

  const handleResetInventory = () => {
    if (window.confirm('Are you sure you want to reset inventory to original default products?')) {
      resetInventoryToDefault();
      notify('Inventory restored to default catalog.');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          background: 'var(--g800)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: 'var(--shadow-lg)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999
        }}>
          <span>✅</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="adm-page-header">
        <div className="adm-page-title-group">
          <div className="adm-page-eyebrow">System Configuration</div>
          <h1 className="adm-page-title">Admin Settings</h1>
          <p className="adm-page-desc">Manage store policies, credentials, shipping rates, and database state</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        
        {/* Store Information Form */}
        <div className="adm-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏪</span> Store Profile & Contact
          </h2>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Brand / Store Name
              </label>
              <input
                type="text"
                className="adm-input"
                style={{ width: '100%' }}
                value={settings.storeName}
                onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Customer Support Email
                </label>
                <input
                  type="email"
                  className="adm-input"
                  style={{ width: '100%' }}
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Support Helpline
                </label>
                <input
                  type="text"
                  className="adm-input"
                  style={{ width: '100%' }}
                  value={settings.supportPhone}
                  onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                GSTIN / Tax Registration Number
              </label>
              <input
                type="text"
                className="adm-input"
                style={{ width: '100%' }}
                value={settings.gstin}
                onChange={e => setSettings({ ...settings, gstin: e.target.value })}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Shipping & Checkout Rules</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    className="adm-input"
                    style={{ width: '100%' }}
                    value={settings.freeShippingAbove}
                    onChange={e => setSettings({ ...settings, freeShippingAbove: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="adm-input"
                    style={{ width: '100%' }}
                    value={settings.flatShippingFee}
                    onChange={e => setSettings({ ...settings, flatShippingFee: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={settings.codEnabled}
                    onChange={e => setSettings({ ...settings, codEnabled: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--g600)' }}
                  />
                  <span>Enable Cash on Delivery (COD) across India</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={settings.orderNotificationEmail}
                    onChange={e => setSettings({ ...settings, orderNotificationEmail: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--g600)' }}
                  />
                  <span>Send instant email alerts when new order arrives</span>
                </label>
              </div>
            </div>

            <button type="submit" className="adm-btn adm-btn-primary" style={{ alignSelf: 'flex-start', marginTop: 10 }}>
              Save Store Settings
            </button>
          </form>
        </div>

        {/* Column 2: Account Security & Data Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Security */}
          <div className="adm-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔐</span> Admin Account Security
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 18, border: '1px solid var(--border)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--g700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {adminUser?.name?.charAt(0) ?? 'A'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{adminUser?.name ?? 'Admin'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{adminUser?.email ?? 'admin@jevansrot.com'} • {adminUser?.role ?? 'Super Admin'}</div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pwError && <div style={{ color: '#dc2626', fontSize: 12, background: '#fee2e2', padding: '6px 10px', borderRadius: 6 }}>{pwError}</div>}
              {pwSuccess && <div style={{ color: '#16a34a', fontSize: 12, background: '#dcfce7', padding: '6px 10px', borderRadius: 6 }}>{pwSuccess}</div>}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  className="adm-input"
                  style={{ width: '100%' }}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>New Password</label>
                  <input
                    type="password"
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Confirm New</label>
                  <input
                    type="password"
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="adm-btn adm-btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                Update Password
              </button>
            </form>
          </div>

          {/* Data Maintenance */}
          <div className="adm-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💾</span> Data Backup & Maintenance
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Export snapshots of your catalog, orders, and customer data, or restore initial demo content.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={handleExportData}
                className="adm-btn adm-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>📥</span> Export Store Backup (JSON)
              </button>

              <button
                type="button"
                onClick={handleResetOrders}
                className="adm-btn adm-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ca8a04' }}
              >
                <span>🔄</span> Reset Demo Orders
              </button>

              <button
                type="button"
                onClick={handleResetInventory}
                className="adm-btn adm-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626' }}
              >
                <span>📦</span> Reset Inventory Catalog
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
