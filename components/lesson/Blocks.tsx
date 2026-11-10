/** Các khối nội dung tĩnh dùng trong bài học (không cần JavaScript phía trình duyệt). */

export function Sec({ id, title, kicker, children }: { id: string; title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="sec">
      <h2>
        {kicker && <span className="sec-kicker mono">{kicker}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sub">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

const NOTE_LABEL = { tip: 'Mẹo', warn: 'Cẩn thận', slide: 'Ghi chú về slide', idea: 'Hình dung', key: 'Ghi nhớ' } as const;

export function Note({ kind = 'tip', title, children }: { kind?: keyof typeof NOTE_LABEL; title?: string; children: React.ReactNode }) {
  return (
    <div className={`note note-${kind}`}>
      <p className="note-label">{title ?? NOTE_LABEL[kind]}</p>
      <div className="note-body">{children}</div>
    </div>
  );
}

export function Formula({ children, caption }: { children: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="formula">
      <div className="formula-body mono">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function Pitfalls({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="pitfalls">
      <h3>Bẫy hay gặp</h3>
      <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export function SelfCheck({ items }: { items: { q: React.ReactNode; a: React.ReactNode }[] }) {
  return (
    <div className="selfcheck">
      <h3>Tự kiểm tra</h3>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <div className="sc-q">{it.q}</div>
            <details>
              <summary>Xem đáp án</summary>
              <div className="sc-a">{it.a}</div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Table({ head, rows, caption, mono }: { head: React.ReactNode[]; rows: React.ReactNode[][]; caption?: React.ReactNode; mono?: number[] }) {
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

export function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="steps">
      {items.map((x, i) => <li key={i}><span className="steps-no mono">{i + 1}</span><div>{x}</div></li>)}
    </ol>
  );
}

export function Widget({ title, kicker = 'Mô phỏng', hint, children }: { title: string; kicker?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <figure className="widget">
      <figcaption className="widget-head">
        <span className="widget-kicker">{kicker}</span>
        <strong>{title}</strong>
        {hint && <span className="widget-hint">{hint}</span>}
      </figcaption>
      <div className="widget-body">{children}</div>
    </figure>
  );
}

export function K({ children }: { children: React.ReactNode }) {
  return <code className="k">{children}</code>;
}
