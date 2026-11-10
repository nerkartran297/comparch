'use client';

import { useStored } from '@/lib/storage';

const ITEMS = [
  'Tính được CPU time, CPI trung bình, “nhanh hơn bao nhiêu %”',
  'Đếm số lệnh động trong vòng lặp lồng nhau',
  'Mô tả chu trình Fetch – Execute, vai trò PC và IR',
  'Giải thích ngắt, ISR, so sánh với gọi hàm; polling và ngắt',
  'Thuộc bảng thanh ghi (zero, ra, sp, t, s, a) và số x tương ứng',
  'Chạy tay một đoạn assembly ra giá trị thanh ghi cuối',
  'Dịch C ↔ assembly: phép gán, mảng, if-else, for, while, switch',
  'Mã hoá lệnh R, I, S ra nhị phân / hex',
  'Viết hàm có cất/khôi phục stack; hiểu đệ quy fact',
  'Vẽ bản đồ vùng .data (có căn lề)',
  'Dùng ecall: in/đọc số, in chuỗi, thoát',
  'Bù 2, mở rộng dấu, lb và lbu, blt và bltu',
  'Nhận biết tràn số',
  'Bảng chân lý full adder, công thức carry-lookahead',
  'Chạy tay thuật toán nhân và chia 4 bit',
  'Đổi qua lại thập phân ↔ IEEE 754; nhận biết 0, ∞, NaN, không chuẩn hoá',
  'Các bước cộng / nhân số thực',
];

/** Checklist trước khi thi, lưu trong trình duyệt. */
export default function Checklist() {
  const [done, setDone] = useStored<Record<number, boolean>>('ktmt-checklist-v1', {});
  const n = ITEMS.filter((_, i) => done[i]).length;
  return (
    <div className="checklist">
      <p className="checklist-head"><b>{n}/{ITEMS.length}</b> mục đã tự tin <span className="hbar-track" style={{ width: 160, display: 'inline-flex', verticalAlign: 'middle', height: 10 }}><span className="hbar-fill" style={{ width: `${(n / ITEMS.length) * 100}%`, background: 'var(--ok)' }} /></span></p>
      <ul>
        {ITEMS.map((t, i) => (
          <li key={i}>
            <label>
              <input id={`ck-${i}`} type="checkbox" checked={!!done[i]} onChange={() => setDone((d) => ({ ...d, [i]: !d[i] }))} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
