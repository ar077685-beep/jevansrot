'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useUserAuth } from '../../context/UserAuthContext';
import { Order, getStoredOrders, fetchOrdersFromServer } from '../../data/orders';
import '../admin/admin.css';

export default function UserPortalPage() {
  const { user, isLoggedIn, openLoginModal, logout, updateProfile } = useUserAuth();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [guestOrderQuery, setGuestOrderQuery] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Clean user profile state (no demo ID hardcoded)
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Load saved profile from localStorage and sync with logged-in user
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jevansrot_user_shipping_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setUserProfile((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) {
      setUserProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    setAllOrders(getStoredOrders());
    fetchOrdersFromServer().then(srv => { if (srv && srv.length) setAllOrders(srv); });
    const handleUpdate = () => setAllOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', handleUpdate);
    return () => window.removeEventListener('jevansrot_orders_updated', handleUpdate);
  }, []);

  // Filter orders for the current user
  const userOrders = useMemo(() => {
    if (isLoggedIn && user?.email) {
      const uEmail = user.email.toLowerCase().trim();
      const uPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
      return allOrders.filter(ord => {
        const ordEmail = ord.customer?.email?.toLowerCase().trim() || '';
        const ordPhone = ord.customer?.phone ? ord.customer.phone.replace(/[^0-9]/g, '') : '';
        return (uEmail && ordEmail === uEmail) || (uPhone && ordPhone && ordPhone === uPhone);
      });
    }

    if (guestOrderQuery.trim()) {
      const query = guestOrderQuery.toLowerCase().trim();
      return allOrders.filter(ord =>
        ord.orderNumber.toLowerCase().includes(query) ||
        ord.customer.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
      );
    }

    return [];
  }, [isLoggedIn, user, allOrders, guestOrderQuery]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('jevansrot_user_shipping_profile', JSON.stringify(userProfile));
    } catch {
      // ignore
    }

    if (isLoggedIn) {
      updateProfile({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const getStepStatus = (orderStatus: string, step: number) => {
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = statuses.indexOf(orderStatus);
    if (orderStatus === 'Cancelled') return { done: false, active: false, cancelled: true };
    if (currentIdx >= step) return { done: true, active: false };
    if (currentIdx === step - 1) return { done: false, active: true };
    return { done: false, active: false };
  };

  return (
    <>
      <Navbar />
      <div className="usr-page-wrap">
        {/* Header Hero Banner */}
        <section className="usr-header-banner">
          <div className="usr-header-inner">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                <span>👤</span> {isLoggedIn ? (user?.provider === 'google' ? 'Google Account' : 'Customer Account') : 'Customer Portal'}
              </div>
              <h1 className="usr-title">
                {isLoggedIn
                  ? `Welcome, ${user?.name || userProfile.name || 'Customer'}`
                  : 'My Account & Orders'}
              </h1>
              <p className="usr-subtitle">
                Track shipments, view delivery schedules, and manage your saved address
              </p>
            </div>

            <div className="usr-quick-actions">
              {!isLoggedIn ? (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="usr-btn-outline"
                  style={{ background: '#d4a847', color: '#143d23', borderColor: '#d4a847', fontWeight: 700 }}
                >
                  <span>🔑</span> Log In / Sign Up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  className="usr-btn-outline"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                >
                  <span>🚪</span> Sign Out
                </button>
              )}
              <Link href="/cart" className="usr-btn-outline" id="user-to-cart-btn">
                <span>🛒</span> View Cart
              </Link>
              <Link href="/" className="usr-btn-outline" id="user-to-store-btn">
                <span>🛍️</span> Shop
              </Link>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="usr-content-container">
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'orders' ? '#143d23' : '#ffffff',
                color: activeTab === 'orders' ? '#ffffff' : '#334155',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
              id="user-tab-orders"
            >
              📦 My Orders ({userOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'profile' ? '#143d23' : '#ffffff',
                color: activeTab === 'profile' ? '#ffffff' : '#334155',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
              id="user-tab-profile"
            >
              👤 Profile &amp; Address
            </button>
          </div>

          {/* Orders Section */}
          {activeTab === 'orders' ? (
            <div className="usr-orders-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>My Orders</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Live delivery tracking &amp; purchase history</p>
                </div>
                <Link href="/#products" style={{ fontSize: 13, fontWeight: 600, color: '#1a5c33', textDecoration: 'none' }}>
                  + Browse Catalog →
                </Link>
              </div>

              {/* Guest Look-up Bar if not logged in */}
              {!isLoggedIn && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                    Track an Order without Logging In
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="adm-input"
                      style={{ flex: 1, minWidth: 220 }}
                      placeholder="Enter Order Number (e.g. JEV-2026-...) or Mobile"
                      value={guestOrderQuery}
                      onChange={(e) => setGuestOrderQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="adm-btn-primary"
                      style={{ width: 'auto', padding: '10px 20px', whiteSpace: 'nowrap' }}
                    >
                      Log In to View All
                    </button>
                  </div>
                </div>
              )}

              {userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                    No orders found
                  </h3>
                  <p style={{ fontSize: 14, marginBottom: 20 }}>
                    {!isLoggedIn && !guestOrderQuery
                      ? 'Please log in or enter your order number above to track your orders.'
                      : 'You have not placed any orders yet. Discover our 100% plant-based supplements.'}
                  </p>
                  <Link href="/#products" className="adm-btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px' }}>
                    Shop Supplements Now
                  </Link>
                </div>
              ) : (
                userOrders.map((ord) => {
                  const s1 = getStepStatus(ord.status, 0);
                  const s2 = getStepStatus(ord.status, 2);
                  const s3 = getStepStatus(ord.status, 3);
                  const s4 = getStepStatus(ord.status, 4);

                  return (
                    <div key={ord.id} className="usr-order-item-card" id={`user-order-${ord.id}`}>
                      {/* Head */}
                      <div className="usr-order-head">
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>ORDER NUMBER</span>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ord.orderNumber}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>TOTAL AMOUNT</span>
                          <div style={{ fontWeight: 800, fontSize: 16, color: '#143d23' }}>₹{ord.total.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>{ord.paymentMethod} &bull; {ord.paymentStatus}</div>
                          <div style={{ fontSize: 11, marginTop: 4 }}>
                            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Advance: ₹{(ord.advanceAmount || 0).toLocaleString()}</span>
                            <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                            <span style={{ color: (ord.remainAmount ?? (ord.total - (ord.advanceAmount || 0))) > 0 ? '#ea580c' : '#16a34a', fontWeight: 600 }}>
                              Remaining: ₹{(ord.remainAmount !== undefined ? ord.remainAmount : Math.max(0, ord.total - (ord.advanceAmount || 0))).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>DELIVERY STATUS</span>
                          <div>
                            <span className={`adm-badge badge-${ord.status.toLowerCase()}`}>
                              <span className="adm-badge-dot"></span>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tracker Progress Bar */}
                      <div style={{ padding: '20px 24px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>
                          Package Tracking {ord.trackingNumber ? `(${ord.trackingNumber})` : ''}
                        </div>
                        <div className="usr-progress-bar">
                          <div className="usr-progress-line">
                            <div
                              className="usr-progress-fill"
                              style={{
                                width: ord.status === 'Delivered' ? '100%' : ord.status === 'Shipped' ? '66%' : ord.status === 'Processing' ? '33%' : '5%'
                              }}
                            ></div>
                          </div>

                          <div className="usr-step-node">
                            <div className={`usr-step-circle ${s1.done ? 'done' : 'active'}`}>✓</div>
                            <div className="usr-step-label">Ordered</div>
                          </div>

                          <div className="usr-step-node">
                            <div className={`usr-step-circle ${s2.done ? 'done' : s2.active ? 'active' : ''}`}>2</div>
                            <div className="usr-step-label">Processing</div>
                          </div>

                          <div className="usr-step-node">
                            <div className={`usr-step-circle ${s3.done ? 'done' : s3.active ? 'active' : ''}`}>3</div>
                            <div className="usr-step-label">Shipped</div>
                          </div>

                          <div className="usr-step-node">
                            <div className={`usr-step-circle ${s4.done ? 'done' : s4.active ? 'active' : ''}`}>4</div>
                            <div className="usr-step-label">Delivered</div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ padding: '20px 24px' }}>
                        {ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                            <Image
                              src={item.img}
                              alt={item.name}
                              width={60}
                              height={60}
                              style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{item.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>Qty: {item.quantity} &bull; ₹{item.price.toLocaleString()} each</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            Delivery to: <strong>{ord.customer.address}, {ord.customer.city}</strong>
                          </span>
                          <button
                            onClick={() => window.print()}
                            className="adm-btn-action"
                            style={{ background: '#f8fafc' }}
                          >
                            📄 Invoice / Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Profile & Address Section */
            <div className="usr-orders-card">
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Profile &amp; Delivery Address
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                Manage your contact details and default delivery address for faster checkout
              </p>

              {profileSaved && (
                <div className="adm-error-box" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d', marginBottom: 20 }}>
                  ✓ Profile &amp; delivery address saved successfully!
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Full Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Rohit Sharma"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="adm-input"
                      placeholder="10-digit mobile number"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Email Address</label>
                    <input
                      type="email"
                      className="adm-input"
                      placeholder="name@example.com"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Pincode</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="6-digit pincode"
                      value={userProfile.pincode}
                      onChange={(e) => setUserProfile({ ...userProfile, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="adm-form-label">Delivery Street Address</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Flat / House No., Building Name, Street"
                      value={userProfile.address}
                      onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">City</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="City"
                      value={userProfile.city}
                      onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">State</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="State"
                      value={userProfile.state}
                      onChange={(e) => setUserProfile({ ...userProfile, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="adm-btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
                    Save Address Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
