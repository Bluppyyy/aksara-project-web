// Pembungkus fetch untuk semua panggilan ke backend AKSARA.
// - Base URL diambil dari VITE_API_URL (lihat .env.example)
// - Token login otomatis dikirim lewat header Authorization
// - Respons error backend ({ error: "..." }) diubah jadi ApiError dengan pesan yang bisa ditampilkan

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** true = backend disambungkan; false = website memakai data contoh */
export const USE_API = Boolean(BASE_URL);

const SESSION_KEY = 'aksara.session';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* localStorage tidak tersedia */
  }
  window.dispatchEvent(new Event('aksara:session'));
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const FRIENDLY = {
  401: 'Sesi kamu sudah berakhir. Silakan masuk lagi.',
  403: 'Kamu tidak punya akses untuk aksi ini.',
  404: 'Data tidak ditemukan.',
  500: 'Terjadi kesalahan di server. Coba lagi sebentar lagi.',
};

/**
 * Panggil endpoint backend.
 * @param {string} path  contoh: '/resource'
 * @param {{ method?: string, body?: object|FormData, auth?: boolean, query?: object }} options
 */
export async function api(path, { method = 'GET', body, auth = false, query } = {}) {
  const url = new URL(BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const session = getSession();
  if (auth || session?.access_token) {
    if (!session?.access_token && auth) throw new ApiError(FRIENDLY[401], 401);
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Tidak bisa terhubung ke server. Periksa koneksi internetmu.', 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && session) setSession(null); // token kedaluwarsa → keluar otomatis
    const message = data?.error && res.status < 500 ? data.error : FRIENDLY[res.status] || FRIENDLY[500];
    throw new ApiError(message, res.status);
  }
  return data;
}
