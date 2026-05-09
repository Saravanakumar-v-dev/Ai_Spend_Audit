import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Spend Audit | Saravanakumar — Find Where Your Team Overspends on AI",
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
    title: "AI Spend Audit by Saravanakumar",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
    type: "website",
    locale: "en_US",
    siteName: "Saravanakumar AI Spend Audit",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit by Saravanakumar",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Outfit } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* Dynamic background effect */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-primary/20 via-background to-background"></div>
        {children}
      </body>
    </html>
  );
}
