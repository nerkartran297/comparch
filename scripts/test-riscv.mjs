import * as RV from '../lib/riscv.mjs';
import { EXAMPLES as EX } from '../lib/examples.mjs';
// Chạy: npm test — dịch + chạy mọi chương trình mẫu (bản tiếng Việt và tiếng Anh), kiểm tra kết quả,
// kiểm tra bản tiếng Anh có code y hệt bản tiếng Việt (chỉ khác comment / chuỗi), kiểm tra mã máy và thông báo lỗi 2 thứ tiếng.
let fail = 0;

// bỏ comment và nội dung chuỗi để so sánh phần code
const stripLine = (l) => {
  let out = '', inS = false, inC = false;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if ((inS || inC) && c === '\\') { i++; continue; }
    if (c === '"' && !inC) { inS = !inS; out += c; continue; }
    if (c === "'" && !inS) inC = !inC;
    if (c === '#' && !inS && !inC) break;
    if (!inS) out += c;
  }
  return out.trimEnd();
};
const codeOnly = (src) => src.split('\n').map(stripLine).join('\n');

function runOne(ex, code, tag) {
  const p = RV.assemble(code);
  if (!p.ok) { console.log('ASM FAIL', tag, ex.id, p.errors); return 1; }
  const s = new RV.Sim(); s.load(p); const inp = [...(ex.input || [])];
  let guard = 0;
  while (!s.halted && guard++ < 100) { s.run(1e6); if (s.waiting) { const v = inp.shift(); if (v === undefined) { console.log('NEED INPUT', tag, ex.id); break; } s.provideInput(v); } else break; }
  const e = ex.expect || {}; const errs = [];
  if (s.error) errs.push('runtime ' + s.error);
  for (const [r, v] of Object.entries(e.reg || {})) if (s.x[RV.REG[r]] !== (v | 0)) errs.push(`${r}=${s.x[RV.REG[r]]} want ${v}`);
  for (const [a, v] of Object.entries(e.mem || {})) if ((s.peekWord(+a) | 0) !== (v | 0)) errs.push(`mem[${(+a).toString(16)}]=${s.peekWord(+a)} want ${v}`);
  for (const [l, v] of Object.entries(e.label || {})) if (p.labels[l] !== v) errs.push(`label ${l}=${p.labels[l]?.toString(16)}`);
  if (e.out !== undefined && s.out !== e.out) errs.push(`out=${JSON.stringify(s.out)} want ${JSON.stringify(e.out)}`);
  if (e.outIncludes && !s.out.includes(e.outIncludes)) errs.push(`out=${JSON.stringify(s.out)} missing ${JSON.stringify(e.outIncludes)}`);
  // lùi hết các bước, thanh ghi phải về như ban đầu
  while (s.back());
  if (s.pc !== RV.TEXT_BASE || s.x[2] !== (RV.SP_INIT | 0)) errs.push('backstep restore failed');
  console.log(errs.length ? 'FAIL' : 'ok  ', tag, ex.id, errs.join('; '), errs.length ? '| out=' + JSON.stringify(s.out) : '');
  return errs.length ? 1 : 0;
}

for (const ex of EX) {
  fail += runOne(ex, ex.code, 'vi');
  if (!ex.en) { console.log('FAIL en  ', ex.id, 'thiếu bản tiếng Anh'); fail++; continue; }
  fail += runOne(ex, ex.en.code, 'en');
  if (codeOnly(ex.code) !== codeOnly(ex.en.code)) { console.log('FAIL en  ', ex.id, 'code tiếng Anh khác code tiếng Việt'); fail++; }
  if (/[À-ÖØ-öø-ỹ]/.test(ex.en.code + ex.en.title)) { console.log('FAIL en  ', ex.id, 'còn chữ tiếng Việt'); fail++; }
}

// encoder checks
const chk = (l, h) => { const r = RV.encodeLine(l); const got = r.ok ? RV.hex8(r.words[0].word) : r.msg; if (got !== h) fail++; console.log(got === h ? 'ok  ' : 'FAIL', l, got, r.ok ? r.words[0].d.text : ''); };
chk('add x9, x20, x21', '0x015A04B3'); chk('lw t0, 0(s1)', '0x0004A283'); chk('addi t1, zero, 0', '0x00000313');
chk('addi t1, t1, 1', '0x00130313'); chk('sw x5, 32(x30)', '0x025F2023'); chk('addi x5, x0, 7', '0x00700293');
chk('slli x6, x11, 3', '0x00359313'); chk('beq t0, t1, 8', '0x00628463'); chk('jal ra, 2048', '0x001000EF');

// thông báo lỗi hai thứ tiếng
for (const lang of ['vi', 'en']) {
  RV.setLang(lang);
  for (const l of ['subi t0,t0,1', 'addi t0, t0, 5000', 'add t0, t1', 'beq t0, t1, nowhere', 'lw t0, t1']) {
    const r = RV.encodeLine(l);
    const msg = r.ok ? '(ok?!)' : r.msg;
    const hasVi = /[À-ỹ]/.test(msg.replace(/[×−→±–]/g, ''));
    const bad = r.ok || (lang === 'en' && hasVi);
    if (bad) fail++;
    console.log(bad ? 'FAIL' : 'ok  ', lang, l, '→', msg);
  }
}
RV.setLang('vi');

console.log(fail ? `${fail} lỗi` : 'Tất cả đều đúng.'); process.exit(fail ? 1 : 0);
