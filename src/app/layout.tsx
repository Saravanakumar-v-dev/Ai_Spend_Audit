import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saravanakumar AI Spend Audit · USD-native benchmarking",
  description:
    "Free AI spend audit: Cursor, Copilot, Claude, ChatGPT, Gemini, Anthropic & OpenAI APIs, v0 — modeled in USD with honest savings thresholds.",
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
    title: "Saravanakumar Spend Lab · AI vendor audit",
    description:
      "Deterministic USD benchmarking for every major AI SKU — screenshot-ready savings for leadership reviews.",
    type: "website",
    locale: "en_US",
    siteName: "Saravanakumar Spend Lab",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saravanakumar Spend Lab · AI vendor audit",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Outfit, Poppins, Space_Grotesk, Inter } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${poppins.variable} ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* Dynamic background effect */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-primary/20 via-background to-background"></div>
        {children}
      </body>
    </html>
  );
}
