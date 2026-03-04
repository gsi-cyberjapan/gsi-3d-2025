import { LngLat } from "maplibre-gl";
import * as mgrs from "mgrs";
import { GEOCODING_CONFIG } from "./config";
import { getMuniData } from "./getMuniData";

const generateShortId = (): string => {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36).padStart(2, "0")).join(
    "",
  );
};

type Brand<T, B extends string> = T & { readonly __brand: B };

type LngLatText = Brand<string, "LngLatText">; // "35.00 135.00" / "35.00,135.00"
type LngLatDmsText = Brand<string, "LngLatDmsText">; // "35度0分0秒 135度0分0秒" など
type MgrsText = Brand<string, "MgrsText">; // "54SUE83694920" など
type AddressText = Brand<string, "AddressText">; // "金沢市木ノ新保町" など

type DetectedSearchInput =
  | { kind: "lnglat"; value: LngLatText; raw: string }
  | { kind: "lnglatDms"; value: LngLatDmsText; raw: string }
  | { kind: "mgrs"; value: MgrsText; raw: string }
  | { kind: "address"; value: AddressText; raw: string };

const isLngLatText = (s: string): s is LngLatText => {
  const trimmed = s.trim();

  // Pattern 1: lat lng [z] または lat,lng[,z]
  // Examples: "35.00 135.00", "35.00,135.00", "35.00 135.00 15"
  const LNGLAT_PATTERN_1 =
    /^([-+]?[0-9]+(\.[0-9]+)?)([\s,]+)([-+]?[0-9]+(\.[0-9]+)?)(([\s,]+)([0-9]+(\.[0-9]+)?))?$/;

  // Pattern 2: #z/lat/lng または z/lat/lng
  // Examples: "#15/35.00/135.00", "15/35.00/135.00"
  const LNGLAT_PATTERN_2 =
    /^[#]?([0-9]+(\.[0-9]+)?)([/]+)([-+]?[0-9]+(\.[0-9]+)?)([/]+)([-+]?[0-9]+(\.[0-9]+)?)$/;

  if (LNGLAT_PATTERN_1.test(trimmed)) {
    const m = trimmed.match(LNGLAT_PATTERN_1);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[4]);
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    }
  }

  if (LNGLAT_PATTERN_2.test(trimmed)) {
    const m = trimmed.match(LNGLAT_PATTERN_2);
    if (m) {
      const lat = parseFloat(m[4]);
      const lng = parseFloat(m[7]);
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    }
  }

  return false;
};

const isLngLatDmsText = (s: string): s is LngLatDmsText => {
  // Example: "35度40分57秒 139度45分10秒"
  const japanesePattern =
    /^([+,-]?[0-9]+)度([0-9]+)分([0-9]+(\.[0-9]+)?)秒([\s]+)([+,-]?[0-9]+)度([0-9]+)分([0-9]+(\.[0-9]+)?)秒$/;
  if (japanesePattern.test(s.trim())) {
    return true;
  }

  const westernPattern = /[度°]['′']?["″"]?|[分′]['′']?["″"]?|[秒″]/;
  return westernPattern.test(s);
};

const isMgrsText = (s: string): s is MgrsText => {
  // Example: "54SUE83694920"
  const utmPattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{8}$/;
  if (utmPattern.test(s.trim())) {
    return true;
  }

  const mgrsPattern =
    /^\d{1,2}[C-X][A-Z]{2}(\d{2}|\d{4}|\d{6}|\d{8}|\d{10})?$/i;
  return mgrsPattern.test(s.replace(/\s/g, ""));
};

const detectSearchInput = (raw: string): DetectedSearchInput => {
  const input = raw.trim();
  if (isLngLatText(input)) return { kind: "lnglat", value: input, raw };
  if (isLngLatDmsText(input)) return { kind: "lnglatDms", value: input, raw };
  if (isMgrsText(input)) return { kind: "mgrs", value: input, raw };
  return { kind: "address", value: input as AddressText, raw };
};

