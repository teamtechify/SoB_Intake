import type { Metadata } from "next";
import { Geist_Mono, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "School of Bots — Client Onboarding",
  description: "Provide assets and access for your AI-powered Instagram DM funnel.",
  icons: {
    icon: "/SoB-faviconV2.png",
    shortcut: "/SoB-faviconV2.png",
    apple: "/SoB-faviconV2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full sob-gradient-bg">
      <body className={`${publicSans.variable} ${spaceMono.variable} ${geistMono.variable} antialiased text-sob-ink min-h-full`}>
        <header className="w-full">
          <div className="mx-auto max-w-5xl px-4 md:px-6 py-2 flex items-center justify-center">
            <a href="/" className="block" aria-label="School of Bots">
              <img src="/logo.svg" alt="School of Bots" className="mx-auto w-56 md:w-72 h-auto" />
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

