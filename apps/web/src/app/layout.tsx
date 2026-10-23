import type { Metadata } from "next";
import localFont from "next/font/local";

import "../styles/globals.css";
import Providers from "@/components/providers";
import { getLocale } from "@/i18n/get-locale";
import { cn } from "cn";
import { Inter } from "next/font/google";

const outfitHeading = localFont({
  src: "../fonts/outfit-latin.woff2",
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "tcl-guide",
  description: "tcl-guide",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale === "my" ? "my" : "en"}
      suppressHydrationWarning
      className={cn("font-sans", inter.variable, outfitHeading.variable)}
    >
      <body className={cn("antialiased", "style-rhea")}>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
