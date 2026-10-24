// Markdown sederhana untuk isi wawasan (sesuai tombol toolbar di halaman Tulis Wawasan).
// Hanya mengubah teks menjadi struktur data; tampilannya dirender komponen <Markdown> tanpa dangerouslySetInnerHTML.

const HEADING = /^(#{1,3})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

/**
 * Teks markdown → daftar blok.
 * Setiap baris biasa menjadi satu paragraf (sama seperti saat mengetik di editor);
 * baris daftar/kutipan yang berurutan digabung menjadi satu blok.
 * @returns {{ type: 'lead'|'p'|'h2'|'h3'|'quote'|'ul'|'ol'|'img', text?: string, items?: string[], src?: string, alt?: string }[]}
 */
export function parseBlocks(text = '') {
  const blocks = [];
  const last = () => blocks[blocks.length - 1];

  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      blocks.push({ type: 'break' }); // pemisah, supaya daftar/kutipan tidak tersambung
      continue;
    }
    let m;
    if ((m = line.match(HEADING))) {
      blocks.push({ type: m[1].length === 1 ? 'h2' : 'h3', text: m[2] });
    } else if ((m = line.match(QUOTE))) {
      if (last()?.type === 'quote') last().text += `\n${m[1]}`;
      else blocks.push({ type: 'quote', text: m[1] });
    } else if ((m = line.match(BULLET))) {
      if (last()?.type === 'ul') last().items.push(m[1]);
      else blocks.push({ type: 'ul', items: [m[1]] });
    } else if ((m = line.match(NUMBERED))) {
      if (last()?.type === 'ol') last().items.push(m[1]);
      else blocks.push({ type: 'ol', items: [m[1]] });
    } else if ((m = line.match(IMAGE_LINE))) {
      blocks.push({ type: 'img', alt: m[1], src: m[2] });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }

  const result = blocks.filter((b) => b.type !== 'break');
  if (result[0]?.type === 'p') result[0] = { ...result[0], type: 'lead' };
  return result;
}

/** Hapus tanda markdown → teks biasa (untuk cuplikan di kartu wawasan) */
export function stripMarkdown(text = '') {
  return String(text)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<\/?u>/g, '')
    .replace(/(\*\*|~~|`)/g, '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*(#{1,3}|>|[-*]|\d+[.)])\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Hanya tautan http(s) yang boleh dibuka / ditampilkan sebagai gambar */
export function safeUrl(url = '') {
  try {
    const trimmed = String(url).trim();
    const { protocol } = new URL(trimmed);
    return protocol === 'http:' || protocol === 'https:' ? trimmed : null;
  } catch {
    return null;
  }
}
