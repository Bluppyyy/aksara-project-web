# AKSARA — Academic Repository

Frontend website **AKSARA**, platform berbagi resource akademik dan pengalaman mahasiswa Fakultas Informatika Telkom University. Dikerjakan untuk **ASE LAB 2026**.

- **Desain:** Figma _ASE-LAB-PROJECT_, section "2nd iteration"
- **Backend:** [byEzry/Aksara-project-ASE](https://github.com/byEzry/Aksara-project-ASE) (Express + Supabase)

## Teknologi

- React 18 + Vite 5
- CSS Modules + CSS variables (`src/index.css`)
- React Router DOM v6
- @iconify/react (ikon Lucide)
- Fetch API lewat service layer (`src/services/`)

## Cara menjalankan

Butuh **Node.js 18 atau lebih baru**.

### 1. Jalankan backend

```bash
git clone https://github.com/byEzry/Aksara-project-ASE.git
cd Aksara-project-ASE
npm install
# buat file .env (lihat .env.example), isi URL & key Supabase dari tim backend
node server.js
```

Backend berjalan di http://localhost:3000 (dokumentasi API di http://localhost:3000/api-docs).

### 2. Jalankan frontend

```bash
cd aksara
npm install
npm run dev
```

Buka http://localhost:5173.

Frontend otomatis tersambung ke backend: request ke `/api` diteruskan Vite ke `http://localhost:3000` (diatur di `.env.development` dan `vite.config.js`). Tidak perlu membuat `.env` sendiri.

### Mode demo (tanpa backend)

Untuk melihat tampilan tanpa menjalankan backend, buat file `aksara/.env.development.local` berisi:

```
VITE_API_URL=
```

Lalu jalankan ulang `npm run dev`. Semua halaman memakai data contoh dari `src/data/`. Akun demo:

| Peran     | Email             | Kata sandi   |
| --------- | ----------------- | ------------ |
| Mahasiswa | `demo@aksara.id`  | `demo12345`  |
| Admin     | `admin@aksara.id` | `admin12345` |

Hapus file tersebut untuk kembali ke mode backend.

## Perintah

| Perintah          | Fungsi                                   |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Menjalankan server development           |
| `npm run build`   | Membuat versi produksi ke folder `dist/` |
| `npm run preview` | Melihat hasil build secara lokal         |
| `npm run lint`    | Mengecek kode dengan ESLint              |
| `npm run format`  | Merapikan kode dengan Prettier           |

## Halaman

Satu web untuk dua peran. Setelah login, peran dikenali otomatis: mahasiswa ke `/`, admin ke `/admin`.

| Route                                    | Halaman                                                | Akses     |
| ---------------------------------------- | ------------------------------------------------------ | --------- |
| `/`                                      | Landing page (tamu) / Aktivitas Komunitas (mahasiswa)  | –         |
| `/login`, `/admin/login`                 | Masuk                                                  | –         |
| `/daftar`                                | Registrasi (data diri → informasi akademik → berhasil) | –         |
| `/eksplorasi`                            | Eksplorasi                                             | –         |
| `/eksplorasi/hasil`                      | Hasil pencarian, kategori, dan filter                  | Mahasiswa |
| `/resource/:id`                          | Detail resource                                        | Mahasiswa |
| `/unggah`                                | Unggah resource                                        | Mahasiswa |
| `/koleksi`                               | Koleksi Saya (bookmark)                                | Mahasiswa |
| `/wawasan`                               | Wawasan & Pengalaman                                   | –         |
| `/wawasan/:id`                           | Detail wawasan                                         | Mahasiswa |
| `/wawasan/tulis`                         | Tulis wawasan                                          | Mahasiswa |
| `/admin`                                 | Dashboard admin                                        | Admin     |
| `/admin/resource`                        | Kelola resource                                        | Admin     |
| `/admin/laporan`, `/admin/laporan/:id`   | Kelola & detail laporan                                | Admin     |
| `/admin/moderasi`, `/admin/moderasi/:id` | Moderasi & detail moderasi konten                      | Admin     |

Tamu hanya bisa melihat Landing Page, Eksplorasi, dan Wawasan. Fitur lain akan diarahkan ke halaman login.

Daftar endpoint backend yang dipakai setiap halaman ada di [`aksara/INTEGRASI_BACKEND.md`](aksara/INTEGRASI_BACKEND.md).

## Struktur folder

```
aksara/
├─ public/        # file statis
├─ scripts/       # script unduh aset Figma & kumpulkan ikon
└─ src/
   ├─ pages/      # satu .jsx + .module.css per halaman (auth/ = login & daftar, admin/ = panel admin)
   ├─ components/ # komponen yang dipakai ulang (Header, Footer, ResourceCard, dst.)
   ├─ services/   # pemanggilan API ke backend
   ├─ context/    # status login (AuthContext)
   ├─ hooks/      # custom hooks (useAsync, useBookmark, dst.)
   ├─ utils/      # fungsi bantu (filter, riwayat dilihat)
   ├─ data/       # data contoh untuk mode demo
   └─ assets/     # gambar & ikon dari Figma
```

Halaman tidak memanggil `fetch` langsung, semuanya lewat `src/services/`. `api.js` mengatur alamat backend dan token login, sedangkan `adapters.js` menyesuaikan nama field backend (`judul`, `deskripsi`, …) dengan yang dipakai komponen.

## Konvensi

- Komponen dan file komponen: **PascalCase** (`ResourceCard.jsx`)
- Variabel dan fungsi: **camelCase** (`listResources`)
- Style per komponen di file `.module.css` dengan nama yang sama
- Teks antarmuka dalam Bahasa Indonesia
- Pesan commit: `feat:`, `fix:`, `chore:`, `docs:`
