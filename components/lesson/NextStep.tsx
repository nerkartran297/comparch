'use client';

import Link from 'next/link';
import { nextStep } from '@/lib/nav';
import { useProgress } from '@/lib/storage';
import { L } from '@/components/i18n';

export default function NextStep({ id }: { id: string }) {
  const { done, toggle } = useProgress();
  const next = nextStep(id);
  const isDone = !!done[id];
  return (
    <footer className="next-step">
      <button className={`done-btn${isDone ? ' on' : ''}`} onClick={() => toggle(id)} aria-pressed={isDone}>
        <span className="done-box">{isDone ? '✓' : ''}</span>
        {isDone ? <L vi="Đã học xong bài này" en="Lesson completed" /> : <L vi="Đánh dấu đã học xong" en="Mark as completed" />}
      </button>
      {next && (
        <Link className="next-link" href={next.href} onClick={() => !isDone && toggle(id, true)}>
          <span><L vi="Bài tiếp · Bước" en="Next · Step" /> {next.no}</span>
          <strong><L vi={next.short.vi} en={next.short.en} />: <L vi={next.title.vi} en={next.title.en} /> →</strong>
        </Link>
      )}
    </footer>
  );
}
