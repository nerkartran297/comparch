/* RISC-V RV32IM (+ một phần F) — assembler & mô phỏng kiểu RARS, dùng để học.
 Dùng chung cho web (import) và test Node (scripts/test-riscv.mjs). */

const TEXT_BASE = 0x00400000, DATA_BASE = 0x10010000;
const SP_INIT = 0x7FFFEFFC, GP_INIT = 0x10008000;

const ABI = ['zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
  's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6'];
const FABI = ['ft0', 'ft1', 'ft2', 'ft3', 'ft4', 'ft5', 'ft6', 'ft7', 'fs0', 'fs1', 'fa0', 'fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6', 'fa7',
  'fs2', 'fs3', 'fs4', 'fs5', 'fs6', 'fs7', 'fs8', 'fs9', 'fs10', 'fs11', 'ft8', 'ft9', 'ft10', 'ft11'];
const REG = Object.create(null), FREG = Object.create(null);
for (let i = 0; i < 32; i++) { REG['x' + i] = i; REG[ABI[i]] = i; FREG['f' + i] = i; FREG[FABI[i]] = i; }
REG.fp = 8;

const hex8 = v => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');
const bin32 = v => (v >>> 0).toString(2).padStart(32, '0');

// ---------- instruction tables ----------
const R_OPS = {
  add: [0x00, 0], sub: [0x20, 0], sll: [0x00, 1], slt: [0x00, 2], sltu: [0x00, 3], xor: [0x00, 4],
  srl: [0x00, 5], sra: [0x20, 5], or: [0x00, 6], and: [0x00, 7],
  mul: [0x01, 0], mulh: [0x01, 1], mulhsu: [0x01, 2], mulhu: [0x01, 3],
  div: [0x01, 4], divu: [0x01, 5], rem: [0x01, 6], remu: [0x01, 7]
};
const IA_OPS = { addi: 0, slti: 2, sltiu: 3, xori: 4, ori: 6, andi: 7 };
const SH_OPS = { slli: [0x00, 1], srli: [0x00, 5], srai: [0x20, 5] };
const LD_OPS = { lb: 0, lh: 1, lw: 2, lbu: 4, lhu: 5 };
const ST_OPS = { sb: 0, sh: 1, sw: 2 };
const BR_OPS = { beq: 0, bne: 1, blt: 4, bge: 5, bltu: 6, bgeu: 7 };
const FR_OPS = { 'fadd.s': 0x00, 'fsub.s': 0x04, 'fmul.s': 0x08, 'fdiv.s': 0x0C };
const FSGN = { 'fsgnj.s': 0, 'fsgnjn.s': 1, 'fsgnjx.s': 2 };
const FCMP = { 'feq.s': 2, 'flt.s': 1, 'fle.s': 0 };

const SYNTAX = {};
Object.keys(R_OPS).forEach(k => SYNTAX[k] = k + ' rd, rs1, rs2');
Object.keys(IA_OPS).forEach(k => SYNTAX[k] = k + ' rd, rs1, imm');
Object.keys(SH_OPS).forEach(k => SYNTAX[k] = k + ' rd, rs1, shamt');
Object.keys(LD_OPS).forEach(k => SYNTAX[k] = k + ' rd, offset(rs1)');
Object.keys(ST_OPS).forEach(k => SYNTAX[k] = k + ' rs2, offset(rs1)');
Object.keys(BR_OPS).forEach(k => SYNTAX[k] = k + ' rs1, rs2, nhãn');
Object.assign(SYNTAX, {
  jal: 'jal rd, nhãn  hoặc  jal nhãn', jalr: 'jalr rd, offset(rs1)  hoặc  jalr rd, rs1, imm',
  lui: 'lui rd, imm20', auipc: 'auipc rd, imm20', li: 'li rd, số', la: 'la rd, nhãn', mv: 'mv rd, rs',
  j: 'j nhãn', jr: 'jr rs', not: 'not rd, rs', neg: 'neg rd, rs', call: 'call nhãn',
  beqz: 'beqz rs, nhãn', bnez: 'bnez rs, nhãn', bgt: 'bgt rs1, rs2, nhãn', ble: 'ble rs1, rs2, nhãn',
  bgtu: 'bgtu rs1, rs2, nhãn', bleu: 'bleu rs1, rs2, nhãn', bltz: 'bltz rs, nhãn', bgez: 'bgez rs, nhãn',
  blez: 'blez rs, nhãn', bgtz: 'bgtz rs, nhãn', seqz: 'seqz rd, rs', snez: 'snez rd, rs',
  flw: 'flw fd, offset(rs1)', fsw: 'fsw fs2, offset(rs1)', 'fmv.s': 'fmv.s fd, fs',
  'fcvt.s.w': 'fcvt.s.w fd, rs', 'fcvt.w.s': 'fcvt.w.s rd, fs', 'fmv.x.w': 'fmv.x.w rd, fs', 'fmv.w.x': 'fmv.w.x fd, rs'
});
['fadd.s', 'fsub.s', 'fmul.s', 'fdiv.s', 'fsgnj.s', 'fsgnjn.s', 'fsgnjx.s'].forEach(k => SYNTAX[k] = k + ' fd, fs1, fs2');
['feq.s', 'flt.s', 'fle.s'].forEach(k => SYNTAX[k] = k + ' rd, fs1, fs2');

const HINTS = {
  subi: 'RISC-V không có lệnh subi. Dùng addi với số âm, ví dụ: addi t0, t0, -5',
  move: 'RISC-V dùng mv rd, rs (không phải move như MIPS).',
  lwi: 'Không có lwi. Dùng li để nạp hằng số.',
  'b': 'Dùng j nhãn để nhảy không điều kiện.',
  jl: 'Ý bạn là jal?',
  print: 'Muốn in ra màn hình thì dùng ecall (ví dụ: li a7, 1 rồi ecall để in số trong a0).'
};

// ---------- helpers: parsing ----------
class AsmError extends Error { constructor(line, msg) { super(msg); this.line = line; } }

function unescapeChar(s, i) { // s[i] === '\\'
  const c = s[i + 1];
  const map = { n: 10, t: 9, r: 13, '0': 0, '\\': 92, "'": 39, '"': 34 };
  if (c in map) return [map[c], 2];
  return [c.charCodeAt(0), 2];
}

function parseNum(tok) {
  if (tok == null) return null;
  tok = String(tok).trim();
  if (!tok) return null;
  let m = /^'(\\.|[^\\'])'$/.exec(tok);
  if (m) { return m[1][0] === '\\' ? unescapeChar(m[1], 0)[0] : m[1].codePointAt(0); }
  let neg = false;
  if (tok[0] === '-' || tok[0] === '+') { neg = tok[0] === '-'; tok = tok.slice(1); }
  let v = null;
  if (/^0x[0-9a-f]+$/i.test(tok)) v = parseInt(tok.slice(2), 16);
  else if (/^0b[01]+$/i.test(tok)) v = parseInt(tok.slice(2), 2);
  else if (/^\d+$/.test(tok)) v = parseInt(tok, 10);
  if (v === null || !isFinite(v)) return null;
  return neg ? -v : v;
}

