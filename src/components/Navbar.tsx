'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar() {
  const { cart, cartOpen, setCartOpen, cartCount, cartTotal, updateQuantity } = useCart();
  const { user, isLoggedIn, openLoginModal, logout } = useUserAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCartOpen]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="ann">
        <span>🌿 India&apos;s 1st Nano Formulated Nutraceutical Brand</span>
        <span className="sep">|</span>
        <span>⭐ 4.8 Rating (50,000+ Customers)</span>
        <span className="sep">|</span>
        <a href="#products">Free Shipping Above ₹999 →</a>
        <span className="sep">|</span>
        {isLoggedIn ? (
          <Link href="/user" style={{ color: '#f2cc6b', fontWeight: 600, textDecoration: 'none' }}>
            👤 {user?.name?.split(' ')[0] || 'My'}&apos;s Orders &amp; Account
          </Link>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            id="announcement-login-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#f2cc6b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: 0
            }}
          >
            👤 Sign In / Track Orders
          </button>
        )}
      </div>

      {/* Header */}
      <div className="header-wrap">
        <div className="header-top">
          {/* Logo */}
          <Link href="/" className="logo">
            <Image src="/jevansrot-logo.svg" alt="Jevansrot" width={180} height={56} priority />
          </Link>

          {/* Nav */}
          <ul className="nav-menu">
            <li><a href="#products">Shop All</a></li>
            <li><a href="#concerns">Shop by Concern</a></li>
            <li><a href="#technology">Our Science</a></li>
            <li><a href="#why">Why Jevansrot</a></li>
            <li><a href="#testimonials">Reviews</a></li>
          </ul>

          {/* Search */}
          <div className="search-wrap">
            <span className="srch-ico">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input type="text" placeholder="Search for health supplements..." />
          </div>

          {/* Right Actions */}
          <div className="header-right">
            {/* User Account / Login Button */}
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                type="button"
                className="hbtn"
                aria-label={isLoggedIn ? `Account: ${user?.name}` : 'Sign In to Account'}
                id="user-portal-btn"
                title={isLoggedIn ? `Logged in as ${user?.name}` : 'Click to Sign In'}
                onClick={() => {
                  if (!isLoggedIn) {
                    openLoginModal();
                  } else {
                    setUserMenuOpen(!userMenuOpen);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 8
                }}
              >
                {isLoggedIn && user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={24}
                    height={24}
                    unoptimized
                    style={{ borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #1a5c33' }}
                  />
                ) : isLoggedIn ? (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #143d23, #1a5c33)',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}

                {isLoggedIn && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      right: 5,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '1.5px solid #ffffff',
                    }}
                  />
                )}
              </button>

              {/* Logged-In User Quick Dropdown */}
              {isLoggedIn && userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 250,
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)',
                    padding: '12px 0',
                    zIndex: 1100,
                  }}
                >
                  <div style={{ padding: '6px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', wordBreak: 'break-all', marginTop: 2 }}>{user?.email}</div>
                    {user?.provider === 'google' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 100,
                          marginTop: 6,
                        }}
                      >
                        ✓ Google Account
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '6px 0' }}>
                    <Link
                      href="/user"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 16px',
                        fontSize: 13,
                        color: '#1e293b',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      <span>📦</span> My Orders &amp; Tracking
                    </Link>
                    <Link
                      href="/user"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 16px',
                        fontSize: 13,
                        color: '#1e293b',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      <span>👤</span> Profile &amp; Address
                    </Link>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '9px 16px',
                        fontSize: 13,
                        color: '#e53935',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textAlign: 'left',
                      }}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="hbtn" aria-label="Wishlist">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
            {/* Cart → links to /cart page */}
            <Link href="/cart" className="hbtn" aria-label="Go to Cart" id="cart-btn"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'inherit' }}>
              <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Mini Cart Drawer (quick peek) */}
      <div
        className={`cart-modal-overlay ${cartOpen ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}
      >
        <div className="cart-drawer-content">
          <div className="cart-drawer-header">
            <h3>
              <svg style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              Your Cart
            </h3>
            <button className="cart-drawer-close" onClick={() => setCartOpen(false)}>✕</button>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <span style={{ fontSize: 48 }}>🛒</span>
              <p>Your basket is empty</p>
              <p style={{ fontSize: 13 }}>Add products from the catalog above!</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                  <Image src={item.img} alt={item.name} width={72} height={72} style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1c1c1c', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontWeight: 700, color: '#1a5c33', marginBottom: 8 }}>₹{item.price.toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f5f5f5', borderRadius: 100, padding: '3px 10px', width: 'fit-content' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #eee', padding: '20px 24px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <Link href="/cart" onClick={() => setCartOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', background: '#143d23', color: '#fff', padding: '14px 20px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all .2s' }}>
                🛒 View Full Cart & Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
