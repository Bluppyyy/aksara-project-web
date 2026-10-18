import { api, USE_API, setSession, getSession } from './api';
import { initials } from './adapters';

/** Login → simpan token. Backend: POST /login → { data: { session, user } } */
export async function login(email, password) {
  if (!USE_API) {
    // Mode demo: tetap cek akun, supaya email/password sembarang tidak bisa masuk
    const account = getDemoAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) throw new Error('Invalid login credentials');
    const user = { email: account.email, nama: account.nama, role: account.role || 'mahasiswa' };
    setSession({ access_token: 'demo', user });
    return user;
  }
  const res = await api('/login', { method: 'POST', body: { email, password } });
  const session = res?.data?.session;
  if (!session?.access_token) throw new Error('Login gagal. Periksa kembali email dan kata sandi.');
  setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: { email, nama: res.data.user?.user_metadata?.nama || email.split('@')[0] },
  });
  // Lengkapi data user (role) dari backend; /test-auth dipakai sampai ada GET /me
  try {
    const me = await api('/test-auth', { auth: true });
    setSession({ ...getSession(), user: { ...getSession().user, ...me.user } });
  } catch {
    /* tidak fatal */
  }
  return getSession().user;
}

/**
 * Daftar akun. Backend saat ini baru menyimpan email + password;
 * nama & nomor telepon tetap dikirim supaya langsung tersimpan begitu backend menambah kolomnya.
 */
export async function register({ name, email, phone, password }) {
  if (!USE_API) {
    const accounts = getDemoAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already registered');
    }
    saveDemoAccounts([...accounts, { email, password, nama: name }]);
    return { email };
  }
  const res = await api('/register', {
    method: 'POST',
    body: { email, password, nama: name, no_telp: phone ? `+62${phone}` : undefined },
  });
  return res.data;
}

export function logout() {
  // TODO: panggil POST /logout begitu endpoint-nya ada
  setSession(null);
}

/** Halaman awal setelah login sesuai peran (FR-LOGIN-03) */
export function homeFor(user) {
  return user?.role === 'admin' ? '/admin' : '/';
}

export const isAdmin = (user) => user?.role === 'admin';

export function currentUser() {
  const user = getSession()?.user;
  return user ? { ...user, initials: initials(user.nama || user.email) } : null;
}

// ---- Mode demo (VITE_API_URL kosong) ----
// Akun disimpan di localStorage browser ini saja. Akun bawaan untuk mencoba:
//   mahasiswa → demo@aksara.id  / demo12345
//   admin     → admin@aksara.id / admin12345
const DEMO_ACCOUNTS_KEY = 'aksara.demoAccounts';
const DEFAULT_DEMO_ACCOUNTS = [
  { email: 'demo@aksara.id', password: 'demo12345', nama: 'Zulfan Falah', role: 'mahasiswa' },
  { email: 'admin@aksara.id', password: 'admin12345', nama: 'Administrator Repositori', role: 'admin' },
];

function getDemoAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY)) || [];
    return [...DEFAULT_DEMO_ACCOUNTS, ...saved];
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

function saveDemoAccounts(accounts) {
  try {
    const defaults = DEFAULT_DEMO_ACCOUNTS.map((a) => a.email);
    const own = accounts.filter((a) => !defaults.includes(a.email));
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(own));
  } catch {
    /* localStorage tidak tersedia */
  }
}
