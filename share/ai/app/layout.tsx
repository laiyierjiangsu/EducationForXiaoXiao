import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI 的“聪明”从哪里来？｜从一条直线到 Transformer',
  description:
    '用数学讲透人工智能：42 页浅色演讲，从线性回归、训练与验证，到神经网络、Transformer、现实应用与独立判断。',
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
