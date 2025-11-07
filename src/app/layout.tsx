import type { Metadata } from "next";
import "./globals.css";
import { GENERAL } from "@/lib/config";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "latin-ext"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: GENERAL.TITLE,
  description: GENERAL.DESCRIPTION,
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang={GENERAL.LANGUAGE} suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} ${notoSansJP.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
