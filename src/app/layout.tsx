import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Corden",
  description:
    "A browser-based 2D + 3D architectural workspace. Draft, model, create.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#4772b3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plexMono.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
