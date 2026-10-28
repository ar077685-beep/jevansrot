'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import './LoginModal.css';

interface GoogleIdTokenPayload {
  sub: string;
  name?: string;
  given_name?: string;
  email: string;
  picture?: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, loginWithEmail } = useUserAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Reset state on close
  const handleClose = useCallback(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
    closeLoginModal();
  }, [closeLoginModal]);

  // Google Identity Services (GIS) dynamic initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const googleObj = (window as unknown as { google?: { accounts?: { id?: { initialize: (cfg: unknown) => void } } } }).google;
        if (clientId && googleObj?.accounts?.id) {
          try {
            googleObj.accounts.id.initialize({
              client_id: clientId,
              callback: (response: GoogleCredentialResponse) => {
                if (response?.credential) {
                  try {
                    const base64Url = response.credential.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                      window.atob(base64)
                        .split('')
                        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    );
                    const payload: GoogleIdTokenPayload = JSON.parse(jsonPayload);
                    loginWithGoogle({
                      id: payload.sub,
                      name: payload.name || payload.given_name || 'Google User',
                      email: payload.email,
                      avatar: payload.picture,
                    });
                  } catch (e) {
                    console.error('Failed to parse Google JWT credential', e);
                  }
                }
              },
            });
          } catch (err) {
            console.error('Google GIS initialization error', err);
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [loginWithGoogle]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, handleClose]);

  // Handle Google Login Click (At bottom)
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleObj = (window as unknown as { google?: { accounts?: { id?: { prompt: () => void } } } }).google;

    // If real Google Client ID is configured, trigger Google prompt
    if (clientId && googleObj?.accounts?.id) {
      try {
        googleObj.accounts.id.prompt();
        setLoading(false);
        return;
      } catch {
        // Continue to direct sign in
      }
    }

    // Direct Google sign in
    try {
      setSuccessMsg('Signing in with Google...');
      setTimeout(async () => {
        await loginWithGoogle();
        setLoading(false);
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  // Handle Email & Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      setSuccessMsg(isSignUp ? 'Creating account...' : 'Signing in...');
      setTimeout(async () => {
        await loginWithEmail(email, name);
        setLoading(false);
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div
      className={`jm-overlay ${isLoginModalOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jm-modal-title"
    >
      <div className="jm-modal">
        {/* Close Button */}
        <button className="jm-close-btn" onClick={handleClose} aria-label="Close modal">
          ✕
        </button>

        {/* Clean Header */}
        <div className="jm-header">
          <h2 id="jm-modal-title">{isSignUp ? 'Create an Account' : 'Log In'}</h2>
          <p>
            {isSignUp
              ? 'Enter your details below to create your Jevansrot account'
              : 'Enter your email and password to access your account'}
          </p>
        </div>

        {/* Body */}
        <div className="jm-body">
          {errorMsg && (
            <div className="jm-alert error">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="jm-alert success">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Normal Email & Password Form */}
          <form onSubmit={handleEmailSubmit}>
            {isSignUp && (
              <div className="jm-form-group">
                <label className="jm-label">Full Name</label>
                <input
                  type="text"
                  className="jm-input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="jm-form-group">
              <label className="jm-label">Email Address</label>
              <input
                type="email"
                className="jm-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="jm-form-group">
              <label className="jm-label">Password</label>
              <input
                type="password"
                className="jm-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="jm-submit-btn"
              id="btn-login-submit"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Log In'}
            </button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <div className="jm-toggle-text">
            {isSignUp ? (
              <span>
                Already have an account?
                <button
                  type="button"
                  className="jm-toggle-btn"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                  }}
                >
                  Log In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?
                <button
                  type="button"
                  className="jm-toggle-btn"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                  }}
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="jm-divider">
            <span>OR</span>
          </div>

          {/* Google Login at Bottom */}
          <button
            type="button"
            className="jm-google-btn"
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
