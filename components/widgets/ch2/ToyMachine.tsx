'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useT } from '@/lib/lang';

type St = { mem: Record<number, number>; pc: number; ir: number | null; ac: number | null; phase: 'fetch' | 'exec' | 'halt'; msg: Bi; hot: string[]; n: number };

const INIT_MEM: Record<number, number> = { 0x300: 0x1940, 0x301: 0x5941, 0x302: 0x2941, 0x303: 0x0000, 0x940: 0x0003, 0x941: 0x0002 };
const OPS: Record<number, Bi> = {
  0x1: { vi: 'Nạp AC từ bộ nhớ', en: 'Load AC from memory' },
  0x2: { vi: 'Lưu AC vào bộ nhớ', en: 'Store AC to memory' },
  0x5: { vi: 'Cộng ô nhớ vào AC', en: 'Add memory word to AC' },
  0x0: { vi: 'Dừng máy', en: 'Halt' },
};

const h3 = (v: number) => v.toString(16).toUpperCase().padStart(3, '0');
const h4 = (v: number | null) => (v === null ? '----' : v.toString(16).toUpperCase().padStart(4, '0'));

const fresh = (mem = INIT_MEM): St => ({
  mem: { ...mem }, pc: 0x300, ir: null, ac: null, phase: 'fetch', hot: ['pc'], n: 0,
  msg: { vi: 'Máy vừa bật. PC = 300: lệnh đầu tiên nằm ở ô nhớ 300.', en: 'The machine has just started. PC = 300: the first instruction is in memory word 300.' },
});

function next(s: St): St {
  if (s.phase === 'halt') return s;
  if (s.phase === 'fetch') {
    const w = s.mem[s.pc] ?? 0;
    return { ...s, ir: w, pc: s.pc + 1, phase: 'exec', n: s.n + 1, hot: ['ir', 'pc', `m${s.pc}`],
      msg: {
        vi: `FETCH: đọc ô nhớ ${h3(s.pc)} (PC chỉ tới) → IR = ${h4(w)}. Tăng PC lên ${h3(s.pc + 1)} để trỏ lệnh kế tiếp.`,
        en: `FETCH: read memory word ${h3(s.pc)} (where PC points) → IR = ${h4(w)}. Increment PC to ${h3(s.pc + 1)} so it points to the next instruction.`,
      } };
  }
  const ir = s.ir ?? 0, op = ir >> 12, addr = ir & 0xfff, m = s.mem[addr] ?? 0;
  const base = { ...s, phase: 'fetch' as const, n: s.n + 1 };
  switch (op) {
    case 0x1: return { ...base, ac: m, hot: ['ac', `m${addr}`], msg: {
      vi: `EXECUTE: IR = ${h4(ir)} → opcode 1 (nạp), địa chỉ ${h3(addr)}. AC ← M[${h3(addr)}] = ${h4(m)}.`,
      en: `EXECUTE: IR = ${h4(ir)} → opcode 1 (load), address ${h3(addr)}. AC ← M[${h3(addr)}] = ${h4(m)}.`,
    } };
    case 0x5: { const r = ((s.ac ?? 0) + m) & 0xffff; return { ...base, ac: r, hot: ['ac', `m${addr}`], msg: {
      vi: `EXECUTE: opcode 5 (cộng), địa chỉ ${h3(addr)}. AC ← AC + M[${h3(addr)}] = ${h4(s.ac)} + ${h4(m)} = ${h4(r)}.`,
      en: `EXECUTE: opcode 5 (add), address ${h3(addr)}. AC ← AC + M[${h3(addr)}] = ${h4(s.ac)} + ${h4(m)} = ${h4(r)}.`,
    } }; }
    case 0x2: return { ...base, mem: { ...s.mem, [addr]: s.ac ?? 0 }, hot: [`m${addr}`, 'ac'], msg: {
      vi: `EXECUTE: opcode 2 (lưu), địa chỉ ${h3(addr)}. M[${h3(addr)}] ← AC = ${h4(s.ac)}.`,
      en: `EXECUTE: opcode 2 (store), address ${h3(addr)}. M[${h3(addr)}] ← AC = ${h4(s.ac)}.`,
    } };
    case 0x0: return { ...base, phase: 'halt', hot: [], msg: {
      vi: 'EXECUTE: opcode 0 → dừng máy. (Ô 303 được thêm vào để máy dừng; ví dụ gốc chỉ có 3 lệnh.)',
      en: 'EXECUTE: opcode 0 → halt. (Word 303 was added so the machine stops; the original example has only 3 instructions.)',
    } };
    default: return { ...base, phase: 'halt', hot: [], msg: {
      vi: `Opcode ${op.toString(16)} không có trong bảng → dừng.`,
      en: `Opcode ${op.toString(16)} is not in the table → halt.`,
    } };
  }
}