function stripComment(line) {
  let inS = false, inC = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if ((inS || inC) && ch === '\\') { i++; continue; }
    if (ch === '"' && !inC) inS = !inS;
    else if (ch === "'" && !inS) inC = !inC;
    else if (ch === '#' && !inS && !inC) return line.slice(0, i);
  }
  return line;
}

function splitArgs(s) { // comma-separated, quote aware (for directives)
  const out = []; let cur = '', inS = false, inC = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if ((inS || inC) && ch === '\\') { cur += ch + (s[i + 1] || ''); i++; continue; }
    if (ch === '"' && !inC) inS = !inS;
    else if (ch === "'" && !inS) inC = !inC;
    if (ch === ',' && !inS && !inC) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function splitOperands(s) { // commas or whitespace, keep (...) attached
  const out = []; let cur = '', depth = 0, inC = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inC && ch === '\\') { cur += ch + (s[i + 1] || ''); i++; continue; }
    if (ch === "'") inC = !inC;
    if (!inC && ch === '(') depth++;
    if (!inC && ch === ')') depth--;
    if (!inC && depth === 0 && (ch === ',' || /\s/.test(ch))) { if (cur) out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  // merge "0" "(sp)"
  const merged = [];
  for (const t of out) {
    if (t[0] === '(' && merged.length && parseNum(merged[merged.length - 1]) !== null) merged[merged.length - 1] += t;
    else merged.push(t);
  }
  return merged;
}

function parseString(tok, line) {
  const m = /^"(.*)"$/s.exec(tok.trim());
  if (!m) throw new AsmError(line, 'Chuỗi phải nằm trong dấu ngoặc kép "..."');
  const s = m[1], bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') { const [c, n] = unescapeChar(s, i); bytes.push(c); i += n - 1; }
    else {
      const cp = s.codePointAt(i);
      if (cp > 0x7F) { // UTF-8 encode
        const enc = new TextEncoder().encode(String.fromCodePoint(cp));
        enc.forEach(b => bytes.push(b));
        if (cp > 0xFFFF) i++;
      } else bytes.push(cp);
    }
  }
  return bytes;
}

