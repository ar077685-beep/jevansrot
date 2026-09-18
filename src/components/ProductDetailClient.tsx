'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { Product } from '../data/products';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { cart, addToCart } = useCart();
  const router = useRouter();
  
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const handleBuyNow = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, img: product.img });
    router.push('/cart');
  };

  return (
    <div className="pdp-wrap" style={{ background: '#f1f3f6' }}>
      <div className="pdp-inner ecom-pdp-inner">
        
        {/* LEFT: Image Gallery */}
        <div className="ecom-img-col">
          <div className="ecom-thumbs">
            <div className="ecom-thumb" style={{ borderColor: 'var(--green)' }}>
              <Image src={product.img} alt={product.name} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
            {/* Mock extra thumbnails */}
            <div className="ecom-thumb">
              <Image src={product.img} alt={product.name} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.7 }} />
            </div>
          </div>
          <div className="ecom-main-img-box">
            <Image
              src={product.img}
              alt={product.name}
              width={400}
              height={400}
              priority
            />
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="ecom-info-col">
          <div className="bc-nav">
            <Link href="/">Home</Link>
            <span className="bc-sep">›</span>
            <Link href="/">Supplements</Link>
            <span className="bc-sep">›</span>
            <Link href="/">Jevansrot</Link>
            <span className="bc-sep">›</span>
            <span style={{ color: 'var(--text)' }}>{product.name}</span>
          </div>

          <h1 className="ecom-title">{product.vendor} {product.name}</h1>
          
          <div className="ecom-rating-bar">
            <div className="ecom-rating-badge">
              {product.rating}
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>{product.reviews.toLocaleString()} Ratings & Reviews</span>
            <Image src="/fssai.png" alt="FSSAI" width={60} height={20} style={{ marginLeft: '16px', opacity: 0 }} /> {/* Placeholder for fssai logo if needed */}
          </div>

          <div className="ecom-price-box">
            <span className="ecom-price-now">₹{product.price.toLocaleString()}</span>
            <span className="ecom-price-was">₹{product.compare.toLocaleString()}</span>
            <span className="ecom-price-off">{product.off} off</span>
            <span className="ecom-tax-note">Inclusive of all taxes</span>
          </div>

          <div className="ecom-offers">
            <h4>Available offers</h4>
            <div className="ecom-offer-item">
              <span>🚚 Delivery Offer</span>
              <span>Free delivery on all orders above ₹999. <a href="#" style={{ color: 'var(--green)' }}>T&C</a></span>
            </div>
            {!product.name.toLowerCase().includes('combo') && (
              <div className="ecom-offer-item">
                <span>🎁 Combo Offer</span>
                <span>Buy a combo pack to get an exclusive discount on your order. <a href="#" style={{ color: 'var(--green)' }}>T&C</a></span>
              </div>
            )}
            <div className="ecom-offer-item">
              <span>🏷️ Special Price</span>
              <span>Get a discount of {product.off} on this product. <a href="#" style={{ color: 'var(--green)' }}>T&C</a></span>
            </div>
          </div>

          {/* Delivery
          <div className="deliver-check-card" style={{ background: 'transparent', padding: '0 0 24px', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, boxShadow: 'none' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', width: '80px', display: 'inline-block' }}>Delivery</h4>
            <div className="pincode-row" style={{ display: 'inline-flex', width: 'auto' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter Delivery Pincode"
                value={pincode}
                onChange={e => { setPincode(e.target.value); setPincodeChecked(false); }}
                style={{ background: '#fff', border: 'none', borderBottom: '2px solid var(--green)', borderRadius: 0, padding: '8px 0', width: '200px' }}
              />
              <button onClick={() => { if (pincode.length === 6) setPincodeChecked(true); }} style={{ background: 'none', color: 'var(--green)', padding: '0 16px' }}>Check</button>
            </div>
            {pincodeChecked && (
              <div className="deliver-result" style={{ marginLeft: '84px', marginTop: '12px', background: 'transparent', padding: 0 }}>
                Delivery by <strong>{new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}</strong> | <span style={{ color: 'var(--green)' }}>Free</span>
              </div>
            )}
          </div>
          */}

          {/* Highlights */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="ecom-highlights-row">
              <div className="ecom-hl-label">Highlights</div>
              <ul className="ecom-hl-list">
                {product.benefits.map((ben, idx) => (
                  <li key={idx}>{ben}</li>
                ))}
                <li>Form: Liquid/Capsule</li>
                <li>100% Plant Based</li>
                <li>FSSAI Certified</li>
              </ul>
            </div>
          )}

          {/* Seller */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
            <div className="ecom-hl-label">Seller</div>
            <div>
              <div style={{ color: 'var(--green)', fontWeight: '600', marginBottom: '8px' }}>Jevansrot Official Store <span className="ecom-rating-badge" style={{ display: 'inline-flex', marginLeft: '8px', fontSize: '12px' }}>4.9 ★</span></div>
              <ul style={{ listStyle: 'disc', paddingLeft: '16px', fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>7 Days Replacement Policy</li>
                <li>GST invoice available</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ecom-actions">
            <button 
              className="btn-atc"
              onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, img: product.img })}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              ADD TO CART
            </button>
            <button 
              className="btn-buy"
              onClick={handleBuyNow}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 10V8c0-2.21 1.79-4 4-4s4 1.79 4 4v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm4-4c-1.1 0-2 .9-2 2v2h4V8c0-1.1-.9-2-2-2zm0 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
              BUY NOW
            </button>
          </div>

          <div className="ecom-desc-box">
            <h3>Product Description</h3>
            <p>{product.description}</p>
            
            {product.ingredients && product.ingredients.length > 0 && (
              <>
                <h4 style={{ marginBottom: '12px' }}>Key Ingredients</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '24px', fontSize: '15px', color: 'var(--text-mid)', marginBottom: '24px' }}>
                  {product.ingredients.map((ing, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{ing}</li>)}
                </ul>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
