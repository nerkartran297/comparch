import { ABI, FABI, hex8 } from './riscv.mjs';
import type { Decoded } from './riscv.mjs';

/** Giải thích một lệnh đã giải mã bằng tiếng Việt hoặc tiếng Anh, kèm giá trị thanh ghi hiện tại. */

export type Lang = 'vi' | 'en';
type Pair = [string, string];
const pick = (p: Pair, lang: Lang) => (lang === 'en' ? p[1] : p[0]);

const ECALL_NAMES: Record<number, Pair> = {
  1: ['in số nguyên trong a0', 'print the integer in a0'],
  2: ['in số thực trong fa0', 'print the float in fa0'],
  4: ['in chuỗi tại địa chỉ a0', 'print the string at address a0'],
  5: ['đọc số nguyên từ bàn phím → a0', 'read an integer from the keyboard → a0'],
  6: ['đọc số thực → fa0', 'read a float → fa0'],
  8: ['đọc chuỗi vào vùng nhớ a0 (tối đa a1 byte)', 'read a string into memory at a0 (at most a1 bytes)'],
  10: ['kết thúc chương trình', 'exit the program'],
  11: ['in một ký tự trong a0', 'print the character in a0'],
  12: ['đọc một ký tự → a0', 'read a character → a0'],
  34: ['in a0 dạng hex', 'print a0 in hex'],
  35: ['in a0 dạng nhị phân', 'print a0 in binary'],
  36: ['in a0 dạng không dấu', 'print a0 as unsigned'],
  93: ['kết thúc với mã a0', 'exit with code a0'],
};

const OPCODE_GROUPS: Record<number, Pair> = {
  0x33: ['R: phép toán 3 thanh ghi', 'R: operation on 3 registers'],
  0x13: ['I: phép toán với hằng số', 'I: operation with a constant'],
  0x03: ['I: nạp từ bộ nhớ (load)', 'I: load from memory'],
  0x23: ['S: cất vào bộ nhớ (store)', 'S: store to memory'],
  0x63: ['B: rẽ nhánh có điều kiện', 'B: conditional branch'],
  0x6f: ['J: jal (nhảy và lưu địa chỉ về)', 'J: jal (jump and save the return address)'],
  0x67: ['I: jalr (nhảy tới địa chỉ trong thanh ghi)', 'I: jalr (jump to the address in a register)'],
  0x37: ['U: lui (nạp 20 bit cao)', 'U: lui (load the upper 20 bits)'],
  0x17: ['U: auipc (PC + 20 bit cao)', 'U: auipc (PC + upper 20 bits)'],
  0x73: ['hệ thống (ecall)', 'system (ecall)'],
  0x07: ['I: nạp số thực (flw)', 'I: load a float (flw)'],
  0x27: ['S: cất số thực (fsw)', 'S: store a float (fsw)'],
  0x53: ['R: phép toán số thực', 'R: floating-point operation'],
};

export const ecallName = (n: number, lang: Lang = 'vi') => (ECALL_NAMES[n] ? pick(ECALL_NAMES[n], lang) : undefined);
export const opcodeGroup = (op: number, lang: Lang = 'vi') => (OPCODE_GROUPS[op] ? pick(OPCODE_GROUPS[op], lang) : undefined);

/** Bản tiếng Việt, giữ cho tương thích ngược. */
export const ECALLS: Record<number, string> = Object.fromEntries(Object.entries(ECALL_NAMES).map(([k, v]) => [k, v[0]]));
export const OPCODE_GROUP: Record<number, string> = Object.fromEntries(Object.entries(OPCODE_GROUPS).map(([k, v]) => [k, v[0]]));

const FLOAT_OPS = new Set([0x07, 0x27, 0x53]);

