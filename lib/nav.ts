import type { Bi } from '@/components/i18n';

/** Lộ trình học: thứ tự này là thứ tự nên học (không phải thứ tự chương trong slide). */
export type Step = {
  id: string;
  href: string;
  no: string;
  short: Bi;
  title: Bi;
  time: Bi;
  goal: Bi;
};

export const STEPS: Step[] = [
  {
    id: 'nen-tang', href: '/nen-tang', no: '0',
    short: { vi: 'Nền tảng', en: 'Foundations' },
    title: { vi: 'Bit, nhị phân, hex', en: 'Bits, binary, hex' },
    time: { vi: '1 buổi', en: '1 session' },
    goal: { vi: 'Đổi qua lại thập phân ↔ nhị phân ↔ hex, hiểu AND/OR/XOR và dịch bit', en: 'Convert between decimal ↔ binary ↔ hex, understand AND/OR/XOR and bit shifts' },
  },
  {
    id: 'chuong-1', href: '/chuong-1', no: '1',
    short: { vi: 'Chương 1', en: 'Chapter 1' },
    title: { vi: 'Giới thiệu & hiệu năng', en: 'Introduction & performance' },
    time: { vi: '1–2 buổi', en: '1–2 sessions' },
    goal: { vi: 'Tính CPU time, CPI, so sánh máy nào nhanh hơn bao nhiêu lần', en: 'Compute CPU time and CPI, and say how many times faster one machine is' },
  },
  {
    id: 'chuong-2', href: '/chuong-2', no: '2',
    short: { vi: 'Chương 2', en: 'Chapter 2' },
    title: { vi: 'Thành phần, chu trình lệnh, ngắt', en: 'Components, instruction cycle, interrupts' },
    time: { vi: '1 buổi', en: '1 session' },
    goal: { vi: 'Giải thích CPU chạy một lệnh thế nào, ngắt là gì và để làm gì', en: 'Explain how the CPU runs one instruction, and what interrupts are for' },
  },
  {
    id: 'chuong-4a', href: '/chuong-4a', no: '3',
    short: { vi: 'Chương 4 · phần A', en: 'Chapter 4 · part A' },
    title: { vi: 'Số nguyên, bù 2, tràn số', en: "Integers, two's complement, overflow" },
    time: { vi: '1 buổi', en: '1 session' },
    goal: { vi: 'Biểu diễn số âm, mở rộng dấu, nhận biết tràn số, phân biệt lb/lbu', en: 'Represent negative numbers, sign-extend, spot overflow, tell lb from lbu' },
  },
  {
    id: 'chuong-3', href: '/chuong-3', no: '4',
    short: { vi: 'Chương 3', en: 'Chapter 3' },
    title: { vi: 'Tập lệnh RISC-V', en: 'The RISC-V instruction set' },
    time: { vi: '4–6 buổi', en: '4–6 sessions' },
    goal: { vi: 'Đọc/viết assembly, dịch C ↔ assembly, mã hoá lệnh, viết hàm dùng stack', en: 'Read/write assembly, translate C ↔ assembly, encode instructions, write functions that use the stack' },
  },
  {
    id: 'bai-tap-3', href: '/bai-tap-3', no: '5',
    short: { vi: 'Bài tập Chương 3', en: 'Chapter 3 exercises' },
    title: { vi: 'Thực hành kiểu RARS', en: 'RARS-style practice' },
    time: { vi: '2–3 buổi', en: '2–3 sessions' },
    goal: { vi: 'Tự viết chương trình nhập/xuất, vòng lặp, hàm; vẽ bản đồ bộ nhớ', en: 'Write programs with input/output, loops and functions; draw a memory map' },
  },
  {
    id: 'chuong-4b', href: '/chuong-4b', no: '6',
    short: { vi: 'Chương 4 · phần B', en: 'Chapter 4 · part B' },
    title: { vi: 'Mạch logic, nhân chia, số thực', en: 'Logic circuits, multiply/divide, floating point' },
    time: { vi: '3–4 buổi', en: '3–4 sessions' },
    goal: { vi: 'Tính tay nhân/chia nhị phân, hiểu mạch cộng, đổi số thực sang IEEE 754', en: 'Multiply/divide binary by hand, understand adders, convert reals to IEEE 754' },
  },
  {
    id: 'on-thi', href: '/on-thi', no: '7',
    short: { vi: 'Ôn thi', en: 'Exam review' },
    title: { vi: 'Tóm tắt, checklist, trắc nghiệm', en: 'Summary, checklist, quiz' },
    time: { vi: 'trước thi', en: 'before the exam' },
    goal: { vi: 'Ôn bằng tóm tắt 1 trang và tự kiểm tra bằng trắc nghiệm', en: 'Review with the one-page summary and test yourself with the quiz' },
  },
];

/** Tiêu đề tab trình duyệt bằng tiếng Anh (bản tiếng Việt nằm trong metadata của từng trang). */
export const EN_TITLES: Record<string, string> = {
  '/': 'Computer Architecture from Zero',
  '/nen-tang': 'Foundations: bits, binary, hex',
  '/chuong-1': 'Chapter 1: Introduction & performance',
  '/chuong-2': 'Chapter 2: Components, instruction cycle, interrupts',
  '/chuong-4a': "Chapter 4A: Integers, two's complement, overflow",
  '/chuong-3': 'Chapter 3: The RISC-V instruction set',
  '/bai-tap-3': 'Chapter 3 exercises: RARS practice',
  '/chuong-4b': 'Chapter 4B: Logic, multiply/divide, floating point',
  '/on-thi': 'Exam review',
  '/lab': 'RISC-V Lab',
};

export function stepById(id: string) {
  return STEPS.find((s) => s.id === id)!;
}

export function nextStep(id: string) {
  const i = STEPS.findIndex((s) => s.id === id);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : null;
}
