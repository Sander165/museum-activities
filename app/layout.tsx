import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Activiteiten & Workshops — Museum",
  description:
    "Ontdek ons aanbod aan rondleidingen, workshops en lezingen. Bekijk wat er binnenkort op het programma staat en reserveer direct een plek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
