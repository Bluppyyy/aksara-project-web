import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import { AdminPager } from './shared.jsx';
import t from './AdminTable.module.css';

/**
 * Tabel utama panel admin — SATU komponen untuk semua halaman
 * (Beranda, Kelola Resource, Kelola Laporan, Moderasi Konten) supaya bentuk,
 * jarak, dan tipografinya selalu sama.
 *
 * columns: [{ key, label, width, align: 'left'|'center'|'right', render: (row) => node }]
 * selectable: tampilkan kolom checkbox + bar aksi massal (bulkActions)
 */
export default function AdminTable({
  columns,
  rows = [],
  rowKey = 'id',
  title,
  headerExtra,
  selectable = false,
  selected = [],
  onSelectedChange,
  bulkActions,
  loading,
  error,
  onRetry,
  emptyText = 'Belum ada data.',
  pager,
}) {
  const ids = rows.map((r) => r[rowKey]);
  const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));
  const toggleAll = () => onSelectedChange?.(allChecked ? [] : ids);
  const toggleOne = (id) =>
    onSelectedChange?.(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  // Kolom tanpa lebar (judul) minimal 300px → di layar sempit tabel bisa digeser, bukan dipadatkan
  const minWidth = columns.reduce((sum, c) => sum + (c.width || 300), selectable ? 52 : 0);

  let body;
  if (loading) body = <p className={t.state}>Memuat data…</p>;
  else if (error)
    body = (
      <p className={t.state}>
        {error.message || 'Gagal memuat data.'}{' '}
        {onRetry && (
          <button type="button" className={t.link} onClick={onRetry}>
            Coba lagi
          </button>
        )}
      </p>
    );
  else if (rows.length === 0) body = <p className={t.state}>{emptyText}</p>;
  else
    body = (
      <div className={t.scroll}>
        <table className={t.table} style={{ minWidth: minWidth }}>
          <colgroup>
            {selectable && <col style={{ width: 52 }} />}
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {selectable && (
                <th className={t.checkCol}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Pilih semua baris" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align || 'left' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = row[rowKey];
              const isSel = selected.includes(id);
              return (
                <tr key={id} className={isSel ? t.rowSelected : undefined}>
                  {selectable && (
                    <td className={t.checkCol}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(id)} aria-label="Pilih baris" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

  return (
    <section className={t.card}>
      {(title || headerExtra) && (
        <header className={t.head}>
          {title && <h2 className={t.title}>{title}</h2>}
          {headerExtra}
        </header>
      )}
      {selectable && bulkActions && (
        <div className={t.bulk}>
          <span>{selected.length ? `${selected.length} dipilih` : 'Centang baris untuk aksi massal'}</span>
          <div className={t.bulkActions}>{bulkActions}</div>
        </div>
      )}
      {body}
      {pager && <AdminPager {...pager} />}
    </section>
  );
}

/* ================= Sel standar ================= */

/** Judul + baris kecil di atas (kode/mata kuliah/jenis) + meta di bawah (format, statistik) */
export function TitleCell({ code, over, title, to, meta = [] }) {
  return (
    <div className={t.titleCell}>
      {(code || over) && (
        <span className={t.over}>
          {code && <span className={t.code}>{code}</span>}
          {over && <span className={t.overText}>{over}</span>}
        </span>
      )}
      {to ? (
        <Link to={to} className={t.cellTitle} title={title}>
          {title}
        </Link>
      ) : (
        <span className={t.cellTitle} title={title}>
          {title}
        </span>
      )}
      {meta.length > 0 && (
        <span className={t.meta}>
          {meta.map((m) => (
            <span key={m.label || m.text} title={m.label}>
              {m.icon && <Icon icon={m.icon} size={12} />}
              {m.text}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

const initialsOf = (name = '') =>
  name
    .replace(/^(Dr\.|Prof\.)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** Avatar inisial + nama + satu baris keterangan */
export function PersonCell({ name, lines = [] }) {
  return (
    <div className={t.person}>
      <span className={t.avatar}>{initialsOf(name)}</span>
      <span className={t.stack}>
        <span className={t.strong} title={name}>
          {name}
        </span>
        {lines.filter(Boolean).map((l) => (
          <span key={l} className={t.muted} title={l}>
            {l}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Dua baris teks: utama + keterangan (tanggal/jam, prodi, alasan, dst.) */
export function TextCell({ primary, secondary, nowrap, clamp }) {
  return (
    <span className={`${t.stack} ${nowrap ? t.nowrap : ''}`}>
      <span className={t.strong}>{primary}</span>
      {secondary && <span className={`${t.muted} ${clamp ? t.clamp1 : ''}`}>{secondary}</span>}
    </span>
  );
}

/** Tombol ikon 32px di kolom Aksi */
export function ActionButton({ icon, label, tone, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`${t.actionBtn} ${tone ? t[tone] : ''}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon icon={icon} size={16} />
    </button>
  );
}

/** Tombol teks 32px di kolom Aksi (tinggi sama dengan ActionButton) */
export function ActionText({ children, onClick, to }) {
  return to ? (
    <Link to={to} className={t.actionText}>
      {children}
    </Link>
  ) : (
    <button type="button" className={t.actionText} onClick={onClick}>
      {children}
    </button>
  );
}

export function Actions({ children }) {
  return <div className={t.actions}>{children}</div>;
}

/** Tombol di bar aksi massal */
export function BulkButton({ icon, children, danger, ...props }) {
  return (
    <button type="button" className={`${t.bulkBtn} ${danger ? t.bulkDanger : ''}`} {...props}>
      <Icon icon={icon} size={14} />
      {children}
    </button>
  );
}

/** Chip filter di kepala tabel. options: [{ key, label, count? }] */
export function TableChips({ options, value, onChange, label = 'Filter' }) {
  return (
    <div className={t.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`${t.chip} ${value === o.key ? t.chipActive : ''}`}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.label}
          {o.count !== undefined && <span className={t.chipCount}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Badge kategori — nama panjang turun ke baris berikutnya */
export function CategoryBadge({ children }) {
  return (
    <span className={t.category} title={typeof children === 'string' ? children : undefined}>
      {children}
    </span>
  );
}
