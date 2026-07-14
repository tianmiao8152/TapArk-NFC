import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TapArk NFC - 专业NFC工具',
  description: '支持NFC读取、写入、二进制编辑和数据管理的专业Web工具',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
