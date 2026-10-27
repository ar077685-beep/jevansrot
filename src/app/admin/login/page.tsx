'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginAdminApi, isAdminAuthenticated, DEMO_ADMIN } from '../../../utils/adminAuth';
import '../admin.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) router.replace('/admin');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your admin email or username'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    loginAdminApi(email, password).then(res => {
      if (res.success) {
        window.location.href = '/admin/';
      } else {
        setError(res.message || 'Invalid credentials');
        setLoading(false);
      }
    });
  };

  const fillDemo = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError('');
  };

  return (
    <div className="adm-login-root">
      {/* ── Left panel ── */}
      <div className="adm-login-left">
        <div className="adm-login-left-inner">
          {/* Logo */}
          <div className="adm-login-logo">
            <div className="adm-login-logo-icon">🌿</div>
            <div>
              <div className="adm-login-logo-text">Jevansrot Sciences</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1, fontWeight: 600, letterSpacing: 0.5 }}>ADMIN PORTAL v2.4</div>
            </div>
          </div>

          <h1 className="adm-login-headline">
            Manage your<br />
            <em>health empire</em><br />
            from one place
          </h1>

          <p className="adm-login-tagline">
            Complete visibility into orders, dispatch status, revenue analytics, and customer management — all in a unified dashboard.
          </p>

          {/* Stats */}
          <div className="adm-login-stats">
            <div className="adm-login-stat">
              <div className="adm-login-stat-val">50K+</div>
              <div className="adm-login-stat-label">Customers</div>
            </div>
            <div className="adm-login-stat">
              <div className="adm-login-stat-val">₹1.2Cr</div>
              <div className="adm-login-stat-label">Revenue</div>
            </div>
            <div className="adm-login-stat">
              <div className="adm-login-stat-val">98%</div>
              <div className="adm-login-stat-label">Fulfillment</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="adm-login-right">
        <div className="adm-login-form-wrap">
          {/* Logo for mobile */}
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image
              src="/jevansrot-logo.svg"
              alt="Jevansrot"
              width={130}
              height={40}
              priority
            />
          </div>

          <h2 className="adm-login-form-title">Welcome back 👋</h2>
          <p className="adm-login-form-sub">Sign in to your admin dashboard</p>

          {error && (
            <div className="adm-error-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {/* Secure Portal notice */}
          <div className="adm-demo-chip" style={{ cursor: 'default' }}>
            <div>
              <strong>🔒 Protected Admin Portal:</strong>{' '}
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Authorized personnel only. Two-layer security active.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label className="adm-form-label" htmlFor="admin-email">Email or Username</label>
              <div className="adm-input-wrap">
                <span className="adm-input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  id="admin-email"
                  type="text"
                  className="adm-input with-icon"
                  placeholder="admin@jevansrot.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label" htmlFor="admin-pass">Password</label>
              <div className="adm-input-wrap">
                <span className="adm-input-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="adm-input with-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  className="adm-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g700)' }} />
                Keep me signed in
              </label>
              <span style={{ color: 'var(--g600)', fontWeight: 600 }}>Jevansrot Admin v2.4</span>
            </div>

            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={loading}
              id="admin-login-submit"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 14 }}
            >
              {loading ? (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"></circle>
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>Sign In to Dashboard →</>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Link href="/" className="adm-login-back">
              ← Back to Store
            </Link>
            <span style={{ color: 'var(--border)', fontSize: 16 }}>|</span>
            <Link href="/user" className="adm-login-back">
              User Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
