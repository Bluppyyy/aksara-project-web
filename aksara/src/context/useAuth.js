import { createContext, useContext } from 'react';

/** Context berisi user yang sedang login (diisi oleh <AuthProvider> di AuthContext.jsx) */
export const AuthContext = createContext(null);

/** User yang sedang login, atau null */
export function useAuth() {
  return useContext(AuthContext);
}
