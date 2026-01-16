import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat - AIを介したチャットツール",
  description: "メッセージがAIを経由して届くチャットアプリ。送信前にAIがメッセージを処理し、コミュニケーションを補助します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
