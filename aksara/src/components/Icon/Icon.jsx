import { useMemo } from 'react';
import { Icon as IconifyIcon, addCollection, getIcon } from '@iconify/react';
import collections from '../../icons/collection.json';

// Daftarkan ikon yang dipakai (dibuat oleh scripts/build-icons.mjs) supaya
// tampil langsung tanpa memanggil API Iconify.
collections.forEach((c) => addCollection(c));

/**
 * Ikon berbasis @iconify/react.
 *
 * <Icon icon="lucide:eye" size={18} />
 * <Icon icon="lucide:star" size={13} fill="currentColor" strokeWidth={0} />
 *
 * Prop size, strokeWidth, fill, dan color mengikuti perilaku Lucide supaya
 * tampilan sama seperti desain.
 */
export default function Icon({ icon, size = 24, strokeWidth, fill, color, style, ...rest }) {
  const data = useMemo(() => {
    if (strokeWidth == null && fill == null) return icon;
    const base = getIcon(icon);
    if (!base) return icon;
    let body = base.body;
    if (strokeWidth != null) body = body.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);
    if (fill != null) body = body.replace(/fill="none"/g, `fill="${fill}"`);
    return { ...base, body };
  }, [icon, strokeWidth, fill]);

  return (
    <IconifyIcon
      icon={data}
      width={size}
      height={size}
      style={color ? { color, ...style } : style}
      aria-hidden="true"
      {...rest}
    />
  );
}
