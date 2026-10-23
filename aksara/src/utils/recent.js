// "Terakhir Dilihat" — riwayat resource yang dibuka, disimpan per akun di browser.
// Backend belum punya endpoint riwayat, jadi cukup di localStorage (maks. 6 item).
import { currentUser } from '../services/auth';

const MAX = 6;
const keyFor = (user) => (user?.email ? `aksara.recent.${user.email.toLowerCase()}` : null);

export function getRecent(user = currentUser()) {
  const key = keyFor(user);
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

/** Timpa seluruh riwayat (dipakai setelah diperbarui dari backend) */
export function saveRecent(list, user = currentUser()) {
  const key = keyFor(user);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(list.map(({ bookmarked: _b, ...card }) => card).slice(0, MAX)));
  } catch {
    /* penyimpanan penuh / diblokir: abaikan */
  }
}

export function addRecent(resource, user = currentUser()) {
  const key = keyFor(user);
  if (!key || !resource?.id) return;
  // thumbnail hasil import Vite berupa URL string, aman disimpan
  const { bookmarked: _bookmarked, ...card } = resource; // status simpan tidak ikut disimpan
  const list = [card, ...getRecent(user).filter((r) => r.id !== card.id || r.title !== card.title)].slice(0, MAX);
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* penyimpanan penuh / diblokir: abaikan */
  }
}
