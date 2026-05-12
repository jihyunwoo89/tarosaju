import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Noto_Serif_KR } from 'next/font/google';
import localFont from 'next/font/local';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display-kr',
  display: 'swap',
});

// Pretendard 은 Google Fonts 가 아니라 self-host (Task 1 단계는 system-ui fallback, 여기서 로컬 폰트 도입)
// public/fonts/PretendardVariable.woff2 가 있다고 가정 (Step 2 에서 다운로드)
const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tarosaju — 사주와 타로로 보는 풀이',
  description: '사주 명식과 타로 3장을 한 흐름에서 융합 해석합니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // iOS Safari safe-area + 100dvh
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F0F0E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${notoSerifKR.variable} ${pretendard.variable}`}>
      <body className="font-body bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
