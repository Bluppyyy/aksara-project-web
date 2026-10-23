# Integrasi Backend AKSARA

Frontend tersambung ke backend **`byEzry/Aksara-project-ASE`** (commit `1b78068`, "lengkapi kekurangan backend aksara, registrasi akademik, master data, dan pembersihan data demo"). Semua alur sudah dicoba end-to-end terhadap kode backend tersebut.

## Cara menjalankan

1. Di folder backend: `git pull`, `npm install`, isi `.env`, lalu `node server.js` (port 3000, dokumentasi di `/api-docs`).
2. Pastikan `migration.sql` dari backend sudah dijalankan di Supabase (SQL Editor) dan bucket Storage **`uploads`** ada (untuk sampul wawasan).
3. Di folder `aksara/`, file `.env` berisi `VITE_API_URL=/api` (diteruskan Vite ke `http://localhost:3000`).
4. Jalankan `npm run dev`. Kalau `.env` diubah, matikan dulu (Ctrl+C) lalu jalankan lagi.

Kalau `VITE_API_URL` kosong, web memakai **data contoh (mode demo)**.

## Peta halaman → endpoint backend

| Halaman / fitur | Endpoint |
|---|---|
| Daftar | `POST /register` (email, password, nama, nim, prodi, angkatan, kode_kelas, minat) |
| Masuk (mahasiswa & admin) | `POST /login` → `data.profile.role` |
| Eksplorasi & Hasil | `GET /resource-relevan` (+ `GET /resource` saat login untuk nama pengunggah, format, jumlah unduhan/dilihat) |
| Data master | `GET /kategori`, `GET /mata-kuliah`, `GET /prodi`, `GET /semester` |
| Filter Program Studi & Semester | dicocokkan dari `prodi_id` / `semester_id` resource |
| Detail resource | `GET /resource/:id`, `GET /rating-review/:resource_id` |
| Unduh dokumen | `GET /resource/:id/file` → signed URL (60 detik) |
| Ulasan · Laporkan | `POST /rating-review` · `POST /report` |
| Simpan / Koleksi | `POST /bookmark`, `GET /bookmark`, `DELETE /bookmark/:resource_id` |
| Unggah resource | `POST /resource` (multipart: judul, deskripsi, sumber, file, category_id, matkul_id, semester_id, prodi_id) |
| Wawasan (daftar · detail) | `GET /experience` · `GET /experience/:id` |
| Tulis wawasan | `POST /experience` (multipart: judul, sub_judul, konten, kategori, tags, sampul) |
| Admin — Kelola Resource | `GET /admin/resource`, `PUT /admin/resource/:id/status` (approved / rejected + alasan_penolakan / hidden), `DELETE /admin/resource/:id` |
| Admin — Kelola Laporan | `GET /admin/report`, `GET /admin/report/:id`, `PUT /admin/report/:id/status` (baru / ditinjau / selesai + catatan_admin) |
| Admin — Moderasi | `GET /admin/resource`, `GET /admin/experience`, `PUT /admin/experience/:id/status` (approved / rejected) |

Semua pemetaan data ada di `src/services/` (`adapters.js`, `resources.js`, `admin.js`, `wawasan.js`, `auth.js`, `master.js`).

## Catatan

| Hal | Penanganan |
|---|---|
| `GET /resource-relevan` belum mengirim nama pengunggah, format, jumlah unduhan | Dilengkapi dari `GET /resource` (hanya saat login) |
| Nama prodi di database ("S1 Data Sains") vs frontend ("S1 Sains Data") | Disamakan di `prodiLabel()` (`master.js`) |
| Wawasan belum bisa "disembunyikan" (backend hanya approved / rejected) | Tombol Sembunyikan tidak tampil untuk wawasan |
| Ulasan & rating untuk wawasan | Belum ada di backend, tidak ditampilkan |
| ZIP | Tidak diterima backend (hanya PDF, Word, PowerPoint, JPG/PNG/WebP, maks. 10 MB) |
