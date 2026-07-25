import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blueoakshealth.com"),

  title: {
    default: "BlueOaks Health",
    template: "%s | BlueOaks Health",
  },

  description:
    "Psychiatric care in San Antonio and across Texas. Home visits, outpatient care, and telehealth.",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "BlueOaks Health",
    description:
      "Psychiatric care in San Antonio and across Texas. Home visits, outpatient care, and telehealth.",
    url: "https://blueoakshealth.com",
    siteName: "BlueOaks Health",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BlueOaks Health",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BlueOaks Health",
    description:
      "Psychiatric care in San Antonio and across Texas. Home visits, outpatient care, and telehealth.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
