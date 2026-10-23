# AKSARA — Academic Repository

Frontend website **AKSARA**, platform berbagi resource akademik (tugas, laporan, referensi) dan pengalaman mahasiswa. Proyek ini dikerjakan untuk **ASE LAB 2026**.

- **Desain:** Figma *ASE-LAB-PROJECT*, section "2nd iteration"
- **Backend:** [byEzry/Aksara-project-ASE](https://github.com/byEzry/Aksara-project-ASE) (Express + Supabase)

## Teknologi

| Bagian | Yang dipakai |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | CSS Modules + CSS variables (`src/index.css`) |
| Routing | react-router-dom v6 |
| Ikon | @iconify/react (set Lucide) |
| Data | Fetch API lewat service layer (`src/services/`) |

## Cara menjalankan

Butuh **Node.js 18 atau lebih baru**.

```bash
cd aksara
npm install
npm run dev
```

Buka http://localhost:5173.

### Mode data

| Mode | Cara | Hasil |
|---|---|---|
| **Demo** | Tidak membuat file `.env`, atau `VITE_API_URL` dikosongkan | Semua halaman memakai data dummy dari `src/data/` |
| **API** | Salin `.env.example` jadi `.env`, isi `VITE_API_URL=http://localhost:3000` (alamat backend) | Halaman yang endpointnya sudah ada memakai data asli dari backend |

Yang sudah tersambung ke backend: login (peran dibaca dari `GET /test-auth`), daftar, hasil eksplorasi (search + filter), detail resource, ulasan, bookmark/koleksi, lapor konten, unggah resource, tulis wawasan (`POST /experience`), dan service panel admin (`/admin/*`).

Yang masih memakai data dummy (endpoint belum tersedia): halaman Eksplorasi (rekomendasi dan trending), feed Aktivitas Komunitas, detail wawasan, statistik dashboard admin, detail laporan/moderasi, dan resource terkait.

### Akun demo (mode Demo)

| Peran | Email | Kata sandi |
|---|---|---|
| Mahasiswa | `demo@aksara.id` | `demo12345` |
| Admin | `admin@aksara.id` | `admin12345` |

Akun hasil halaman Daftar (mode demo) tersimpan di browser yang sama.

### Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run build` | Membuat versi siap online ke folder `dist/` |
| `npm run preview` | Melihat hasil build secara lokal |
| `npm run icons` | Mengumpulkan ikon yang dipakai (otomatis jalan saat `dev` atau `build`) |
| `npm run assets` | Mengunduh aset Figma yang belum ada (otomatis jalan saat `dev` atau `build`) |

## Halaman

Satu web untuk dua peran (FR-LOGIN-03, NFR-SEC-01). Setelah login, peran dikenali otomatis: mahasiswa ke `/`, admin ke `/admin`. Penjagaan rute di frontend hanya untuk tampilan; keamanan sebenarnya ada di backend (`roleMiddleware('admin')`).

| Route | Halaman | Akses |
|---|---|---|
| `/` | Landing page (tamu) / Beranda Aktivitas Komunitas (mahasiswa login) | – |
| `/komunitas` | Beranda Aktivitas Komunitas | Mahasiswa |
| `/login`, `/admin/login` | Masuk (keduanya mengenali peran otomatis) | – |
| `/daftar` | Registrasi 4 langkah + layar berhasil | – |
| `/eksplorasi` | Eksplorasi (sebelum mencari) | – |
| `/eksplorasi/hasil?q=&kategori=&fakultas=…` | Hasil pencarian, kategori, dan filter | Mahasiswa |
| `/wawasan` | Wawasan & pengalaman | – |
| `/wawasan/:id` | Detail wawasan | Mahasiswa |
| `/wawasan/tulis` | Tulis wawasan (share experience) | Mahasiswa |
| `/resource/:id` | Detail resource | Mahasiswa |
| `/unggah` | Unggah resource | Mahasiswa |
| `/koleksi` | Koleksi (bookmark) | Mahasiswa |
| `/admin` | Dashboard admin | Admin |
| `/admin/resource` | Kelola resource (FR-ADM-01, 02) | Admin |
| `/admin/laporan`, `/admin/laporan/:id` | Kelola & detail laporan (FR-ADM-03, 04) | Admin |
| `/admin/moderasi`, `/admin/moderasi/:id` | Moderasi konten (FR-ADM-05) | Admin |
| `/admin/profil`, `/admin/pengaturan` | Profil & pengaturan admin | Admin |

Tamu (belum login) hanya bisa melihat Landing Page, tampilan awal Eksplorasi, dan tampilan awal Wawasan. Mencari, memilih kategori, membuka resource/artikel, atau menyimpan ke koleksi akan diarahkan ke halaman login, lalu kembali ke halaman tujuan setelah berhasil masuk.

## Struktur folder

```
aksara/
├─ public/              # file statis (_redirects untuk Netlify)
├─ scripts/             # script unduh aset Figma & kumpulkan ikon
├─ src/
│  ├─ App.jsx           # daftar route
│  ├─ index.css         # warna, font, dan style global
│  ├─ pages/            # satu .jsx + .module.css per halaman (auth/ = login & daftar, admin/ = panel admin)
│  ├─ components/       # komponen yang dipakai ulang (Header, Footer, ResourceCard, Icon, dst.)
│  ├─ services/         # pemanggilan API: api.js, auth.js, resources.js, wawasan.js, admin.js, adapters.js
│  ├─ utils/            # filters.js (baca/tulis filter di URL, saring & urutkan hasil)
│  ├─ context/          # AuthContext (status login)
│  ├─ hooks/            # useAsync, useBookmark
│  ├─ data/             # data dummy untuk mode demo
│  ├─ icons/            # ikon hasil `npm run icons`
│  └─ assets/           # gambar & ikon dari Figma
└─ vercel.json          # pengaturan routing untuk Vercel
```

### Alur data

Halaman tidak memanggil `fetch` langsung. Semuanya lewat `src/services/`:

1. `api.js` mengatur alamat backend, token login (`Authorization: Bearer`), dan pesan error.
2. `auth.js` dan `resources.js` berisi fungsi per fitur, misalnya `login()`, `listResources()`, `uploadResource()`.
3. `adapters.js` mengubah nama field dari backend (`judul`, `link_file`, …) ke bentuk yang dipakai komponen.

Kalau backend mengubah nama field, cukup sesuaikan `adapters.js`.

## Ikon

```jsx
import Icon from '../components/Icon/Icon.jsx';

<Icon icon="lucide:eye" size={18} />
```

Nama ikon bisa dicari di https://icon-sets.iconify.design/lucide/.

## Konvensi

- Nama komponen dan file komponen: **PascalCase** (`ResourceCard.jsx`)
- Nama variabel dan fungsi: **camelCase** (`listResources`)
- Style per komponen di file `.module.css` dengan nama yang sama
- Teks antarmuka dalam Bahasa Indonesia