const getLngLatFromLngLatString = (input: LngLatText): LngLat => {
  const trimmed = input.trim();

  const LNGLAT_PATTERN_1 =
    /^([-+]?[0-9]+(\.[0-9]+)?)([\s,]+)([-+]?[0-9]+(\.[0-9]+)?)(([\s,]+)([0-9]+(\.[0-9]+)?))?$/;

  const LNGLAT_PATTERN_2 =
    /^[#]?([0-9]+(\.[0-9]+)?)([/]+)([-+]?[0-9]+(\.[0-9]+)?)([/]+)([-+]?[0-9]+(\.[0-9]+)?)$/;

  const m1 = trimmed.match(LNGLAT_PATTERN_1);
  if (m1) {
    const lat = parseFloat(m1[1]);
    const lng = parseFloat(m1[4]);
    return new LngLat(lng, lat);
  }

  const m2 = trimmed.match(LNGLAT_PATTERN_2);
  if (m2) {
    const lat = parseFloat(m2[4]);
    const lng = parseFloat(m2[7]);
    return new LngLat(lng, lat);
  }

  const parts = input.split(/[,\s]+/).map((p) => parseFloat(p.trim()));
  const [lat, lng] = parts;
  return new LngLat(lng, lat);
};

const getLngLatFromLngLatDms = (input: LngLatDmsText): LngLat => {
  const trimmed = input.trim();

  // Japanese pattern: "35度40分57秒 139度45分10秒"
  const japanesePattern =
    /^([+,-]?[0-9]+)度([0-9]+)分([0-9]+(\.[0-9]+)?)秒([\s]+)([+,-]?[0-9]+)度([0-9]+)分([0-9]+(\.[0-9]+)?)秒$/;
  const m = trimmed.match(japanesePattern);

  if (m) {
    const latDegRaw = parseFloat(m[1]);
    const latMinus = latDegRaw < 0;
    let lat =
      Math.abs(latDegRaw) + parseFloat(m[2]) / 60 + parseFloat(m[3]) / 3600;
    if (latMinus) lat *= -1;

    const lngDegRaw = parseFloat(m[6]);
    const lngMinus = lngDegRaw < 0;
    let lng =
      Math.abs(lngDegRaw) + parseFloat(m[7]) / 60 + parseFloat(m[8]) / 3600;
    if (lngMinus) lng *= -1;

    return new LngLat(lng, lat);
  }

  // Degree-only pattern: "35.68度 139.76度", "35.68度 139.76度 15", "35.68度 139.76 15度"
  if (/度/.test(trimmed) && !/分/.test(trimmed) && !/秒/.test(trimmed)) {
    const stripped = trimmed.replace(/度/g, "");
    const nums = stripped.match(/[+,-]?[0-9]+(\.[0-9]+)?/g);
    if (nums && nums.length >= 2) {
      const lat = parseFloat(nums[0]);
      const lng = parseFloat(nums[1]);
      return new LngLat(lng, lat);
    }
  }

  const numbers = input.match(/[-+]?\d+\.?\d*/g);
  if (!numbers || numbers.length < 6) {
    throw new Error("Invalid DMS format");
  }

  const latDeg = parseFloat(numbers[0]);
  const latMin = parseFloat(numbers[1]);
  const latSec = parseFloat(numbers[2]);
  const lngDeg = parseFloat(numbers[3]);
  const lngMin = parseFloat(numbers[4]);
  const lngSec = parseFloat(numbers[5]);

  let lat = Math.abs(latDeg) + latMin / 60 + latSec / 3600;
  let lng = Math.abs(lngDeg) + lngMin / 60 + lngSec / 3600;

  if (latDeg < 0) lat *= -1;
  if (lngDeg < 0) lng *= -1;

  if (input.includes("S") || input.includes("南")) lat = -Math.abs(lat);
  if (input.includes("W") || input.includes("西")) lng = -Math.abs(lng);

  return new LngLat(lng, lat);
};

const getLngLatFromMgrs = (input: MgrsText): LngLat => {
  const cleanedInput = input.replace(/\s/g, "");

  try {
    const [lng, lat] = mgrs.toPoint(cleanedInput);
    return new LngLat(lng, lat);
  } catch (error) {
    throw new Error(
      `Invalid MGRS format: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export interface AddressSearchResult {
  candidates: {
    id: string;
    lnglat: LngLat;
    title: string;
    subTitle: string;
    prefCode: string;
    cityCode: string;
    isResidentialAreaName: boolean;
    dataSource?: number;
    ilvl?: number;
    zl?: number;
    addressCode?: string;
  }[];
}

interface GsiAddressFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    title: string;
    addressCode?: string;
    dataSource?: number;
    ilvl?: number;
    zl?: number;
  };
}

const geocodeFromAddress = async (
  input: AddressText,
): Promise<AddressSearchResult> => {
  try {
    const muniData = await getMuniData();

    const params = new URLSearchParams({
      q: input,
      lang: "ja,en",
      zl: "T",
      ilvl: "T",
      sort_il: "1",
    });

    const response = await fetch(
      `${GEOCODING_CONFIG.ADDRESS_SEARCH_URL}?${params.toString()}`,
    );

    if (!response.ok) {
      console.error("GSI address search failed:", response.statusText);
      return { candidates: [] };
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { candidates: [] };
    }

    const features = data as GsiAddressFeature[];

    const candidatesWithPending: {
      candidate: AddressSearchResult["candidates"][0];
      needsReverseGeocode: boolean;
    }[] = [];

    for (const feature of features) {
      const { coordinates } = feature.geometry;
      const [lng, lat] = coordinates;
      const { title, addressCode, dataSource, ilvl, zl } = feature.properties;

      let prefCode = "";
      let cityCode = "";
      let prefName = "";
      let cityName = "";
      let hasMuniEntry = false;

      if (addressCode) {
        const muniEntry = muniData?.[addressCode];
        if (muniEntry) {
          prefCode = muniEntry.prefCode;
          prefName = muniEntry.prefName;
          cityCode = muniEntry.cityCode;
          cityName = muniEntry.cityName;
          hasMuniEntry = true;
        }
      }

      const candidate = {
        id: `gsi-${generateShortId()}`,
        lnglat: new LngLat(lng, lat),
        title,
        subTitle: `${prefName}${cityName}`,
        prefCode,
        cityCode,
        isResidentialAreaName: dataSource === 5,
        dataSource,
        ilvl,
        zl,
        addressCode,
      };

      candidatesWithPending.push({
        candidate,
        needsReverseGeocode: !addressCode || !hasMuniEntry,
      });
    }

    const needsReverseGeocodeList = candidatesWithPending.filter(
      (item) => item.needsReverseGeocode,
    );

    if (needsReverseGeocodeList.length > 0) {
      await Promise.all(
        needsReverseGeocodeList.map(async (item) => {
          try {
            const { lng, lat } = item.candidate.lnglat;
            const reverseParams = new URLSearchParams({
              lon: lng.toString(),
              lat: lat.toString(),
            });

            const reverseResponse = await fetch(
              `${GEOCODING_CONFIG.REVERSE_GEOCODE_URL}?${reverseParams.toString()}`,
            );

            if (!reverseResponse.ok) {
              console.error(
                "Reverse geocoding failed:",
                reverseResponse.statusText,
              );
              return;
            }

            const reverseData: unknown = await reverseResponse.json();

            if (
              reverseData &&
              typeof reverseData === "object" &&
              "results" in reverseData &&
              reverseData.results &&
              typeof reverseData.results === "object" &&
              "muniCd" in reverseData.results
            ) {
              const muniCd = reverseData.results.muniCd;
              const addressCodeStr = String(muniCd);
              const muniEntry = muniData?.[addressCodeStr];
              if (muniEntry) {
                item.candidate.prefCode = muniEntry.prefCode;
                item.candidate.cityCode = muniEntry.cityCode;
                item.candidate.subTitle = `${muniEntry.prefName}${muniEntry.cityName}`;
                item.candidate.addressCode = addressCodeStr;
              }
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
          }
        }),
      );
    }

    const candidates = candidatesWithPending.map((item) => item.candidate);

    return { candidates };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return { candidates: [] };
  }
};

interface GeocodeAddressResult {
  type: "address";
  detected: DetectedSearchInput;
  getAddressSearchResult: Promise<AddressSearchResult>;
}

interface GeocodePointResult {
  type: "point";
  detected: DetectedSearchInput;
  lnglat: LngLat;
}

type GeocodeResult = GeocodePointResult | GeocodeAddressResult;

export const geocode = (input: string): GeocodeResult => {
  const detectedInput = detectSearchInput(input);

  if (detectedInput.kind === "lnglat") {
    return {
      type: "point",
      detected: detectedInput,
      lnglat: getLngLatFromLngLatString(detectedInput.value),
    };
  } else if (detectedInput.kind === "lnglatDms") {
    return {
      type: "point",
      detected: detectedInput,
      lnglat: getLngLatFromLngLatDms(detectedInput.value),
    };
  } else if (detectedInput.kind === "mgrs") {
    return {
      type: "point",
      detected: detectedInput,
      lnglat: getLngLatFromMgrs(detectedInput.value),
    };
  } else {
    return {
      type: "address",
      detected: detectedInput,
      getAddressSearchResult: geocodeFromAddress(detectedInput.value),
    };
  }
};
