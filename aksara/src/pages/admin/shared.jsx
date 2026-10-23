import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import ui from './admin.module.css';
import { STATUS_META } from './statusMeta';

export function StatusBadge({ status, label }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`${ui.badge} ${ui.badgeRound} ${meta.tone}`}>
      <span className={ui.dot} />
      {label || meta.label}
    </span>
  );
}

/** Paginasi sederhana bergaya admin */
export function AdminPager({ info, page = 1, pages = [1, 2, 3], last, onChange }) {
  return (
    <div className={ui.pager}>
      <span>{info}</span>
      <div className={ui.pagerButtons}>
        <button
          type="button"
          className={ui.pageBtn}
          disabled={page <= 1}
          onClick={() => onChange?.(page - 1)}
          aria-label="Sebelumnya"
        >
          <Icon icon="lucide:chevron-left" size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${ui.pageBtn} ${p === page ? ui.pageBtnActive : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange?.(p)}
          >
            {p}
          </button>
        ))}
        {last && (
          <>
            <span>…</span>
            <button
              type="button"
              className={`${ui.pageBtn} ${last === page ? ui.pageBtnActive : ''}`}
              onClick={() => onChange?.(last)}
            >
              {last}
            </button>
          </>
        )}
        <button
          type="button"
          className={ui.pageBtn}
          disabled={page >= (last || pages[pages.length - 1])}
          onClick={() => onChange?.(page + 1)}
          aria-label="Berikutnya"
        >
          <Icon icon="lucide:chevron-right" size={14} />
        </button>
      </div>
    </div>
  );
}

/* ================= Kepala halaman (dipakai semua halaman admin) ================= */

/** Breadcrumb di dalam halaman. items: [{ label, to? }] — item terakhir = halaman aktif */
export function Breadcrumbs({ items }) {
  return (
    <nav className={ui.crumbs} aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={it.label}>
            {i > 0 && (
              <span className={ui.crumbSep} aria-hidden="true">
                /
              </span>
            )}
            {last || !it.to ? (
              <span className={last ? ui.crumbActive : undefined} aria-current={last ? 'page' : undefined}>
                {it.label}
              </span>
            ) : (
              <Link to={it.to}>{it.label}</Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Breadcrumb + judul + deskripsi singkat + tombol aksi kanan */
export function PageHeader({ crumbs, title, subtitle, actions }) {
  return (
    <header className={ui.pageHead}>
      <div className={ui.pageHeadText}>
        {crumbs && <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, ...crumbs]} />}
        <h1 className={ui.title}>{title}</h1>
        {subtitle && <p className={ui.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={ui.headActions}>{actions}</div>}
    </header>
  );
}

const STAT_TONES = { primary: ui.statPrimary, warn: ui.statWarn, danger: ui.statDanger, ok: ui.statOk };

/** Kartu angka ringkas — bentuk sama di semua halaman */
export function StatCards({ items }) {
  return (
    <section
      className={ui.stats}
      style={{ '--stat-cols': items.length % 3 === 0 && items.length > 4 ? 3 : Math.min(items.length, 4) }}
      aria-label="Ringkasan"
    >
      {items.map((s) => (
        <article key={s.label} className={ui.stat}>
          <span className={`${ui.statIcon} ${STAT_TONES[s.tone] || ui.statPrimary}`}>
            <Icon icon={s.icon} size={18} />
          </span>
          <span className={ui.statBody}>
            <span className={ui.statLabel}>{s.label}</span>
            <strong className={ui.statValue}>{s.value}</strong>
            {s.note && <span className={ui.statNote}>{s.note}</span>}
          </span>
        </article>
      ))}
    </section>
  );
}

/**
 * Bar pencarian + filter dalam satu baris.
 * selects: [{ label, value, onChange, options: [string | {value,label}] }]
 */
export function AdminFilters({ search, selects = [], onReset }) {
  return (
    <section className={ui.filterBar}>
      <label className={`${ui.search} ${ui.filterSearch}`}>
        <Icon icon="lucide:search" size={16} />
        <span className="visually-hidden">Cari</span>
        <input
          type="search"
          placeholder={search.placeholder}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
        />
      </label>
      {selects.map((f) => (
        <span key={f.label} className={`${ui.select} ${ui.filterSelect}`}>
          <select value={f.value} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
            {f.options.map((o) =>
              typeof o === 'string' ? (
                <option key={o}>{o}</option>
              ) : (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              )
            )}
          </select>
          <Icon icon="lucide:chevron-down" size={16} />
        </span>
      ))}
      {onReset && (
        <button
          type="button"
          className={ui.resetBtn}
          onClick={onReset}
          title="Hapus semua filter"
          aria-label="Hapus semua filter"
        >
          <Icon icon="lucide:rotate-ccw" size={16} />
        </button>
      )}
    </section>
  );
}
