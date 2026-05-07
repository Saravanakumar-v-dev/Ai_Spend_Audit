import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Spend Audit | Credex — Find Where Your Team Overspends on AI",
  description:
    "Free AI spend audit for startups. Discover how much your team spends on Cursor, Copilot, ChatGPT, Claude, and more — and where you can save.",
  keywords: [
    "AI spend audit",
    "AI cost optimization",
    "startup AI tools",
    "Cursor pricing",
    "GitHub Copilot cost",
    "ChatGPT business pricing",
    "Claude pricing",
    "AI tool comparison",
  ],
  openGraph: {
    title: "AI Spend Audit by Credex",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
    type: "website",
    locale: "en_US",
    siteName: "Credex AI Spend Audit",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit by Credex",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
