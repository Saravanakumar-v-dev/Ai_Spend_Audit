import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0e1a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "Saravanakumar AI Spend Audit · USD-native benchmarking",
  description:
    "Free AI spend audit: Cursor, Copilot, Claude, ChatGPT, Gemini, Anthropic & OpenAI APIs, v0 — modeled in USD with honest savings thresholds.",
  generator: "Next.js 16",
  applicationName: "Saravanakumar Spend Lab",
  referrer: "strict-origin-when-cross-origin",
  keywords: [
    "AI spend audit",
    "AI cost optimization",
    "startup AI tools",
    "Cursor pricing",
    "GitHub Copilot cost",
    "ChatGPT business pricing",
    "Claude pricing",
    "AI tool comparison",
    "AI spending tracker",
    "developer tool audit",
  ],
  authors: [{ name: "Saravanakumar" }],
  creator: "Saravanakumar",
  publisher: "Saravanakumar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Saravanakumar Spend Lab · AI vendor audit",
    description:
      "Deterministic USD benchmarking for every major AI SKU — screenshot-ready savings for leadership reviews.",
    type: "website",
    locale: "en_US",
    siteName: "Saravanakumar Spend Lab",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saravanakumar Spend Lab · AI vendor audit",
    description:
      "Find out how much your team is overspending on AI tools. Free personalized audit report.",
    creator: "@saravanakumar",
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
  alternates: {
    canonical: "/",
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
    <html lang="en" className={`${outfit.variable} ${poppins.variable} ${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0e1a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://waljptefuiautfuhehyf.supabase.co" />
        <link rel="dns-prefetch" href="https://api.resend.com" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-accent-primary focus:text-white focus:px-3 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        
        {/* Dynamic background effect */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-primary/20 via-background to-background pointer-events-none" aria-hidden="true"></div>
        
        {children}
      </body>
    </html>
  );
}
