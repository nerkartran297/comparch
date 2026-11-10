'use client';

import Link from 'next/link';
import { nextStep } from '@/lib/nav';
import { useProgress } from '@/lib/storage';

export default function NextStep({ id }: { id: string }) {
  const { done, toggle } = useProgress();
  const next = nextStep(id);
  const isDone = !!done[id];
  return (
    <footer className="next-step">
      <button className={`done-btn${isDone ? ' on' : ''}`} onClick={() => toggle(id)} aria-pressed={isDone}>
        <span className="done-box">{isDone ? '✓' : ''}</span>
        {isDone ? 'Đã học xong bài này' : 'Đánh dấu đã học xong'}
      </button>
      {next && (
        <Link className="next-link" href={next.href} onClick={() => !isDone && toggle(id, true)}>
          <span>Bài tiếp · Bước {next.no}</span>
          <strong>{next.short}: {next.title} →</strong>
        </Link>
      )}
    </footer>
  );
}
