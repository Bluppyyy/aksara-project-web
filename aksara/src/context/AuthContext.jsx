import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentUser, homeFor } from '../services/auth';

const AuthContext = createContext(null);

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

/** User yang sedang login, atau null */
export function useAuth() {
  return useContext(AuthContext);
}

/** Bungkus halaman yang wajib login; kalau belum, arahkan ke /login lalu kembali lagi */
export function RequireAuth({ children }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}
