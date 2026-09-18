'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';



const concerns = [
  { em: '⚡', name: 'Energy & Fitness', cnt: '8 Products' },
  { em: '🧠', name: 'Brain Care', cnt: '5 Products' },
  { em: '🦴', name: 'Bone & Joint', cnt: '6 Products' },
  { em: '💚', name: 'Men Health', cnt: '7 Products' },
  { em: '🌸', name: 'Women Health', cnt: '9 Products' },
];

const whyItems = [
  { icon: '🔬', title: 'BioEnhance Nano Technology', desc: 'Our patented nano-particle technology increases bioavailability up to 5X vs conventional supplements.' },
  { icon: '🌿', title: 'Zero Artificial Additives', desc: 'Every ingredient sourced from nature. Zero synthetic additives, artificial colors or chemical fillers.' },
  { icon: '✅', title: 'GMP & FSSAI Certified', desc: 'Manufactured in WHO-GMP certified facilities under strict quality protocols approved by FSSAI.' },
  { icon: '💧', title: 'Aqueous Extraction', desc: 'Water-based extraction preserves bioactive compounds without chemical residues or harsh solvents.' },
  { icon: '🏷️', title: 'Clean Label Promise', desc: 'Every ingredient clearly listed. No hidden additives. Full transparency in every product.' },
  { icon: '🧪', title: 'Third Party Tested', desc: 'Every batch tested by NABL-accredited labs for purity, potency and safety before reaching you.' },
];

const testimonials = [
  {
    text: 'Been taking this for 3 months and the results are remarkable. High quality ingredients and nano formulation really makes a difference in absorption!',
    product: 'Jevansrot Special Formula',
    name: 'Rohit Sharma',
    loc: 'Delhi',
    color: '#1a5c33',
    initials: 'RS',
  },
  {
    text: 'Excellent product! My energy levels have improved significantly. 100% plant based and the ingredients are clean and transparent.',
    product: 'Jevansrot Daily Vitality',
    name: 'Priya M.',
    loc: 'Mumbai',
    color: '#246b3a',
    initials: 'PM',
  },
  {
    text: 'Premium quality product. I feel more energetic and my gym performance has improved. The nano formulation really does absorb better!',
    product: 'Jevansrot Power Pack',
    name: 'Arjun K.',
    loc: 'Bangalore',
    color: '#143d23',
    initials: 'AK',
  },
  {
    text: 'Great quality supplements! Love that they are FSSAI certified and 100% plant based. Will definitely reorder. Highly recommend Jevansrot!',
    product: 'Jevansrot Organic Care',
    name: 'Anita R.',
    loc: 'Chennai',
    color: '#1d6636',
    initials: 'AR',
  },
  {
    text: 'Finally a transparent supplement brand. The nano formula helped regulate my overall vitality. Best health investment I have made!',
    product: 'Jevansrot Special Formula',
    name: 'Vikram S.',
    loc: 'Hyderabad',
    color: '#3d8152',
    initials: 'VS',
  },
  {
    text: 'The wellness product has helped tremendously. Natural, effective and very well priced. Jevansrot is now my go-to brand!',
    product: 'Jevansrot Daily Vitality',
    name: 'Meena T.',
    loc: 'Mumbai',
    color: '#1a5c33',
    initials: 'MT',
  },
];

const mqItems = [
  '★ 4.8 Rating', '50,000+ Happy Customers', '100% Plant Based', 'FSSAI Certified',
  'Nano Formulated', 'Zero Artificial Additives', 'GMP Certified', '5X Bioavailability',
  '30 Days Money Back', 'Free Shipping ₹999+',
];

