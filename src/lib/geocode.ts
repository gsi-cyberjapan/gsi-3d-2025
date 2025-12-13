import { LngLat } from "maplibre-gl";

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
  // TODO
  return false;
};

const isLngLatDmsText = (s: string): s is LngLatDmsText => {
  // TODO
  return false;
};

const isMgrsText = (s: string): s is MgrsText => {
  // TODO
  return false;
};

const detectSearchInput = (raw: string): DetectedSearchInput => {
  const input = raw.trim();
  if (isLngLatText(input)) return { kind: "lnglat", value: input, raw };
  if (isLngLatDmsText(input)) return { kind: "lnglatDms", value: input, raw };
  if (isMgrsText(input)) return { kind: "mgrs", value: input, raw };
  return { kind: "address", value: input as AddressText, raw };
};

const getLngLatFromLngLatString = (_input: LngLatText): LngLat => {
  // TODO
  return new LngLat(139.763328, 35.675069);
};

const getLngLatFromLngLatDms = (_input: LngLatDmsText): LngLat => {
  // TODO
  return new LngLat(139.763328, 35.675069);
};

const getLngLatFromMgrs = (_input: MgrsText): LngLat => {
  // TODO
  return new LngLat(139.763328, 35.675069);
};

interface AddressSearchResult {
  candidates: {
    id: string;
    lnglat: LngLat;
    /** 例: 丸の内 */
    title: string;
    /** 例: 東京都千代田区 */
    subTitle: string;
    prefCode: number;
    cityCode: number;
    /** 居住地名かどうか */
    isResidentialAreaName: boolean;
  }[];
}

const geocodeFromAddress = async (
  _input: AddressText,
): Promise<AddressSearchResult> => {
  // TODO
  await new Promise((r) => setTimeout(r, 3000));
  return {
    candidates: [
      {
        id: "tokyo-chiyoda-marunouchi",
        lnglat: new LngLat(139.7649, 35.6812),
        title: "丸の内",
        subTitle: "東京都千代田区",
        prefCode: 13,
        cityCode: 13101,
        isResidentialAreaName: true,
      },
      {
        id: "tokyo-chiyoda-tokyostation",
        lnglat: new LngLat(139.7671, 35.6812),
        title: "東京駅",
        subTitle: "東京都千代田区",
        prefCode: 13,
        cityCode: 13101,
        isResidentialAreaName: false,
      },
      {
        id: "osaka-kita-umeda",
        lnglat: new LngLat(135.4983, 34.7025),
        title: "梅田",
        subTitle: "大阪府大阪市北区",
        prefCode: 27,
        cityCode: 27127,
        isResidentialAreaName: true,
      },
    ],
  };
};

interface GeocodeAddressResult {
  detected: DetectedSearchInput;
  getAddressSearchResult: Promise<AddressSearchResult>;
}

interface GeocodePointResult {
  detected: DetectedSearchInput;
  lnglat: LngLat;
}

type GeocodeResult = GeocodePointResult | GeocodeAddressResult;

export const geocode = (input: string): GeocodeResult => {
  const detectedInput = detectSearchInput(input);

  if (detectedInput.kind === "lnglat") {
    return {
      detected: detectedInput,
      lnglat: getLngLatFromLngLatString(detectedInput.value),
    };
  } else if (detectedInput.kind === "lnglatDms") {
    return {
      detected: detectedInput,
      lnglat: getLngLatFromLngLatDms(detectedInput.value),
    };
  } else if (detectedInput.kind === "mgrs") {
    return {
      detected: detectedInput,
      lnglat: getLngLatFromMgrs(detectedInput.value),
    };
  } else {
    return {
      detected: detectedInput,
      getAddressSearchResult: geocodeFromAddress(detectedInput.value),
    };
  }
};
