import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentUser } from '../services/auth';

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
