import { ABI, FABI, hex8 } from './riscv.mjs';
import type { Decoded } from './riscv.mjs';

/** Giải thích một lệnh đã giải mã bằng tiếng Việt, kèm giá trị thanh ghi hiện tại. */

export const ECALLS: Record<number, string> = {
  1: 'in số nguyên trong a0',
  2: 'in số thực trong fa0',
  4: 'in chuỗi tại địa chỉ a0',
  5: 'đọc số nguyên từ bàn phím → a0',
  6: 'đọc số thực → fa0',
  8: 'đọc chuỗi vào vùng nhớ a0 (tối đa a1 byte)',
  10: 'kết thúc chương trình',
  11: 'in một ký tự trong a0',
  12: 'đọc một ký tự → a0',
  34: 'in a0 dạng hex',
  35: 'in a0 dạng nhị phân',
  36: 'in a0 dạng không dấu',
  93: 'kết thúc với mã a0',
};

export const OPCODE_GROUP: Record<number, string> = {
  0x33: 'R: phép toán 3 thanh ghi',
  0x13: 'I: phép toán với hằng số',
  0x03: 'I: nạp từ bộ nhớ (load)',
  0x23: 'S: cất vào bộ nhớ (store)',
  0x63: 'B: rẽ nhánh có điều kiện',
  0x6f: 'J: jal (nhảy và lưu địa chỉ về)',
  0x67: 'I: jalr (nhảy tới địa chỉ trong thanh ghi)',
  0x37: 'U: lui (nạp 20 bit cao)',
  0x17: 'U: auipc (PC + 20 bit cao)',
  0x73: 'hệ thống (ecall)',
  0x07: 'I: nạp số thực (flw)',
  0x27: 'S: cất số thực (fsw)',
  0x53: 'R: phép toán số thực',
};

const FLOAT_OPS = new Set([0x07, 0x27, 0x53]);

const R_SYM: Record<string, string> = {
  add: '+', sub: '−', and: 'AND', or: 'OR', xor: 'XOR', sll: '<<', srl: '>> (logic)', sra: '>> (giữ dấu)',
  slt: '<', sltu: '< (không dấu)', mul: '×', mulh: '× (lấy 32 bit cao)', mulhu: '× (32 bit cao, không dấu)',
  mulhsu: '× (32 bit cao)', div: '/', divu: '/ (không dấu)', rem: '%', remu: '% (không dấu)',
};
const I_SYM: Record<string, string> = {
  addi: '+', andi: 'AND', ori: 'OR', xori: 'XOR', slti: '<', sltiu: '< (không dấu)',
  slli: '<<', srli: '>> (logic)', srai: '>> (giữ dấu)',
};
const BR_SYM: Record<string, [string, (a: number, b: number) => boolean]> = {
  beq: ['==', (a, b) => a === b], bne: ['≠', (a, b) => a !== b], blt: ['<', (a, b) => a < b],
  bge: ['≥', (a, b) => a >= b], bltu: ['< (không dấu)', (a, b) => a >>> 0 < b >>> 0],
  bgeu: ['≥ (không dấu)', (a, b) => a >>> 0 >= b >>> 0],
};
const LOAD_SIZE: Record<string, string> = { lb: '1 byte, mở rộng dấu', lbu: '1 byte, mở rộng 0', lh: '2 byte, mở rộng dấu', lhu: '2 byte, mở rộng 0', lw: '1 word = 4 byte' };
const STORE_SIZE: Record<string, string> = { sb: '1 byte thấp', sh: '2 byte thấp', sw: '4 byte' };

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

