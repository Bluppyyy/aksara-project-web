import { Fragment } from 'react';
import { parseBlocks, safeUrl } from '../../utils/markdown';
import styles from './Markdown.module.css';

// Urutan penting: gambar sebelum tautan, tebal (**) sebelum miring (*)
const INLINE =
  /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*(.+?)\*\*|<u>(.+?)<\/u>|~~(.+?)~~|\*([^*]+)\*/g;

/** Format dalam baris: **tebal**, *miring*, <u>garis bawah</u>, ~~coret~~, `kode`, [tautan](url), ![gambar](url) */
export function Inline({ text = '' }) {
  const out = [];
  let last = 0;
  let key = 0;
  for (const m of String(text).matchAll(INLINE)) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    const [whole, imgAlt, imgSrc, linkText, linkUrl, code, bold, underline, strike, italic] = m;
    if (imgSrc !== undefined) {
      const src = safeUrl(imgSrc);
      out.push(
        src ? (
          <img key={key++} src={src} alt={imgAlt} className={styles.inlineImg} />
        ) : (
          <Fragment key={key++}>{imgAlt}</Fragment>
        )
      );
    } else if (linkUrl !== undefined) {
      const href = safeUrl(linkUrl);
      out.push(
        href ? (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <Inline text={linkText} />
          </a>
        ) : (
          <Fragment key={key++}>{linkText}</Fragment>
        )
      );
    } else if (code !== undefined) out.push(<code key={key++}>{code}</code>);
    else if (bold !== undefined)
      out.push(
        <strong key={key++}>
          <Inline text={bold} />
        </strong>
      );
    else if (underline !== undefined)
      out.push(
        <u key={key++}>
          <Inline text={underline} />
        </u>
      );
    else if (strike !== undefined)
      out.push(
        <s key={key++}>
          <Inline text={strike} />
        </s>
      );
    else if (italic !== undefined) out.push(<em key={key++}>{italic}</em>);
    else out.push(<Fragment key={key++}>{whole}</Fragment>);
    last = m.index + whole.length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}

/**
 * Render isi wawasan. Terima `text` (markdown mentah) atau `blocks` (hasil parseBlocks / data demo).
 * Gaya huruf, judul, dan kutipan mengikuti elemen induknya; `leadClassName` untuk paragraf pembuka.
 */
export default function Markdown({ text, blocks, leadClassName = '', paragraphClassName = '' }) {
  const list = blocks || parseBlocks(text);
  return list.map((b, i) => {
    switch (b.type) {
      case 'h2':
        return (
          <h2 key={i}>
            <Inline text={b.text} />
          </h2>
        );
      case 'h3':
        return (
          <h3 key={i} className={styles.h3}>
            <Inline text={b.text} />
          </h3>
        );
      case 'quote':
        return (
          <blockquote key={i}>
            {b.text.split('\n').map((t, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={t} />
              </Fragment>
            ))}
          </blockquote>
        );
      case 'ul':
      case 'ol': {
        const Tag = b.type;
        return (
          <Tag key={i} className={styles.list}>
            {b.items.map((t, j) => (
              <li key={j}>
                <Inline text={t} />
              </li>
            ))}
          </Tag>
        );
      }
      case 'img': {
        const src = safeUrl(b.src);
        if (!src) return b.alt ? <p key={i}>{b.alt}</p> : null;
        return (
          <figure key={i} className={styles.figure}>
            <img src={src} alt={b.alt} />
            {b.alt && <figcaption>{b.alt}</figcaption>}
          </figure>
        );
      }
      default:
        return (
          <p key={i} className={`${b.type === 'lead' ? leadClassName : ''} ${paragraphClassName}`.trim() || undefined}>
            <Inline text={b.text} />
          </p>
        );
    }
  });
}
