import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import Shell from '@/components/Shell';
import LabProvider from '@/components/lab/LabProvider';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/shell.css';
import '@/styles/lesson.css';
import '@/styles/widgets.css';
import '@/styles/lab.css';
import '@/styles/parts.css';

const display = Bricolage_Grotesque({ subsets: ['latin', 'vietnamese'], axes: ['opsz', 'wdth'], variable: '--font-display', display: 'swap' });
const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Kiến trúc Máy tính từ số 0', template: '%s · KTMT từ số 0' },
  description: 'Học Kiến trúc Máy tính (IT3030E) từ con số 0: lộ trình, giải thích chi tiết, mô phỏng RISC-V chạy từng lệnh.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// đặt giao diện sáng/tối và ngôn ngữ trước khi vẽ trang để không bị nháy
const themeScript = `try{var d=document.documentElement;var t=JSON.parse(localStorage.getItem('ktmt-theme')||'"system"');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);var l=JSON.parse(localStorage.getItem('ktmt-lang')||'"vi"');if(l==='en'){d.setAttribute('data-lang','en');d.setAttribute('lang','en')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LabProvider>
          <Shell>{children}</Shell>
        </LabProvider>
      </body>
    </html>
  );
}
