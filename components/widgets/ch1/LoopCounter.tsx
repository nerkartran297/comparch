'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useLang, useT } from '@/lib/lang';

const N = (s: string) => Math.max(0, Math.floor(Number(s) || 0));

/** Đếm số lệnh động trong 3 vòng lặp lồng nhau (slide 41). */
export default function LoopCounter() {
  const t = useT();
  const [lang] = useLang();
  const loc = lang === 'en' ? 'en-US' : 'vi-VN';
  const [pre, setPre] = useState('250');
  const [bi, setBi] = useState('20');
  const [bj, setBj] = useState('40');
  const [bk, setBk] = useState('10');
  const [ni, setNi] = useState('100');
  const [nj, setNj] = useState('100');
  const [nk, setNk] = useState('100');
  const [ov, setOv] = useState('2');

  const o = N(ov);
  const k = (N(bk) + o) * N(nk);
  const j = (N(bj) + k + o) * N(nj);
  const i = (N(bi) + j + o) * N(ni);
  const total = N(pre) + i;
  const stat = N(pre) + N(bi) + N(bj) + N(bk) + 3 * o;
  const f = (x: number) => x.toLocaleString(loc);
  const inp = (id: string, v: string, set: (s: string) => void, label: string) => (
    <input id={id} className="code-in" value={v} onChange={(e) => set(e.target.value)} aria-label={label} inputMode="numeric" />
  );
  const instr = <L vi="lệnh" en="instructions" />;

  return (
    <Widget
      title={<L vi="Đếm số lệnh được thực thi (số lệnh động)" en="Counting executed instructions (dynamic count)" />}
      hint={<L
        vi="Sửa các số ngay trong đoạn code. Mỗi vòng for tốn thêm vài lệnh mỗi lần lặp (tăng biến đếm + kiểm tra điều kiện)."
        en="Edit the numbers right inside the code. Every for loop costs a few extra instructions per iteration (increment the counter + check the condition)."
      />}
    >
      <pre className="loop-code mono">
        {inp('lc-pre', pre, setPre, t('Số lệnh trước vòng lặp', 'Instructions before the loops'))} {instr}{'\n'}
        for i = 1..{inp('lc-ni', ni, setNi, t('Số lần lặp i', 'Iterations of i'))}:{'\n'}
        {'    '}{inp('lc-bi', bi, setBi, t('Số lệnh trong vòng i', 'Instructions in the i loop'))} {instr}{'\n'}
        {'    '}for j = 1..{inp('lc-nj', nj, setNj, t('Số lần lặp j', 'Iterations of j'))}:{'\n'}
        {'        '}{inp('lc-bj', bj, setBj, t('Số lệnh trong vòng j', 'Instructions in the j loop'))} {instr}{'\n'}
        {'        '}for k = 1..{inp('lc-nk', nk, setNk, t('Số lần lặp k', 'Iterations of k'))}:{'\n'}
        {'            '}{inp('lc-bk', bk, setBk, t('Số lệnh trong vòng k', 'Instructions in the k loop'))} {instr}{'\n'}
        {'\n'}<L vi="mỗi vòng for tốn thêm" en="each for loop costs an extra" /> {inp('lc-ov', ov, setOv, t('Lệnh phụ mỗi lần lặp', 'Overhead instructions per iteration'))} <L vi="lệnh / lần lặp" en="instructions / iteration" />
      </pre>
      <ol className="solve">
        <li><span><L vi="Vòng k (trong cùng)" en="Loop k (innermost)" /></span><code>({bk} + {o}) × {nk} = {f(k)}</code></li>
        <li><span><L vi="Vòng j" en="Loop j" /></span><code>({bj} + {f(k)} + {o}) × {nj} = {f(j)}</code></li>
        <li><span><L vi="Vòng i" en="Loop i" /></span><code>({bi} + {f(j)} + {o}) × {ni} = {f(i)}</code></li>
        <li><span><L vi="Cộng phần trước vòng lặp" en="Add the code before the loops" /></span><code>{pre} + {f(i)} = <b>{f(total)}</b> <L vi="lệnh động" en="dynamic instructions" /></code></li>
      </ol>
      <p className="explain">
        <L
          vi={<><b>Số lệnh tĩnh</b> (số dòng lệnh viết ra) chỉ là {pre} + {bi} + {bj} + {bk} + 3 × {o} = <b>{f(stat)}</b>. Số lệnh <b>động</b> mới là thứ đi vào công thức CPU time.</>}
          en={<>The <b>static count</b> (instructions written in the code) is only {pre} + {bi} + {bj} + {bk} + 3 × {o} = <b>{f(stat)}</b>. It is the <b>dynamic</b> count that goes into the CPU time formula.</>}
        />
      </p>
    </Widget>
  );
}
