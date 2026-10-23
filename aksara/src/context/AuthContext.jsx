import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentUser, homeFor, isAdmin } from '../services/auth';
import { AuthContext, useAuth } from './useAuth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(currentUser);

  useEffect(() => {
    const sync = () => setUser(currentUser());
    window.addEventListener('aksara:session', sync);
    window.addEventListener('storage', sync); // login/logout di tab lain
    return () => {
      window.removeEventListener('aksara:session', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

/**
 * Bungkus halaman yang wajib login; kalau belum, arahkan ke /login lalu kembali lagi
 * ke halaman yang sama (termasuk ?query, misalnya kata kunci pencarian).
 */
export function RequireAuth({
  children,
  notice = 'Masuk dulu untuk melanjutkan. Halaman ini khusus mahasiswa yang sudah login.',
}) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search, notice }} />;
  return children;
}

/**
 * Bungkus halaman yang hanya boleh dibuka peran tertentu (NFR-SEC-01).
 * Catatan: ini hanya untuk tampilan. Keamanan sebenarnya tetap di backend
 * (endpoint /admin/* dijaga roleMiddleware('admin')).
 */
export function RequireRole({ role, loginPath = '/login', children }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  const allowed = role === 'admin' ? isAdmin(user) : user.role === role;
  if (!allowed) return <Navigate to={homeFor(user)} replace />;
  return children;
}
