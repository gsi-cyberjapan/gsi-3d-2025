import { getMaplibreWithProtocol } from "./getMaplibreWhithProtocol";

export interface PaperSize {
  id: string;
  label: string;
  width: number;
  height: number;
  dpi: number;
  cssSize: string;
  cssOrientation: "portrait" | "landscape";
}

export const PAPER_SIZES: PaperSize[] = [
  {
    id: "a4-portrait-standard",
    label: "A4\u7E26\uFF08\u6A19\u6E96\u753B\u8CEA\uFF09",
    width: 1240,
    height: 1754,
    dpi: 150,
    cssSize: "A4",
    cssOrientation: "portrait",
  },
  {
    id: "a4-portrait-high",
    label: "A4\u7E26\uFF08\u9AD8\u753B\u8CEA\uFF09",
    width: 2480,
    height: 3508,
    dpi: 300,
    cssSize: "A4",
    cssOrientation: "portrait",
  },
  {
    id: "a4-landscape-standard",
    label: "A4\u6A2A\uFF08\u6A19\u6E96\u753B\u8CEA\uFF09",
    width: 1754,
    height: 1240,
    dpi: 150,
    cssSize: "A4",
    cssOrientation: "landscape",
  },
  {
    id: "a4-landscape-high",
    label: "A4\u6A2A\uFF08\u9AD8\u753B\u8CEA\uFF09",
    width: 3508,
    height: 2480,
    dpi: 300,
    cssSize: "A4",
    cssOrientation: "landscape",
  },
  {
    id: "a3-portrait-standard",
    label: "A3\u7E26\uFF08\u6A19\u6E96\u753B\u8CEA\uFF09",
    width: 1754,
    height: 2480,
    dpi: 150,
    cssSize: "A3",
    cssOrientation: "portrait",
  },
  {
    id: "a3-portrait-high",
    label: "A3\u7E26\uFF08\u9AD8\u753B\u8CEA\uFF09",
    width: 3508,
    height: 4961,
    dpi: 300,
    cssSize: "A3",
    cssOrientation: "portrait",
  },
  {
    id: "a3-landscape-standard",
    label: "A3\u6A2A\uFF08\u6A19\u6E96\u753B\u8CEA\uFF09",
    width: 2480,
    height: 1754,
    dpi: 150,
    cssSize: "A3",
    cssOrientation: "landscape",
  },
  {
    id: "a3-landscape-high",
    label: "A3\u6A2A\uFF08\u9AD8\u753B\u8CEA\uFF09",
    width: 4961,
    height: 3508,
    dpi: 300,
    cssSize: "A3",
    cssOrientation: "landscape",
  },
];

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
const CREDIT_TEXT = "\u51FA\u5178\uFF1A\u56FD\u571F\u5730\u7406\u9662";
const COMPASS_IMAGE_URL = "https://maps.gsi.go.jp/image/map/compass.png";

/**
 * Calculate the title area height in pixels for a given DPI
 */
export function getTitleHeight(title: string, dpi: number): number {
  if (title.trim().length === 0) return 0;
  return Math.round(24 * (dpi / 150)) + Math.round(16 * (dpi / 150)) * 2;
}

function getGroundResolution(latitude: number, zoom: number): number {
  return (
    (Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EARTH_RADIUS) /
    (256 * Math.pow(2, zoom))
  );
}

interface RenderOptions {
  style: maplibregl.StyleSpecification;
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  width: number;
  height: number;
}

/**
 * Render a high-resolution map canvas using an offscreen MapLibre instance
 */
