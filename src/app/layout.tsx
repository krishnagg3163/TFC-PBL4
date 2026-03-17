import type { Metadata } from "next";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TFC — Tinder for Clothes",
  description:
    "Swipe, style, and build your perfect wardrobe. Discover fashion that matches your vibe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans antialiased bg-dark text-white min-h-screen`}
      >
        {/* Top accent bar */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/80 via-primary to-primary/80 z-50" />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
