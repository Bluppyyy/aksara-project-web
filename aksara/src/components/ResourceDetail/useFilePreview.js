import { useEffect, useState } from 'react';

const OFFICE = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
const IMAGE = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

/**
 * Ambil file dari signed URL lalu siapkan pratinjaunya.
 *  - PDF & gambar → diambil sebagai blob (tetap tampil walau signed URL 60 detik sudah kedaluwarsa)
 *  - Word / PowerPoint / Excel → Microsoft Office Online viewer
 *  - format lain → hanya tombol buka di tab baru
 * @param {() => Promise<string|null>} getUrl  fungsi yang mengembalikan signed URL file
 * @param {unknown} key  ganti nilainya untuk memuat ulang (mis. id resource)
 */
export function useFilePreview(getUrl, key) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    let objectUrl = null;
    setState({ status: 'loading' });
    (async () => {
      try {
        const url = await getUrl();
        if (!url) throw new Error('File belum tersedia.');
        const ext = decodeURIComponent(new URL(url).pathname).split('.').pop().toLowerCase();
        if (ext === 'pdf' || IMAGE.includes(ext)) {
          const res = await fetch(url);
          if (!res.ok) throw new Error('File tidak dapat dimuat.');
          const blob = await res.blob();
          const typed =
            ext === 'pdf' && blob.type !== 'application/pdf' ? new Blob([blob], { type: 'application/pdf' }) : blob;
          objectUrl = URL.createObjectURL(typed);
          if (alive) setState({ status: 'ready', kind: ext === 'pdf' ? 'pdf' : 'image', src: objectUrl, ext });
        } else if (OFFICE.includes(ext)) {
          const src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
          if (alive) setState({ status: 'ready', kind: 'office', src, ext });
        } else if (alive) {
          setState({ status: 'ready', kind: 'other', ext });
        }
      } catch (err) {
        if (alive) setState({ status: 'error', message: err.message || 'Pratinjau gagal dimuat.' });
      }
    })();
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // getUrl sengaja tidak dijadikan dependency: cukup dimuat ulang saat `key` berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /** Buka file asli di tab baru (tab dibuka dulu supaya tidak diblokir popup blocker) */
  const openInNewTab = async () => {
    const tab = window.open('', '_blank');
    try {
      const url = await getUrl();
      if (tab && url) tab.location.href = url;
      else tab?.close();
    } catch {
      tab?.close();
    }
  };

  return [state, openInNewTab];
}
