export interface ElevationResult {
  elevation: number;
  hsrc: string;
  fixed: number;
}

interface DemSource {
  name: string;
  url: string;
  zoom: number;
  fixed: number;
}

const DEM_SOURCES: DemSource[] = [
  {
    name: "DEM1A",
    url: "https://cyberjapandata.gsi.go.jp/xyz/dem1a_png/",
    zoom: 17,
    fixed: 1,
  },
  {
    name: "DEM5A",
    url: "https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/",
    zoom: 15,
    fixed: 1,
  },
  {
    name: "DEM5B",
    url: "https://cyberjapandata.gsi.go.jp/xyz/dem5b_png/",
    zoom: 15,
    fixed: 1,
  },
  {
    name: "DEM5C",
    url: "https://cyberjapandata.gsi.go.jp/xyz/dem5c_png/",
    zoom: 15,
    fixed: 1,
  },
  {
    name: "DEM10B",
    url: "https://cyberjapandata.gsi.go.jp/xyz/dem_png/",
    zoom: 14,
    fixed: 0,
  },
  {
    name: "DEMGM",
    url: "https://cyberjapandata.gsi.go.jp/xyz/demgm_png/",
    zoom: 8,
    fixed: 0,
  },
];

const lngToTileX = (lng: number, zoom: number): number =>
  ((lng + 180) / 360) * Math.pow(2, zoom);

const latToTileY = (lat: number, zoom: number): number =>
  ((1 -
    Math.log(
      Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
    ) /
      Math.PI) /
    2) *
  Math.pow(2, zoom);

const calcHeight = (
  r: number,
  g: number,
  b: number,
  a: number,
): number | null => {
  const x = r * Math.pow(2, 16) + g * Math.pow(2, 8) + b;
  const pow23 = Math.pow(2, 23);
  const pow24 = Math.pow(2, 24);

  if (x === pow23 || a === 0) return null;
  if (x < pow23) return x * 0.01;
  return (x - pow24) * 0.01;
};

const getPixelColor = async (
  arrayBuffer: ArrayBuffer,
  px: number,
  py: number,
): Promise<[number, number, number, number] | null> => {
  const blob = new Blob([arrayBuffer], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        resolve();
      };
      image.onerror = () => {
        reject(new Error("Image loading error"));
      };
    });

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0);
    const pixelData = ctx.getImageData(px, py, 1, 1).data;
    return [pixelData[0], pixelData[1], pixelData[2], pixelData[3]];
  } finally {
    URL.revokeObjectURL(url);
  }
};

const getElevationFromTile = async (
  lat: number,
  lng: number,
  source: DemSource,
): Promise<number | null> => {
  const realX = lngToTileX(lng, source.zoom);
  const realY = latToTileY(lat, source.zoom);
  const tileX = Math.floor(realX);
  const tileY = Math.floor(realY);

  const px = Math.min(255, Math.max(0, Math.floor((realX - tileX) * 256)));
  const py = Math.min(255, Math.max(0, Math.floor((realY - tileY) * 256)));

  const url = `${source.url}${String(source.zoom)}/${String(tileX)}/${String(tileY)}.png`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const arrayBuffer = await res.arrayBuffer();
  const pixelColor = await getPixelColor(arrayBuffer, px, py);
  if (!pixelColor) return null;

  return calcHeight(...pixelColor);
};

export async function getElevationFromLatLng(
  lat: number,
  lng: number,
): Promise<ElevationResult | null> {
  for (const source of DEM_SOURCES) {
    try {
      const elevation = await getElevationFromTile(lat, lng, source);
      if (elevation !== null) {
        return { elevation, hsrc: source.name, fixed: source.fixed };
      }
    } catch {
      continue;
    }
  }
  return null;
}
