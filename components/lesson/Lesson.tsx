import Link from 'next/link';
import { stepById } from '@/lib/nav';
import NextStep from './NextStep';

type Props = {
  step: string;
  title?: string;
  summary: React.ReactNode[];
  toc: { id: string; title: string }[];
  children: React.ReactNode;
};

/** Khung một bài học: tiêu đề, tóm tắt 1 phút, mục lục, nội dung, nút sang bài tiếp. */
export default function Lesson({ step, title, summary, toc, children }: Props) {
  const s = stepById(step);
  return (
    <article className="lesson">
      <header className="lesson-head">
        <p className="lesson-kicker">
          <span className="lesson-no mono">Bước {s.no}</span>
          <span>{s.short}</span>
          <span className="lesson-time">· {s.time}</span>
        </p>
        <h1>{title ?? s.title}</h1>
        <p className="lesson-goal"><b>Học xong phải làm được:</b> {s.goal}.</p>
      </header>

      <aside className="summary" aria-label="Tóm tắt 1 phút">
        <h2>Tóm tắt 1 phút</h2>
        <ul>
          {summary.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </aside>

      <nav className="toc" aria-label="Trong bài này">
        <span>Trong bài này</span>
        <ol>
          {toc.map((t) => (
            <li key={t.id}><Link href={`#${t.id}`}>{t.title}</Link></li>
          ))}
        </ol>
      </nav>

      <div className="lesson-body">{children}</div>

      <NextStep id={step} />
    </article>
  );
}
