'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import { createNewOrder } from '../../data/orders';
import Navbar from '../../components/Navbar';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user } = useUserAuth();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'UPI / QR' as 'UPI / QR' | 'Cash on Delivery'
  });

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('jevansrot_user_shipping_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed) {
          setShippingForm((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
            email: parsed.email || prev.email,
            address: parsed.address || prev.address,
            city: parsed.city || prev.city,
            state: parsed.state || prev.state,
            pincode: parsed.pincode || prev.pincode,
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const delivery = cartTotal >= 999 ? 0 : 79;
  const finalTotal = cartTotal - discount + delivery;

  const handleCoupon = () => {
    if (coupon.trim().toUpperCase() === 'HEALTHY10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try HEALTHY10');
      setCouponApplied(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    setTimeout(() => {
      createNewOrder({
        customer: {
          name: shippingForm.name,
          phone: shippingForm.phone,
          email: shippingForm.email,
          address: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.pincode
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          img: item.img
        })),
        subtotal: cartTotal,
        discount: discount,
        shipping: delivery,
        total: finalTotal,
        advanceAmount: 0,
        remainAmount: finalTotal,
        paymentMethod: shippingForm.paymentMethod,
        paymentStatus: 'Pending',
        status: 'Pending',
        notes: `Order placed via store checkout (${shippingForm.paymentMethod}). Payment set to Pending for admin verification.`
      });

      clearCart();
      setCheckoutModalOpen(false);
      setOrderSubmitting(false);
      router.push('/user');
    }, 500);
  };

  return (
    <>
      <Navbar />
      <div className="cart-page-wrap">
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <div className="cart-bc-inner">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Shopping Cart</span>
          </div>
        </div>

        <div className={`cart-layout${cart.length === 0 ? ' is-empty' : ''}`}>
          {/* LEFT — Items */}
          <div className={`cart-left${cart.length === 0 && !loading ? ' is-empty' : ''}`}>
            {loading ? (
              <div className="cart-items-list">
                <div className="skeleton skel-title" style={{ width: '200px', margin: '20px 0' }}></div>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="skel-cart-item">
                    <div className="skeleton skel-cart-img"></div>
                    <div className="skel-cart-info">
                      <div className="skeleton skel-text" style={{ width: '40%' }}></div>
                      <div className="skeleton skel-title" style={{ width: '70%', height: '20px' }}></div>
                      <div className="skeleton skel-text" style={{ width: '30%' }}></div>
                      <div className="skeleton" style={{ width: '100px', height: '36px', marginTop: '16px', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cart.length === 0 ? (
              <div className="cart-empty-page">
                <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '120px', height: '120px', background: '#edf5ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '60px', height: '60px', fill: 'none', stroke: '#1a5c33', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                </div>
                <h2>Your cart is empty!</h2>
                <p>Add items to get started. 50,000+ customers trust Jevansrot.</p>
                <Link href="/" className="btn-shop-now">Continue Shopping</Link>
              </div>
            ) : (
              <>
                <div className="cart-items-header">
                  <h1>My Cart <span>({cart.reduce((a, i) => a + i.quantity, 0)} items)</span></h1>
                  <div className="cart-free-ship-bar">
                    {cartTotal >= 999
                      ? <><span className="ship-check">✓</span> You qualify for FREE delivery!</>
                      : <>Add <strong>₹{(999 - cartTotal).toLocaleString()}</strong> more to get FREE delivery!</>
                    }
                  </div>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      {/* Image */}
                      <div className="cart-item-img-wrap">
                        <Image
                          src={item.img}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="cart-item-img"
                        />
                      </div>

                      {/* Details */}
                      <div className="cart-item-details">
                        <div className="cart-item-brand">Jevansrot</div>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-tags">
                          <span className="itag green">✓ In Stock</span>
                          <span className="itag">🌿 100% Plant Based</span>
                          <span className="itag">✅ FSSAI Certified</span>
                        </div>
                        <div className="cart-item-price-row">
                          <span className="cart-price-main">₹{item.price.toLocaleString()}</span>
                          <span className="cart-price-per">per unit</span>
                        </div>
                        <div className="cart-item-subtotal">
                          Item total: <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                        </div>

                        {/* Actions */}
                        <div className="cart-item-actions">
                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="qty-num">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="item-action-btns">
                            <button
                              className="item-remove-btn"
                              onClick={() => removeFromCart(item.id)}
                            >
                              🗑 Remove
                            </button>
                            <button className="item-wishlist-btn">
                              ♡ Save for later
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Check
                <div className="deliver-check-card">
                  <h3>📦 Check Delivery</h3>
                  <div className="pincode-row">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={e => { setPincode(e.target.value); setPincodeChecked(false); }}
                    />
                    <button onClick={() => { if (pincode.length === 6) setPincodeChecked(true); }}>Check</button>
                  </div>
                  {pincodeChecked && (
                    <div className="deliver-result">
                      <span className="ship-check">✓</span> Delivery available to <strong>{pincode}</strong> — usually 3–5 business days.
                    </div>
                  )}
                </div>
                */}

                {/* Coupon */}
                <div className="coupon-card">
                  <h3>🏷️ Apply Coupon</h3>
                  <div className="coupon-row">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); setCouponError(''); }}
                    />
                    <button onClick={handleCoupon}>Apply</button>
                  </div>
                  {couponApplied && (
                    <div className="coupon-success">
                      🎉 Coupon <strong>HEALTHY10</strong> applied! You save ₹{discount.toLocaleString()}.
                    </div>
                  )}
                  {couponError && <div className="coupon-error">{couponError}</div>}
                  {/* <div className="coupon-hint">💡 Try code <strong>HEALTHY10</strong> for 10% off</div> */}
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Price Summary */}
          {(cart.length > 0 || loading) && (
            <div className="cart-right">
              {loading ? (
                <>
                  <div className="price-box skeleton" style={{ height: '300px', marginBottom: '20px' }}></div>
                  <div className="checkout-box skeleton skel-checkout-box"></div>
                </>
              ) : (
                <>
              {/* Price Details */}
              <div className="price-box">
                <h3 className="price-box-title">PRICE DETAILS</h3>
                <div className="price-rows">
                  <div className="price-row">
                    <span>Price ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="price-row green">
                      <span>Coupon Discount (HEALTHY10)</span>
                      <span>− ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={`price-row ${delivery === 0 ? 'green' : ''}`}>
                    <span>Delivery Charges</span>
                    <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                  </div>
                  {!couponApplied && (
                    <div className="price-row muted">
                      <span>Promo Savings</span>
                      <span>Apply coupon to save</span>
                    </div>
                  )}
                </div>
                <div className="price-total-row">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
                {couponApplied && (
                  <div className="savings-badge">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                    You save ₹{(discount + (delivery === 0 ? 79 : 0)).toLocaleString()} on this order!
                  </div>
                )}
              </div>

              {/* Checkout Options */}
              <div className="checkout-box">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Choose Checkout Method
                </h3>

                {/* Instant Online Order button */}
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#143d23',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 12px rgba(20,61,35,0.2)'
                  }}
                  id="cart-checkout-proceed-btn"
                >
                  <span>⚡</span>
                  Place Order Now (₹{finalTotal.toLocaleString()})
                </button>

                {/* UPI QR */}
                <div className="checkout-method">
                  <div className="checkout-method-header">
                    <span className="checkout-method-icon" style={{ display: 'flex' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </span>
                    <div>
                      <div className="checkout-method-title">Scan & Pay via UPI</div>
                      <div className="checkout-method-sub">GPay, PhonePe, Paytm, BHIM & more</div>
                    </div>
                  </div>
                  <div className="qr-box">
                    <Image src="/q.jpeg" alt="UPI QR Code" width={360} height={360} className="qr-img" />
                  </div>
                  <div className="upi-id-row">
                    <span className="upi-label">UPI ID:</span>
                    <span className="upi-val">jevansrot@upi</span>
                    <button
                      className="upi-copy"
                      onClick={() => navigator.clipboard.writeText('jevansrot@upi')}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      Copy
                    </button>
                  </div>
                </div>

                {/* WhatsApp Confirm */}
                <a
                  href={`https://wa.me/919205722107?text=Hello%2C%20I%20have%20placed%20an%20order%20worth%20%E2%82%B9${finalTotal.toLocaleString()}%20at%20Jevansrot.%20Please%20confirm%20my%20order!`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-checkout-btn"
                >
                  <span>💬</span>
                  Confirm Order via WhatsApp
                </a>
                <p className="checkout-note">
                  After payment, click above to send a screenshot & confirm your order instantly.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges-box">
                <div className="tb-item"><span>🔒</span> 100% Secure Payment</div>
                <div className="tb-item"><span>🚚</span> Free Delivery on ₹999+</div>
                <div className="tb-item"><span>↩️</span> Easy 30-day returns</div>
                <div className="tb-item"><span>✅</span> FSSAI Certified Products</div>
              </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="adm-modal-overlay" onClick={() => setCheckoutModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Complete Your Order
                </h2>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Total Payable: <strong>₹{finalTotal.toLocaleString()}</strong> ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                </div>
              </div>
              <button className="adm-modal-close" onClick={() => setCheckoutModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="adm-modal-body">
                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Shipping & Contact Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Full Name</label>
                      <input
                        type="text"
                        className="adm-input"
                        required
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Phone Number</label>
                      <input
                        type="text"
                        className="adm-input"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Street Address</label>
                      <input
                        type="text"
                        className="adm-input"
                        required
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>City</label>
                      <input
                        type="text"
                        className="adm-input"
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Pincode</label>
                      <input
                        type="text"
                        className="adm-input"
                        required
                        value={shippingForm.pincode}
                        onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-modal-section">
                  <div className="adm-modal-section-title">Select Payment Mode</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <label style={{ flex: '1 1 200px', border: `2px solid ${shippingForm.paymentMethod === 'UPI / QR' ? '#143d23' : '#e2e8f0'}`, borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: shippingForm.paymentMethod === 'UPI / QR' ? '#edf5ef' : '#fff' }}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={shippingForm.paymentMethod === 'UPI / QR'}
                        onChange={() => setShippingForm({ ...shippingForm, paymentMethod: 'UPI / QR' })}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>UPI / QR Payment</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Instant verification</div>
                      </div>
                    </label>

                    <label style={{ flex: '1 1 200px', border: `2px solid ${shippingForm.paymentMethod === 'Cash on Delivery' ? '#143d23' : '#e2e8f0'}`, borderRadius: 8, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: shippingForm.paymentMethod === 'Cash on Delivery' ? '#edf5ef' : '#fff' }}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={shippingForm.paymentMethod === 'Cash on Delivery'}
                        onChange={() => setShippingForm({ ...shippingForm, paymentMethod: 'Cash on Delivery' })}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Cash on Delivery</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Pay on doorstep</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-action"
                  onClick={() => setCheckoutModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn-primary"
                  style={{ width: 'auto', padding: '10px 24px' }}
                  disabled={orderSubmitting}
                  id="checkout-confirm-submit-btn"
                >
                  {orderSubmitting ? 'Confirming Order...' : `Confirm Order (₹${finalTotal.toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
