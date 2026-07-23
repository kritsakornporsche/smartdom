import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Noto_Sans_Thai, Noto_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";

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
    default: "แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา | Experience Modern Living",
    template: "%s | แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา",
  },
  description: "ระบบบริหารจัดการหอพักสำหรับนักศึกษาและเจ้าของหอพัก หน้ามหาวิทยาลัยพะเยา",
  keywords: ["Dormitory", "Management", "University of Phayao", "Smart Living", "Phayao"],
  authors: [{ name: "ทีมงานแพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import SessionProviderWrapper from "./components/SessionProviderWrapper";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${outfit.variable} ${inter.variable} ${notoThai.variable} ${notoThaiLooped.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-200">
        <Toaster position="top-center" expand={true} richColors />
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
