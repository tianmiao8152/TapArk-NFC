import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TapArk NFC - 专业NFC工具',
  description: '支持NFC读取、写入、二进制编辑和数据管理的专业Web工具',
  manifest: '/manifest.webmanifest',
  themeColor: '#0ea5e9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TapArk NFC',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-nfc-dark">
        {children}
      </body>
    </html>
  );
}
