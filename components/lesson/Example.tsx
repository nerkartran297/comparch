import { EXAMPLES } from '@/lib/examples.mjs';
import { L } from '@/components/i18n';
import Code from './Code';

/**
 * Hiện một chương trình mẫu trong lib/examples.mjs (cả bản Việt lẫn Anh) kèm nút chạy trong Lab.
 * <Example id="fact" />  hoặc  <Example id="fact" title={<L vi="…" en="…" />} />
 */
export default function Example({ id, title }: { id: string; title?: React.ReactNode }) {
  const ex = EXAMPLES.find((e) => e.id === id);
  if (!ex) throw new Error(`Không có chương trình mẫu '${id}'`);
  const enTitle = ex.en?.title ?? ex.title;
  return (
    <Code
      code={ex.code}
      codeEn={ex.en?.code}
      title={title ?? <L vi={ex.title} en={enTitle} />}
      runTitle={{ vi: ex.title, en: enTitle }}
    />
  );
}
