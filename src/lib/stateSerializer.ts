import { DEFAULT_VIEW_CONFIG } from "@/lib/config";
import { LayoutMode, MapId, ViewState } from "@/hooks/store/mapManagerState";
import { getBaseLayers, BaseLayer } from "@/lib/getBaseLayers";
import { getCustomLayers } from "@/lib/customBaseLayers";
import {
  DEFAULT_PATTERN_ID,
  ElevationRange,
  getDefaultRanges,
} from "@/lib/relief/colorPatterns";

/** Serializable optional layer entry (reconstructed during deserialization) */
export interface SerializedOptionalLayer {
  layerId: string;
  title: string;
  opacity: number;
  visible: boolean;
  tileUrl: string;
}

/** Shape of deserialized state that hydrate actions accept */
export interface DeserializedState {
  // Map position (main)
  mainViewState?: ViewState;
  // Map position (sub)
  subViewState?: ViewState;
  // Layout & UI
  layoutMode?: LayoutMode;
  isSyncPosition?: boolean;
  subMapOpacityOnOverlay?: number;
  isDisplayCenterLine?: boolean;
  isDisplayOverview?: boolean;
  isClickToMoveEnabled?: boolean;
  isDisplayMagneticNorth?: boolean;
  // Map layers
  mainBaseLayerId?: string;
  subBaseLayerId?: string;
  mainProjection?: "mercator" | "globe";
  subProjection?: "mercator" | "globe";
  mainOptionalLayers?: SerializedOptionalLayer[];
  subOptionalLayers?: SerializedOptionalLayer[];
  // Grid
  isDisplayLatLngGrid?: boolean;
  isDisplayUtmGrid?: boolean;
  isDisplayTileGrid?: boolean;
  isDisplayRegionalMesh?: boolean;
  isDisplayMapSheetNumbers?: boolean;
  // Relief
  isReliefWindowOpen?: boolean;
  isHillshadeEnabled?: boolean;
  selectedPatternId?: string;
  elevationRanges?: ElevationRange[];
}

// --- Defaults ---

const DEFAULT_LAYOUT_MODE: LayoutMode = "single";
const DEFAULT_SYNC = false;
const DEFAULT_OPACITY = 0.5;
const DEFAULT_CENTER_LINE = true;
const DEFAULT_OVERVIEW = false;
const DEFAULT_CLICK_TO_MOVE = false;
const DEFAULT_MAGNETIC_NORTH = false;
const DEFAULT_BASE_LAYER_ID = getBaseLayers()[0].id;
const DEFAULT_PROJECTION = "mercator";
const DEFAULT_RELIEF_WINDOW = false;
const DEFAULT_HILLSHADE = false;

// --- Serialization helpers ---

const fmtFloat = (n: number, decimals: number): string => n.toFixed(decimals);

const fmtBool = (b: boolean): string => (b ? "1" : "0");

const layoutModeToShort: Record<LayoutMode, string> = {
  single: "s",
  split: "sp",
  overlay: "o",
};

const shortToLayoutMode: Record<string, LayoutMode> = {
  s: "single",
  sp: "split",
  o: "overlay",
};

const projToShort = (p: "mercator" | "globe"): string =>
  p === "mercator" ? "m" : "g";

const shortToProj = (s: string): "mercator" | "globe" | undefined => {
  if (s === "m") return "mercator";
  if (s === "g") return "globe";
  return undefined;
};

const serializeOptionalLayers = (
  layers: {
    layerId: string;
    title: string;
    opacity: number;
    visible: boolean;
    tileUrl: string;
  }[],
): string =>
  layers
    .map(
      (l) =>
        `${l.layerId}|${l.title}|${fmtFloat(l.opacity, 2)}|${fmtBool(l.visible)}|${l.tileUrl}`,
    )
    .join(",");

