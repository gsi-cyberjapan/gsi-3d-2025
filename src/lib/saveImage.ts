export interface SaveImageBBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ScaleBarEntry {
  distance: number;
  label: string;
}

const SCALE_BAR_DISTANCES: ScaleBarEntry[] = [
  { distance: 10, label: "10m" },
  { distance: 20, label: "20m" },
  { distance: 50, label: "50m" },
  { distance: 100, label: "100m" },
  { distance: 200, label: "200m" },
  { distance: 500, label: "500m" },
  { distance: 1000, label: "1km" },
  { distance: 2000, label: "2km" },
  { distance: 5000, label: "5km" },
  { distance: 10000, label: "10km" },
  { distance: 20000, label: "20km" },
  { distance: 50000, label: "50km" },
  { distance: 100000, label: "100km" },
  { distance: 200000, label: "200km" },
  { distance: 500000, label: "500km" },
];

const EARTH_RADIUS = 6378137;
const CREDIT_TEXT = "出典：国土地理院";

/**
 * Calculate ground resolution (meters/pixel) at given latitude and zoom level
 */
function getGroundResolution(latitude: number, zoom: number): number {
  return (
    (Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EARTH_RADIUS) /
    (256 * Math.pow(2, zoom))
  );
}

/**
 * Capture the map canvas and return a copy
 */
export function captureMapCanvas(map: maplibregl.Map): HTMLCanvasElement {
  const mapCanvas = map.getCanvas();
  const canvas = document.createElement("canvas");
  canvas.width = mapCanvas.width;
  canvas.height = mapCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(mapCanvas, 0, 0);
  return canvas;
}

/**
 * Crop canvas to the pixel region corresponding to a BBOX
 */
export function cropCanvasToBBox(
  sourceCanvas: HTMLCanvasElement,
  map: maplibregl.Map,
  bbox: SaveImageBBox,
): HTMLCanvasElement {
  const dpr = window.devicePixelRatio;
  const topLeft = map.project([bbox.west, bbox.north]);
  const bottomRight = map.project([bbox.east, bbox.south]);

  const sx = Math.round(topLeft.x * dpr);
  const sy = Math.round(topLeft.y * dpr);
  const sw = Math.round((bottomRight.x - topLeft.x) * dpr);
  const sh = Math.round((bottomRight.y - topLeft.y) * dpr);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, sw);
  canvas.height = Math.max(1, sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
}

/**
 * Draw a scale bar on the canvas
 */
export function drawScaleBar(
  canvas: HTMLCanvasElement,
  latitude: number,
  zoom: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio;
  const resolution = getGroundResolution(latitude, zoom);
  const maxBarWidthPx = canvas.width / 4;
  const maxBarMeters = (maxBarWidthPx / dpr) * resolution;

  let chosen: ScaleBarEntry | undefined;
  for (const entry of SCALE_BAR_DISTANCES) {
    if (entry.distance <= maxBarMeters) {
      chosen = entry;
    }
  }
  if (!chosen) return;

  const barWidthPx = (chosen.distance / resolution) * dpr;
  const barHeight = 6 * dpr;
  const margin = 12 * dpr;
  const fontSize = 12 * dpr;
  const textGap = 4 * dpr;

  const x = margin;
  const y = canvas.height - margin - barHeight;

  // Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(
    x - 4 * dpr,
    y - fontSize - textGap - 4 * dpr,
    barWidthPx + 8 * dpr,
    barHeight + fontSize + textGap + 8 * dpr,
  );

  // Bar
  ctx.fillStyle = "#333333";
  ctx.fillRect(x, y, barWidthPx, barHeight);

  // End caps
  const capHeight = barHeight + 4 * dpr;
  const capY = y - 2 * dpr;
  ctx.fillRect(x, capY, 2 * dpr, capHeight);
  ctx.fillRect(x + barWidthPx - 2 * dpr, capY, 2 * dpr, capHeight);

  // Label
  ctx.font = `${String(fontSize)}px sans-serif`;
  ctx.fillStyle = "#333333";
  ctx.textBaseline = "bottom";
  ctx.fillText(chosen.label, x, y - textGap);
}

/**
 * Draw GSI credit text on the canvas
 */
export function drawCredit(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio;
  const fontSize = 12 * dpr;
  const margin = 12 * dpr;
  const padding = 4 * dpr;

  ctx.font = `${String(fontSize)}px sans-serif`;
  const textMetrics = ctx.measureText(CREDIT_TEXT);
  const textWidth = textMetrics.width;

  const x = canvas.width - margin - textWidth - padding * 2;
  const y = canvas.height - margin - fontSize - padding * 2;

  // Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(x, y, textWidth + padding * 2, fontSize + padding * 2);

  // Text
  ctx.fillStyle = "#333333";
  ctx.textBaseline = "top";
  ctx.fillText(CREDIT_TEXT, x + padding, y + padding);
}

/**
 * Convert lat/lng to Web Mercator coordinates (EPSG:3857)
 */
function lngLatToMercator(lng: number, lat: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  const latRad = (lat * Math.PI) / 180;
  const y =
    (Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (Math.PI / 180)) *
    (20037508.34 / 180);
  return { x, y };
}

/**
 * Generate a world file (.pgw) content string
 */
export function generateWorldFile(
  map: maplibregl.Map,
  imageWidth: number,
  imageHeight: number,
  bbox?: SaveImageBBox,
): string {
  const bounds = map.getBounds();
  const nwLng = bbox ? bbox.west : bounds.getWest();
  const nwLat = bbox ? bbox.north : bounds.getNorth();
  const seLng = bbox ? bbox.east : bounds.getEast();
  const seLat = bbox ? bbox.south : bounds.getSouth();

  const nw = lngLatToMercator(nwLng, nwLat);
  const se = lngLatToMercator(seLng, seLat);

  const xScale = (se.x - nw.x) / imageWidth;
  const yScale = (nw.y - se.y) / imageHeight;

  const lines = [
    xScale.toFixed(10),
    "0.0000000000",
    "0.0000000000",
    (-yScale).toFixed(10),
    (nw.x + xScale / 2).toFixed(10),
    (nw.y - yScale / 2).toFixed(10),
  ];
  return lines.join("\n");
}

/**
 * Convert a canvas to a Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob from canvas"));
      }
    }, "image/png");
  });
}

/**
 * Download a Blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a text string as a file
 */
export function downloadText(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}
