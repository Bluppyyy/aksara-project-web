# AKSARA — Academic Repository (React + CSS Modules)

Dibuat dari section Figma **"2nd iteration"** (ASE-LAB-PROJECT).

## Cara menjalankan
```bash
npm install
npm run dev
```
`npm run dev` otomatis men-download semua aset (logo, ikon, foto, background) dari Figma ke `src/assets/`
sesuai daftar di `scripts/assets.json`. **Link aset Figma hanya berlaku ±7 hari (sampai ±11 Okt 2026)** —
jalankan sekali dalam rentang itu, setelahnya file tersimpan permanen. Kalau sudah kedaluwarsa, export ulang
aset dari Figma dan simpan dengan nama file yang sama seperti di `scripts/assets.json`.

## Halaman (route)
| Route | Frame Figma |
|---|---|
| `/` | landing jul |
| `/login` | login rel |
| `/daftar` | refister farel |
| `/eksplorasi` | Page / Explore Before Search |
| `/eksplorasi/hasil` | Explore after search |
| `/wawasan` | Explore after search (versi Wawasan & Pengalaman) |
| `/resource/:id` | Kontribusi (halaman detail resource) |
| `/unggah` | Upload |
| `/koleksi` | Bookmark (Koleksi Saya) |

## Struktur
```
src/
  App.jsx                 # routing (react-router-dom)
  index.css               # token warna, font, shadow
  pages/                  # satu file .jsx + .module.css per halaman
    auth/                 # Login & Register
  components/
    Header/               # varian guest / user / minimal
    Hero/  FilterBar/  FilterSidebar/  RangeSlider/  ResultsToolbar/
    ResourceCard/  ResourceListItem/  ArticleCard/  Pagination/
    SectionHeader/  AuthPanel/  Footer/
    detail/               # komponen halaman detail resource
  data/                   # data contoh — ganti dengan data dari API
```

## Catatan
- Di frame **landing**, semua teks di Figma sudah di-outline jadi vektor, jadi teksnya ditulis ulang sebagai
  teks asli dan ikon kecilnya memakai `@iconify/react` (set Lucide). Ornamen hero (sparkle, garis bawah, panah tulisan tangan)
  tetap memakai aset asli Figma.
- Tombol login/daftar, unggah, kirim ulasan, dan filter belum tersambung ke backend (lihat komentar `TODO`).

## Jadikan website siap online
```bash
npm run build
```
Hasilnya ada di folder `dist/` (HTML + CSS + JS biasa). Folder itu bisa langsung di-upload ke hosting statis
seperti Netlify, Vercel, GitHub Pages, atau hosting kampus. Karena memakai routing, atur hosting agar semua
URL diarahkan ke `index.html` (di Netlify: buat file `public/_redirects` berisi `/*  /index.html  200`).

## Ikon

Ikon memakai `@iconify/react` dengan set **Lucide** (sesuai SRS), lewat komponen `src/components/Icon/Icon.jsx`:

```jsx
import Icon from '../components/Icon/Icon.jsx';

<Icon icon="lucide:eye" size={18} />
<Icon icon="lucide:star" size={13} fill="currentColor" strokeWidth={0} />
```

- Nama ikon bisa dicari di https://icon-sets.iconify.design/lucide/.
- `npm run dev`/`npm run build` otomatis menjalankan `npm run icons`, yang mengumpulkan ikon yang dipakai ke `src/icons/collection.json`. Ikon tampil tanpa internet dan bundle tetap kecil.
- Mau pakai Material Symbols: `npm i -D @iconify-json/material-symbols`, lalu tulis `icon="material-symbols:home"`.
