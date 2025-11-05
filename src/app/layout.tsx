import type { Metadata } from "next";
import "./globals.css";
import { GENERAL } from "@/lib/config";

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
    <html lang={GENERAL.LANGUAGE}>
      <body className="antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