export async function renderHighResMap(
  options: RenderOptions,
): Promise<HTMLCanvasElement> {
  const mapLib = await getMaplibreWithProtocol();

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const container = document.createElement("div");
    container.style.width = `${String(options.width)}px`;
    container.style.height = `${String(options.height)}px`;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    try {
      const renderMap = new mapLib.Map({
        container,
        style: options.style,
        center: options.center,
        zoom: options.zoom,
        bearing: options.bearing,
        pitch: options.pitch,
        interactive: false,
        attributionControl: false,
        pixelRatio: 1,
        canvasContextAttributes: { preserveDrawingBuffer: true },
      });

      const onError = (e: { error?: { message?: string } }) => {
        renderMap.remove();
        document.body.removeChild(container);
        reject(new Error(`Map render error: ${e.error?.message ?? "unknown"}`));
      };

      renderMap.on("error", onError);

      void renderMap.once("idle", () => {
        try {
          const mapCanvas = renderMap.getCanvas();
          const resultCanvas = document.createElement("canvas");
          resultCanvas.width = mapCanvas.width;
          resultCanvas.height = mapCanvas.height;
          const ctx = resultCanvas.getContext("2d");
          if (!ctx) throw new Error("Failed to get canvas context");
          ctx.drawImage(mapCanvas, 0, 0);
          resolve(resultCanvas);
        } catch (err) {
          reject(
            err instanceof Error ? err : new Error("Failed to render map"),
          );
        } finally {
          renderMap.off("error", onError);
          renderMap.remove();
          document.body.removeChild(container);
        }
      });
    } catch (err) {
      document.body.removeChild(container);
      reject(
        err instanceof Error ? err : new Error("Failed to create map instance"),
      );
    }
  });
}

