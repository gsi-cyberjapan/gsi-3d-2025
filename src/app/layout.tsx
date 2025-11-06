import type { Metadata } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { GENERAL_CONFIG } from "@/lib/config";
import { ThemeProvider } from "@/components/custom/theme-provider";

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
    <html lang={GENERAL_CONFIG.LANGUAGE} suppressHydrationWarning>
      <body className="antialiased">
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
