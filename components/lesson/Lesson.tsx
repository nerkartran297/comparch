import Link from 'next/link';
import { stepById } from '@/lib/nav';
import { L } from '@/components/i18n';
import NextStep from './NextStep';

type Props = {
  step: string;
  title?: React.ReactNode;
  summary: React.ReactNode[];
  toc: { id: string; title: React.ReactNode }[];
  children: React.ReactNode;
};

/** Khung một bài học: tiêu đề, tóm tắt 1 phút, mục lục, nội dung, nút sang bài tiếp. */
export default function Lesson({ step, title, summary, toc, children }: Props) {
  const s = stepById(step);
  return (
    <article className="lesson">
      <header className="lesson-head">
        <p className="lesson-kicker">
          <span className="lesson-no mono"><L vi="Bước" en="Step" /> {s.no}</span>
          <span><L vi={s.short.vi} en={s.short.en} /></span>
          <span className="lesson-time">· <L vi={s.time.vi} en={s.time.en} /></span>
        </p>
        <h1>{title ?? <L vi={s.title.vi} en={s.title.en} />}</h1>
        <p className="lesson-goal">
          <b><L vi="Học xong phải làm được:" en="After this lesson you can:" /></b> <L vi={s.goal.vi} en={s.goal.en} />.
        </p>
      </header>

      <aside className="summary" aria-label="Tóm tắt / Summary">
        <h2><L vi="Tóm tắt 1 phút" en="One-minute summary" /></h2>
        <ul>
          {summary.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </aside>

      <nav className="toc" aria-label="Trong bài này / In this lesson">
        <span><L vi="Trong bài này" en="In this lesson" /></span>
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
