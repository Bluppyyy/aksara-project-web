// Download semua aset (logo, ikon, gambar) dari Figma ke src/assets.
// Daftar file & URL ada di scripts/assets.json.
// URL aset Figma MCP cuma berlaku ±7 hari sejak kode dibuat (Okt 2026).
// File yang sudah ada dilewati, jadi aman dijalankan berulang kali.
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'src', 'assets');
const assets = JSON.parse(await readFile(join(root, 'scripts', 'assets.json'), 'utf8'));
const exists = (p) => access(p).then(() => true, () => false);

let failed = 0;
for (const [name, url] of Object.entries(assets)) {
  const dest = join(outDir, name);
  if (await exists(dest)) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error('file kosong');
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(`✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name} — ${err.message}`);
  }
}
if (failed) {
  console.error(
    `\n${failed} aset gagal di-download. Kalau URL Figma sudah kedaluwarsa, ` +
      'export ulang aset dari Figma dan simpan di src/assets dengan nama file yang sama.'
  );
  process.exit(1);
}