/**
 * Draw title text at the top of the canvas
 */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  canvasWidth: number,
  dpi: number,
): number {
  const fontSize = Math.round(24 * (dpi / 150));
  const padding = Math.round(16 * (dpi / 150));
  const totalHeight = fontSize + padding * 2;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, totalHeight);

  // Text
  ctx.fillStyle = "#333333";
  ctx.font = `bold ${String(fontSize)}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(title, canvasWidth / 2, totalHeight / 2);

  return totalHeight;
}

/**
 * Draw compass icon rotated by bearing
 */
async function drawCompass(
  ctx: CanvasRenderingContext2D,
  bearing: number,
  x: number,
  y: number,
  size: number,
): Promise<void> {
  const img = await loadImage(COMPASS_IMAGE_URL);

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((-bearing * Math.PI) / 180);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

/**
 * Draw scale bar on the print canvas
 */
function drawPrintScaleBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  latitude: number,
  zoom: number,
  dpi: number,
): void {
  const scale = dpi / 150;
  const resolution = getGroundResolution(latitude, zoom);
  const maxBarWidthPx = canvasWidth / 4;
  const maxBarMeters = maxBarWidthPx * resolution;

  let chosen: ScaleBarEntry | undefined;
  for (const entry of SCALE_BAR_DISTANCES) {
    if (entry.distance <= maxBarMeters) {
      chosen = entry;
    }
  }
  if (!chosen) return;

  const barWidthPx = chosen.distance / resolution;
  const barHeight = Math.round(6 * scale);
  const margin = Math.round(12 * scale);
  const fontSize = Math.round(12 * scale);
  const textGap = Math.round(4 * scale);

  const x = margin;
  const y = canvasHeight - margin - barHeight;

  // Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(
    x - Math.round(4 * scale),
    y - fontSize - textGap - Math.round(4 * scale),
    barWidthPx + Math.round(8 * scale),
    barHeight + fontSize + textGap + Math.round(8 * scale),
  );

  // Bar
  ctx.fillStyle = "#333333";
  ctx.fillRect(x, y, barWidthPx, barHeight);

  // End caps
  const capHeight = barHeight + Math.round(4 * scale);
  const capY = y - Math.round(2 * scale);
  ctx.fillRect(x, capY, Math.round(2 * scale), capHeight);
  ctx.fillRect(
    x + barWidthPx - Math.round(2 * scale),
    capY,
    Math.round(2 * scale),
    capHeight,
  );

  // Label
  ctx.font = `${String(fontSize)}px sans-serif`;
  ctx.fillStyle = "#333333";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillText(chosen.label, x, y - textGap);
}

/**
 * Draw credit text on the print canvas
 */
function drawPrintCredit(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  dpi: number,
): void {
  const scale = dpi / 150;
  const fontSize = Math.round(12 * scale);
  const margin = Math.round(12 * scale);
  const padding = Math.round(4 * scale);

  ctx.font = `${String(fontSize)}px sans-serif`;
  const textMetrics = ctx.measureText(CREDIT_TEXT);
  const textWidth = textMetrics.width;

  const x = canvasWidth - margin - textWidth - padding * 2;
  const y = canvasHeight - margin - fontSize - padding * 2;

  // Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(x, y, textWidth + padding * 2, fontSize + padding * 2);

  // Text
  ctx.fillStyle = "#333333";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(CREDIT_TEXT, x + padding, y + padding);
}

interface ComposeOptions {
  mapCanvas: HTMLCanvasElement;
  title: string;
  showCompass: boolean;
  bearing: number;
  latitude: number;
  zoom: number;
  paper: PaperSize;
}

/**
 * Compose the final print canvas with title, map, scale bar, credit, and compass
 */
export async function composePrintCanvas(
  options: ComposeOptions,
): Promise<HTMLCanvasElement> {
  const { mapCanvas, title, showCompass, bearing, latitude, zoom, paper } =
    options;

  const titleHeight = getTitleHeight(title, paper.dpi);

  const canvas = document.createElement("canvas");
  canvas.width = paper.width;
  canvas.height = paper.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  if (titleHeight > 0) {
    drawTitle(ctx, title, canvas.width, paper.dpi);
  }

  // Map
  const mapY = titleHeight;
  const mapHeight = canvas.height - titleHeight;
  ctx.drawImage(mapCanvas, 0, mapY, canvas.width, mapHeight);

  // Scale bar
  drawPrintScaleBar(
    ctx,
    canvas.width,
    canvas.height,
    latitude,
    zoom,
    paper.dpi,
  );

  // Credit
  drawPrintCredit(ctx, canvas.width, canvas.height, paper.dpi);

  // Compass
  if (showCompass) {
    const compassSize = Math.round(60 * (paper.dpi / 150));
    const compassMargin = Math.round(12 * (paper.dpi / 150));
    const compassX = canvas.width - compassMargin - compassSize;
    const compassY = mapY + compassMargin;
    try {
      await drawCompass(ctx, bearing, compassX, compassY, compassSize);
    } catch {
      // Compass image failed to load - skip silently
    }
  }

  return canvas;
}

/**
 * Open a new window with the print image and trigger browser print dialog
 */
export function triggerBrowserPrint(
  canvas: HTMLCanvasElement,
  paper: PaperSize,
): void {
  const dataUrl = canvas.toDataURL("image/png");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "\u30DD\u30C3\u30D7\u30A2\u30C3\u30D7\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F\u3002\u30DD\u30C3\u30D7\u30A2\u30C3\u30D7\u30D6\u30ED\u30C3\u30AB\u30FC\u3092\u7121\u52B9\u306B\u3057\u3066\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",
    );
    return;
  }

  const doc = printWindow.document;

  // Build document using DOM API instead of deprecated document.write
  doc.title = "\u5370\u5237";

  const style = doc.createElement("style");
  style.textContent = [
    `@page { size: ${paper.cssSize} ${paper.cssOrientation}; margin: 0; }`,
    "* { margin: 0; padding: 0; }",
    "body { display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }",
    "img { max-width: 100%; max-height: 100%; object-fit: contain; }",
    "@media print { body { width: 100%; height: 100%; } img { width: 100%; height: 100%; object-fit: contain; } }",
  ].join("\n");
  doc.head.appendChild(style);

  const img = doc.createElement("img");
  img.src = dataUrl;
  img.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
  doc.body.appendChild(img);
}
