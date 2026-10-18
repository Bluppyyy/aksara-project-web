# Foto sampul kartu resource

Foto diambil dari Figma (ASE LAB PROJECT → Page / Eksplorasi — Sebelum Pencarian),
di-resize ke lebar 960px (JPEG). Ada 8 foto berbeda: `foto-1.jpg` … `foto-8.jpg`.

Pemakaian (lihat `src/data/resources.js`):

| Section                        | Foto                         |
|--------------------------------|------------------------------|
| Resource Relevan untuk Kamu    | baris 1 & 3: 1–4, baris 2: 5–8 |
| Terakhir Dilihat               | 5, 6, 7                      |
| Karya Riset dari Fakultas Kamu | 8, 1, 2, 3                   |
| Mata Kuliah Favorit            | 4, 5, 6, 7                   |
| Sedang Trending di AKSARA      | 8, 1, 2, 3                   |

Halaman lain memakai foto default per kategori (`CATEGORY_FALLBACK`).
Kalau file tidak ada, kartu otomatis memakai gradient biru (tidak error).
Data dari backend memakai field `thumbnail` / `link_thumbnail` kalau tersedia.
