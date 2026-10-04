/**
 * Mengumpulkan ikon Iconify yang dipakai di src/ menjadi satu file kecil
 * (src/icons/collection.json), supaya ikon tampil tanpa internet dan
 * bundle tidak memuat seluruh set ikon.
 *
 * Ikon dideteksi dari teks "prefix:nama" di kode, misalnya icon="lucide:eye".
 * Set yang didukung = paket @iconify-json/<prefix> yang terpasang
 * (saat ini lucide; tambah material-symbols dengan
 * `npm i -D @iconify-json/material-symbols`).
 *
 * Dijalankan otomatis sebelum `npm run dev` dan `npm run build`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { getIcons } from '@iconify/utils';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const outFile = join(srcDir, 'icons', 'collection.json');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== 'assets' && name !== 'icons') walk(p, files);
    } else if (/\.(jsx?|tsx?)$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

const PATTERN = /['"`]([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)['"`]/g;
const wanted = new Map(); // prefix -> Set(nama)

for (const file of walk(srcDir)) {
  const text = readFileSync(file, 'utf8');
  for (const [, prefix, name] of text.matchAll(PATTERN)) {
    if (!wanted.has(prefix)) wanted.set(prefix, new Set());
    wanted.get(prefix).add(name);
  }
}

const collections = [];
const missing = [];

for (const [prefix, names] of wanted) {
  let set;
  try {
    set = require(`@iconify-json/${prefix}/icons.json`);
  } catch {
    continue; // bukan nama ikon (mis. "http:..."), atau set belum dipasang
  }
  const subset = getIcons(set, [...names].sort());
  if (!subset) continue;
  for (const n of names) {
    if (!subset.icons[n] && !subset.aliases?.[n]) missing.push(`${prefix}:${n}`);
  }
  collections.push(subset);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(collections) + '\n');

const total = collections.reduce(
  (n, c) => n + Object.keys(c.icons).length + Object.keys(c.aliases || {}).length,
  0
);
console.log(`[icons] ${total} ikon disiapkan -> src/icons/collection.json`);
if (missing.length) {
  console.warn(`[icons] Tidak ditemukan: ${missing.join(', ')}`);
  process.exitCode = 1;
}
