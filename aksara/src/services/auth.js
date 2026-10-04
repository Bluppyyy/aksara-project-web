import { api, USE_API, setSession, getSession } from './api';
import { initials } from './adapters';

/** Login → simpan token. Backend: POST /login → { data: { session, user } } */
export async function login(email, password) {
  if (!USE_API) {
    const user = { email, nama: email.split('@')[0], role: 'mahasiswa' };
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
  if (!USE_API) return { email };
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

export function currentUser() {
  const user = getSession()?.user;
  return user ? { ...user, initials: initials(user.nama || user.email) } : null;
}
