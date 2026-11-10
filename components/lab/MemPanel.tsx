'use client';

import { useMemo, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import type { Prog, SimT } from './Lab';

type Seg = 'data' | 'stack' | 'text';

const printable = (b: number) => (b >= 32 && b < 127 ? String.fromCharCode(b) : b === 0 ? '·' : '.');

/** Xem bộ nhớ: vùng .data theo byte/word, stack (địa chỉ cao ở trên), hoặc vùng code. */
export default function MemPanel({ sim, prog }: { sim: SimT; prog: Prog | null }) {
  const [seg, setSeg] = useState<Seg>('data');
  const [fmt, setFmt] = useState<'byte' | 'word'>('byte');
  const rec = sim.lastRec;

  const written = useMemo(() => new Set<number>((rec?.mem ?? []).map((m: number[]) => m[0] >>> 0)), [rec]);
  const read = useMemo(() => {
    const s = new Set<number>();
    if (rec?.memR) for (let k = 0; k < rec.memR[1]; k++) s.add((rec.memR[0] + k) >>> 0);
    return s;
  }, [rec]);

  const labelAt = useMemo(() => {
    const m = new Map<number, string[]>();
    if (prog) for (const [name, addr] of Object.entries(prog.labels)) {
      const a = (addr as number) >>> 0;
      if (a >= RV.DATA_BASE && a < RV.TEXT_BASE + 0x10000000) m.set(a, [...(m.get(a) ?? []), name]);
    }
    return m;
  }, [prog]);

  const cellCls = (a: number) => (written.has(a) ? ' w' : read.has(a) ? ' r' : '');

  let body: React.ReactNode = null;
  if (!prog) {
    body = <p className="panel-empty">Dịch chương trình để xem bộ nhớ.</p>;
  } else if (seg === 'data') {
    const end = Math.min(Math.max(prog.dataEnd, RV.DATA_BASE + 32), RV.DATA_BASE + 1024);
    const per = fmt === 'byte' ? 8 : 16;
    const rows: number[] = [];
    for (let a = RV.DATA_BASE; a < end; a += per) rows.push(a);
    body = (
      <>
        <table className="mem mono">
          <thead>
            <tr>
              <th>Địa chỉ</th>
              {fmt === 'byte'
                ? Array.from({ length: 8 }, (_, i) => <th key={i}>+{i}</th>)
                : [0, 4, 8, 12].map((o) => <th key={o}>+{o}</th>)}
              {fmt === 'byte' && <th>ASCII</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a}>
                <td className="addr">{RV.hex8(a)}</td>
                {fmt === 'byte'
                  ? Array.from({ length: 8 }, (_, i) => {
                      const ad = a + i, b = sim.peekByte(ad), labs = labelAt.get(ad);
                      return (
                        <td key={i} className={`b${cellCls(ad)}${labs ? ' lab' : ''}${ad >= prog.dataEnd ? ' out' : ''}`} title={`${RV.hex8(ad)}${labs ? ' ← ' + labs.join(', ') : ''} = ${b}`}>
                          {b.toString(16).toUpperCase().padStart(2, '0')}
                        </td>
                      );
                    })
                  : [0, 4, 8, 12].map((o) => {
                      const ad = a + o, labs = labelAt.get(ad);
                      const hit = [0, 1, 2, 3].some((k) => written.has(ad + k)) ? ' w' : [0, 1, 2, 3].some((k) => read.has(ad + k)) ? ' r' : '';
                      return (
                        <td key={o} className={`wd${hit}${labs ? ' lab' : ''}`} title={`${RV.hex8(ad)}${labs ? ' ← ' + labs.join(', ') : ''} = ${sim.peekWord(ad) | 0}`}>
                          {RV.hex8(sim.peekWord(ad)).slice(2)}
                        </td>
                      );
                    })}
                {fmt === 'byte' && (
                  <td className="ascii">{Array.from({ length: 8 }, (_, i) => printable(sim.peekByte(a + i))).join('')}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {labelAt.size > 0 && (
          <p className="mem-labels">
            {[...labelAt.entries()].filter(([a]) => a < RV.TEXT_BASE + 0x10000000 && a >= RV.DATA_BASE && a < prog.dataEnd + 1).map(([a, n]) => (
              <span key={a}><b>{n.join(', ')}</b> = {RV.hex8(a)}</span>
            ))}
          </p>
        )}
      </>
    );
  } else if (seg === 'stack') {
    const sp = sim.x[2] >>> 0;
    const top = Math.max(RV.SP_INIT, sp) >>> 0;
    const rows: number[] = [];
    for (let a = (top + 4) & ~3; a >= sp - 8 && rows.length < 48; a -= 4) rows.push(a >>> 0);
    const fp = sim.x[8] >>> 0;
    body = (
      <>
        <p className="panel-note">Stack mọc <b>xuống</b> (về địa chỉ thấp). Ô tô vàng = vừa ghi. Đáy stack ở trên cùng.</p>
        <table className="mem stack mono">
          <thead>
            <tr><th>Địa chỉ</th><th>Hex</th><th>Thập phân</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const hit = [0, 1, 2, 3].some((k) => written.has(a + k)) ? ' w' : [0, 1, 2, 3].some((k) => read.has(a + k)) ? ' r' : '';
              const inUse = a >= sp && a < top + 4 && a <= RV.SP_INIT;
              return (
                <tr key={a} className={`${a === sp ? 'is-sp' : ''}${inUse ? ' used' : ''}`}>
                  <td className="addr">{RV.hex8(a)}</td>
                  <td className={`wd${hit}`}>{RV.hex8(sim.peekWord(a)).slice(2)}</td>
                  <td className="dec">{sim.peekWord(a) | 0}</td>
                  <td className="ptr">{a === sp && '← sp'}{a === fp && a !== sp && fp > 0x10000000 ? '← s0/fp' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  } else {
    body = (
      <table className="mem mono">
        <thead><tr><th>Địa chỉ</th><th>Mã máy</th><th>Lệnh</th></tr></thead>
        <tbody>
          {prog.text.map((t) => (
            <tr key={t.addr} className={t.addr === sim.pc ? 'is-sp' : ''}>
              <td className="addr">{RV.hex8(t.addr)}</td>
              <td className="wd">{RV.hex8(sim.peekWord(t.addr)).slice(2)}</td>
              <td className="dec">{RV.decode(sim.peekWord(t.addr), t.addr).abiText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="seg" role="group" aria-label="Vùng nhớ">
          <button className={seg === 'data' ? 'on' : ''} onClick={() => setSeg('data')}>.data</button>
          <button className={seg === 'stack' ? 'on' : ''} onClick={() => setSeg('stack')}>Stack</button>
          <button className={seg === 'text' ? 'on' : ''} onClick={() => setSeg('text')}>.text</button>
        </div>
        {seg === 'data' && (
          <div className="seg" role="group" aria-label="Kiểu hiển thị">
            <button className={fmt === 'byte' ? 'on' : ''} onClick={() => setFmt('byte')}>Byte</button>
            <button className={fmt === 'word' ? 'on' : ''} onClick={() => setFmt('word')}>Word</button>
          </div>
        )}
      </div>
      <div className="mem-scroll">{body}</div>
      {seg === 'data' && fmt === 'word' && (
        <p className="panel-note">Chế độ Word đọc 4 byte theo <b>little-endian</b>: byte ở địa chỉ thấp nhất đứng cuối.</p>
      )}
    </div>
  );
}
