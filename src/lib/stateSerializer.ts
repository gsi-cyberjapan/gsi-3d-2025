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
  // Per-map display toggles
  mainHillshade?: boolean;
  subHillshade?: boolean;
  mainTerrain?: boolean;
  subTerrain?: boolean;
  mainPointCloud?: boolean;
  subPointCloud?: boolean;
  mainDenshi3d?: boolean;
  subDenshi3d?: boolean;
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

// --- Layer serialization (gsimaps-vector-experiment compatible) ---

const serializeLayers = (
  baseLayerId: string,
  optionalLayers: {
    layerId: string;
    title: string;
    opacity: number;
    visible: boolean;
    tileUrl: string;
  }[],
): { ls: string; disp: string } => {
  // Base layer: first entry, always opacity 1.00, always visible
  const lsParts = [`${baseLayerId},${fmtFloat(1.0, 2)}`];
  let disp = "1";

  for (const l of optionalLayers) {
    lsParts.push(
      `${l.layerId},${fmtFloat(l.opacity, 2)},${encodeURIComponent(l.title)},${encodeURIComponent(l.tileUrl)}`,
    );
    disp += l.visible ? "1" : "0";
  }

  return { ls: lsParts.join("|"), disp };
};

const deserializeLayers = (
  ls: string,
  disp: string,
): { baseLayerId: string; optionalLayers: SerializedOptionalLayer[] } => {
  if (!ls) return { baseLayerId: DEFAULT_BASE_LAYER_ID, optionalLayers: [] };

  const entries = ls.split("|");
  let baseLayerId = DEFAULT_BASE_LAYER_ID;
  const optionalLayers: SerializedOptionalLayer[] = [];

  entries.forEach((entry, index) => {
    const parts = entry.split(",");
    const isVisible = disp ? disp[index] === "1" : true;

    if (parts.length === 2) {
      // Base layer: layerId,opacity
      baseLayerId = parts[0];
    } else if (parts.length >= 4) {
      // Optional layer: layerId,opacity,title,tileUrl
      const opacity = parseFloat(parts[1]);
      if (isNaN(opacity)) return;
      optionalLayers.push({
        layerId: parts[0],
        title: decodeURIComponent(parts[2]),
        opacity,
        visible: isVisible,
        tileUrl: decodeURIComponent(parts.slice(3).join(",")),
      });
    }
  });

  return { baseLayerId, optionalLayers };
};

// --- Elevation range helpers ---

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
      isHillshadeEnabled: boolean;
      isTerrainEnabled: boolean;
      isPointCloudEnabled: boolean;
      isDenshi3dEnabled: boolean;
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
  // Position segment: zoom/lat/lng/ (always present)
  const mv = state.viewStates.main;
  const zoom = mv
    ? fmtFloat(mv.zoom, 3)
    : fmtFloat(DEFAULT_VIEW_CONFIG.ZOOM, 3);
  const lat = mv
    ? fmtFloat(mv.latitude, 6)
    : fmtFloat(DEFAULT_VIEW_CONFIG.LATITUDE, 6);
  const lng = mv
    ? fmtFloat(mv.longitude, 6)
    : fmtFloat(DEFAULT_VIEW_CONFIG.LONGITUDE, 6);
  const positionSegment = `${zoom}/${lat}/${lng}/`;

  const parts: string[] = [];

  // Helper: push encoded param (only when different from default)
  const push = (key: string, value: string, defaultValue: string) => {
    if (value !== defaultValue) {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  };

  // Helper: push raw param (for ls/disp with structural delimiters)
  const pushRaw = (key: string, value: string) => {
    parts.push(`${key}=${value}`);
  };

  // Bearing and pitch (only when non-default)
  if (mv) {
    push(
      "b",
      fmtFloat(mv.bearing, 1),
      fmtFloat(DEFAULT_VIEW_CONFIG.BEARING, 1),
    );
    push("p", fmtFloat(mv.pitch, 1), fmtFloat(DEFAULT_VIEW_CONFIG.PITCH, 1));
  }

  // Layout mode (omitted for single)
  push(
    "lm",
    layoutModeToShort[state.layoutMode],
    layoutModeToShort[DEFAULT_LAYOUT_MODE],
  );

  // Main layers: ls= and disp= (always present)
  const mainLayers = serializeLayers(
    state.maps.main.baseLayer.id,
    state.maps.main.optionalLayers,
  );
  pushRaw("ls", mainLayers.ls);
  pushRaw("disp", mainLayers.disp);

  // Main map params
  push(
    "pj",
    projToShort(state.maps.main.projection),
    projToShort(DEFAULT_PROJECTION),
  );
  push("hil", fmtBool(state.maps.main.isHillshadeEnabled), fmtBool(false));
  push("ter", fmtBool(state.maps.main.isTerrainEnabled), fmtBool(false));
  push("pc", fmtBool(state.maps.main.isPointCloudEnabled), fmtBool(false));
  push("d3d", fmtBool(state.maps.main.isDenshi3dEnabled), fmtBool(false));

  // Sub map (only when not single)
  if (state.layoutMode !== "single") {
    // Sub layers
    const subLayers = serializeLayers(
      state.maps.sub.baseLayer.id,
      state.maps.sub.optionalLayers,
    );
    pushRaw("sls", subLayers.ls);
    pushRaw("sdisp", subLayers.disp);

    // Sub view state
    const sv = state.viewStates.sub;
    if (sv) {
      push("slat", fmtFloat(sv.latitude, 6), "");
      push("slng", fmtFloat(sv.longitude, 6), "");
      push("sz", fmtFloat(sv.zoom, 3), "");
      push(
        "sb",
        fmtFloat(sv.bearing, 1),
        fmtFloat(DEFAULT_VIEW_CONFIG.BEARING, 1),
      );
      push("sp", fmtFloat(sv.pitch, 1), fmtFloat(DEFAULT_VIEW_CONFIG.PITCH, 1));
    }

    // Sub map params
    push(
      "spj",
      projToShort(state.maps.sub.projection),
      projToShort(DEFAULT_PROJECTION),
    );
    push("shil", fmtBool(state.maps.sub.isHillshadeEnabled), fmtBool(false));
    push("ster", fmtBool(state.maps.sub.isTerrainEnabled), fmtBool(false));
    push("spc", fmtBool(state.maps.sub.isPointCloudEnabled), fmtBool(false));
    push("sd3d", fmtBool(state.maps.sub.isDenshi3dEnabled), fmtBool(false));
  }

  // UI toggles
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

  const paramStr = parts.join("&");
  return paramStr ? `${positionSegment}&${paramStr}` : positionSegment;
};

