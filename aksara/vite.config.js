import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { basename } from 'node:path';

/**
 * Nama class CSS Modules yang mudah dibaca saat inspect:
 * ResourceListItem.module.css + .preview → "ResourceListItem__preview"
 * (nama file *.module.css di proyek ini unik, jadi tidak ada yang bentrok).
 */
const readableClassName = (local, filename) => {
  const file = basename(filename.split('?')[0]).replace(/\.module\.(css|scss|sass|less)$/, '');
  return `${file}__${local}`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    css: {
      modules: { generateScopedName: readableClassName },
    },
    server: {
      // Port tetap 5180 untuk semua laptop tim; kalau sedang dipakai, Vite berhenti dengan pesan error (tidak pindah port diam-diam)
      port: 5180,
      strictPort: true,
      // Izinkan link Cloudflare Tunnel / ngrok untuk membagikan localhost ke teman (lihat panduan localhost)
      allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
      // Saat development, /api/* diteruskan ke backend (default http://localhost:3000).
      // Frontend & backend jadi satu origin → tidak ada masalah CORS / beda port.
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
