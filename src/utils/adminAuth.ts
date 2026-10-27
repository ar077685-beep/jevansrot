export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const AUTH_KEY = 'jevansrot_admin_authenticated';
const USER_KEY = 'jevansrot_admin_user_info';

export const DEMO_ADMIN = {
  email: 'admin@jevansrot.com',
  password: 'admin',
  name: 'Aman Sharma',
  role: 'Operations & Store Manager'
};

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function loginAdminApi(email: string, pass: string): Promise<{ success: boolean; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        window.dispatchEvent(new Event('jevansrot_admin_auth_changed'));
      }
      return { success: true };
    }

    return {
      success: false,
      message: data.message || 'Invalid credentials. Use demo email: admin@jevansrot.com and password: admin'
    };
  } catch {
    // Fallback if network offline
    return loginAdmin(cleanEmail, cleanPass);
  }
}

export function loginAdmin(email: string, pass: string): { success: boolean; message?: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Window not available' };

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Accept admin@jevansrot.com or admin as username
  const isEmailMatch = cleanEmail === 'admin@jevansrot.com' || cleanEmail === 'admin';
  const isPassMatch = cleanPass === 'admin' || cleanPass === 'admin123';

  if (isEmailMatch && isPassMatch) {
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        role: DEMO_ADMIN.role
      })
    );
    window.dispatchEvent(new Event('jevansrot_admin_auth_changed'));
    return { success: true };
  }

  return {
    success: false,
    message: 'Invalid credentials. Use demo email: admin@jevansrot.com and password: admin'
  };
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('jevansrot_admin_auth_changed'));
  }
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }
}