const deserializeOptionalLayers = (s: string): SerializedOptionalLayer[] => {
  if (!s) return [];
  return s
    .split(",")
    .map((entry) => {
      const parts = entry.split("|");
      if (parts.length < 4) return null;
      const opacity = parseFloat(parts[2]);
      if (isNaN(opacity)) return null;
      // 後方互換性: 旧形式(4パート)は visible=true、新形式(5パート以上)は visible フラグあり
      const hasVisibleField = parts.length >= 5 && (parts[3] === "0" || parts[3] === "1");
      const visible = hasVisibleField ? parts[3] === "1" : true;
      const tileUrlStartIndex = hasVisibleField ? 4 : 3;
      return {
        layerId: parts[0],
        title: parts[1],
        opacity,
        visible,
        tileUrl: parts.slice(tileUrlStartIndex).join("|"), // tileUrl may contain |
      };
    })
    .filter((x): x is SerializedOptionalLayer => x !== null);
};

const serializeElevationRanges = (ranges: ElevationRange[]): string =>
  ranges.map((r) => `${String(r.minElevation)}:${r.color}`).join(",");

const deserializeElevationRanges = (s: string): ElevationRange[] => {
  if (!s) return [];
  return s
    .split(",")
    .map((entry, index) => {
      const [elevStr, color] = entry.split(":");
      const minElevation = parseFloat(elevStr);
      if (isNaN(minElevation) || !color) return null;
      return {
        id: `url-${String(index)}`,
        minElevation,
        color,
      };
    })
    .filter((x): x is ElevationRange => x !== null);
};

const defaultRangesString = (): string =>
  serializeElevationRanges(getDefaultRanges());

// --- State read interface (what we read from the store) ---

export interface SerializableStoreState {
  viewStates: Record<MapId, ViewState | null>;
  layoutMode: LayoutMode;
  isSyncPosition: boolean;
  subMapOpacityOnOverlay: number;
  isDisplayCenterLine: boolean;
  isDisplayOverview: boolean;
  isClickToMoveEnabled: boolean;
  isDisplayMagneticNorth: boolean;
  maps: Record<
    MapId,
    {
      baseLayer: { id: string };
      optionalLayers: {
        layerId: string;
        title: string;
        opacity: number;
        visible: boolean;
        tileUrl: string;
      }[];
      projection: "mercator" | "globe";
    }
  >;
  isDisplayLatLngGrid: boolean;
  isDisplayUtmGrid: boolean;
  isDisplayTileGrid: boolean;
  isDisplayRegionalMesh: boolean;
  isDisplayMapSheetNumbers: boolean;
  isReliefWindowOpen: boolean;
  isHillshadeEnabled: boolean;
  selectedPatternId: string;
  elevationRanges: ElevationRange[];
}

// --- Serialize ---

