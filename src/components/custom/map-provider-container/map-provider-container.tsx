"use client";
import { MapProvider } from "@vis.gl/react-maplibre";

export const MapProviderContainer = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <MapProvider>{children}</MapProvider>;
};
