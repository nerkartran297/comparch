'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

const h8 = (v: number) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');

/** lw rd, offset(rs1): địa chỉ = giá trị rs1 + offset. Với mảng int, offset = chỉ số × 4. */
export default function AddrCalc() {
  const [base, setBase] = useState('0x12004094');
  const [off, setOff] = useState('24');
  const [ins, setIns] = useState<'lw' | 'sw'>('lw');
  const b = parseInt(base.replace(/^0x/i, ''), 16);
  const o = Math.trunc(Number(off));
  const ok = /^(0x)?[0-9a-f]{1,8}$/i.test(base.trim()) && Number.isFinite(o) && off.trim() !== '' && o >= -2048 && o <= 2047;
  const addr = (b + o) >>> 0;

  return (
    <Widget title="Tính địa chỉ cho lw / sw" hint="Đề slide 29: s3 = 0x12004094, lệnh lw t0, 24(s3) đọc word ở địa chỉ nào?">
      <div className="ctrls">
        <div className="chips">
          <button className={`btn sm${ins === 'lw' ? ' on' : ''}`} onClick={() => setIns('lw')}>lw</button>
          <button className={`btn sm${ins === 'sw' ? ' on' : ''}`} onClick={() => setIns('sw')}>sw</button>
        </div>
        <label className="field">Giá trị thanh ghi cơ sở (hex)<input id="ac-base" className="mono" value={base} onChange={(e) => setBase(e.target.value)} /></label>
        <label className="field">offset (thập phân, −2048…2047)<input id="ac-off" className="mono" value={off} onChange={(e) => setOff(e.target.value)} /></label>
      </div>
      {!ok ? (
        <p className="pill bad">Thanh ghi cơ sở là hex tối đa 8 chữ số; offset là số 12 bit có dấu.</p>
      ) : (
        <>
          <p className="ac-ins mono"><b>{ins}</b> t0, <span className="ac-off">{o}</span>(<span className="ac-base">s3</span>)</p>
          <pre className="explain mono">{`  ${h8(b)}   (s3)
+ ${h8(o).replace('0x', '0x')}   (${o} thập phân = 0x${(o >>> 0).toString(16).toUpperCase()}${o < 0 ? ', số âm ở dạng bù 2' : ''})
  ----------
= ${h8(addr)}   ← địa chỉ ${ins === 'lw' ? 'được đọc' : 'được ghi'}`}</pre>
          <div className="readouts">
            <div className="readout accent"><span>Địa chỉ</span><strong>{h8(addr)}</strong></div>
            <div className={`readout${addr % 4 ? ' signal' : ''}`}><span>Chia hết cho 4?</span><strong>{addr % 4 ? 'Không → lỗi căn lề' : 'Có'}</strong></div>
            <div className="readout"><span>Nếu s3 là địa chỉ A[0] của mảng int</span><strong>{o % 4 === 0 ? `phần tử A[${o / 4}]` : 'không trúng phần tử nào'}</strong></div>
          </div>
        </>
      )}
    </Widget>
  );
}