export const serializeState = (state: SerializableStoreState): string => {
  const params: [string, string][] = [];

  const push = (key: string, value: string, defaultValue: string) => {
    if (value !== defaultValue) {
      params.push([key, value]);
    }
  };

  // Main view state
  const mv = state.viewStates.main;
  if (mv) {
    push(
      "lat",
      fmtFloat(mv.latitude, 6),
      fmtFloat(DEFAULT_VIEW_CONFIG.LATITUDE, 6),
    );
    push(
      "lng",
      fmtFloat(mv.longitude, 6),
      fmtFloat(DEFAULT_VIEW_CONFIG.LONGITUDE, 6),
    );
    push("z", fmtFloat(mv.zoom, 2), fmtFloat(DEFAULT_VIEW_CONFIG.ZOOM, 2));
    push(
      "b",
      fmtFloat(mv.bearing, 1),
      fmtFloat(DEFAULT_VIEW_CONFIG.BEARING, 1),
    );
    push("p", fmtFloat(mv.pitch, 1), fmtFloat(DEFAULT_VIEW_CONFIG.PITCH, 1));
  }

  // Sub view state (only when not single)
  if (state.layoutMode !== "single") {
    const sv = state.viewStates.sub;
    if (sv) {
      push("slat", fmtFloat(sv.latitude, 6), "");
      push("slng", fmtFloat(sv.longitude, 6), "");
      push("sz", fmtFloat(sv.zoom, 2), "");
      push(
        "sb",
        fmtFloat(sv.bearing, 1),
        fmtFloat(DEFAULT_VIEW_CONFIG.BEARING, 1),
      );
      push("sp", fmtFloat(sv.pitch, 1), fmtFloat(DEFAULT_VIEW_CONFIG.PITCH, 1));
    }
  }

  // Layout & UI
  push(
    "lm",
    layoutModeToShort[state.layoutMode],
    layoutModeToShort[DEFAULT_LAYOUT_MODE],
  );
  push("sync", fmtBool(state.isSyncPosition), fmtBool(DEFAULT_SYNC));
  push(
    "opa",
    fmtFloat(state.subMapOpacityOnOverlay, 2),
    fmtFloat(DEFAULT_OPACITY, 2),
  );
  push("cl", fmtBool(state.isDisplayCenterLine), fmtBool(DEFAULT_CENTER_LINE));
  push("ov", fmtBool(state.isDisplayOverview), fmtBool(DEFAULT_OVERVIEW));
  push(
    "ctm",
    fmtBool(state.isClickToMoveEnabled),
    fmtBool(DEFAULT_CLICK_TO_MOVE),
  );
  push(
    "mn",
    fmtBool(state.isDisplayMagneticNorth),
    fmtBool(DEFAULT_MAGNETIC_NORTH),
  );

  // Map layers - main
  push("bl", state.maps.main.baseLayer.id, DEFAULT_BASE_LAYER_ID);
  push(
    "pj",
    projToShort(state.maps.main.projection),
    projToShort(DEFAULT_PROJECTION),
  );
  if (state.maps.main.optionalLayers.length > 0) {
    params.push([
      "ol",
      serializeOptionalLayers(state.maps.main.optionalLayers),
    ]);
  }

  // Map layers - sub
  push("sbl", state.maps.sub.baseLayer.id, DEFAULT_BASE_LAYER_ID);
  push(
    "spj",
    projToShort(state.maps.sub.projection),
    projToShort(DEFAULT_PROJECTION),
  );
  if (state.maps.sub.optionalLayers.length > 0) {
    params.push([
      "sol",
      serializeOptionalLayers(state.maps.sub.optionalLayers),
    ]);
  }

  // Grid
  push("llg", fmtBool(state.isDisplayLatLngGrid), fmtBool(false));
  push("utmg", fmtBool(state.isDisplayUtmGrid), fmtBool(false));
  push("tg", fmtBool(state.isDisplayTileGrid), fmtBool(false));
  push("rm", fmtBool(state.isDisplayRegionalMesh), fmtBool(false));
  push("msn", fmtBool(state.isDisplayMapSheetNumbers), fmtBool(false));

  // Relief
  push("rw", fmtBool(state.isReliefWindowOpen), fmtBool(DEFAULT_RELIEF_WINDOW));
  push("hs", fmtBool(state.isHillshadeEnabled), fmtBool(DEFAULT_HILLSHADE));
  push("rp", state.selectedPatternId, DEFAULT_PATTERN_ID);

  // Elevation ranges: only serialize if pattern is custom (empty string)
  if (state.selectedPatternId === "") {
    const rangesStr = serializeElevationRanges(state.elevationRanges);
    push("er", rangesStr, defaultRangesString());
  }

  return params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
};

// --- Deserialize ---