export function describe(d: Decoded, x: Int32Array, pc: number): { what: string; now?: string } {
  if (!d.ok || !d.name) return { what: 'Không giải mã được lệnh này.' };
  const n = d.name, rd = d.rd ?? 0, rs1 = d.rs1 ?? 0, rs2 = d.rs2 ?? 0, imm = d.imm ?? 0;
  const R = (i: number) => ABI[i];
  const v = (i: number) => x[i];
  /** giá trị trông như địa chỉ thì in hex cho dễ đọc */
  const f = (n: number) => (Math.abs(n) >= 0x400000 ? hex8(n) : String(n));
  const dropNote = rd === 0 ? ' (đích là zero → kết quả bị bỏ, x0 luôn = 0)' : '';

  if (d.op !== undefined && FLOAT_OPS.has(d.op)) {
    if (n === 'flw') return { what: `${FABI[rd]} ← số thực 4 byte tại Mem[${R(rs1)} + ${imm}]`, now: `địa chỉ = ${hex8(v(rs1))} + ${imm} = ${hex8((v(rs1) + imm) >>> 0)}` };
    if (n === 'fsw') return { what: `Mem[${R(rs1)} + ${imm}] ← ${FABI[rs2]}`, now: `địa chỉ = ${hex8((v(rs1) + imm) >>> 0)}` };
    return { what: `Lệnh số thực ${n}: làm việc trên thanh ghi f (xem tab Số thực).` };
  }

  if (n in R_SYM) {
    const r = compute(n, v(rs1), v(rs2));
    return {
      what: `${R(rd)} ← ${R(rs1)} ${R_SYM[n]} ${R(rs2)}${dropNote}`,
      now: r === null ? `${R(rs1)} = ${f(v(rs1))}, ${R(rs2)} = ${f(v(rs2))}` : `= ${f(v(rs1))} ${R_SYM[n].split(' ')[0]} ${f(v(rs2))} = ${f(r)}`,
    };
  }
  if (n in I_SYM) {
    const r = compute(n, v(rs1), imm);
    if (n === 'addi' && rs1 === 0) return { what: `${R(rd)} ← ${imm} (zero + hằng số = nạp hằng)${dropNote}`, now: `= ${f(r ?? 0)}` };
    if (n === 'addi' && imm === 0) return { what: `${R(rd)} ← ${R(rs1)} (chép thanh ghi, chính là mv)${dropNote}`, now: `= ${f(r ?? 0)}` };
    return { what: `${R(rd)} ← ${R(rs1)} ${I_SYM[n]} ${imm}${dropNote}`, now: `= ${f(v(rs1))} ${I_SYM[n].split(' ')[0]} ${imm} = ${f(r ?? 0)}` };
  }
  if (n in LOAD_SIZE) {
    const addr = (v(rs1) + imm) >>> 0;
    return { what: `${R(rd)} ← Mem[${R(rs1)} + ${imm}] (${LOAD_SIZE[n]})`, now: `địa chỉ = ${hex8(v(rs1))} + ${imm} = ${hex8(addr)}` };
  }
  if (n in STORE_SIZE) {
    const addr = (v(rs1) + imm) >>> 0;
    return { what: `Mem[${R(rs1)} + ${imm}] ← ${R(rs2)} (${STORE_SIZE[n]})`, now: `địa chỉ = ${hex8(addr)}, giá trị cất = ${f(v(rs2))}` };
  }
  if (n in BR_SYM) {
    const [sym, test] = BR_SYM[n];
    const t = test(v(rs1), v(rs2));
    const target = d.target ?? 0;
    return {
      what: `Nếu ${R(rs1)} ${sym} ${R(rs2)} thì nhảy tới ${hex8(target)} (= PC ${imm >= 0 ? '+' : '−'} ${Math.abs(imm)})`,
      now: `${f(v(rs1))} ${sym.split(' ')[0]} ${f(v(rs2))} → ${t ? 'ĐÚNG: sẽ nhảy' : 'SAI: đi tiếp lệnh kế'}`,
    };
  }
  switch (n) {
    case 'jal':
      return rd === 0
        ? { what: `Nhảy tới ${hex8(d.target ?? 0)} (j: không lưu địa chỉ về)` }
        : { what: `${R(rd)} ← PC + 4 = ${hex8(pc + 4)} (địa chỉ quay về), rồi nhảy tới ${hex8(d.target ?? 0)}` };
    case 'jalr': {
      const t = ((v(rs1) + imm) & ~1) >>> 0;
      if (rd === 0 && rs1 === 1 && imm === 0) return { what: 'Quay về nơi đã gọi hàm (nhảy tới địa chỉ trong ra)', now: `ra = ${hex8(v(1))}` };
      return { what: `${rd ? R(rd) + ' ← PC + 4, rồi ' : ''}nhảy tới ${R(rs1)} + ${imm}`, now: `= ${hex8(t)}` };
    }
    case 'lui':
      return { what: `${R(rd)} ← 0x${(imm >>> 0).toString(16).toUpperCase()} dịch trái 12 bit`, now: `= ${hex8((imm << 12) >>> 0)}` };
    case 'auipc':
      return { what: `${R(rd)} ← PC + (0x${(imm >>> 0).toString(16).toUpperCase()} << 12)`, now: `= ${hex8(pc)} + ${hex8((imm << 12) >>> 0)} = ${hex8((pc + (imm << 12)) >>> 0)}` };
    case 'ecall': {
      const a7 = v(17);
      return { what: 'Gọi dịch vụ hệ thống, số dịch vụ nằm trong a7', now: `a7 = ${a7}: ${ECALLS[a7] ?? 'dịch vụ không có trong bảng (kiểm tra a7!)'}` };
    }
    case 'ebreak':
      return { what: 'Điểm dừng: tạm dừng chương trình' };
  }
  return { what: n };
}
