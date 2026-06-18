import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/casino/site-header";
import { BottomNav } from "@/components/casino/bottom-nav";
import { ToastViewport } from "@/components/casino/toast-viewport";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrishulCasino — Premium Online Gaming Platform",
  description: "Play slots, lottery, sports, live casino, and more. Instant deposits via UPI, 24/7 withdrawals, fair play guaranteed. 18+ only.",
  keywords: ["online casino", "slots", "lottery", "Aviator", "Win Go", "live casino", "Andar Bahar", "Teen Patti", "India casino"],
  authors: [{ name: "TrishulHub" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "TrishulCasino — Premium Online Gaming",
    description: "Slots · Lottery · Sports · Live Casino · Mini Games",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable}`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
        <BottomNav />
        <footer className="hidden md:block bg-card border-t border-border py-6 px-4 mt-auto">
          <div className="container mx-auto text-center text-xs text-muted-foreground space-y-2">
            <p>© {new Date().getFullYear()} TrishulCasino. All rights reserved.</p>
            <p className="text-amber-500 font-semibold">⚠ 18+ Only · Play Responsibly · Gambling can be addictive</p>
            <p>Licensed for demo purposes. Not a real-money gambling site.</p>
          </div>
        </footer>
        <Toaster />
        <ToastViewport />
      </body>
    </html>
  );
}
