/** Lộ trình học: thứ tự này là thứ tự nên học (không phải thứ tự chương trong slide). */
export type Step = {
  id: string;
  href: string;
  no: string;
  short: string;
  title: string;
  time: string;
  goal: string;
};

export const STEPS: Step[] = [
  {
    id: 'nen-tang', href: '/nen-tang', no: '0', short: 'Nền tảng', title: 'Bit, nhị phân, hex',
    time: '1 buổi', goal: 'Đổi qua lại thập phân ↔ nhị phân ↔ hex, hiểu AND/OR/XOR và dịch bit',
  },
  {
    id: 'chuong-1', href: '/chuong-1', no: '1', short: 'Chương 1', title: 'Giới thiệu & hiệu năng',
    time: '1–2 buổi', goal: 'Tính CPU time, CPI, so sánh máy nào nhanh hơn bao nhiêu lần',
  },
  {
    id: 'chuong-2', href: '/chuong-2', no: '2', short: 'Chương 2', title: 'Thành phần, chu trình lệnh, ngắt',
    time: '1 buổi', goal: 'Giải thích CPU chạy một lệnh thế nào, ngắt là gì và để làm gì',
  },
  {
    id: 'chuong-4a', href: '/chuong-4a', no: '3', short: 'Chương 4 · phần A', title: 'Số nguyên, bù 2, tràn số',
    time: '1 buổi', goal: 'Biểu diễn số âm, mở rộng dấu, nhận biết tràn số, phân biệt lb/lbu',
  },
  {
    id: 'chuong-3', href: '/chuong-3', no: '4', short: 'Chương 3', title: 'Tập lệnh RISC-V',
    time: '4–6 buổi', goal: 'Đọc/viết assembly, dịch C ↔ assembly, mã hoá lệnh, viết hàm dùng stack',
  },
  {
    id: 'bai-tap-3', href: '/bai-tap-3', no: '5', short: 'Bài tập Chương 3', title: 'Thực hành kiểu RARS',
    time: '2–3 buổi', goal: 'Tự viết chương trình nhập/xuất, vòng lặp, hàm; vẽ bản đồ bộ nhớ',
  },
  {
    id: 'chuong-4b', href: '/chuong-4b', no: '6', short: 'Chương 4 · phần B', title: 'Mạch logic, nhân chia, số thực',
    time: '3–4 buổi', goal: 'Tính tay nhân/chia nhị phân, hiểu mạch cộng, đổi số thực sang IEEE 754',
  },
  {
    id: 'on-thi', href: '/on-thi', no: '7', short: 'Ôn thi', title: 'Tóm tắt, checklist, trắc nghiệm',
    time: 'trước thi', goal: 'Ôn bằng tóm tắt 1 trang và tự kiểm tra bằng trắc nghiệm',
  },
];

export function stepById(id: string) {
  return STEPS.find((s) => s.id === id)!;
}

export function nextStep(id: string) {
  const i = STEPS.findIndex((s) => s.id === id);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : null;
}
