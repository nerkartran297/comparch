'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

const N = (s: string) => Math.max(0, Math.floor(Number(s) || 0));

/** Đếm số lệnh động trong 3 vòng lặp lồng nhau (slide 41). */
export default function LoopCounter() {
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
  const f = (x: number) => x.toLocaleString('vi-VN');
  const inp = (id: string, v: string, set: (s: string) => void, label: string) => (
    <input id={id} className="code-in" value={v} onChange={(e) => set(e.target.value)} aria-label={label} inputMode="numeric" />
  );

  return (
    <Widget title="Đếm số lệnh được thực thi (số lệnh động)" hint="Sửa các số ngay trong đoạn code. Mỗi vòng for tốn thêm vài lệnh mỗi lần lặp (tăng biến đếm + kiểm tra điều kiện).">
      <pre className="loop-code mono">
        {inp('lc-pre', pre, setPre, 'Số lệnh trước vòng lặp')} lệnh{'\n'}
        for i = 1..{inp('lc-ni', ni, setNi, 'Số lần lặp i')}:{'\n'}
        {'    '}{inp('lc-bi', bi, setBi, 'Số lệnh trong vòng i')} lệnh{'\n'}
        {'    '}for j = 1..{inp('lc-nj', nj, setNj, 'Số lần lặp j')}:{'\n'}
        {'        '}{inp('lc-bj', bj, setBj, 'Số lệnh trong vòng j')} lệnh{'\n'}
        {'        '}for k = 1..{inp('lc-nk', nk, setNk, 'Số lần lặp k')}:{'\n'}
        {'            '}{inp('lc-bk', bk, setBk, 'Số lệnh trong vòng k')} lệnh{'\n'}
        {'\n'}mỗi vòng for tốn thêm {inp('lc-ov', ov, setOv, 'Lệnh phụ mỗi lần lặp')} lệnh / lần lặp
      </pre>
      <ol className="solve">
        <li><span>Vòng k (trong cùng)</span><code>({bk} + {o}) × {nk} = {f(k)}</code></li>
        <li><span>Vòng j</span><code>({bj} + {f(k)} + {o}) × {nj} = {f(j)}</code></li>
        <li><span>Vòng i</span><code>({bi} + {f(j)} + {o}) × {ni} = {f(i)}</code></li>
        <li><span>Cộng phần trước vòng lặp</span><code>{pre} + {f(i)} = <b>{f(total)}</b> lệnh động</code></li>
      </ol>
      <p className="explain">
        <b>Số lệnh tĩnh</b> (số dòng lệnh viết ra) chỉ là {pre} + {bi} + {bj} + {bk} + 3 × {o} = <b>{f(stat)}</b>. Số lệnh <b>động</b> mới là thứ
        đi vào công thức CPU time.
      </p>
    </Widget>
  );
}
