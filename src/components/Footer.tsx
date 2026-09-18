'use client';
import React from 'react';

export default function Footer() {
  return (
    <>
      {/* Newsletter Section */}
      <section className="nl-sec">
        <div className="nl-in">
          <span className="nl-label">Stay Updated</span>
          <h2 className="nl-title">Get Wellness Tips & Exclusive Offers</h2>
          <p className="nl-sub">
            Subscribe for health tips, new product launches, and exclusive subscriber-only discounts delivered to your inbox.
          </p>
          <form className="nl-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address..." required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-in">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo-wrap">
                <span style={{fontSize:26}}>🌿</span>
                <div>
                  <span style={{fontFamily:'var(--fh)',fontSize:20,fontWeight:700,color:'#fff',lineHeight:1,display:'block'}}>JEVANSROT</span>
                  <span style={{fontSize:9,fontWeight:400,color:'rgba(255,255,255,0.35)',letterSpacing:'2.5px',textTransform:'uppercase',display:'block',marginTop:2}}>SCIENCES</span>
                </div>
              </div>
              <p>
                Healthy Life Live Strong. We believe in the power of plants, made more powerful through cutting-edge nano technology.
              </p>
              <div className="socials">
                <a href="#" className="soc-ico" aria-label="Instagram">📷</a>
                <a href="#" className="soc-ico" aria-label="Facebook">👍</a>
                <a href="#" className="soc-ico" aria-label="WhatsApp">💬</a>
              </div>
            </div>

            {/* Shop */}
            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                <li><a href="#products">Best Sellers</a></li>
                <li><a href="#products">New Arrivals</a></li>
                <li><a href="#concerns">Energy & Fitness</a></li>
                <li><a href="#concerns">Men Health</a></li>
                <li><a href="#concerns">Women Health</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Shipping Info</a></li>
                <li><a href="#">Returns Policy</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="#">Mon–Sat, 9AM–6PM IST</a></li>
                <li><a href="https://wa.me/919205722107">WhatsApp Us</a></li>
              </ul>
              <div style={{marginTop:24}}>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:12,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>Secure Payments</p>
                <div className="pay-row">
                  <span className="pay-chip">UPI</span>
                  <span className="pay-chip">NetBanking</span>
                  <span className="pay-chip">RazorPay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Jevansrot Sciences. All Rights Reserved.</p>
            <div style={{display:'flex',gap:'1.5rem'}}>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
