import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header/Header";
import { PuzzleProvider } from "@/context/PuzzleContext";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Luckiest_Guy } from "next/font/google";

export const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
});

// ✅ metadata is allowed in server component
export const metadata: Metadata = {
  title: "moonfall",
  description: "coding puzzles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PuzzleProvider>
          <Header />
          {children}
        </PuzzleProvider>
      </body>
    </html>
  );
}