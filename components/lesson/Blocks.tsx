/** Các khối nội dung tĩnh dùng trong bài học (không cần JavaScript phía trình duyệt). */
import type { ReactNode } from 'react';
import { L } from '@/components/i18n';

export function Sec({ id, title, kicker, children }: { id: string; title: ReactNode; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} className="sec">
      <h2>
        {kicker && <span className="sec-kicker mono">{kicker}</span>}
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

export function Sub({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="sub">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

const NOTE_LABEL = {
  tip: ['Mẹo', 'Tip'],
  warn: ['Cẩn thận', 'Careful'],
  slide: ['Ghi chú về slide', 'About the slides'],
  idea: ['Hình dung', 'Picture it'],
  key: ['Ghi nhớ', 'Remember'],
} as const;

export function Note({ kind = 'tip', title, children }: { kind?: keyof typeof NOTE_LABEL; title?: ReactNode; children: ReactNode }) {
  return (
    <div className={`note note-${kind}`}>
      <p className="note-label">{title ?? <L vi={NOTE_LABEL[kind][0]} en={NOTE_LABEL[kind][1]} />}</p>
      <div className="note-body">{children}</div>
    </div>
  );
}

export function Formula({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="formula">
      <div className="formula-body mono">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function Pitfalls({ items }: { items: ReactNode[] }) {
  return (
    <div className="pitfalls">
      <h3><L vi="Bẫy hay gặp" en="Common traps" /></h3>
      <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export function SelfCheck({ items }: { items: { q: ReactNode; a: ReactNode }[] }) {
  return (
    <div className="selfcheck">
      <h3><L vi="Tự kiểm tra" en="Check yourself" /></h3>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <div className="sc-q">{it.q}</div>
            <details>
              <summary><L vi="Xem đáp án" en="Show answer" /></summary>
              <div className="sc-a">{it.a}</div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Table({ head, rows, caption, mono }: { head: ReactNode[]; rows: ReactNode[][]; caption?: ReactNode; mono?: number[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => <td key={j} className={mono?.includes(j) ? 'mono' : undefined}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="steps">
      {items.map((x, i) => <li key={i}><span className="steps-no mono">{i + 1}</span><div>{x}</div></li>)}
    </ol>
  );
}

export function Widget({ title, kicker, hint, children }: { title: ReactNode; kicker?: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <figure className="widget">
      <figcaption className="widget-head">
        <span className="widget-kicker">{kicker ?? <L vi="Mô phỏng" en="Simulation" />}</span>
        <strong>{title}</strong>
        {hint && <span className="widget-hint">{hint}</span>}
      </figcaption>
      <div className="widget-body">{children}</div>
    </figure>
  );
}

export function K({ children }: { children: ReactNode }) {
  return <code className="k">{children}</code>;
}
