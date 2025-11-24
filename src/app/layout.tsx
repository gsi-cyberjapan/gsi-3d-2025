import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { GENERAL_CONFIG } from "@/lib/config";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/query";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: GENERAL_CONFIG.TITLE,
  description: GENERAL_CONFIG.DESCRIPTION,
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang={GENERAL_CONFIG.LANGUAGE}
      className={notoSansJP.className}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
