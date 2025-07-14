import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BusinessScope - 商业机会发现平台",
  description: "通过AI分析社交媒体内容，发现有价值的商业机会和创业灵感",
  keywords: ["商业机会", "创业", "AI分析", "社交媒体", "投资", "创新"],
  authors: [{ name: "BusinessScope Team" }],
  creator: "BusinessScope",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://businessscope.vercel.app",
    title: "BusinessScope - 商业机会发现平台",
    description: "通过AI分析社交媒体内容，发现有价值的商业机会和创业灵感",
    siteName: "BusinessScope",
  },
  twitter: {
    card: "summary_large_image",
    title: "BusinessScope - 商业机会发现平台",
    description: "通过AI分析社交媒体内容，发现有价值的商业机会和创业灵感",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-background">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-muted-foreground">
                      © 2025 BusinessScope. All rights reserved.
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      隐私政策
                    </a>
                    <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      服务条款
                    </a>
                    <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      联系我们
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
