/** Tiện ích làm việc với bit cho các widget. Dùng số JS thường, w ≤ 32. */

export const maskOf = (w: number) => (w >= 32 ? 0xffffffff : 2 ** w - 1);

/** Dãy bit từ MSB tới LSB. */
export const toBits = (v: number, w: number) =>
  Array.from({ length: w }, (_, i) => Math.floor((v >>> 0) / 2 ** (w - 1 - i)) % 2);

export const fromBits = (b: number[]) => b.reduce((acc, x) => acc * 2 + x, 0);

export const unsignedOf = (v: number, w: number) => (w >= 32 ? v >>> 0 : (v >>> 0) % 2 ** w);

export const signedOf = (v: number, w: number) => {
  const u = unsignedOf(v, w);
  return u >= 2 ** (w - 1) ? u - 2 ** w : u;
};

export const hexOf = (v: number, w: number) => unsignedOf(v, w).toString(16).toUpperCase().padStart(Math.ceil(w / 4), '0');

export const binOf = (v: number, w: number) => toBits(v, w).join('');

/** Nhóm chuỗi bit thành từng cụm 4 cho dễ đọc. */
export const group4 = (s: string) => s.replace(/\B(?=(.{4})+$)/g, ' ');

/** Chuyển số (cho phép âm) về dạng mẫu bit w bit. Trả null nếu ngoài phạm vi. */
export function patternFrom(n: number, w: number): number | null {
  if (!Number.isInteger(n)) return null;
  if (n < -(2 ** (w - 1)) || n > 2 ** w - 1) return null;
  return n < 0 ? 2 ** w + n : n;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Biểu diễn nhị phân chính xác của một số double hữu hạn (phần nguyên + phần lẻ). */
export function binaryOfDouble(x: number, maxFrac = 64): string {
  if (!isFinite(x)) return String(x);
  const neg = x < 0;
  let a = Math.abs(x);
  const ip = Math.floor(a);
  let frac = a - ip;
  let s = ip.toString(2);
  if (frac > 0) {
    s += '.';
    let n = 0;
    while (frac > 0 && n < maxFrac) {
      frac *= 2;
      if (frac >= 1) { s += '1'; frac -= 1; } else s += '0';
      n++;
    }
    if (frac > 0) s += '…';
  }
  return (neg ? '−' : '') + s;
}

/** Tách float32: dấu, mũ đã bias, phần lẻ 23 bit. */
export function f32Parts(x: number) {
  const buf = new DataView(new ArrayBuffer(4));
  buf.setFloat32(0, x);
  const bits = buf.getUint32(0);
  return { bits, s: bits >>> 31, e: (bits >>> 23) & 0xff, f: bits & 0x7fffff };
}

export function f32FromBits(bits: number) {
  const buf = new DataView(new ArrayBuffer(4));
  buf.setUint32(0, bits >>> 0);
  return buf.getFloat32(0);
}

export const fmtNum = (x: number, digits = 4) =>
  Number.isInteger(x) ? x.toLocaleString('vi-VN') : x.toLocaleString('vi-VN', { maximumSignificantDigits: digits });
