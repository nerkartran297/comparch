export type Example = {
  id: string;
  group: string;
  title: string;
  code: string;
  input?: string[];
  expect?: Record<string, unknown>;
};
export const EXAMPLES: Example[];