/** Máy giả định trong sách Stallings (slide 18–20): chạy từng pha FETCH / EXECUTE. */
export default function ToyMachine() {
  const t = useT();
  const [hist, setHist] = useState<St[]>([fresh()]);
  const s = hist[hist.length - 1];
  const [edit, setEdit] = useState<Record<number, string>>({});

  const addrs = Object.keys(s.mem).map(Number).sort((a, b) => a - b);
  const step = () => setHist((h) => [...h, next(h[h.length - 1])]);
  const back = () => setHist((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const reset = () => { setHist([fresh(hist[0].mem)]); setEdit({}); };
  const runAll = () => setHist((h) => { const out = [...h]; let c = out[out.length - 1]; for (let i = 0; i < 20 && c.phase !== 'halt'; i++) { c = next(c); out.push(c); } return out; });
  const canEdit = hist.length === 1;

  const setMem = (a: number, v: string) => {
    setEdit((e) => ({ ...e, [a]: v }));
    if (/^[0-9a-fA-F]{1,4}$/.test(v)) {
      const mem = { ...hist[0].mem, [a]: parseInt(v, 16) };
      setHist([fresh(mem)]);
    }
  };

  const reg = (id: string, name: string, val: string, note: React.ReactNode) => (
    <div className={`tm-reg${s.hot.includes(id) ? ' hot' : ''}`} key={`${id}-${s.n}`}>
      <span>{name}</span>
      <strong className="mono">{val}</strong>
      <em>{note}</em>
    </div>
  );

  return (
    <Widget
      title={<L vi="Máy giả định chạy từng pha: Fetch → Execute" en="A hypothetical machine, phase by phase: Fetch → Execute" />}
      hint={<L
        vi="Lệnh 16 bit = 4 bit opcode + 12 bit địa chỉ. Ví dụ 1940: opcode 1, địa chỉ 940. Bấm “Bước” để đi từng pha. Trước khi chạy có thể sửa nội dung ô nhớ."
        en="A 16-bit instruction = 4-bit opcode + 12-bit address. Example 1940: opcode 1, address 940. Press “Step” to go one phase at a time. Before running you can edit the memory contents."
      />}
    >
      <div className="tm">
        <div className="tm-cpu">
          <p className="tm-h">CPU</p>
          {reg('pc', 'PC', h3(s.pc), <L vi="địa chỉ lệnh sắp lấy" en="address of the next instruction" />)}
          {reg('ir', 'IR', h4(s.ir), <L vi="lệnh vừa lấy về" en="instruction just fetched" />)}
          {reg('ac', 'AC', h4(s.ac), <L vi="thanh ghi tích luỹ" en="accumulator" />)}
          <div className={`tm-phase ${s.phase}`}>
            {s.phase === 'halt' ? <L vi="ĐÃ DỪNG" en="HALTED" /> : s.phase === 'fetch' ? <L vi="Pha tiếp theo: FETCH" en="Next phase: FETCH" /> : <L vi="Pha tiếp theo: EXECUTE" en="Next phase: EXECUTE" />}
          </div>
        </div>
        <div className="tm-mem">
          <p className="tm-h"><L vi="Bộ nhớ" en="Memory" /></p>
          <div className="scroll-x">
          <table className="steptable">
            <thead><tr><th><L vi="Địa chỉ" en="Address" /></th><th><L vi="Nội dung" en="Contents" /></th><th><L vi="Ý nghĩa" en="Meaning" /></th></tr></thead>
            <tbody>
              {addrs.map((a) => {
                const v = s.mem[a];
                const isProg = a < 0x900;
                const op = OPS[v >> 12];
                return (
                  <tr key={`${a}-${s.n}`} className={`${s.hot.includes(`m${a}`) ? 'cur tm-flash' : ''}${a === s.pc && s.phase === 'fetch' ? ' tm-pc' : ''}`}>
                    <td>{h3(a)}{a === s.pc && s.phase !== 'halt' ? ' ← PC' : ''}</td>
                    <td>
                      {canEdit ? (
                        <input id={`tm-${a}`} className="cell-in mono" value={edit[a] ?? h4(v)} onChange={(e) => setMem(a, e.target.value)} aria-label={t(`Ô nhớ ${h3(a)}`, `Memory word ${h3(a)}`)} />
                      ) : h4(v)}
                    </td>
                    <td className="txt">
                      {isProg
                        ? <L vi={`${op?.vi ?? '?'}${v >> 12 ? ` (ô ${h3(v & 0xfff)})` : ''}`} en={`${op?.en ?? '?'}${v >> 12 ? ` (word ${h3(v & 0xfff)})` : ''}`} />
                        : <L vi={`dữ liệu = ${v}`} en={`data = ${v}`} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <p className="tm-msg" aria-live="polite"><b><L vi="Bước" en="Step" /> {s.n}:</b> <L vi={s.msg.vi} en={s.msg.en} /></p>
      <div className="chips">
        <button className="btn" onClick={back} disabled={hist.length === 1}>⏮ <L vi="Lùi" en="Back" /></button>
        <button className="btn primary" onClick={step} disabled={s.phase === 'halt'}>⏭ <L vi="Bước" en="Step" /></button>
        <button className="btn" onClick={runAll} disabled={s.phase === 'halt'}><L vi="Chạy hết" en="Run to end" /></button>
        <button className="btn" onClick={reset}>⟲ <L vi="Làm lại" en="Reset" /></button>
      </div>
      <p className="widget-note">
        <L
          vi="Bảng opcode: 1 = nạp AC từ ô nhớ · 2 = lưu AC vào ô nhớ · 5 = cộng ô nhớ vào AC · 0 = dừng (thêm cho máy biết khi nào dừng)."
          en="Opcode table: 1 = load AC from memory · 2 = store AC to memory · 5 = add memory word to AC · 0 = halt (added so the machine knows when to stop)."
        />
      </p>
    </Widget>
  );
}
