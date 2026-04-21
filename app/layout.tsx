import type { Metadata } from "next";
import { Fraunces, Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PageConfig from "@/components/page-config";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voyage",
  description:
    "Plan your next trip away from start to finish with Voyage, the ultimate travel planning app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${plusJakartaSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PageConfig>{children}</PageConfig>
      </body>
    </html>
  );
}
