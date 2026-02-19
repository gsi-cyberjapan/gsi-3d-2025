"use client";

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/hooks/store/useStore";
import { DEFAULT_VIEW_CONFIG } from "@/lib/config";
import { Circle, Compass, ExternalLink, Map } from "lucide-react";
import Link from "next/link";
import proj4 from "proj4";

// 日本測地系 (Tokyo Datum / EPSG:4301)
proj4.defs(
  "EPSG:4301",
  "+proj=longlat +ellps=bessel +towgs84=-146.336,506.832,680.254,0,0,0,0 +no_defs",
);

/**
 * MapLibre GLのズームレベルをLeaflet（地理院地図）のズームレベルに変換する。
 * LeafletはMapLibre GLよりズームレベルが1大きい。
 */
const toLeafletZoom = (maplibreZoom: number) => Math.round(maplibreZoom + 1);

const buildGsiMapsUrl = (lat: number, lng: number, zoom: number) => {
  const z = toLeafletZoom(zoom);
  return `https://maps.gsi.go.jp/#${String(z)}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
};

const buildMapionUrl = (lat: number, lng: number, zoom: number) => {
  const z = Math.max(6, toLeafletZoom(zoom));
  return `https://maps.gsi.go.jp/link.html?site=mapion&lat=${String(lat)}&lng=${String(lng)}&z=${String(z)}`;
};

/**
 * MapLibre GLのズームレベルからいつもナビ独自ズームレベルへのマッピング。
 * gsimaps (Leaflet) のマッピングテーブルをMapLibre GL基準に調整したもの。
 */
const toItsumoNaviZoom = (maplibreZoom: number): number => {
  const z = Math.round(maplibreZoom);
  if (z <= 5) return 1;
  if (z <= 6) return 2;
  if (z <= 7) return 3;
  if (z <= 8) return 4;
  if (z <= 9) return 6;
  if (z <= 10) return 7;
  if (z <= 11) return 8;
  if (z <= 12) return 9;
  if (z <= 13) return 10;
  if (z <= 14) return 11;
  if (z <= 15) return 13;
  if (z <= 16) return 14;
  if (z <= 17) return 16;
  return 18;
};

const buildItsumoNaviUrl = (lat: number, lng: number, zoom: number) => {
  // WGS84 → 日本測地系 (EPSG:4301) に変換
  const [tokyoLng, tokyoLat] = proj4("EPSG:4326", "EPSG:4301", [lng, lat]);
  const y = Math.round(tokyoLat * 3600 * 1000);
  const x = Math.round(tokyoLng * 3600 * 1000);
  const z = toItsumoNaviZoom(zoom);
  return `https://maps.gsi.go.jp/link.html?site=itsumonavi&lat=${String(y)}&lng=${String(x)}&z=${String(z)}`;
};

export const OthersDropdownContent = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const viewState = useStore((state) => state.viewStates[focusMapId]);
  const setIsEquidistantCirclesWindowOpen = useStore(
    (state) => state.setIsEquidistantCirclesWindowOpen,
  );
  const setIsAzimuthWindowOpen = useStore(
    (state) => state.setIsAzimuthWindowOpen,
  );

  const lat = viewState?.latitude ?? DEFAULT_VIEW_CONFIG.LATITUDE;
  const lng = viewState?.longitude ?? DEFAULT_VIEW_CONFIG.LONGITUDE;
  const zoom = viewState?.zoom ?? DEFAULT_VIEW_CONFIG.ZOOM;

  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuGroup>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link href={buildGsiMapsUrl(lat, lng, zoom)} target="_blank">
            <Map />
            地理院地図で見る
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          外部サービスで見る
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link href={buildItsumoNaviUrl(lat, lng, zoom)} target="_blank">
            <ExternalLink />
            いつもNAVI
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link href={buildMapionUrl(lat, lng, zoom)} target="_blank">
            <ExternalLink />
            Mapion
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          ツール
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link
            href="https://www.gsi.go.jp/sokuchikijun/uPlace.html"
            target="_blank"
          >
            <ExternalLink />
            場所情報コード
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm cursor-pointer"
          onClick={() => {
            setIsEquidistantCirclesWindowOpen(true);
          }}
        >
          <Circle />
          等距圏
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm cursor-pointer"
          onClick={() => {
            setIsAzimuthWindowOpen(true);
          }}
        >
          <Compass />
          方位線
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};