const R_SYM: Record<string, Pair> = {
  add: ['+', '+'], sub: ['−', '−'], and: ['AND', 'AND'], or: ['OR', 'OR'], xor: ['XOR', 'XOR'], sll: ['<<', '<<'],
  srl: ['>> (logic)', '>> (logical)'], sra: ['>> (giữ dấu)', '>> (keeps the sign)'],
  slt: ['<', '<'], sltu: ['< (không dấu)', '< (unsigned)'], mul: ['×', '×'],
  mulh: ['× (lấy 32 bit cao)', '× (upper 32 bits)'], mulhu: ['× (32 bit cao, không dấu)', '× (upper 32 bits, unsigned)'],
  mulhsu: ['× (32 bit cao)', '× (upper 32 bits)'], div: ['/', '/'], divu: ['/ (không dấu)', '/ (unsigned)'],
  rem: ['%', '%'], remu: ['% (không dấu)', '% (unsigned)'],
};
const I_SYM: Record<string, Pair> = {
  addi: ['+', '+'], andi: ['AND', 'AND'], ori: ['OR', 'OR'], xori: ['XOR', 'XOR'], slti: ['<', '<'],
  sltiu: ['< (không dấu)', '< (unsigned)'], slli: ['<<', '<<'], srli: ['>> (logic)', '>> (logical)'],
  srai: ['>> (giữ dấu)', '>> (keeps the sign)'],
};
const BR_SYM: Record<string, [Pair, (a: number, b: number) => boolean]> = {
  beq: [['==', '=='], (a, b) => a === b], bne: [['≠', '≠'], (a, b) => a !== b], blt: [['<', '<'], (a, b) => a < b],
  bge: [['≥', '≥'], (a, b) => a >= b], bltu: [['< (không dấu)', '< (unsigned)'], (a, b) => a >>> 0 < b >>> 0],
  bgeu: [['≥ (không dấu)', '≥ (unsigned)'], (a, b) => a >>> 0 >= b >>> 0],
};
const LOAD_SIZE: Record<string, Pair> = {
  lb: ['1 byte, mở rộng dấu', '1 byte, sign-extended'], lbu: ['1 byte, mở rộng 0', '1 byte, zero-extended'],
  lh: ['2 byte, mở rộng dấu', '2 bytes, sign-extended'], lhu: ['2 byte, mở rộng 0', '2 bytes, zero-extended'],
  lw: ['1 word = 4 byte', '1 word = 4 bytes'],
};
const STORE_SIZE: Record<string, Pair> = { sb: ['1 byte thấp', 'lowest byte'], sh: ['2 byte thấp', 'lowest 2 bytes'], sw: ['4 byte', '4 bytes'] };

function compute(name: string, a: number, b: number): number | null {
  switch (name) {
    case 'add': case 'addi': return (a + b) | 0;
    case 'sub': return (a - b) | 0;
    case 'and': case 'andi': return a & b;
    case 'or': case 'ori': return a | b;
    case 'xor': case 'xori': return a ^ b;
    case 'sll': case 'slli': return a << (b & 31);
    case 'srl': case 'srli': return (a >>> (b & 31)) | 0;
    case 'sra': case 'srai': return a >> (b & 31);
    case 'slt': case 'slti': return a < b ? 1 : 0;
    case 'sltu': case 'sltiu': return a >>> 0 < b >>> 0 ? 1 : 0;
    case 'mul': return Math.imul(a, b);
    case 'div': return b === 0 ? -1 : Math.trunc(a / b) | 0;
    case 'rem': return b === 0 ? a : (a % b) | 0;
    case 'divu': return b === 0 ? -1 : Math.floor((a >>> 0) / (b >>> 0)) | 0;
    case 'remu': return b === 0 ? a : ((a >>> 0) % (b >>> 0)) | 0;
    default: return null;
  }
}

export function regLabel(i: number, float = false) {
  return float ? FABI[i] : ABI[i];
}

