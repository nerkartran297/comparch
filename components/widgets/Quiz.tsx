'use client';

import { useMemo, useState } from 'react';
import { QUIZ } from '@/lib/quiz';
import { highlightAsm } from '@/lib/highlight';
import { useStored } from '@/lib/storage';
import { L } from '@/components/i18n';

const CH = [
  { id: 'all', vi: 'Tất cả', en: 'All' },
  { id: '1', vi: 'Chương 1', en: 'Chapter 1' },
  { id: '2', vi: 'Chương 2', en: 'Chapter 2' },
  { id: '3', vi: 'Chương 3', en: 'Chapter 3' },
  { id: '4', vi: 'Chương 4', en: 'Chapter 4' },
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
  const good = right / list.length >= 0.8;

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
          {CH.map((c) => <button key={c.id} className={`btn sm${ch === c.id ? ' on' : ''}`} onClick={() => setCh(c.id)}><L vi={c.vi} en={c.en} /></button>)}
        </div>
        <span className="quiz-score tabular">
          <L vi="Đúng" en="Correct" /> {right}/{answered.length} · <L vi="đã làm" en="answered" /> {answered.length}/{list.length}
          {best[ch] !== undefined && <> · <L vi="cao nhất" en="best" /> {best[ch]}/{list.length}</>}
        </span>
        <button className="btn sm" onClick={reset}><L vi="Làm lại" en="Start over" /></button>
      </div>
      {finished && (
        <p className={`pill ${good ? 'ok' : 'warn'}`}>
          <L
            vi={`Xong: ${right}/${list.length} câu đúng. ${good ? 'Tốt rồi!' : 'Xem lại giải thích các câu sai rồi làm lại.'}`}
            en={`Done: ${right}/${list.length} correct. ${good ? 'Well done!' : 'Read the explanations for the ones you missed, then try again.'}`}
          />
        </p>
      )}
      <ol className="quiz-list">
        {list.map((q, n) => {
          const p = picked[q.i];
          return (
            <li key={q.i} className="quiz-q">
              <p className="quiz-text">
                <span className="quiz-no mono">{n + 1}</span>
                <span className="quiz-ch"><L vi={`Ch.${q.ch}`} en={`Ch.${q.ch}`} /></span> <L vi={q.q.vi} en={q.q.en} />
              </p>
              {q.code && <pre className="quiz-code mono" dangerouslySetInnerHTML={{ __html: highlightAsm(q.code) }} />}
              <div className="quiz-opts" role="group">
                {q.opts.map((o, k) => {
                  const state = p === undefined ? '' : k === q.a ? ' right' : k === p ? ' wrong' : ' dim';
                  return (
                    <button key={k} className={`quiz-opt${state}`} onClick={() => pick(q.i, k)} disabled={p !== undefined}>
                      <span className="mono">{String.fromCharCode(65 + k)}</span> <L vi={o.vi} en={o.en} />
                    </button>
                  );
                })}
              </div>
              {p !== undefined && (
                <p className={`quiz-why${p === q.a ? ' ok' : ''}`}>
                  <b>{p === q.a ? <L vi="Đúng." en="Correct." /> : <L vi="Chưa đúng." en="Not quite." />}</b> <L vi={q.why.vi} en={q.why.en} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
