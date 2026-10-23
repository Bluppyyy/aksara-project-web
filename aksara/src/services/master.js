// Data master dari backend: kategori & mata kuliah (endpoint publik, di-cache sekali per sesi).
//   GET /kategori     → [{ category_id, nama_kategori }]
//   GET /mata-kuliah  → [{ matkul_id, nama_matkul, kode_matkul, sks, prodi_id, semester_id }]
import { api, USE_API } from './api';
import { CATEGORIES } from '../data/resources';

let kategoriReq = null;
let matkulReq = null;
let prodiReq = null;
let semesterReq = null;

const once = (getter, setter, path) => {
  if (!USE_API) return Promise.resolve([]);
  let req = getter();
  if (!req) {
    req = api(path)
      .then((r) => r.data || [])
      .catch((err) => {
        setter(null); // boleh dicoba lagi kalau gagal
        throw err;
      });
    setter(req);
  }
  return req;
};

export const getKategori = () =>
  once(
    () => kategoriReq,
    (v) => (kategoriReq = v),
    '/kategori'
  );
export const getMatkul = () =>
  once(
    () => matkulReq,
    (v) => (matkulReq = v),
    '/mata-kuliah'
  );
/** GET /prodi → [{ prodi_id, nama_prodi }] */
export const getProdi = () =>
  once(
    () => prodiReq,
    (v) => (prodiReq = v),
    '/prodi'
  );
/** GET /semester → [{ semester_id, nama_semester }] */
export const getSemester = () =>
  once(
    () => semesterReq,
    (v) => (semesterReq = v),
    '/semester'
  );

/**
 * Nama prodi di database → nama prodi yang dipakai frontend (PRODI_FIF).
 * Contoh: "S1 Data Sains" di database = "S1 Sains Data" di frontend.
 */
export function prodiLabel(nama = '') {
  const n = String(nama).toLowerCase();
  if (/data|sains/.test(n)) return 'S1 Sains Data';
  if (/rekayasa|perangkat lunak|software/.test(n)) return 'S1 Rekayasa Perangkat Lunak';
  if (/teknologi informasi|information tech/.test(n)) return 'S1 Teknologi Informasi';
  if (/informatika|informatics/.test(n)) return 'S1 Informatika';
  return nama;
}

/** "Semester 3" / "3" / "Ganjil 3" → 3 (null kalau tidak ada angkanya) */
export function semesterNumberOf(nama = '') {
  const m = String(nama).match(/\d+/);
  const n = m ? Number(m[0]) : NaN;
  return Number.isInteger(n) && n >= 1 && n <= 14 ? n : null;
}

/** prodi_id → nama prodi versi frontend */
export async function prodiMap() {
  const list = await getProdi().catch(() => []);
  return Object.fromEntries(list.map((p) => [String(p.prodi_id), prodiLabel(p.nama_prodi)]));
}

/** semester_id → angka semester */
export async function semesterMap() {
  const list = await getSemester().catch(() => []);
  return Object.fromEntries(list.map((s) => [String(s.semester_id), semesterNumberOf(s.nama_semester)]));
}

export const PRODI_KEY = Symbol('prodi');
export const SEMESTER_KEY = Symbol('semester');

/**
 * Semua data master yang dibutuhkan kartu resource sekaligus.
 * Dipakai adapter: matkul_id / prodi_id / semester_id → nama.
 */
export async function masterMaps() {
  const [matkul, prodi, semester] = await Promise.all([matkulMap(), prodiMap(), semesterMap()]);
  // Disimpan di objek matkul supaya tanda tangan adapter lama (toResourceCard(r, matkul)) tetap sama
  return Object.assign(matkul, { [PRODI_KEY]: prodi, [SEMESTER_KEY]: semester });
}

/**
 * Nama kategori di database → kunci kategori di frontend (warna badge, ikon, thumbnail).
 * Dicocokkan dari kata kunci supaya tetap jalan walau penamaan di database sedikit berbeda.
 */
const CATEGORY_RULES = [
  ['skripsi', /skripsi|tugas akhir|\bta\b|tesis/i],
  ['magang', /magang|pkl|kerja praktik|\bkp\b|internship/i],
  ['ujian', /soal|ujian|uts|uas|kuis|bank/i],
  ['riset', /riset|paper|publikasi|jurnal|penelitian|dataset/i],
  ['project', /proyek|project|praktikum|modul|source code|kode/i],
  ['tugas', /tugas|makalah|laporan|catatan|materi|kuliah/i],
];

export function categoryKeyOf(nama = '') {
  const hit = CATEGORY_RULES.find(([, re]) => re.test(nama));
  return hit ? hit[0] : 'lainnya';
}

/** Kunci kategori frontend → category_id di database (null kalau tidak ada padanannya) */
export async function categoryIdFor(key) {
  if (!key) return null;
  if (String(key).startsWith('k:')) return String(key).slice(2); // kunci langsung dari kategori database
  const list = await getKategori();
  const exact = list.find((k) => k.nama_kategori?.toLowerCase() === (CATEGORIES[key] || '').toLowerCase());
  const match = exact || list.find((k) => categoryKeyOf(k.nama_kategori) === key);
  return match ? match.category_id : null;
}

/** matkul_id → { kode, nama, semester } */
export async function matkulMap() {
  const list = await getMatkul().catch(() => []);
  return Object.fromEntries(
    list.map((m) => [
      String(m.matkul_id),
      { kode: m.kode_matkul, nama: m.nama_matkul, semester: m.semester_id, prodiId: m.prodi_id },
    ])
  );
}

/** Untuk test / setelah logout */
export function resetMasterCache() {
  kategoriReq = null;
  matkulReq = null;
  prodiReq = null;
  semesterReq = null;
}

/** Mode API: kategori database sebagai pilihan filter → [{ key: "k:<id>", label: nama_kategori }] */
export async function kategoriOptions() {
  const list = await getKategori();
  return list.map((k) => ({ key: `k:${k.category_id}`, label: k.nama_kategori }));
}