export const deserializeState = (paramString: string): DeserializedState => {
  if (!paramString) return {};

  const map = new Map<string, string>();
  for (const part of paramString.split("&")) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;
    const key = part.substring(0, eqIndex);
    const value = decodeURIComponent(part.substring(eqIndex + 1));
    map.set(key, value);
  }

  const result: DeserializedState = {};

  const getFloat = (key: string): number | undefined => {
    const v = map.get(key);
    if (v === undefined) return undefined;
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  };

  const getBool = (key: string): boolean | undefined => {
    const v = map.get(key);
    if (v === "1") return true;
    if (v === "0") return false;
    return undefined;
  };

  const getString = (key: string): string | undefined => map.get(key);

  // Main view state
  const lat = getFloat("lat");
  const lng = getFloat("lng");
  const z = getFloat("z");
  const b = getFloat("b");
  const p = getFloat("p");
  if (lat !== undefined && lng !== undefined && z !== undefined) {
    result.mainViewState = {
      latitude: lat,
      longitude: lng,
      zoom: z,
      bearing: b ?? DEFAULT_VIEW_CONFIG.BEARING,
      pitch: p ?? DEFAULT_VIEW_CONFIG.PITCH,
    };
  }

  // Sub view state
  const slat = getFloat("slat");
  const slng = getFloat("slng");
  const sz = getFloat("sz");
  const sb = getFloat("sb");
  const sp = getFloat("sp");
  if (slat !== undefined && slng !== undefined && sz !== undefined) {
    result.subViewState = {
      latitude: slat,
      longitude: slng,
      zoom: sz,
      bearing: sb ?? DEFAULT_VIEW_CONFIG.BEARING,
      pitch: sp ?? DEFAULT_VIEW_CONFIG.PITCH,
    };
  }

  // Layout & UI
  const lm = getString("lm");
  if (lm !== undefined && lm in shortToLayoutMode) {
    result.layoutMode = shortToLayoutMode[lm];
  }

  const sync = getBool("sync");
  if (sync !== undefined) result.isSyncPosition = sync;

  const opa = getFloat("opa");
  if (opa !== undefined) result.subMapOpacityOnOverlay = opa;

  const cl = getBool("cl");
  if (cl !== undefined) result.isDisplayCenterLine = cl;

  const ov = getBool("ov");
  if (ov !== undefined) result.isDisplayOverview = ov;

  const ctm = getBool("ctm");
  if (ctm !== undefined) result.isClickToMoveEnabled = ctm;

  const mn = getBool("mn");
  if (mn !== undefined) result.isDisplayMagneticNorth = mn;

  // Map layers
  const bl = getString("bl");
  if (bl !== undefined) result.mainBaseLayerId = bl;

  const sbl = getString("sbl");
  if (sbl !== undefined) result.subBaseLayerId = sbl;

  const pj = getString("pj");
  if (pj !== undefined) result.mainProjection = shortToProj(pj);

  const spj = getString("spj");
  if (spj !== undefined) result.subProjection = shortToProj(spj);

  const ol = getString("ol");
  if (ol !== undefined)
    result.mainOptionalLayers = deserializeOptionalLayers(ol);

  const sol = getString("sol");
  if (sol !== undefined)
    result.subOptionalLayers = deserializeOptionalLayers(sol);

  // Grid
  const llg = getBool("llg");
  if (llg !== undefined) result.isDisplayLatLngGrid = llg;

  const utmg = getBool("utmg");
  if (utmg !== undefined) result.isDisplayUtmGrid = utmg;

  const tg = getBool("tg");
  if (tg !== undefined) result.isDisplayTileGrid = tg;

  const rm = getBool("rm");
  if (rm !== undefined) result.isDisplayRegionalMesh = rm;

  const msn = getBool("msn");
  if (msn !== undefined) result.isDisplayMapSheetNumbers = msn;

  // Relief
  const rw = getBool("rw");
  if (rw !== undefined) result.isReliefWindowOpen = rw;

  const hs = getBool("hs");
  if (hs !== undefined) result.isHillshadeEnabled = hs;

  const rp = getString("rp");
  if (rp !== undefined) result.selectedPatternId = rp;

  const er = getString("er");
  if (er !== undefined) {
    const ranges = deserializeElevationRanges(er);
    if (ranges.length >= 2) {
      result.elevationRanges = ranges;
    }
  }

  return result;
};

// --- Base layer resolution ---

export const resolveBaseLayer = (id: string): BaseLayer => {
  // Check standard base layers
  const baseLayers = getBaseLayers();
  const found = baseLayers.find((l) => l.id === id);
  if (found) return found;

  // Check custom base layers from localStorage
  if (id.startsWith("custom-")) {
    const customLayers = getCustomLayers();
    const custom = customLayers.find((l) => l.id === id);
    if (custom) {
      return {
        id: custom.id,
        type: "custom",
        label: custom.label,
        legendImageUrl: "",
        sourceType: custom.sourceType,
        source: custom.source,
        data: custom.data,
        minZoom: custom.minZoom,
        maxZoom: custom.maxZoom,
      };
    }
  }

  // Fallback to first base layer
  return baseLayers[0];
};
