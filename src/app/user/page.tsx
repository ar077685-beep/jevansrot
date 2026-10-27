'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Order, getStoredOrders, fetchOrdersFromServer, INITIAL_ORDERS } from '../../data/orders';
import '../admin/admin.css';

export default function UserPortalPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [userProfile, setUserProfile] = useState({
    name: 'Aman Verma',
    phone: '+91 98765 43210',
    email: 'aman.verma@example.com',
    address: 'Plot 42, Green Avenue, Sector 15',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001'
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setOrders(getStoredOrders());
    fetchOrdersFromServer().then(srv => { if (srv && srv.length) setOrders(srv); });
    const handleUpdate = () => setOrders(getStoredOrders());
    window.addEventListener('jevansrot_orders_updated', handleUpdate);
    return () => window.removeEventListener('jevansrot_orders_updated', handleUpdate);
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
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
                <span>👤</span> Customer Account
              </div>
              <h1 className="usr-title">Welcome back, {userProfile.name}</h1>
              <p className="usr-subtitle">
                Track your wellness orders, delivery schedules & health supplement subscriptions
              </p>
            </div>

            <div className="usr-quick-actions">
              <Link href="/cart" className="usr-btn-outline" id="user-to-cart-btn">
                <span>🛒</span> View Cart
              </Link>
              <Link href="/" className="usr-btn-outline" id="user-to-store-btn">
                <span>🛍️</span> Shop Supplements
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
              📦 My Orders ({orders.length})
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
              👤 Profile & Preferences
            </button>
          </div>

          {activeTab === 'orders' ? (
            <div className="usr-orders-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Recent Orders</h2>
                  <p style={{ fontSize: 13, color: '#64748b' }}>Live status and delivery tracking for all your Jevansrot products</p>
                </div>
                <Link href="/#products" style={{ fontSize: 13, fontWeight: 600, color: '#1a5c33', textDecoration: 'none' }}>
                  + Browse More Products →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>No orders placed yet</h3>
                  <p style={{ fontSize: 14, marginBottom: 20 }}>Explore our 100% natural nano-formulated health supplements.</p>
                  <Link href="/#products" className="adm-btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px' }}>
                    Shop Supplements Now
                  </Link>
                </div>
              ) : (
                orders.map((ord) => {
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

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <div className="usr-orders-card">
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Account & Shipping Info</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Update your saved address for one-click checkout across Jevansrot</p>

              {profileSaved && (
                <div className="adm-error-box" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d', marginBottom: 20 }}>
                  ✓ Profile and delivery address updated successfully!
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Full Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Phone Number</label>
                    <input
                      type="text"
                      className="adm-input"
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
                      value={userProfile.state}
                      onChange={(e) => setUserProfile({ ...userProfile, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="adm-btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
                    Save Changes
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
