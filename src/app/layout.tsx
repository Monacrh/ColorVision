import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarController from "./components/sidebar/controller";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Color Vision AI",
  description: "AI Powered Ishihara Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Perubahan: 
          - md:flex: Pada desktop (md ke atas) gunakan flexbox (kiri-kanan).
          - min-h-screen: Tinggi minimal satu layar penuh.
        */}
        <div className="md:flex min-h-screen bg-gray-50">
          
          {/* Sidebar Controller akan menangani posisinya sendiri (fixed/sticky) */}
          <SidebarController />

          {/* Main content:
            - flex-1: Mengambil sisa ruang.
            - overflow-y-auto: Scroll independen jika diperlukan.
            - w-full: Lebar penuh pada mobile.
          */}
          <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-y-auto h-auto md:h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}