export function describe(d: Decoded, x: Int32Array, pc: number, lang: Lang = 'vi'): { what: string; now?: string } {
  const T = (vi: string, en: string) => (lang === 'en' ? en : vi);
  if (!d.ok || !d.name) return { what: T('Không giải mã được lệnh này.', 'This instruction cannot be decoded.') };
  const n = d.name, rd = d.rd ?? 0, rs1 = d.rs1 ?? 0, rs2 = d.rs2 ?? 0, imm = d.imm ?? 0;
  const R = (i: number) => ABI[i];
  const v = (i: number) => x[i];
  /** giá trị trông như địa chỉ thì in hex cho dễ đọc */
  const f = (n: number) => (Math.abs(n) >= 0x400000 ? hex8(n) : String(n));
  const dropNote = rd === 0 ? T(' (đích là zero → kết quả bị bỏ, x0 luôn = 0)', ' (destination is zero → result discarded, x0 is always 0)') : '';
  const addr = T('địa chỉ', 'address');

  if (d.op !== undefined && FLOAT_OPS.has(d.op)) {
    if (n === 'flw') return { what: T(`${FABI[rd]} ← số thực 4 byte tại Mem[${R(rs1)} + ${imm}]`, `${FABI[rd]} ← 4-byte float at Mem[${R(rs1)} + ${imm}]`), now: `${addr} = ${hex8(v(rs1))} + ${imm} = ${hex8((v(rs1) + imm) >>> 0)}` };
    if (n === 'fsw') return { what: `Mem[${R(rs1)} + ${imm}] ← ${FABI[rs2]}`, now: `${addr} = ${hex8((v(rs1) + imm) >>> 0)}` };
    return { what: T(`Lệnh số thực ${n}: làm việc trên thanh ghi f (xem tab Số thực).`, `Floating-point instruction ${n}: works on the f registers (see the Float tab).`) };
  }

  if (n in R_SYM) {
    const r = compute(n, v(rs1), v(rs2));
    const sym = pick(R_SYM[n], lang);
    return {
      what: `${R(rd)} ← ${R(rs1)} ${sym} ${R(rs2)}${dropNote}`,
      now: r === null ? `${R(rs1)} = ${f(v(rs1))}, ${R(rs2)} = ${f(v(rs2))}` : `= ${f(v(rs1))} ${sym.split(' ')[0]} ${f(v(rs2))} = ${f(r)}`,
    };
  }
  if (n in I_SYM) {
    const r = compute(n, v(rs1), imm);
    const sym = pick(I_SYM[n], lang);
    if (n === 'addi' && rs1 === 0) return { what: `${R(rd)} ← ${imm} ${T('(zero + hằng số = nạp hằng)', '(zero + constant = load a constant)')}${dropNote}`, now: `= ${f(r ?? 0)}` };
    if (n === 'addi' && imm === 0) return { what: `${R(rd)} ← ${R(rs1)} ${T('(chép thanh ghi, chính là mv)', '(copy a register, i.e. mv)')}${dropNote}`, now: `= ${f(r ?? 0)}` };
    return { what: `${R(rd)} ← ${R(rs1)} ${sym} ${imm}${dropNote}`, now: `= ${f(v(rs1))} ${sym.split(' ')[0]} ${imm} = ${f(r ?? 0)}` };
  }
  if (n in LOAD_SIZE) {
    const a = (v(rs1) + imm) >>> 0;
    return { what: `${R(rd)} ← Mem[${R(rs1)} + ${imm}] (${pick(LOAD_SIZE[n], lang)})`, now: `${addr} = ${hex8(v(rs1))} + ${imm} = ${hex8(a)}` };
  }
  if (n in STORE_SIZE) {
    const a = (v(rs1) + imm) >>> 0;
    return { what: `Mem[${R(rs1)} + ${imm}] ← ${R(rs2)} (${pick(STORE_SIZE[n], lang)})`, now: T(`địa chỉ = ${hex8(a)}, giá trị cất = ${f(v(rs2))}`, `address = ${hex8(a)}, value stored = ${f(v(rs2))}`) };
  }
  if (n in BR_SYM) {
    const [symP, test] = BR_SYM[n];
    const sym = pick(symP, lang);
    const t = test(v(rs1), v(rs2));
    const target = d.target ?? 0;
    const off = `PC ${imm >= 0 ? '+' : '−'} ${Math.abs(imm)}`;
    return {
      what: T(`Nếu ${R(rs1)} ${sym} ${R(rs2)} thì nhảy tới ${hex8(target)} (= ${off})`, `If ${R(rs1)} ${sym} ${R(rs2)}, jump to ${hex8(target)} (= ${off})`),
      now: `${f(v(rs1))} ${sym.split(' ')[0]} ${f(v(rs2))} → ${t ? T('ĐÚNG: sẽ nhảy', 'TRUE: will jump') : T('SAI: đi tiếp lệnh kế', 'FALSE: continue with the next instruction')}`,
    };
  }
  switch (n) {
    case 'jal':
      return rd === 0
        ? { what: T(`Nhảy tới ${hex8(d.target ?? 0)} (j: không lưu địa chỉ về)`, `Jump to ${hex8(d.target ?? 0)} (j: no return address saved)`) }
        : { what: T(`${R(rd)} ← PC + 4 = ${hex8(pc + 4)} (địa chỉ quay về), rồi nhảy tới ${hex8(d.target ?? 0)}`, `${R(rd)} ← PC + 4 = ${hex8(pc + 4)} (the return address), then jump to ${hex8(d.target ?? 0)}`) };
    case 'jalr': {
      const t = ((v(rs1) + imm) & ~1) >>> 0;
      if (rd === 0 && rs1 === 1 && imm === 0) return { what: T('Quay về nơi đã gọi hàm (nhảy tới địa chỉ trong ra)', 'Return to the caller (jump to the address in ra)'), now: `ra = ${hex8(v(1))}` };
      return { what: T(`${rd ? R(rd) + ' ← PC + 4, rồi ' : ''}nhảy tới ${R(rs1)} + ${imm}`, `${rd ? R(rd) + ' ← PC + 4, then ' : ''}jump to ${R(rs1)} + ${imm}`), now: `= ${hex8(t)}` };
    }
    case 'lui':
      return { what: T(`${R(rd)} ← 0x${(imm >>> 0).toString(16).toUpperCase()} dịch trái 12 bit`, `${R(rd)} ← 0x${(imm >>> 0).toString(16).toUpperCase()} shifted left 12 bits`), now: `= ${hex8((imm << 12) >>> 0)}` };
    case 'auipc':
      return { what: `${R(rd)} ← PC + (0x${(imm >>> 0).toString(16).toUpperCase()} << 12)`, now: `= ${hex8(pc)} + ${hex8((imm << 12) >>> 0)} = ${hex8((pc + (imm << 12)) >>> 0)}` };
    case 'ecall': {
      const a7 = v(17);
      return {
        what: T('Gọi dịch vụ hệ thống, số dịch vụ nằm trong a7', 'System call; the service number is in a7'),
        now: `a7 = ${a7}: ${ecallName(a7, lang) ?? T('dịch vụ không có trong bảng (kiểm tra a7!)', 'not in the service table (check a7!)')}`,
      };
    }
    case 'ebreak':
      return { what: T('Điểm dừng: tạm dừng chương trình', 'Breakpoint: pause the program') };
  }
  return { what: n };
}
