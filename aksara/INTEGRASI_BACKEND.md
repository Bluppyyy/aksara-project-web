# Integrasi Backend AKSARA

Frontend tersambung ke backend [`byEzry/Aksara-project-ASE`](https://github.com/byEzry/Aksara-project-ASE) (commit `039c482`, "revisi ASE - pratinjau admin, unduhan counter, email admin, rating, view count, dan bookmark wawasan").

## Cara menjalankan

1. Di folder backend: `npm install`, isi `.env`, lalu `node server.js` (port 3000).
2. Pastikan `migration.sql` dari backend sudah dijalankan di Supabase (SQL Editor).
3. Di folder `aksara/`: `npm run dev`. Request `/api/*` diteruskan Vite ke `http://localhost:3000`.

Mode demo (tanpa backend): buat `aksara/.env.development.local` berisi `VITE_API_URL=` (kosong).

## Peta halaman → endpoint

| Halaman / fitur            | Endpoint                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Daftar                     | `POST /register` (email, password, nama, nim, prodi, angkatan, kode_kelas, minat)                           |
| Masuk (mahasiswa & admin)  | `POST /login` → peran dari `data.profile.role`                                                              |
| Data master                | `GET /kategori`, `GET /mata-kuliah`, `GET /prodi`, `GET /semester`                                          |
| Eksplorasi & Hasil         | `GET /resource-relevan` (+ `GET /resource` untuk nama pengunggah, format, jumlah unduhan/dilihat)           |
| Detail resource            | `GET /resource/:id`, `GET /rating-review/:resource_id`                                                      |
| Pratinjau · Unduh dokumen  | `GET /resource/:id/file?action=preview` · `?action=download` (hanya unduh yang menambah jumlah unduhan)     |
| Ulasan · Laporkan resource | `POST /rating-review` · `POST /report` (`resource_id`)                                                      |
| Simpan / Koleksi           | `POST /bookmark`, `GET /bookmark`, `DELETE /bookmark/:id` (resource & wawasan)                              |
| Unggah resource            | `POST /resource` (multipart: judul, deskripsi, sumber, file, category_id, matkul_id, semester_id, prodi_id) |
| Wawasan (daftar · detail)  | `GET /experience` · `GET /experience/:id`                                                                   |
| Ulasan wawasan             | `GET /rating-review/experience/:id`, `POST /rating-review` (`experience_id`)                                |
| Laporkan wawasan           | `POST /report` (`experience_id`)                                                                            |
| Tulis wawasan              | `POST /experience` (multipart: judul, sub_judul, konten, kategori, tags, sampul)                            |
| Admin — Kelola Resource    | `GET /admin/resource`, `PUT /admin/resource/:id/status`, `DELETE /admin/resource/:id`                       |
| Admin — Kelola Laporan     | `GET /admin/report`, `GET /admin/report/:id`, `PUT /admin/report/:id/status`                                |
| Admin — Moderasi           | `GET /admin/resource`, `GET /admin/experience`, `PUT /admin/experience/:id/status`                          |

Semua pemanggilan ada di `src/services/` (`api.js`, `auth.js`, `resources.js`, `insights.js`, `bookmarks.js`, `admin.js`, `master.js`, `notifications.js`). Penyesuaian nama field backend ada di `adapters.js`.

## Catatan / keterbatasan

| Hal                                                      | Penanganan                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| Tahun akademik & kata kunci di form Unggah               | Belum ada kolomnya di backend, belum ikut tersimpan                |
| Unggah hanya dengan tautan (tanpa file)                  | Backend mewajibkan file; tautan disimpan di kolom `sumber`         |
| Format file                                              | PDF, Word, PowerPoint, JPG/PNG/WebP, maks. 10 MB (aturan backend)  |
| Status resource "Arsipkan"                               | Dikirim sebagai `hidden` (backend: approved / rejected / hidden)   |
| Wawasan belum bisa disembunyikan                         | Backend hanya approved / rejected, tombol Sembunyikan tidak tampil |
| Keunikan NIM saat daftar                                 | Belum dicek backend (BUG01 dari QA)                                |
| Notifikasi                                               | Belum ada endpoint, disusun dari data resource & wawasan yang ada  |
| Nama prodi "S1 Data Sains" (database) vs "S1 Sains Data" | Disamakan di `prodiLabel()` (`master.js`)                          |
