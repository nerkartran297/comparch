import * as RV from '../lib/riscv.mjs';
import { EXAMPLES as EX } from '../lib/examples.mjs';
// Chạy: npm test — dịch + chạy mọi chương trình mẫu, kiểm tra kết quả và mã máy.
let fail=0;
for (const ex of EX) {
  const p = RV.assemble(ex.code);
  if (!p.ok) { console.log('ASM FAIL', ex.id, p.errors); fail++; continue; }
  const s = new RV.Sim(); s.load(p); const inp=[...(ex.input||[])];
  let guard=0;
  while (!s.halted && guard++<100) { s.run(1e6); if (s.waiting) { const v=inp.shift(); if(v===undefined){console.log('NEED INPUT',ex.id);break;} s.provideInput(v);} else break; }
  const e=ex.expect||{}; const errs=[];
  if (s.error) errs.push('runtime '+s.error);
  for (const [r,v] of Object.entries(e.reg||{})) if (s.x[RV.REG[r]] !== (v|0)) errs.push(`${r}=${s.x[RV.REG[r]]} want ${v}`);
  for (const [a,v] of Object.entries(e.mem||{})) if ((s.peekWord(+a)|0)!==(v|0)) errs.push(`mem[${(+a).toString(16)}]=${s.peekWord(+a)} want ${v}`);
  for (const [l,v] of Object.entries(e.label||{})) if (p.labels[l]!==v) errs.push(`label ${l}=${p.labels[l]?.toString(16)}`);
  if (e.out!==undefined && s.out!==e.out) errs.push(`out=${JSON.stringify(s.out)} want ${JSON.stringify(e.out)}`);
  if (e.outIncludes && !s.out.includes(e.outIncludes)) errs.push(`out=${JSON.stringify(s.out)} missing ${JSON.stringify(e.outIncludes)}`);
  // backstep all the way & check registers reset
  while (s.back());
  if (s.pc!==RV.TEXT_BASE || s.x[2]!==(RV.SP_INIT|0)) errs.push('backstep restore failed');
  console.log(errs.length?'FAIL':'ok  ', ex.id, s.count===0?'':'', errs.join('; '), errs.length? '| out='+JSON.stringify(s.out):'');
  if (errs.length) fail++;
}
// encoder checks
const chk=(l,h)=>{const r=RV.encodeLine(l); const got=r.ok?RV.hex8(r.words[0].word):r.msg; console.log(got===h?'ok  ':'FAIL', l, got, r.ok?r.words[0].d.text:'');};
chk('add x9, x20, x21','0x015A04B3'); chk('lw t0, 0(s1)','0x0004A283'); chk('addi t1, zero, 0','0x00000313');
chk('addi t1, t1, 1','0x00130313'); chk('sw x5, 32(x30)','0x025F2023'); chk('addi x5, x0, 7','0x00700293');
chk('slli x6, x11, 3','0x00359313'); chk('beq t0, t1, 8', '0x00628463'); chk('jal ra, 2048','0x001000EF');
console.log(RV.encodeLine('subi t0,t0,1').msg); console.log(RV.encodeLine('addi t0, t0, 5000').msg);
console.log(fail ? `${fail} lỗi` : 'Tất cả đều đúng.'); process.exit(fail ? 1 : 0);
