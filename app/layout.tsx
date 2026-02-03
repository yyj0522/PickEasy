import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | EasyPick',
    default: 'EasyPick - AI 기반 IT 제품 추천 & 최저가 비교',
  },
  description: "결정장애 해결! 노트북, PC견적, 가전제품을 AI가 분석하여 최적의 모델을 추천해드립니다.",
  icons: {
    icon: '/logo.png',
  },
  verification: {
    google: 'eofOt5ZI2YD22SwgP9wjDbmdej1l0YcOi6eWJgJsNOI',
    other: {
      'naver-site-verification': 'cc70ddde37675b09f058204fedbfa2cbf04717aa',
    },
  },
  openGraph: {
    title: 'EasyPick - AI 쇼핑 큐레이터',
    description: '고민은 AI가, 선택은 쉽고 빠르게.',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.easypick-ai.com',
    siteName: 'EasyPick',
    images: [
      {
        url: 'https://www.easypick-ai.com/logo.png',
        width: 800,
        height: 600,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}