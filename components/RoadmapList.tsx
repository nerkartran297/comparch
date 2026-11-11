'use client';

import Link from 'next/link';
import { STEPS } from '@/lib/nav';
import { useProgress } from '@/lib/storage';
import { useT } from '@/lib/lang';
import { L } from './i18n';

/** Danh sách các bước của lộ trình, kèm trạng thái đã học. */
export default function RoadmapList() {
  const { done, toggle } = useProgress();
  const t = useT();
  return (
    <ol className="roadmap">
      {STEPS.map((s) => (
        <li key={s.id} className={done[s.id] ? 'is-done' : ''}>
          <button
            className="rm-node mono"
            onClick={() => toggle(s.id)}
            aria-pressed={!!done[s.id]}
            aria-label={done[s.id] ? t(`Đánh dấu ${s.short.vi} là chưa học`, `Mark ${s.short.en} as not done`) : t(`Đánh dấu ${s.short.vi} là đã học`, `Mark ${s.short.en} as done`)}
          >
            {done[s.id] ? '✓' : s.no}
          </button>
          <Link href={s.href} className="rm-body">
            <span className="rm-top"><strong><L vi={s.short.vi} en={s.short.en} /></strong><span className="rm-time"><L vi={s.time.vi} en={s.time.en} /></span></span>
            <span className="rm-title"><L vi={s.title.vi} en={s.title.en} /></span>
            <span className="rm-goal"><L vi="Học xong:" en="You will:" /> <L vi={s.goal.vi} en={s.goal.en} /></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
