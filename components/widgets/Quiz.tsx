'use client';

import { useMemo, useState } from 'react';
import { QUIZ } from '@/lib/quiz';
import { highlightAsm } from '@/lib/highlight';
import { useStored } from '@/lib/storage';

const CH = [
  { id: 'all', label: 'Tất cả' }, { id: '1', label: 'Chương 1' }, { id: '2', label: 'Chương 2' }, { id: '3', label: 'Chương 3' }, { id: '4', label: 'Chương 4' },
];

/** Trắc nghiệm có giải thích ngay sau khi chọn. Điểm cao nhất lưu trong trình duyệt. */
export default function Quiz() {
  const [ch, setCh] = useState('all');
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [best, setBest] = useStored<Record<string, number>>('ktmt-quiz-best', {});
  const list = useMemo(() => QUIZ.map((q, i) => ({ ...q, i })).filter((q) => ch === 'all' || q.ch === ch), [ch]);
  const answered = list.filter((q) => picked[q.i] !== undefined);
  const right = answered.filter((q) => picked[q.i] === q.a).length;
  const finished = answered.length === list.length;

  const pick = (i: number, k: number) => {
    if (picked[i] !== undefined) return;
    const next = { ...picked, [i]: k };
    setPicked(next);
    const nAns = list.filter((q) => next[q.i] !== undefined);
    if (nAns.length === list.length) {
      const score = nAns.filter((q) => next[q.i] === q.a).length;
      setBest((b) => ({ ...b, [ch]: Math.max(b[ch] ?? 0, score) }));
    }
  };
  const reset = () => setPicked((p) => { const n = { ...p }; list.forEach((q) => delete n[q.i]); return n; });

  return (
    <div className="quiz">
      <div className="quiz-bar">
        <div className="chips">
          {CH.map((c) => <button key={c.id} className={`btn sm${ch === c.id ? ' on' : ''}`} onClick={() => setCh(c.id)}>{c.label}</button>)}
        </div>
        <span className="quiz-score tabular">
          Đúng {right}/{answered.length} · đã làm {answered.length}/{list.length}
          {best[ch] !== undefined && ` · cao nhất ${best[ch]}/${list.length}`}
        </span>
        <button className="btn sm" onClick={reset}>Làm lại</button>
      </div>
      {finished && (
        <p className={`pill ${right / list.length >= 0.8 ? 'ok' : 'warn'}`}>
          Xong: {right}/{list.length} câu đúng. {right / list.length >= 0.8 ? 'Tốt rồi!' : 'Xem lại giải thích các câu sai rồi làm lại.'}
        </p>
      )}
      <ol className="quiz-list">
        {list.map((q, n) => {
          const p = picked[q.i];
          return (
            <li key={q.i} className="quiz-q">
              <p className="quiz-text"><span className="quiz-no mono">{n + 1}</span><span className="quiz-ch">Ch.{q.ch}</span> {q.q}</p>
              {q.code && <pre className="quiz-code mono" dangerouslySetInnerHTML={{ __html: highlightAsm(q.code) }} />}
              <div className="quiz-opts" role="group">
                {q.opts.map((o, k) => {
                  const state = p === undefined ? '' : k === q.a ? ' right' : k === p ? ' wrong' : ' dim';
                  return (
                    <button key={k} className={`quiz-opt${state}`} onClick={() => pick(q.i, k)} disabled={p !== undefined}>
                      <span className="mono">{String.fromCharCode(65 + k)}</span> {o}
                    </button>
                  );
                })}
              </div>
              {p !== undefined && <p className={`quiz-why${p === q.a ? ' ok' : ''}`}><b>{p === q.a ? 'Đúng.' : 'Chưa đúng.'}</b> {q.why}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
