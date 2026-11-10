'use client';

import Link from 'next/link';
import { STEPS } from '@/lib/nav';
import { useProgress } from '@/lib/storage';

/** Danh sách các bước của lộ trình, kèm trạng thái đã học. */
export default function RoadmapList() {
  const { done, toggle } = useProgress();
  return (
    <ol className="roadmap">
      {STEPS.map((s) => (
        <li key={s.id} className={done[s.id] ? 'is-done' : ''}>
          <button className="rm-node mono" onClick={() => toggle(s.id)} aria-pressed={!!done[s.id]} aria-label={`Đánh dấu ${s.short} ${done[s.id] ? 'chưa học' : 'đã học'}`}>
            {done[s.id] ? '✓' : s.no}
          </button>
          <Link href={s.href} className="rm-body">
            <span className="rm-top"><strong>{s.short}</strong><span className="rm-time">{s.time}</span></span>
            <span className="rm-title">{s.title}</span>
            <span className="rm-goal">Học xong: {s.goal}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
