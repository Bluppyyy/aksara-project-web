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

Yang sudah tersambung ke backend: login, daftar, hasil eksplorasi, detail resource, ulasan, bookmark/koleksi, lapor konten, dan unggah.

Yang masih memakai data dummy (endpoint belum tersedia): halaman Eksplorasi (rekomendasi dan trending), Wawasan, pilihan filter, statistik di Beranda, dan resource terkait.

### Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run build` | Membuat versi siap online ke folder `dist/` |
| `npm run preview` | Melihat hasil build secara lokal |
| `npm run icons` | Mengumpulkan ikon yang dipakai (otomatis jalan saat `dev` atau `build`) |
| `npm run assets` | Mengunduh aset Figma yang belum ada (otomatis jalan saat `dev` atau `build`) |

## Halaman

| Route | Halaman | Perlu login |
|---|---|---|
| `/` | Beranda | – |
| `/login` | Masuk | – |
| `/daftar` | Daftar akun | – |
| `/eksplorasi` | Eksplorasi (sebelum mencari) | – |
| `/eksplorasi/hasil?q=` | Hasil pencarian dan filter | – |
| `/wawasan` | Wawasan & pengalaman | – |
| `/resource/:id` | Detail resource | – |
| `/unggah` | Unggah resource | ✓ |
| `/koleksi` | Koleksi (bookmark) | ✓ |

## Struktur folder

```
aksara/
├─ public/              # file statis (_redirects untuk Netlify)
├─ scripts/             # script unduh aset Figma & kumpulkan ikon
├─ src/
│  ├─ App.jsx           # daftar route
│  ├─ index.css         # warna, font, dan style global
│  ├─ pages/            # satu .jsx + .module.css per halaman (auth/ = login & daftar)
│  ├─ components/       # komponen yang dipakai ulang (Header, Footer, ResourceCard, Icon, dst.)
│  ├─ services/         # pemanggilan API: api.js, auth.js, resources.js, adapters.js
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
