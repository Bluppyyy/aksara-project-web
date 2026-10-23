import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import useAsync from '../../hooks/useAsync';
import { listNotifications, getSeenAt, markSeen, timeAgo } from '../../services/notifications';
import iconBell from '../../assets/header/icon-bell.svg';
import styles from './NotificationBell.module.css';

const KIND_ICON = {
  approved: { icon: 'lucide:badge-check', tone: styles.toneOk },
  new: { icon: 'lucide:file-text', tone: styles.tonePrimary },
  insight: { icon: 'lucide:lightbulb', tone: styles.toneAccent },
};

/** Tombol lonceng + dropdown notifikasi yang melayang di bawahnya */
export default function NotificationBell({ user, onOpen }) {
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => getSeenAt(user));
  const boxRef = useRef(null);
  const { pathname } = useLocation();
  const { data: items, loading } = useAsync(() => listNotifications(user), [user?.email]);
  const list = items || [];
  const unread = list.filter((n) => n.at > seenAt).length;

  // Tutup saat pindah halaman, klik di luar, atau tekan Esc
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    onOpen?.();
  };

  const markAllRead = () => {
    const now = Date.now();
    markSeen(user, now);
    setSeenAt(now);
  };

  return (
    <div className={styles.wrap} ref={boxRef}>
      <button
        type="button"
        className={styles.bell}
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <img src={iconBell} alt="" className={styles.bellIcon} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notifikasi">
          <div className={styles.head}>
            <strong>Notifikasi</strong>
            {unread > 0 && (
              <button type="button" className={styles.markRead} onClick={markAllRead}>
                Tandai semua dibaca
              </button>
            )}
          </div>

          {loading && <p className={styles.empty}>Memuat notifikasi…</p>}
          {!loading && list.length === 0 && (
            <p className={styles.empty}>Belum ada notifikasi. Kabar resource dan wawasan baru akan muncul di sini.</p>
          )}
          {!loading && list.length > 0 && (
            <ul className={styles.list}>
              {list.map((n) => {
                const kind = KIND_ICON[n.kind] || KIND_ICON.new;
                return (
                  <li key={n.id}>
                    <Link to={n.to} className={`${styles.item} ${n.at > seenAt ? styles.unread : ''}`}>
                      <span className={`${styles.icon} ${kind.tone}`}>
                        <Icon icon={kind.icon} size={16} />
                      </span>
                      <span className={styles.texts}>
                        <span className={styles.title}>{n.title}</span>
                        <span className={styles.text}>{n.text}</span>
                        <span className={styles.time}>{timeAgo(n.at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
