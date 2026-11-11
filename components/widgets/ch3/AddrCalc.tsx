'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';

const h8 = (v: number) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');

/** lw rd, offset(rs1): địa chỉ = giá trị rs1 + offset. Với mảng int, offset = chỉ số × 4. */
export default function AddrCalc() {
  const t = useT();
  const [base, setBase] = useState('0x12004094');
  const [off, setOff] = useState('24');
  const [ins, setIns] = useState<'lw' | 'sw'>('lw');
  const b = parseInt(base.replace(/^0x/i, ''), 16);
  const o = Math.trunc(Number(off));
  const ok = /^(0x)?[0-9a-f]{1,8}$/i.test(base.trim()) && Number.isFinite(o) && off.trim() !== '' && o >= -2048 && o <= 2047;
  const addr = (b + o) >>> 0;

  return (
    <Widget
      title={<L vi="Tính địa chỉ cho lw / sw" en="Computing the address for lw / sw" />}
      hint={<L vi="Đề slide 29: s3 = 0x12004094, lệnh lw t0, 24(s3) đọc word ở địa chỉ nào?" en="Slide 29: s3 = 0x12004094. Which address does lw t0, 24(s3) read the word from?" />}
    >
      <div className="ctrls">
        <div className="chips">
          <button className={`btn sm${ins === 'lw' ? ' on' : ''}`} onClick={() => setIns('lw')}>lw</button>
          <button className={`btn sm${ins === 'sw' ? ' on' : ''}`} onClick={() => setIns('sw')}>sw</button>
        </div>
        <label className="field"><L vi="Giá trị thanh ghi cơ sở (hex)" en="Base register value (hex)" /><input id="ac-base" className="mono" value={base} onChange={(e) => setBase(e.target.value)} /></label>
        <label className="field"><L vi="offset (thập phân, −2048…2047)" en="offset (decimal, −2048…2047)" /><input id="ac-off" className="mono" value={off} onChange={(e) => setOff(e.target.value)} /></label>
      </div>
      {!ok ? (
        <p className="pill bad"><L vi="Thanh ghi cơ sở là hex tối đa 8 chữ số; offset là số 12 bit có dấu." en="The base register is hex with at most 8 digits; the offset is a 12-bit signed number." /></p>
      ) : (
        <>
          <p className="ac-ins mono"><b>{ins}</b> t0, <span className="ac-off">{o}</span>(<span className="ac-base">s3</span>)</p>
          <pre className="explain mono">{`  ${h8(b)}   (s3)
+ ${h8(o)}   (${o} ${t('thập phân', 'decimal')} = 0x${(o >>> 0).toString(16).toUpperCase()}${o < 0 ? t(', số âm ở dạng bù 2', ", a negative number in two's complement") : ''})
  ----------
= ${h8(addr)}   ← ${ins === 'lw' ? t('địa chỉ được đọc', 'address that is read') : t('địa chỉ được ghi', 'address that is written')}`}</pre>
          <div className="readouts">
            <div className="readout accent"><span><L vi="Địa chỉ" en="Address" /></span><strong>{h8(addr)}</strong></div>
            <div className={`readout${addr % 4 ? ' signal' : ''}`}><span><L vi="Chia hết cho 4?" en="Divisible by 4?" /></span><strong>{addr % 4 ? <L vi="Không → lỗi căn lề" en="No → alignment error" /> : <L vi="Có" en="Yes" />}</strong></div>
            <div className="readout"><span><L vi="Nếu s3 là địa chỉ A[0] của mảng int" en="If s3 holds the address of A[0] of an int array" /></span><strong>{o % 4 === 0 ? <L vi={`phần tử A[${o / 4}]`} en={`element A[${o / 4}]`} /> : <L vi="không trúng phần tử nào" en="not on any element" />}</strong></div>
          </div>
        </>
      )}
    </Widget>
  );
}
