import type { Metadata } from "next";
import "./globals.css";
import { GENERAL } from "@/lib/config";
import { ThemeProvider } from "@/components/custom/theme-provider";

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
