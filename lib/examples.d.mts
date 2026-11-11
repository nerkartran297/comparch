export type Example = {
  id: string;
  group: string;
  title: string;
  code: string;
  /** Bản tiếng Anh: tiêu đề + code (thường chỉ dịch comment). */
  en?: { title: string; code: string };
  input?: string[];
  expect?: Record<string, unknown>;
};
export const EXAMPLES: Example[];
