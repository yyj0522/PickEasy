import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.easypick-ai.com"),

  title: {
    template: '%s | PickEasy',
    default: 'PickEasy - AI 기반 IT 제품 추천 & 최저가 비교',
  },
  description: "결정장애 해결! 노트북, PC견적, 가전제품을 AI가 분석하여 최적의 모델을 추천해드립니다.",
  
  keywords: ["픽이지", "PickEasy", "노트북추천", "PC견적", "가성비노트북", "전자제품비교", "AI추천"],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: '/logo.png',
  },

  verification: {
    google: 'eofOt5ZI2YD22SwgP9wjDbmdej1l0YcOi6eWJgJsNOI',
    other: {
      'naver-site-verification': 'cc70ddde37675b09f058204fedbfa2cbf04717aa',
    },
  },

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'PickEasy - AI 쇼핑 큐레이터',
    description: '고민은 AI가, 선택은 쉽고 빠르게.',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.easypick-ai.com',
    siteName: 'PickEasy',
    images: [
      {
        url: '/og-image.png',
        width: 1120,
        height: 630,
        alt: 'PickEasy 서비스 미리보기',
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
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://img.linkprice.com https://track.linkprice.com https://va.vercel-scripts.com;
            img-src 'self' data: https: http:;
            style-src 'self' 'unsafe-inline';
            font-src 'self' data:;
            connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://kwefkeqvltaiixylcewm.supabase.co https://va.vercel-scripts.com;
            frame-src 'self' https://challenges.cloudflare.com;
          "
        />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}