import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI 的“聪明”从哪里来？',
  description: '用初中数学一步步理解人工智能：可暂停、可回看的网页讲座。',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
