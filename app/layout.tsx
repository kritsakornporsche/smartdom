import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Noto_Sans_Thai, Noto_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
});

const notoThaiLooped = Noto_Sans_Thai_Looped({
  variable: "--font-noto-thai-looped",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartDom | Minimal & Sustainable Living",
    template: "%s | SmartDom",
  },
  description: "Next-gen dormitory management for a simplified lifestyle. Experience the future of minimal living with SmartDom.",
  keywords: ["Dormitory", "Management", "Minimalism", "Sustainable Living", "Smart Home"],
  authors: [{ name: "SmartDom Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f6", // Bone color from theme
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${outfit.variable} ${inter.variable} ${notoThai.variable} ${notoThaiLooped.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
