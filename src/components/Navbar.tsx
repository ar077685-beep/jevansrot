'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cart, cartOpen, setCartOpen, cartCount, cartTotal, updateQuantity } = useCart();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCartOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="ann">
        <span>🌿 India&apos;s 1st Nano Formulated Nutraceutical Brand</span>
        <span className="sep">|</span>
        <span>⭐ 4.8 Rating (50,000+ Customers)</span>
        <span className="sep">|</span>
        <a href="#products">Free Shipping Above ₹999 →</a>
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
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Search for health supplements..." />
          </div>

          {/* Right Actions */}
          <div className="header-right">
            <button className="hbtn" aria-label="Wishlist">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            {/* Cart → links to /cart page */}
            <Link href="/cart" className="hbtn" aria-label="Go to Cart" id="cart-btn"
              style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',color:'inherit'}}>
              <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
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
              <svg style={{width:20,height:20,fill:'none',stroke:'#fff',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'}} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Your Cart
            </h3>
            <button className="cart-drawer-close" onClick={() => setCartOpen(false)}>✕</button>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <span style={{fontSize: 48}}>🛒</span>
              <p>Your basket is empty</p>
              <p style={{fontSize:13}}>Add products from the catalog above!</p>
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