// ---------- encoders ----------
const encR = (f7, rs2, rs1, f3, rd, op) => ((f7 << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | op) >>> 0;
const encI = (imm, rs1, f3, rd, op) => (((imm & 0xFFF) << 20) | (rs1 << 15) | (f3 << 12) | (rd << 7) | op) >>> 0;
const encS = (imm, rs2, rs1, f3, op) => ((((imm >> 5) & 0x7F) << 25) | (rs2 << 20) | (rs1 << 15) | (f3 << 12) | ((imm & 0x1F) << 7) | op) >>> 0;
const encB = (imm, rs2, rs1, f3, op) => ((((imm >> 12) & 1) << 31) | (((imm >> 5) & 0x3F) << 25) | (rs2 << 20) | (rs1 << 15) |
  (f3 << 12) | (((imm >> 1) & 0xF) << 8) | (((imm >> 11) & 1) << 7) | op) >>> 0;
const encU = (imm20, rd, op) => (((imm20 & 0xFFFFF) << 12) | (rd << 7) | op) >>> 0;
const encJ = (imm, rd, op) => ((((imm >> 20) & 1) << 31) | (((imm >> 1) & 0x3FF) << 21) | (((imm >> 11) & 1) << 20) |
  (((imm >> 12) & 0xFF) << 12) | (rd << 7) | op) >>> 0;

// ---------- assembler ----------
function assemble(source) {
  const errors = [], warnings = [];
  const lines = String(source).replace(/\r/g, '').replace(/[–−—]/g, '-').replace(/ /g, ' ').split('\n');
  const labels = Object.create(null);
  const eqv = Object.create(null);
  const insts = [];   // {addr, line, src, mn, ops, size}
  const dataItems = []; // {addr, line, kind, ...}
  let seg = 'text', textPC = TEXT_BASE, dataPC = DATA_BASE;
  let pending = [];

  const bind = (addr) => { for (const p of pending) labels[p.name] = addr; pending = []; };
  const align = (n) => { const r = dataPC % n; if (r) dataPC += n - r; };

  const subEqv = (tok) => (tok in eqv ? eqv[tok] : tok);

  // pass 1
  lines.forEach((raw, idx) => {
    const ln = idx + 1;
    try {
      let rest = stripComment(raw).trim();
      let m;
      while ((m = /^([A-Za-z_.$][\w.$]*)\s*:(?!=)/.exec(rest))) {
        const name = m[1];
        if (name in labels || pending.some(p => p.name === name)) throw new AsmError(ln, `Nhãn '${name}' bị khai báo hai lần`);
        pending.push({ name, line: ln, seg });
        labels[name] = undefined; // reserve
        rest = rest.slice(m[0].length).trim();
      }
      if (!rest) return;
      if (rest[0] === '.') {
        const sp = rest.search(/\s/);
        const dir = (sp < 0 ? rest : rest.slice(0, sp)).toLowerCase();
        const argStr = sp < 0 ? '' : rest.slice(sp + 1).trim();
        switch (dir) {
          case '.text': bind(seg === 'text' ? textPC : dataPC); seg = 'text'; return;
          case '.data': bind(seg === 'text' ? textPC : dataPC); seg = 'data'; return;
          case '.globl': case '.global': case '.end': case '.section': case '.extern': return;
          case '.eqv': {
            const a = argStr.split(/[\s,]+/);
            if (a.length < 2) throw new AsmError(ln, '.eqv cần dạng: .eqv TÊN giá_trị');
            eqv[a[0]] = a.slice(1).join(' '); return;
          }
        }
        if (seg !== 'data') throw new AsmError(ln, `Chỉ thị ${dir} phải nằm trong vùng .data`);
        const args = splitArgs(argStr);
        switch (dir) {
          case '.word': case '.half': case '.byte': case '.float': {
            const size = { '.word': 4, '.half': 2, '.byte': 1, '.float': 4 }[dir];
            if (!args.length) throw new AsmError(ln, `${dir} cần ít nhất một giá trị`);
            align(size); bind(dataPC);
            const vals = [];
            for (const a0 of args) {
              const a = subEqv(a0);
              // "value : count" repetition
              const rep = /^(.+?)\s*:\s*(\d+)$/.exec(a);
              const item = rep ? rep[1] : a, count = rep ? parseInt(rep[2], 10) : 1;
              for (let k = 0; k < count; k++) vals.push(item);
            }
            dataItems.push({ addr: dataPC, line: ln, kind: dir, size, vals });
            dataPC += size * vals.length;
            return;
          }
          case '.ascii': case '.asciz': case '.string': {
            bind(dataPC);
            let bytes = [];
            for (const a of args) { bytes = bytes.concat(parseString(a, ln)); if (dir !== '.ascii') bytes.push(0); }
            dataItems.push({ addr: dataPC, line: ln, kind: 'bytes', bytes });
            dataPC += bytes.length; return;
          }
          case '.space': {
            const n = parseNum(subEqv(args[0]));
            if (n === null || n < 0) throw new AsmError(ln, '.space cần một số byte không âm');
            bind(dataPC); dataPC += n; return;
          }
          case '.align': {
            const n = parseNum(args[0]);
            if (n === null || n < 0 || n > 12) throw new AsmError(ln, '.align n: căn lề tới 2^n byte (n từ 0 đến 12)');
            align(1 << n); bind(dataPC); return;
          }
          default: throw new AsmError(ln, `Chỉ thị ${dir} chưa được hỗ trợ trong bản mô phỏng này`);
        }
      }
      // instruction
      if (seg !== 'text') throw new AsmError(ln, 'Lệnh phải nằm trong vùng .text (bạn đang ở .data)');
      const sp = rest.search(/\s/);
      const mn = (sp < 0 ? rest : rest.slice(0, sp)).toLowerCase();
      const ops = sp < 0 ? [] : splitOperands(rest.slice(sp + 1).trim()).map(subEqv);
      bind(textPC);
      const size = instSize(mn, ops, ln);
      insts.push({ addr: textPC, line: ln, src: raw.trim(), mn, ops, size });
      textPC += 4 * size;
    } catch (e) {
      if (e instanceof AsmError) errors.push({ line: e.line, msg: e.message }); else throw e;
    }
  });
  bind(seg === 'text' ? textPC : dataPC);
  for (const k in labels) if (labels[k] === undefined) delete labels[k];

  // pass 2
  const bytes = new Map(); // addr -> byte (data)
  const putByte = (a, v) => bytes.set(a >>> 0, v & 255);
  const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
  for (const d of dataItems) {
    try {
      if (d.kind === 'bytes') { d.bytes.forEach((b, i) => putByte(d.addr + i, b)); continue; }
      d.vals.forEach((v, i) => {
        let n;
        if (d.kind === '.float') {
          const f = parseFloat(v);
          if (!isFinite(f) && !/^[+-]?inf/i.test(v)) throw new AsmError(d.line, `'${v}' không phải số thực`);
          f32[0] = f; n = u32[0];
        } else {
          n = parseNum(v);
          if (n === null) {
            if (v in labels) n = labels[v];
            else throw new AsmError(d.line, `'${v}' không phải số và cũng không phải nhãn đã khai báo`);
          }
          const lim = { 4: [-2147483648, 4294967295], 2: [-32768, 65535], 1: [-128, 255] }[d.size];
          if (n < lim[0] || n > lim[1]) throw new AsmError(d.line, `Giá trị ${v} không vừa ${d.size} byte`);
        }
        for (let b = 0; b < d.size; b++) putByte(d.addr + i * d.size + b, (n >>> (8 * b)) & 255);
      });
    } catch (e) { if (e instanceof AsmError) errors.push({ line: e.line, msg: e.message }); else throw e; }
  }

  const text = []; // {addr, word, line, src, first, pseudo}
  for (const ins of insts) {
    try {
      const words = encodeInst(ins, labels);
      words.forEach((w, i) => text.push({ addr: ins.addr + 4 * i, word: w >>> 0, line: ins.line, src: ins.src, first: i === 0, pseudo: words.length > 1 || !isReal(ins.mn) }));
    } catch (e) { if (e instanceof AsmError) errors.push({ line: e.line, msg: e.message }); else throw e; }
  }
  errors.sort((a, b) => a.line - b.line);
  return { ok: errors.length === 0, errors, warnings, labels, text, data: bytes, textEnd: textPC, dataEnd: dataPC, lines };
}

const REAL = new Set([...Object.keys(R_OPS), ...Object.keys(IA_OPS), ...Object.keys(SH_OPS), ...Object.keys(LD_OPS),
  ...Object.keys(ST_OPS), ...Object.keys(BR_OPS), 'jal', 'jalr', 'lui', 'auipc', 'ecall', 'ebreak', 'flw', 'fsw',
  ...Object.keys(FR_OPS), ...Object.keys(FSGN), ...Object.keys(FCMP), 'fcvt.s.w', 'fcvt.w.s', 'fcvt.s.wu', 'fcvt.wu.s', 'fmv.x.w', 'fmv.w.x']);
function isReal(mn) { return REAL.has(mn); }

const isMemOp = t => /^[^()]*\(\s*\$?[\w]+\s*\)$/.test(t);

function instSize(mn, ops, ln) {
  if (mn === 'la') return 2;
  if (mn === 'li') {
    if (ops.length !== 2) throw new AsmError(ln, 'Cú pháp: li rd, số');
    const v = parseNum(ops[1]);
    if (v === null) throw new AsmError(ln, `li cần một hằng số, '${ops[1]}' không phải số (muốn lấy địa chỉ nhãn thì dùng la)`);
    if (v < -2147483648 || v > 4294967295) throw new AsmError(ln, 'Hằng số vượt quá 32 bit');
    const s = v | 0; return (s >= -2048 && s <= 2047) ? 1 : 2;
  }
  if ((mn in LD_OPS || mn === 'flw') && ops.length === 2 && !isMemOp(ops[1]) && parseNum(ops[1]) === null) return 2;
  if (!(mn in SYNTAX) && !['ecall', 'ebreak', 'nop', 'ret', 'fneg.s', 'fabs.s', 'sltz', 'sgtz', 'fcvt.s.wu', 'fcvt.wu.s'].includes(mn)) {
    if (mn in HINTS) throw new AsmError(ln, HINTS[mn]);
    throw new AsmError(ln, `Không biết lệnh '${mn}'. Kiểm tra lại chính tả (xem bảng lệnh RISC-V).`);
  }
  return 1;
}

function encodeInst(ins, labels) {
  const { mn, ops, line: ln, addr: pc } = ins;
  const need = (n) => { if (ops.length !== n) throw new AsmError(ln, `Lệnh ${mn} cần ${n} toán hạng. Cú pháp: ${SYNTAX[mn] || mn}`); };
  const reg = (t) => {
    const k = String(t).replace(/^\$/, '');
    if (k in REG) return REG[k];
    if (k in FREG) throw new AsmError(ln, `'${t}' là thanh ghi số thực, ở đây cần thanh ghi số nguyên (x0–x31)`);
    throw new AsmError(ln, `'${t}' không phải tên thanh ghi hợp lệ`);
  };
  const freg = (t) => {
    const k = String(t).replace(/^\$/, '');
    if (k in FREG) return FREG[k];
    throw new AsmError(ln, `'${t}' không phải thanh ghi số thực (f0–f31, ft0, fa0, ...)`);
  };
  const imm = (t, lo, hi, what) => {
    const v = parseNum(t);
    if (v === null) throw new AsmError(ln, `'${t}' không phải hằng số`);
    if (v < lo || v > hi) throw new AsmError(ln, `Hằng số ${t} vượt phạm vi ${what} (${lo}..${hi})`);
    return v;
  };
  const imm12 = t => imm(t, -2048, 2047, '12 bit có dấu');
  const mem = (t) => {
    const m = /^(.*)\(\s*(\$?\w+)\s*\)$/.exec(t.trim());
    if (!m) throw new AsmError(ln, `Toán hạng bộ nhớ phải có dạng offset(thanh_ghi), ví dụ 0(t0). Gặp: '${t}'`);
    const off = m[1].trim() === '' ? 0 : imm12(m[1]);
    return [off, reg(m[2])];
  };
  const target = (t, bits) => {
    let off;
    const n = parseNum(t);
    if (n !== null) off = n;
    else if (t in labels) off = labels[t] - pc;
    else throw new AsmError(ln, `Không tìm thấy nhãn '${t}'`);
    const lim = 1 << bits;
    if (off < -lim || off >= lim) throw new AsmError(ln, `Nhãn '${t}' quá xa (khoảng cách ${off} byte, tối đa ±${lim}). ` + (bits === 12 ? 'Đảo điều kiện rồi dùng jal.' : ''));
    if (off & 1) throw new AsmError(ln, 'Khoảng cách nhảy phải là số chẵn');
    return off;
  };
  const hiLo = (v) => { const lo = (v << 20) >> 20; const hi = ((v - lo) >>> 12) & 0xFFFFF; return [hi, lo]; };

  // pseudo-instructions
  switch (mn) {
    case 'nop': need(0); return [encI(0, 0, 0, 0, 0x13)];
    case 'mv': need(2); return [encI(0, reg(ops[1]), 0, reg(ops[0]), 0x13)];
    case 'not': need(2); return [encI(-1, reg(ops[1]), 4, reg(ops[0]), 0x13)];
    case 'neg': need(2); return [encR(0x20, reg(ops[1]), 0, 0, reg(ops[0]), 0x33)];
    case 'seqz': need(2); return [encI(1, reg(ops[1]), 3, reg(ops[0]), 0x13)];
    case 'snez': need(2); return [encR(0, reg(ops[1]), 0, 3, reg(ops[0]), 0x33)];
    case 'sltz': need(2); return [encR(0, 0, reg(ops[1]), 2, reg(ops[0]), 0x33)];
    case 'sgtz': need(2); return [encR(0, reg(ops[1]), 0, 2, reg(ops[0]), 0x33)];
    case 'li': {
      need(2); const rd = reg(ops[0]); const v = parseNum(ops[1]) | 0;
      if (v >= -2048 && v <= 2047) return [encI(v, 0, 0, rd, 0x13)];
      const [hi, lo] = hiLo(v); return [encU(hi, rd, 0x37), encI(lo, rd, 0, rd, 0x13)];
    }
    case 'la': {
      need(2); const rd = reg(ops[0]);
      if (!(ops[1] in labels)) throw new AsmError(ln, `Không tìm thấy nhãn '${ops[1]}'`);
      const [hi, lo] = hiLo((labels[ops[1]] - pc) | 0);
      return [encU(hi, rd, 0x17), encI(lo, rd, 0, rd, 0x13)];
    }
    case 'j': need(1); return [encJ(target(ops[0], 20), 0, 0x6F)];
    case 'call': need(1); return [encJ(target(ops[0], 20), 1, 0x6F)];
    case 'jr': need(1); return [encI(0, reg(ops[0]), 0, 0, 0x67)];
    case 'ret': need(0); return [encI(0, 1, 0, 0, 0x67)];
    case 'beqz': need(2); return [encB(target(ops[1], 12), 0, reg(ops[0]), 0, 0x63)];
    case 'bnez': need(2); return [encB(target(ops[1], 12), 0, reg(ops[0]), 1, 0x63)];
    case 'bltz': need(2); return [encB(target(ops[1], 12), 0, reg(ops[0]), 4, 0x63)];
    case 'bgez': need(2); return [encB(target(ops[1], 12), 0, reg(ops[0]), 5, 0x63)];
    case 'blez': need(2); return [encB(target(ops[1], 12), reg(ops[0]), 0, 5, 0x63)];
    case 'bgtz': need(2); return [encB(target(ops[1], 12), reg(ops[0]), 0, 4, 0x63)];
    case 'bgt': need(3); return [encB(target(ops[2], 12), reg(ops[0]), reg(ops[1]), 4, 0x63)];
    case 'ble': need(3); return [encB(target(ops[2], 12), reg(ops[0]), reg(ops[1]), 5, 0x63)];
    case 'bgtu': need(3); return [encB(target(ops[2], 12), reg(ops[0]), reg(ops[1]), 6, 0x63)];
    case 'bleu': need(3); return [encB(target(ops[2], 12), reg(ops[0]), reg(ops[1]), 7, 0x63)];
    case 'fmv.s': need(2); { const a = freg(ops[1]); return [encR(0x10, a, a, 0, freg(ops[0]), 0x53)]; }
    case 'fneg.s': need(2); { const a = freg(ops[1]); return [encR(0x10, a, a, 1, freg(ops[0]), 0x53)]; }
    case 'fabs.s': need(2); { const a = freg(ops[1]); return [encR(0x10, a, a, 2, freg(ops[0]), 0x53)]; }
  }
  if (mn in R_OPS) { need(3); const [f7, f3] = R_OPS[mn]; return [encR(f7, reg(ops[2]), reg(ops[1]), f3, reg(ops[0]), 0x33)]; }
  if (mn in IA_OPS) { need(3); return [encI(imm12(ops[2]), reg(ops[1]), IA_OPS[mn], reg(ops[0]), 0x13)]; }
  if (mn in SH_OPS) { need(3); const [f7, f3] = SH_OPS[mn]; return [encI((f7 << 5) | imm(ops[2], 0, 31, 'dịch bit'), reg(ops[1]), f3, reg(ops[0]), 0x13)]; }
  if (mn in LD_OPS || mn === 'flw') {
    need(2);
    const rd = mn === 'flw' ? freg(ops[0]) : reg(ops[0]);
    const f3 = mn === 'flw' ? 2 : LD_OPS[mn], op = mn === 'flw' ? 0x07 : 0x03;
    if (!isMemOp(ops[1]) && parseNum(ops[1]) === null) { // load from label
      if (!(ops[1] in labels)) throw new AsmError(ln, `Không tìm thấy nhãn '${ops[1]}'`);
      const tmp = mn === 'flw' ? 6 : rd; // flw uses t1 as temp
      const [hi, lo] = hiLo((labels[ops[1]] - pc) | 0);
      return [encU(hi, tmp, 0x17), encI(lo, tmp, f3, rd, op)];
    }
    const [off, rs1] = mem(ops[1]); return [encI(off, rs1, f3, rd, op)];
  }
  if (mn in ST_OPS || mn === 'fsw') {
    need(2);
    const rs2 = mn === 'fsw' ? freg(ops[0]) : reg(ops[0]);
    const [off, rs1] = mem(ops[1]);
    return [encS(off, rs2, rs1, mn === 'fsw' ? 2 : ST_OPS[mn], mn === 'fsw' ? 0x27 : 0x23)];
  }
  if (mn in BR_OPS) { need(3); return [encB(target(ops[2], 12), reg(ops[1]), reg(ops[0]), BR_OPS[mn], 0x63)]; }
  switch (mn) {
    case 'jal':
      if (ops.length === 1) return [encJ(target(ops[0], 20), 1, 0x6F)];
      need(2); return [encJ(target(ops[1], 20), reg(ops[0]), 0x6F)];
    case 'jalr':
      if (ops.length === 1) return [encI(0, reg(ops[0]), 0, 1, 0x67)];
      if (ops.length === 2) {
        if (isMemOp(ops[1])) { const [off, rs1] = mem(ops[1]); return [encI(off, rs1, 0, reg(ops[0]), 0x67)]; }
        return [encI(0, reg(ops[1]), 0, reg(ops[0]), 0x67)];
      }
      need(3);
      if (isMemOp(ops[2])) { const [off, rs1] = mem(ops[2]); return [encI(off, rs1, 0, reg(ops[0]), 0x67)]; } // jalr rd, rs?, off(rs)
      return [encI(imm12(ops[2]), reg(ops[1]), 0, reg(ops[0]), 0x67)];
    case 'lui': need(2); return [encU(imm(ops[1], -524288, 1048575, '20 bit'), reg(ops[0]), 0x37)];
    case 'auipc': need(2); return [encU(imm(ops[1], -524288, 1048575, '20 bit'), reg(ops[0]), 0x17)];
    case 'ecall': need(0); return [0x00000073];
    case 'ebreak': need(0); return [0x00100073];
    case 'fcvt.s.w': case 'fcvt.s.wu': need(2); return [encR(0x68, mn === 'fcvt.s.wu' ? 1 : 0, reg(ops[1]), 7, freg(ops[0]), 0x53)];
    case 'fcvt.w.s': case 'fcvt.wu.s': need(2); return [encR(0x60, mn === 'fcvt.wu.s' ? 1 : 0, freg(ops[1]), 7, reg(ops[0]), 0x53)];
    case 'fmv.x.w': need(2); return [encR(0x70, 0, freg(ops[1]), 0, reg(ops[0]), 0x53)];
    case 'fmv.w.x': need(2); return [encR(0x78, 0, reg(ops[1]), 0, freg(ops[0]), 0x53)];
  }
  if (mn in FR_OPS) { if (ops.length === 4) ops.pop(); need(3); return [encR(FR_OPS[mn], freg(ops[2]), freg(ops[1]), 7, freg(ops[0]), 0x53)]; }
  if (mn in FSGN) { need(3); return [encR(0x10, freg(ops[2]), freg(ops[1]), FSGN[mn], freg(ops[0]), 0x53)]; }
  if (mn in FCMP) { need(3); return [encR(0x50, freg(ops[2]), freg(ops[1]), FCMP[mn], reg(ops[0]), 0x53)]; }
  throw new AsmError(ln, `Không biết lệnh '${mn}'`);
}

// ---------- decoder / disassembler ----------
const inv = (o) => { const r = {}; for (const k in o) r[JSON.stringify(o[k])] = k; return r; };
const R_INV = inv(R_OPS), IA_INV = inv(IA_OPS), LD_INV = inv(LD_OPS), ST_INV = inv(ST_OPS), BR_INV = inv(BR_OPS), FR_INV = inv(FR_OPS);
const FSGN_INV = inv(FSGN), FCMP_INV = inv(FCMP);

function decode(w, pc) {
  w >>>= 0; pc = pc >>> 0;
  const op = w & 0x7F, rd = (w >>> 7) & 31, f3 = (w >>> 12) & 7, rs1 = (w >>> 15) & 31, rs2 = (w >>> 20) & 31, f7 = w >>> 25;
  const iI = w >> 20;
  const iS = ((w >> 25) << 5) | ((w >>> 7) & 31);
  const iB = ((w >> 31) << 12) | (((w >>> 7) & 1) << 11) | (((w >>> 25) & 0x3F) << 5) | (((w >>> 8) & 0xF) << 1);
  const iU = (w & 0xFFFFF000) | 0;
  const iJ = ((w >> 31) << 20) | (((w >>> 12) & 0xFF) << 12) | (((w >>> 20) & 1) << 11) | (((w >>> 21) & 0x3FF) << 1);
  const X = i => 'x' + i, F = i => 'f' + i;
  let name = null, fmt = null, text = '', imm = null;
  const fields = (spec) => spec.map(([n, hi, lo, kind, note]) => ({ name: n, hi, lo, kind, value: (w >>> lo) & ((1 << (hi - lo + 1)) - 1) >>> 0, note }));
  let fl = [];
  switch (op) {
    case 0x33: name = R_INV[JSON.stringify([f7, f3])]; fmt = 'R';
      text = `${name} ${X(rd)}, ${X(rs1)}, ${X(rs2)}`; break;
    case 0x13:
      if (f3 === 1 || f3 === 5) { name = f3 === 1 ? 'slli' : (f7 === 0x20 ? 'srai' : 'srli'); fmt = 'I'; imm = rs2; text = `${name} ${X(rd)}, ${X(rs1)}, ${rs2}`; }
      else { name = IA_INV[f3]; fmt = 'I'; imm = iI; text = `${name} ${X(rd)}, ${X(rs1)}, ${iI}`; }
      break;
    case 0x03: name = LD_INV[f3]; fmt = 'I'; imm = iI; text = `${name} ${X(rd)}, ${iI}(${X(rs1)})`; break;
    case 0x07: if (f3 === 2) { name = 'flw'; fmt = 'I'; imm = iI; text = `flw ${F(rd)}, ${iI}(${X(rs1)})`; } break;
    case 0x23: name = ST_INV[f3]; fmt = 'S'; imm = iS; text = `${name} ${X(rs2)}, ${iS}(${X(rs1)})`; break;
    case 0x27: if (f3 === 2) { name = 'fsw'; fmt = 'S'; imm = iS; text = `fsw ${F(rs2)}, ${iS}(${X(rs1)})`; } break;
    case 0x63: name = BR_INV[f3]; fmt = 'B'; imm = iB; text = `${name} ${X(rs1)}, ${X(rs2)}, ${iB}`; break;
    case 0x6F: name = 'jal'; fmt = 'J'; imm = iJ; text = `jal ${X(rd)}, ${iJ}`; break;
    case 0x67: name = 'jalr'; fmt = 'I'; imm = iI; text = `jalr ${X(rd)}, ${X(rs1)}, ${iI}`; break;
    case 0x37: name = 'lui'; fmt = 'U'; imm = iU >>> 12; text = `lui ${X(rd)}, 0x${(iU >>> 12).toString(16)}`; break;
    case 0x17: name = 'auipc'; fmt = 'U'; imm = iU >>> 12; text = `auipc ${X(rd)}, 0x${(iU >>> 12).toString(16)}`; break;
    case 0x73: if (w === 0x73) { name = 'ecall'; fmt = 'I'; text = 'ecall'; } else if (w === 0x00100073) { name = 'ebreak'; fmt = 'I'; text = 'ebreak'; } break;
    case 0x53:
      fmt = 'R';
      if (f7 in { 0: 1, 4: 1, 8: 1, 12: 1 }) { name = FR_INV[f7]; text = `${name} ${F(rd)}, ${F(rs1)}, ${F(rs2)}`; }
      else if (f7 === 0x10) { name = FSGN_INV[f3]; text = `${name} ${F(rd)}, ${F(rs1)}, ${F(rs2)}`; }
      else if (f7 === 0x50) { name = FCMP_INV[f3]; text = `${name} ${X(rd)}, ${F(rs1)}, ${F(rs2)}`; }
      else if (f7 === 0x60) { name = rs2 ? 'fcvt.wu.s' : 'fcvt.w.s'; text = `${name} ${X(rd)}, ${F(rs1)}`; }
      else if (f7 === 0x68) { name = rs2 ? 'fcvt.s.wu' : 'fcvt.s.w'; text = `${name} ${F(rd)}, ${X(rs1)}`; }
      else if (f7 === 0x70) { name = 'fmv.x.w'; text = `fmv.x.w ${X(rd)}, ${F(rs1)}`; }
      else if (f7 === 0x78) { name = 'fmv.w.x'; text = `fmv.w.x ${F(rd)}, ${X(rs1)}`; }
      break;
  }
  if (!name) return { ok: false, word: w, text: '???', fmt: null, fields: [] };
  switch (fmt) {
    case 'R': fl = fields([['funct7', 31, 25, 'f7'], ['rs2', 24, 20, 'rs2'], ['rs1', 19, 15, 'rs1'], ['funct3', 14, 12, 'f3'], ['rd', 11, 7, 'rd'], ['opcode', 6, 0, 'op']]); break;
    case 'I':
      if (name === 'slli' || name === 'srli' || name === 'srai') fl = fields([['funct7', 31, 25, 'f7'], ['shamt', 24, 20, 'imm'], ['rs1', 19, 15, 'rs1'], ['funct3', 14, 12, 'f3'], ['rd', 11, 7, 'rd'], ['opcode', 6, 0, 'op']]);
      else fl = fields([['imm[11:0]', 31, 20, 'imm'], ['rs1', 19, 15, 'rs1'], ['funct3', 14, 12, 'f3'], ['rd', 11, 7, 'rd'], ['opcode', 6, 0, 'op']]);
      break;
    case 'S': fl = fields([['imm[11:5]', 31, 25, 'imm'], ['rs2', 24, 20, 'rs2'], ['rs1', 19, 15, 'rs1'], ['funct3', 14, 12, 'f3'], ['imm[4:0]', 11, 7, 'imm'], ['opcode', 6, 0, 'op']]); break;
    case 'B': fl = fields([['imm[12|10:5]', 31, 25, 'imm'], ['rs2', 24, 20, 'rs2'], ['rs1', 19, 15, 'rs1'], ['funct3', 14, 12, 'f3'], ['imm[4:1|11]', 11, 7, 'imm'], ['opcode', 6, 0, 'op']]); break;
    case 'U': fl = fields([['imm[31:12]', 31, 12, 'imm'], ['rd', 11, 7, 'rd'], ['opcode', 6, 0, 'op']]); break;
    case 'J': fl = fields([['imm[20|10:1|11|19:12]', 31, 12, 'imm'], ['rd', 11, 7, 'rd'], ['opcode', 6, 0, 'op']]); break;
  }
  const abiText = text.replace(/\bx(\d+)\b/g, (_, n) => ABI[+n]);
  return { ok: true, word: w, name, fmt, text, abiText, imm, rd, rs1, rs2, f3, f7, op, fields: fl, target: (fmt === 'B' || fmt === 'J') ? (pc + imm) >>> 0 : null };
}

// ---------- float formatting (Java Float.toString-like) ----------
function fmtFloat(f) {
  if (Number.isNaN(f)) return 'NaN';
  if (f === Infinity) return 'Infinity';
  if (f === -Infinity) return '-Infinity';
  if (f === 0) return (1 / f < 0) ? '-0.0' : '0.0';
  let s = null;
  for (let p = 1; p <= 9; p++) { const t = f.toPrecision(p); if (Math.fround(parseFloat(t)) === f) { s = parseFloat(t); break; } }
  if (s === null) s = f;
  const a = Math.abs(s);
  if (a >= 1e-3 && a < 1e7) { let str = String(s); if (!/[.e]/.test(str)) str += '.0'; return str; }
  let [m, e] = s.toExponential().split('e');
  if (!m.includes('.')) m += '.0';
  return m + 'E' + (+e);
}

// ---------- simulator ----------
class Sim {
  constructor() {
    this.x = new Int32Array(32);
    this.fbuf = new ArrayBuffer(128); this.fb = new Uint32Array(this.fbuf); this.fv = new Float32Array(this.fbuf);
    this.tmpF = new Float32Array(1); this.tmpU = new Uint32Array(this.tmpF.buffer);
    this.pages = new Map();
    this.prog = null;
    this.reset();
  }
  reset() {
    this.x.fill(0); this.fb.fill(0);
    this.x[2] = SP_INIT | 0; this.x[3] = GP_INIT | 0;
    this.pc = TEXT_BASE; this.pages = new Map();
    this.out = ''; this.halted = false; this.waiting = null; this.error = null; this.exitCode = null;
    this.history = []; this.count = 0; this.cur = null; this.lastRec = null; this.haltMsg = '';
    if (this.prog) {
      for (const [a, b] of this.prog.data) this._poke(a, b);
      for (const t of this.prog.text) for (let k = 0; k < 4; k++) this._poke(t.addr + k, (t.word >>> (8 * k)) & 255);
    }
  }
  load(prog) {
    this.prog = prog;
    this.textMap = new Map(); for (const t of prog.text) this.textMap.set(t.addr, t);
    this.reset();
  }
  _peek(a) { a >>>= 0; const p = this.pages.get(a >>> 12); return p ? p[a & 4095] : 0; }
  _poke(a, v) { a >>>= 0; let p = this.pages.get(a >>> 12); if (!p) { p = new Uint8Array(4096); this.pages.set(a >>> 12, p); } p[a & 4095] = v & 255; }
  peekByte(a) { return this._peek(a); }
  peekWord(a) { return (this._peek(a) | (this._peek(a + 1) << 8) | (this._peek(a + 2) << 16) | (this._peek(a + 3) << 24)) >>> 0; }

  _err(msg) { const e = new Error(msg); e.sim = true; throw e; }
  _checkAddr(a, n, write) {
    a >>>= 0;
    if (a < TEXT_BASE) this._err(`Truy cập địa chỉ không hợp lệ ${hex8(a)} (vùng này không thuộc chương trình). Thường do quên la/khởi tạo thanh ghi địa chỉ.`);
    if (write && a < 0x10000000) this._err(`Không được ghi vào vùng code ${hex8(a)}`);
    if (a % n) this._err(`Địa chỉ ${hex8(a)} không chia hết cho ${n}. Lệnh ${n === 4 ? 'lw/sw' : 'lh/sh'} cần dữ liệu được căn lề.`);
    return a;
  }
  _wb(a, v) { const old = this._peek(a); this.cur.mem.push([a >>> 0, old]); this._poke(a, v); }
  _load(a, n, signed) {
    a = this._checkAddr(a, n, false);
    let v = 0; for (let k = 0; k < n; k++) v |= this._peek(a + k) << (8 * k);
    if (n === 1) return signed ? (v << 24) >> 24 : v & 0xFF;
    if (n === 2) return signed ? (v << 16) >> 16 : v & 0xFFFF;
    return v | 0;
  }
  _store(a, n, v) { a = this._checkAddr(a, n, true); for (let k = 0; k < n; k++) this._wb(a + k, (v >>> (8 * k)) & 255); this.cur.memW = [a, n]; }
  _set(rd, v) { if (rd === 0) return; this.cur.regs.push([rd, this.x[rd]]); this.x[rd] = v | 0; }
  _setF(rd, bits) { this.cur.fregs.push([rd, this.fb[rd]]); this.fb[rd] = bits >>> 0; }
  _setFv(rd, val) { this.tmpF[0] = val; this._setF(rd, this.tmpU[0]); }
  _print(s) { this.out += s; }

  readString(a, max = 20000) {
    const bytes = [];
    for (let i = 0; i < max; i++) { const b = this._peek(a + i); if (!b) break; bytes.push(b); }
    try { return new TextDecoder().decode(new Uint8Array(bytes)); } catch (e) { return String.fromCharCode(...bytes); }
  }

  canStep() { return this.prog && !this.halted && !this.waiting; }

  step() {
    if (!this.canStep()) return false;
    const pc = this.pc >>> 0;
    const t = this.textMap.get(pc);
    if (!t) {
      this.halted = true;
      this.haltMsg = (pc === this.prog.textEnd) ? 'Chương trình đã chạy hết (rơi khỏi cuối đoạn code). Nên kết thúc bằng li a7, 10 + ecall.' : `PC = ${hex8(pc)} không trỏ vào lệnh nào → dừng.`;
      return false;
    }
    const w = this.peekWord(pc);
    this.cur = { pc, regs: [], fregs: [], mem: [], outLen: this.out.length, word: w, memW: null, memR: null };
    try {
      const r = this._exec(w, pc);
      if (r === 'input') { this.cur = null; return false; }
    } catch (e) {
      if (!e.sim) throw e;
      // roll back partial
      this._undo(this.cur); this.cur = null;
      this.halted = true; this.error = e.message; this.haltMsg = 'Lỗi: ' + e.message;
      return false;
    }
    this._finish(this.cur);
    this.history.push(this.cur); if (this.history.length > 20000) this.history.shift();
    this.lastRec = this.cur; this.cur = null; this.count++;
    return true;
  }

  _finish(rec) {
    rec.regs = rec.regs.map(([r, old]) => [r, old, this.x[r]]);
    rec.fregs = rec.fregs.map(([r, old]) => [r, old, this.fb[r]]);
    rec.nextPc = this.pc;
    if (rec.memW) {
      const [a, n] = rec.memW; let v = 0;
      for (let k = 0; k < n && k < 4; k++) v |= this._peek(a + k) << (8 * k);
      rec.memVal = n === 4 ? v | 0 : v;
    }
  }

  _undo(rec) {
    for (let i = rec.mem.length - 1; i >= 0; i--) this._poke(rec.mem[i][0], rec.mem[i][1]);
    for (let i = rec.regs.length - 1; i >= 0; i--) this.x[rec.regs[i][0]] = rec.regs[i][1];
    for (let i = rec.fregs.length - 1; i >= 0; i--) this.fb[rec.fregs[i][0]] = rec.fregs[i][1];
    this.out = this.out.slice(0, rec.outLen);
    this.pc = rec.pc;
  }

  back() {
    const rec = this.history.pop();
    if (!rec) return false;
    this._undo(rec);
    this.halted = false; this.waiting = null; this.error = null; this.exitCode = null; this.haltMsg = '';
    this.count--; this.lastRec = this.history[this.history.length - 1] || null;
    return true;
  }

  provideInput(str) {
    if (!this.waiting) return { ok: false };
    const kind = this.waiting.kind;
    const pc = this.pc;
    const parsed = (() => {
      if (kind === 'int') { const v = parseNum(str.trim()); if (v === null || v < -2147483648 || v > 4294967295) return null; return v | 0; }
      if (kind === 'float') { const v = parseFloat(str); if (!isFinite(v) && !/^[+-]?inf/i.test(str.trim())) return null; return v; }
      return str;
    })();
    if (parsed === null) return { ok: false, msg: kind === 'int' ? 'Hãy nhập một số nguyên (ví dụ 42 hoặc -7).' : 'Hãy nhập một số thực (ví dụ 3.14).' };
    this.cur = { pc, regs: [], fregs: [], mem: [], outLen: this.out.length, word: 0x73, memW: null };
    if (kind === 'int') { this._set(10, parsed); this._print(String(parsed) + '\n'); }
    else if (kind === 'float') { this._setFv(10, parsed); this._print(String(parsed) + '\n'); }
    else if (kind === 'char') { const c = str.length ? str.codePointAt(0) : 10; this._set(10, c); this._print((str[0] || '') + '\n'); }
    else if (kind === 'string') {
      const buf = this.x[10] >>> 0, max = this.x[11];
      const enc = new TextEncoder().encode(str + '\n');
      const n = Math.max(0, Math.min(enc.length, max - 1));
      for (let i = 0; i < n; i++) this._wb(buf + i, enc[i]);
      if (max > 0) this._wb(buf + n, 0);
      this.cur.memW = [buf, n + 1];
      this._print(str + '\n');
    }
    this.pc = (pc + 4) >>> 0;
    this._finish(this.cur);
    this.history.push(this.cur); this.lastRec = this.cur; this.cur = null; this.count++;
    this.waiting = null;
    return { ok: true };
  }

  _ecall() {
    const a7 = this.x[17], a0 = this.x[10];
    switch (a7) {
      case 1: this._print(String(a0)); break;
      case 2: this._print(fmtFloat(this.fv[10])); break;
      case 4: this._print(this.readString(a0 >>> 0)); break;
      case 5: this.waiting = { kind: 'int' }; return 'input';
      case 6: this.waiting = { kind: 'float' }; return 'input';
      case 8: this.waiting = { kind: 'string' }; return 'input';
      case 10: this.halted = true; this.exitCode = 0; this.haltMsg = 'Chương trình kết thúc (ecall 10).'; break;
      case 93: this.halted = true; this.exitCode = a0; this.haltMsg = `Chương trình kết thúc với mã ${a0} (ecall 93).`; break;
      case 11: this._print(String.fromCharCode(a0 & 0xFF)); break;
      case 12: this.waiting = { kind: 'char' }; return 'input';
      case 34: this._print(hex8(a0).toLowerCase()); break;
      case 35: this._print('0b' + bin32(a0)); break;
      case 36: this._print(String(a0 >>> 0)); break;
      default: this._err(`Dịch vụ ecall số ${a7} chưa được hỗ trợ trong bản mô phỏng này (a7 = ${a7}). Kiểm tra lại giá trị a7.`);
    }
    return null;
  }

  _exec(w, pc) {
    const x = this.x;
    const op = w & 0x7F, rd = (w >>> 7) & 31, f3 = (w >>> 12) & 7, rs1 = (w >>> 15) & 31, rs2 = (w >>> 20) & 31, f7 = w >>> 25;
    const iI = w >> 20;
    let next = (pc + 4) >>> 0;
    switch (op) {
      case 0x33: {
        const a = x[rs1], b = x[rs2]; let r;
        if (f7 === 1) {
          switch (f3) {
            case 0: r = Math.imul(a, b); break;
            case 1: r = Number(BigInt.asIntN(32, (BigInt(a) * BigInt(b)) >> 32n)); break;
            case 2: r = Number(BigInt.asIntN(32, (BigInt(a) * BigInt(b >>> 0)) >> 32n)); break;
            case 3: r = Number(BigInt.asIntN(32, (BigInt(a >>> 0) * BigInt(b >>> 0)) >> 32n)); break;
            case 4: r = b === 0 ? -1 : (a === -2147483648 && b === -1) ? a : Math.trunc(a / b); break;
            case 5: r = b === 0 ? -1 : Math.floor((a >>> 0) / (b >>> 0)); break;
            case 6: r = b === 0 ? a : (a === -2147483648 && b === -1) ? 0 : a % b; break;
            case 7: r = b === 0 ? a : (a >>> 0) % (b >>> 0); break;
          }
        } else {
          switch (f3) {
            case 0: r = f7 === 0x20 ? a - b : a + b; break;
            case 1: r = a << (b & 31); break;
            case 2: r = a < b ? 1 : 0; break;
            case 3: r = (a >>> 0) < (b >>> 0) ? 1 : 0; break;
            case 4: r = a ^ b; break;
            case 5: r = f7 === 0x20 ? a >> (b & 31) : a >>> (b & 31); break;
            case 6: r = a | b; break;
            case 7: r = a & b; break;
          }
        }
        this._set(rd, r); break;
      }
      case 0x13: {
        const a = x[rs1]; let r;
        switch (f3) {
          case 0: r = a + iI; break;
          case 2: r = a < iI ? 1 : 0; break;
          case 3: r = (a >>> 0) < (iI >>> 0) ? 1 : 0; break;
          case 4: r = a ^ iI; break;
          case 6: r = a | iI; break;
          case 7: r = a & iI; break;
          case 1: r = a << rs2; break;
          case 5: r = f7 === 0x20 ? a >> rs2 : a >>> rs2; break;
        }
        this._set(rd, r); break;
      }
      case 0x03: {
        const addr = (x[rs1] + iI) >>> 0;
        const n = [1, 2, 4, 0, 1, 2][f3], signed = f3 < 4;
        if (!n) this._err('Lệnh load không hợp lệ');
        const v = this._load(addr, n, signed); this.cur.memR = [addr, n];
        this._set(rd, v); break;
      }
      case 0x07: { const addr = (x[rs1] + iI) >>> 0; const v = this._load(addr, 4, false); this.cur.memR = [addr, 4]; this._setF(rd, v >>> 0); break; }
      case 0x23: {
        const iS = ((w >> 25) << 5) | ((w >>> 7) & 31);
        const addr = (x[rs1] + iS) >>> 0; this._store(addr, [1, 2, 4][f3], x[rs2]); break;
      }
      case 0x27: { const iS = ((w >> 25) << 5) | ((w >>> 7) & 31); this._store((x[rs1] + iS) >>> 0, 4, this.fb[rs2]); break; }
      case 0x63: {
        const a = x[rs1], b = x[rs2]; let t;
        switch (f3) {
          case 0: t = a === b; break; case 1: t = a !== b; break;
          case 4: t = a < b; break; case 5: t = a >= b; break;
          case 6: t = (a >>> 0) < (b >>> 0); break; case 7: t = (a >>> 0) >= (b >>> 0); break;
          default: this._err('Lệnh rẽ nhánh không hợp lệ');
        }
        this.cur.taken = !!t;
        if (t) { const iB = ((w >> 31) << 12) | (((w >>> 7) & 1) << 11) | (((w >>> 25) & 0x3F) << 5) | (((w >>> 8) & 0xF) << 1); next = (pc + iB) >>> 0; }
        break;
      }
      case 0x6F: {
        const iJ = ((w >> 31) << 20) | (((w >>> 12) & 0xFF) << 12) | (((w >>> 20) & 1) << 11) | (((w >>> 21) & 0x3FF) << 1);
        this._set(rd, pc + 4); next = (pc + iJ) >>> 0; break;
      }
      case 0x67: { const t = ((x[rs1] + iI) & ~1) >>> 0; this._set(rd, pc + 4); next = t; break; }
      case 0x37: this._set(rd, w & 0xFFFFF000); break;
      case 0x17: this._set(rd, pc + (w & 0xFFFFF000)); break;
      case 0x73:
        if (w === 0x73) { const r = this._ecall(); if (r === 'input') return 'input'; }
        else if (w === 0x00100073) { this.halted = true; this.haltMsg = 'Gặp ebreak → tạm dừng.'; }
        else this._err('Lệnh hệ thống không hỗ trợ');
        break;
      case 0x53: {
        const fv = this.fv;
        switch (f7) {
          case 0x00: this._setFv(rd, fv[rs1] + fv[rs2]); break;
          case 0x04: this._setFv(rd, fv[rs1] - fv[rs2]); break;
          case 0x08: this._setFv(rd, fv[rs1] * fv[rs2]); break;
          case 0x0C: this._setFv(rd, fv[rs1] / fv[rs2]); break;
          case 0x10: {
            const a = this.fb[rs1], b = this.fb[rs2];
            const s = f3 === 0 ? (b & 0x80000000) : f3 === 1 ? (~b & 0x80000000) : ((a ^ b) & 0x80000000);
            this._setF(rd, (a & 0x7FFFFFFF) | s); break;
          }
          case 0x50: { const a = fv[rs1], b = fv[rs2]; this._set(rd, f3 === 2 ? +(a === b) : f3 === 1 ? +(a < b) : +(a <= b)); break; }
          case 0x60: {
            const v = fv[rs1]; let r;
            if (Number.isNaN(v)) r = rs2 ? -1 : 0x7FFFFFFF;
            else { r = Math.round(v); if (Math.abs(v % 1) === 0.5) r = 2 * Math.round(v / 2); }
            if (!rs2) r = Math.max(-2147483648, Math.min(2147483647, r)); else r = Math.max(0, Math.min(4294967295, r));
            this._set(rd, r); break;
          }
          case 0x68: this._setFv(rd, rs2 ? (x[rs1] >>> 0) : x[rs1]); break;
          case 0x70: this._set(rd, this.fb[rs1]); break;
          case 0x78: this._setF(rd, x[rs1] >>> 0); break;
          default: this._err('Lệnh số thực không hỗ trợ');
        }
        break;
      }
      default: this._err(`Mã lệnh ${hex8(w)} không hợp lệ tại ${hex8(pc)}`);
    }
    this.pc = next;
    return null;
  }

  run(maxSteps = 1e6) {
    let n = 0;
    while (this.canStep() && n < maxSteps) { if (!this.step()) break; n++; }
    return n;
  }
}

// single-line encode helper for the encoder widget
function encodeLine(line) {
  const res = assemble('.text\n' + line);
  if (!res.ok) return { ok: false, msg: res.errors[0].msg };
  if (!res.text.length) return { ok: false, msg: 'Chưa có lệnh nào.' };
  return { ok: true, words: res.text.map(t => ({ word: t.word, d: decode(t.word, t.addr - TEXT_BASE) })) };
}

export { assemble, decode, Sim, encodeLine, fmtFloat, parseNum, hex8, bin32, ABI, FABI, REG, FREG, TEXT_BASE, DATA_BASE, SP_INIT, GP_INIT, SYNTAX };