export default function Home() {
  const { cart, addToCart, updateQuantity } = useCart();
  const getQty = (id: string) => cart.find(i => i.id === id)?.quantity ?? 0;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-in">
          {loading ? (
            <>
              <div className="skel-hero-text">
                <div className="skeleton skel-title" style={{ width: '120px', height: '24px', borderRadius: '100px' }}></div>
                <div className="skeleton skel-title" style={{ width: '80%', height: '56px' }}></div>
                <div className="skeleton skel-text"></div>
                <div className="skeleton skel-text"></div>
                <div className="skeleton skel-text" style={{ width: '60%' }}></div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '30px' }}>
                  <div className="skeleton" style={{ width: '120px', height: '48px', borderRadius: '8px' }}></div>
                  <div className="skeleton" style={{ width: '140px', height: '48px', borderRadius: '8px' }}></div>
                </div>
              </div>
              <div className="skeleton skel-hero-img"></div>
            </>
          ) : (
            <>
              <div>
                <span className="hero-tag">Plant Based & Nano Formulated</span>
                <h1 className="hero-title">
                  Healthy Life<br />
                  <span className="gold">Live Strong</span>
                </h1>
                <p className="hero-sub">
                  India&apos;s 1st Nano formulated nutraceutical brand. Experience up to{' '}
                  <strong>5X better absorption</strong> with our patented BioEnhance™ technology — pure plants, smarter science.
                </p>
                <div className="hero-btns">
                  <button className="btn-main" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                    Shop Now
                  </button>
                  <button className="btn-sec" onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}>
                    Explore Science
                  </button>
                </div>
                <div className="hero-stats">
                  <div className="hstat"><span className="num">50K+</span><span className="lbl">Happy Customers</span></div>
                  <div className="hstat"><span className="num">5X</span><span className="lbl">Higher Bioavailability</span></div>
                  <div className="hstat"><span className="num">4.8★</span><span className="lbl">Avg Rating</span></div>
                </div>
              </div>

              <div className="hero-img-box">
                <Image
                  src="/products/highpower-combo-3999.webp"
                  alt="Jevansrot Featured Image"
                  width={500}
                  height={500}
                  className="hero-img-main"
                  priority
                />
                <div className="hero-float f1">
                  <span className="dot"></span>
                  FSSAI &amp; GMP Certified
                </div>
                <div className="hero-float f2">
                  <span className="dot"></span>
                  Free Shipping ₹999+
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            FSSAI &amp; GMP Certified
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Zero Artificial Additives
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            Free Shipping Above ₹999
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            BioEnhance Nano Technology
          </div>
        </div>
      </div>

      {/* Marquee Bar */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[...mqItems, ...mqItems].map((item, i) => (
            <span key={i} className="mqitem">
              <span className="star">★</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      <section className="sec" id="products">
        <div className="sec-in">
          <div className="sec-header">
            <span className="sec-label">Our Products</span>
            <h2 className="sec-title">Best Sellers</h2>
            <p className="sec-sub">
              Discover top-rated nano-formulated supplements trusted by 50,000+ customers across India. All products are 100% plant based and FSSAI certified.
            </p>
          </div>
          <div className="prod-grid">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="prod-card skel-prod-card">
                  <div className="skeleton skel-prod-img"></div>
                  <div className="skeleton skel-text" style={{ width: '40%' }}></div>
                  <div className="skeleton skel-title" style={{ height: '20px', width: '80%', margin: 0 }}></div>
                  <div className="skeleton skel-text" style={{ width: '60%' }}></div>
                  <div className="skeleton" style={{ height: '44px', width: '100%', marginTop: 'auto', borderRadius: '8px' }}></div>
                </div>
              ))
            ) : (
              products.map((p) => (
                <div key={p.id} className="prod-card">
                  <div className="prod-badges">
                    <span className={`badge ${p.badge}`}>{p.badgeLabel}</span>
                    {p.isNew && <span className="badge b-new">New</span>}
                  </div>
                  <button className="wl-ico" aria-label="Wishlist">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </button>
                  <div className="prod-img-wrap">
                    <Link href={`/product/${p.slug}`}>
                      <Image src={p.img} alt={p.name} width={300} height={300} className="prod-img" style={{ cursor: 'pointer' }} />
                    </Link>
                  </div>
                  <div className="prod-body">
                    <div className="prod-vendor">{p.vendor}</div>
                    <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <div className="prod-name" style={{ cursor: 'pointer' }}>{p.name}</div>
                    </Link>
                    <div className="prod-rating">
                      <span className="stars-ico">{'★'.repeat(Math.floor(p.rating))}</span>
                      <span className="rcount">({p.reviews.toLocaleString()})</span>
                    </div>
                    <div className="prod-price-atc">
                      <div className="prod-prices-row">
                        <span className="price-now">&#8377;{p.price.toLocaleString()}</span>
                        <span className="price-was">&#8377;{p.compare.toLocaleString()}</span>
                        <span className="price-save">{p.off}</span>
                      </div>
                      <div className="prod-atc-row">
                        {getQty(p.id) === 0 ? (
                          <button
                            className="atc-btn-full"
                            onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, img: p.img })}
                          >
                            + Add to Cart
                          </button>
                        ) : (
                          <div className="card-qty-ctrl-full">
                            <button
                              className="card-qty-btn-full"
                              onClick={() => updateQuantity(p.id, getQty(p.id) - 1)}
                            >&#8722;</button>
                            <span className="card-qty-num-full">{getQty(p.id)}</span>
                            <button
                              className="card-qty-btn-full"
                              onClick={() => updateQuantity(p.id, getQty(p.id) + 1)}
                            >+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Nano / Science Section */}
      <section className="nano-sec" id="technology">
        <div className="nano-in">
          <div>
            <span className="nano-label">Our Science</span>
            <h2 className="nano-title">
              BioEnhance™ <span className="au">Nano Formula</span>
            </h2>
            <p className="nano-text">
              Our patented nanotechnology converts plant extracts into ultra-small particles your body absorbs up to 5X better than conventional supplements. No chemicals, just smarter science.
            </p>
            <div className="nano-feats">
              <div className="nano-feat">
                <div className="nano-feat-icon">🔬</div>
                <div className="nano-feat-body">
                  <h4>Nano-Particle Conversion</h4>
                  <p>Plant extracts broken into 50-200nm particles for superior cellular uptake.</p>
                </div>
              </div>
              <div className="nano-feat">
                <div className="nano-feat-icon">💧</div>
                <div className="nano-feat-body">
                  <h4>Aqueous Extraction</h4>
                  <p>Water-based extraction preserves bioactive compounds without chemical residues.</p>
                </div>
              </div>
              <div className="nano-feat">
                <div className="nano-feat-icon">🎯</div>
                <div className="nano-feat-body">
                  <h4>Targeted Delivery</h4>
                  <p>Nano-particles penetrate cell membranes directly for faster, effective results.</p>
                </div>
              </div>
              <div className="nano-feat">
                <div className="nano-feat-icon">🌱</div>
                <div className="nano-feat-body">
                  <h4>Zero Synthetic Carriers</h4>
                  <p>No artificial binders or fillers — just pure plant intelligence, perfected.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nano-right">
            <div className="nano-big-card">
              <div className="nano-circle">🌿</div>
              <h3>Converting nature&apos;s best into nano-particles for maximum benefit</h3>
              <p>Higher Bioavailability</p>
            </div>
            <div className="nano-stats">
              <div className="nano-stat">
                <span className="big">5X</span>
                <span className="sm">Better Absorption</span>
              </div>
              <div className="nano-stat">
                <span className="big">50K+</span>
                <span className="sm">Happy Customers</span>
              </div>
              <div className="nano-stat">
                <span className="big">100%</span>
                <span className="sm">Plant Based</span>
              </div>
              <div className="nano-stat">
                <span className="big">4.8★</span>
                <span className="sm">Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Concern */}
      <section className="sec" id="concerns">
        <div className="sec-in">
          <div className="sec-header">
            <span className="sec-label">Health Goals</span>
            <h2 className="sec-title">Shop by <span className="g">Concern</span></h2>
            <p className="sec-sub">Select your specific health goal to discover customized nano-formulated herbal solutions.</p>
          </div>
          <div className="concerns-grid">
            {concerns.map((c, i) => (
              <a key={i} href="#products" className="concern-card">
                <div className="concern-em">{c.em}</div>
                <div className="concern-name">{c.name}</div>
                <span className="concern-cnt">{c.cnt}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Jevansrot */}
      <section className="sec why-sec" id="why">
        <div className="sec-in">
          <div className="sec-header">
            <span className="sec-label">Our Promise</span>
            <h2 className="sec-title">Why <span className="g">Jevansrot</span></h2>
            <p className="sec-sub">We believe you deserve supplements that are safe, effective and transparent. Here is our promise to you.</p>
          </div>
          <div className="why-grid">
            {whyItems.map((w, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <div className="why-title">{w.title}</div>
                <div className="why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="sec" id="testimonials">
        <div className="sec-in">
          <div className="sec-header">
            <span className="sec-label">Customer Reviews</span>
            <h2 className="sec-title">Join 50,000+ satisfied customers</h2>
            <p className="sec-sub">who have experienced the Jevansrot difference in their health journey.</p>
          </div>
          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="t-stars">★★★★★</div>
                <p className="t-text">&ldquo;{t.text}&rdquo;</p>
                <span className="t-prod-tag">{t.product}</span>
                <div className="t-user">
                  <div className="t-avatar" style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-loc">{t.loc}</div>
                    <div className="t-ver">✔ Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
