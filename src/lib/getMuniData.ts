import { GEOCODING_CONFIG } from "./config";

export type MuniData = Record<
  string,
  { prefCode: string; prefName: string; cityCode: string; cityName: string }
>;

let muniDataCache: MuniData | null = null;

export const getMuniData = async (): Promise<MuniData | null> => {
  if (muniDataCache) return muniDataCache;

  try {
    const response = await fetch(GEOCODING_CONFIG.MUNI_DATA_URL);
    if (!response.ok) {
      console.error("Failed to load MUNI data");
      return null;
    }

    const text = await response.text();
    const muniData: MuniData = {};

    const pattern = /GSI\.MUNI_ARRAY\["(\d+)"\]\s*=\s*'([^']+)'/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const code = match[1];
      const [prefCode, prefName, cityCode, cityName] = match[2].split(",");
      muniData[code] = { prefCode, prefName, cityCode, cityName };
    }

    muniDataCache = muniData;
    return muniData;
  } catch (error) {
    console.error("Failed to load MUNI data:", error);
    return null;
  }
};
