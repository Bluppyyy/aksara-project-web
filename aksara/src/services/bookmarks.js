// GET /bookmark dipakai banyak halaman sekaligus (kartu resource, wawasan, koleksi, notifikasi).
// Permintaan yang berdekatan memakai satu request saja; cache dikosongkan setiap kali bookmark berubah.
import { api, getSession } from './api';

let cache = null;

/** Baris bookmark user yang login: [{ resource_id, experience_id, resource, experience }] */
export function fetchBookmarkRows() {
  const token = getSession()?.access_token;
  if (!token) return Promise.resolve([]);
  if (cache && cache.token === token && Date.now() - cache.at < 2000) return cache.promise;
  const promise = api('/bookmark', { auth: true }).then((res) => res.data || []);
  promise.catch(() => {
    cache = null;
  });
  cache = { token, at: Date.now(), promise };
  return promise;
}

export function invalidateBookmarks() {
  cache = null;
}
