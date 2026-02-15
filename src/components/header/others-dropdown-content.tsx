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
import { Circle, ExternalLink } from "lucide-react";
import Link from "next/link";

const buildExternalServiceUrl = (
  site: string,
  lat: number,
  lng: number,
  zoom: number,
) => {
  return `https://maps.gsi.go.jp/link.html?site=${site}&lat=${String(lat)}&lng=${String(lng)}&z=${String(zoom)}`;
};

export const OthersDropdownContent = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const viewState = useStore((state) => state.viewStates[focusMapId]);
  const setIsEquidistantCirclesWindowOpen = useStore(
    (state) => state.setIsEquidistantCirclesWindowOpen,
  );

  const lat = viewState?.latitude ?? DEFAULT_VIEW_CONFIG.LATITUDE;
  const lng = viewState?.longitude ?? DEFAULT_VIEW_CONFIG.LONGITUDE;
  const zoom = viewState?.zoom ?? DEFAULT_VIEW_CONFIG.ZOOM;

  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          外部サービスで見る
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link
            href={buildExternalServiceUrl("itsumonavi", lat, lng, zoom)}
            target="_blank"
          >
            <ExternalLink />
            いつもNAVI
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-sm cursor-pointer">
          <Link
            href={buildExternalServiceUrl("mapion", lat, lng, zoom)}
            target="_blank"
          >
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
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};