// --- Deserialize ---

// Position segment regex: zoom/lat/lng/ (trailing slash optional)
const POSITION_REGEX =
  /^([+-]?(?:\d+)(?:\.\d+)?)\/([+-]?(?:\d+)(?:\.\d+)?)\/([+-]?(?:\d+)(?:\.\d+)?)\/?/;

export const deserializeState = (paramString: string): DeserializedState => {
  if (!paramString) return {};

  const result: DeserializedState = {};

  // Phase 1: Parse position segment (zoom/lat/lng/)
  let remainder = paramString;
  const posMatch = paramString.match(POSITION_REGEX);
  if (posMatch) {
    const zoom = parseFloat(posMatch[1]);
    const lat = parseFloat(posMatch[2]);
    const lng = parseFloat(posMatch[3]);
    if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
      result.mainViewState = {
        latitude: lat,
        longitude: lng,
        zoom,
        bearing: DEFAULT_VIEW_CONFIG.BEARING,
        pitch: DEFAULT_VIEW_CONFIG.PITCH,
      };
    }
    remainder = paramString.substring(posMatch[0].length);
  }

  // Phase 2: Parse &-separated params from remainder
  if (remainder.startsWith("&")) {
    remainder = remainder.substring(1);
  }

  // Store raw values (not decoded) so ls/disp can be parsed without
  // decoding structural delimiters like | and ,
  const rawMap = new Map<string, string>();
  for (const part of remainder.split("&")) {
    if (!part) continue;
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;
    const key = part.substring(0, eqIndex);
    const rawValue = part.substring(eqIndex + 1);
    rawMap.set(key, rawValue);
  }

  // Helpers for decoded values (regular params)
  const getFloat = (key: string): number | undefined => {
    const v = rawMap.get(key);
    if (v === undefined) return undefined;
    const n = parseFloat(decodeURIComponent(v));
    return isNaN(n) ? undefined : n;
  };

  const getBool = (key: string): boolean | undefined => {
    const v = rawMap.get(key);
    if (v === "1") return true;
    if (v === "0") return false;
    return undefined;
  };

  const getString = (key: string): string | undefined => {
    const v = rawMap.get(key);
    return v !== undefined ? decodeURIComponent(v) : undefined;
  };

  // Helper for raw values (ls/disp — parsed internally with own decoding)
  const getRaw = (key: string): string | undefined => rawMap.get(key);

  // Apply bearing/pitch to mainViewState if present
  const b = getFloat("b");
  const p = getFloat("p");
  if (result.mainViewState) {
    if (b !== undefined) result.mainViewState.bearing = b;
    if (p !== undefined) result.mainViewState.pitch = p;
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

  // Main layers (ls=/disp=)
  const ls = getRaw("ls");
  const disp = getRaw("disp");
  if (ls !== undefined) {
    const { baseLayerId, optionalLayers } = deserializeLayers(ls, disp ?? "");
    result.mainBaseLayerId = baseLayerId;
    if (optionalLayers.length > 0) {
      result.mainOptionalLayers = optionalLayers;
    }
  }

  // Sub layers (sls=/sdisp=)
  const sls = getRaw("sls");
  const sdisp = getRaw("sdisp");
  if (sls !== undefined) {
    const { baseLayerId, optionalLayers } = deserializeLayers(sls, sdisp ?? "");
    result.subBaseLayerId = baseLayerId;
    if (optionalLayers.length > 0) {
      result.subOptionalLayers = optionalLayers;
    }
  }

  // Projection
  const pj = getString("pj");
  if (pj !== undefined) result.mainProjection = shortToProj(pj);

  const spj = getString("spj");
  if (spj !== undefined) result.subProjection = shortToProj(spj);

  // Per-map display toggles
  const hil = getBool("hil");
  if (hil !== undefined) result.mainHillshade = hil;

  const shil = getBool("shil");
  if (shil !== undefined) result.subHillshade = shil;

  const ter = getBool("ter");
  if (ter !== undefined) result.mainTerrain = ter;

  const ster = getBool("ster");
  if (ster !== undefined) result.subTerrain = ster;

  const pc = getBool("pc");
  if (pc !== undefined) result.mainPointCloud = pc;

  const spc = getBool("spc");
  if (spc !== undefined) result.subPointCloud = spc;

  const d3d = getBool("d3d");
  if (d3d !== undefined) result.mainDenshi3d = d3d;

  const sd3d = getBool("sd3d");
  if (sd3d !== undefined) result.subDenshi3d = sd3d;

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
