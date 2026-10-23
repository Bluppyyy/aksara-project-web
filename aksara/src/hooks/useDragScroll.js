import { useEffect, useRef } from 'react';

/**
 * Elemen yang bisa digeser kiri-kanan dengan drag mouse
 * (touch & trackpad sudah otomatis lewat overflow-x).
 * Klik tetap jalan kalau mouse tidak benar-benar digeser.
 */
export default function useDragScroll({ paged = false, ready = true } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.dataset.dragging = 'true';
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const onUp = (e) => {
      if (!down) return;
      down = false;
      delete el.dataset.dragging;
      // Mode carousel: geser sedikit saja sudah pindah ke slide berikut/sebelumnya
      if (paged && moved) {
        const kids = el.children;
        const page = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : el.clientWidth;
        const dx = e.clientX - startX;
        const from = Math.round(startLeft / page);
        const to = Math.abs(dx) > 60 ? from + (dx < 0 ? 1 : -1) : from;
        const max = kids.length - 1;
        el.scrollTo({ left: Math.max(0, Math.min(max, to)) * page, behavior: 'smooth' });
      }
    };
    // Batalkan klik setelah drag supaya tidak membuka link/memilih chip tanpa sengaja
    const onClick = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const onDragStart = (e) => e.preventDefault();

    // data-overflow="true" selama masih ada isi di sebelah kanan → CSS memakainya untuk efek pudar di tepi
    const updateOverflow = () => {
      if (el.scrollWidth - el.clientWidth - el.scrollLeft > 1) el.dataset.overflow = 'true';
      else delete el.dataset.overflow;
    };
    updateOverflow();
    el.addEventListener('scroll', updateOverflow, { passive: true });
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateOverflow) : null;
    resize?.observe(el);
    const mutation = new MutationObserver(updateOverflow); // isi berubah, mis. pill baru setelah data dimuat
    mutation.observe(el, { childList: true, subtree: true });

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
      el.removeEventListener('dragstart', onDragStart);
      el.removeEventListener('scroll', updateOverflow);
      resize?.disconnect();
      mutation.disconnect();
    };
  }, [paged, ready]); // ready: pasang ulang saat elemen baru muncul (mis. setelah data dimuat)
  return ref;
}
