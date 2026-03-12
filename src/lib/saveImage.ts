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

const CREDIT_TEXT = "出典：国土地理院";

/**
 * Capture the map canvas and return a copy.
 * Also composites any overlay canvases (e.g., deck.gl point cloud) on top.
 */
export function captureMapCanvas(map: maplibregl.Map): HTMLCanvasElement {
  const mapCanvas = map.getCanvas();
  const canvas = document.createElement("canvas");
  canvas.width = mapCanvas.width;
  canvas.height = mapCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(mapCanvas, 0, 0);

  // Composite overlay canvases (e.g., deck.gl point cloud)
  const container = map.getContainer();
  for (const c of container.querySelectorAll("canvas")) {
    if (c !== mapCanvas && c.width > 0 && c.height > 0) {
      ctx.drawImage(c, 0, 0, canvas.width, canvas.height);
    }
  }

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
  map: maplibregl.Map,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio;

  // Compute ground resolution using map.unproject(), matching MapLibre's ScaleControl
  const container = map.getContainer();
  const cx = container.clientWidth / 2;
  const cy = container.clientHeight / 2;
  const halfSpan = 50;
  const left = map.unproject([cx - halfSpan, cy]);
  const right = map.unproject([cx + halfSpan, cy]);
  const metersPerCssPx = left.distanceTo(right) / (halfSpan * 2);

  const maxBarWidthPx = canvas.width / 4;
  const maxBarMeters = (maxBarWidthPx / dpr) * metersPerCssPx;

  let chosen: ScaleBarEntry | undefined;
  for (const entry of SCALE_BAR_DISTANCES) {
    if (entry.distance <= maxBarMeters) {
      chosen = entry;
    }
  }
  if (!chosen) return;

  const barWidthPx = (chosen.distance / metersPerCssPx) * dpr;
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
