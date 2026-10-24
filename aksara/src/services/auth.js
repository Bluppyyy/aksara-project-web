import { api, USE_API, setSession, getSession } from './api';
import { initials } from './adapters';

/** Login → simpan token. Backend: POST /login → { data: { session, user } } */
export async function login(email, password) {
  if (!USE_API) {
    // Mode demo: tetap cek akun, supaya email/password sembarang tidak bisa masuk
    const account = getDemoAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) throw new Error('Invalid login credentials');
    const user = {
      email: account.email,
      nama: account.nama,
      role: account.role || 'mahasiswa',
      fakultas: account.fakultas || '',
      prodi: account.prodi || '',
      angkatan: account.angkatan || '',
      minat: account.minat || [],
    };
    setSession({ access_token: 'demo', user });
    return user;
  }
  const res = await api('/login', { method: 'POST', body: { email, password } });
  const session = res?.data?.session;
  if (!session?.access_token) throw new Error('Login gagal. Periksa kembali email dan kata sandi.');

  // Profil & peran dikirim backend di data.profile (FR-LOGIN-03)
  const p = res.data.profile;
  if (p?.role) {
    setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: p.user_id || null,
        email: p.email || email,
        nama: p.nama || email.split('@')[0],
        nim: p.nim || '',
        prodi: p.prodi || '',
        angkatan: p.angkatan || '',
        kelas: p.kode_kelas || '',
        minat: p.minat || [],
        role: p.role,
      },
    });
    return getSession().user;
  }

  // Cadangan kalau data.profile kosong (akun ada di Supabase Auth tapi belum ada di tabel "pengguna"):
  // profil dari browser, peran dicek lewat endpoint yang dijaga roleMiddleware
  const profile = getProfile(email);
  setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: { email, nama: profile.nama || email.split('@')[0], ...profile, role: 'mahasiswa' },
  });
  // /test-mahasiswa: 200 = mahasiswa, 403 = bukan mahasiswa, 404 = belum ada di tabel "pengguna"
  const role = await detectRole();
  setSession({ ...getSession(), user: { ...getSession().user, role } });
  return getSession().user;
}

/**
 * Cadangan penentuan peran saat login tidak mengirim data.profile.
 * Dicek lewat endpoint yang dijaga roleMiddleware: /test-mahasiswa (khusus mahasiswa) lalu /admin/experience (khusus admin).
 */
async function detectRole() {
  try {
    await api('/test-mahasiswa', { auth: true });
    return 'mahasiswa';
  } catch (err) {
    if (err.status === 404) {
      setSession(null);
      throw new Error(
        'Akun ini belum terdaftar di tabel "pengguna". Minta tim backend menambahkan akunmu (role: mahasiswa/admin).'
      );
    }
    if (err.status !== 403) {
      setSession(null);
      throw err;
    }
  }
  // Bukan mahasiswa → cek admin
  try {
    await api('/admin/experience', { auth: true });
    return 'admin';
  } catch (err) {
    if (err.status === 403) {
      setSession(null);
      throw new Error(
        'Peran akun ini tidak dikenali. Kolom "role" di tabel pengguna harus berisi "mahasiswa" atau "admin" (huruf kecil).'
      );
    }
    if (err.status === 401 || err.status === 0) {
      setSession(null);
      throw err;
    }
    return 'admin'; // lolos pengecekan peran admin, hanya datanya yang gagal dimuat
  }
}

/**
 * Daftar akun (FR-LOGIN-05). Backend: POST /register { email, password, nama, nim, prodi, angkatan, kode_kelas, minat }
 * → akun Supabase Auth + baris "pengguna" (role mahasiswa) dengan data profil lengkap.
 */
export async function register({ name, email, password, nim, fakultas, prodi, angkatan, kelas, minat }) {
  const profile = { nama: name, nim, fakultas, prodi, angkatan, kelas, minat: minat?.bidang || [] };
  if (!USE_API) {
    const accounts = getDemoAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already registered');
    }
    saveDemoAccounts([...accounts, { email, password, ...profile }]);
    return { email };
  }
  const res = await api('/register', {
    method: 'POST',
    body: { email, password, nama: name, nim, prodi, angkatan, kode_kelas: kelas, minat: profile.minat },
  });
  saveProfile(email, profile); // salinan lokal, dipakai login cadangan bila data.profile kosong
  return res.data;
}

// ---- Profil lokal (cadangan bila login tidak mengirim data.profile) ----
const PROFILE_KEY = 'aksara.profiles';
function getProfile(email) {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY))?.[email.toLowerCase()] || {};
  } catch {
    return {};
  }
}
function saveProfile(email, profile) {
  try {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
    all[email.toLowerCase()] = profile;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage tidak tersedia */
  }
}

export function logout() {
  // Backend belum punya POST /logout; token Supabase cukup dibuang dari browser
  setSession(null);
}

/** Halaman awal setelah login sesuai peran (FR-LOGIN-03) */
export function homeFor(user) {
  return isAdmin(user) ? '/admin' : '/';
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
