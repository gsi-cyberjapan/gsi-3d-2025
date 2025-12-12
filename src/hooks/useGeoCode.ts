import { useEffect } from "react";
import { useDebouncedValue } from "./useDebounceValue";
import { LngLat } from "maplibre-gl";

/**
 * Brand utilities
 */
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

export const useGeoCode = (
  input: string,
  options: {
    debounceMs: number;
  },
) => {
  const debouncedInput = useDebouncedValue(input, options.debounceMs);

  useEffect(() => {
    if (!debouncedInput.trim()) return;

    const detected = detectSearchInput(debouncedInput);

    switch (detected.kind) {
      case "lnglat": {
        const lnglat = getLngLatFromLngLatString(detected.value);
        console.log(lnglat);
        return;
      }
      case "lnglatDms": {
        const lnglat = getLngLatFromLngLatDms(detected.value);
        console.log(lnglat);
        return;
      }
      case "mgrs": {
        const lnglat = getLngLatFromMgrs(detected.value);
        console.log(lnglat);
        return;
      }
      case "address": {
        console.log(detected.value);
        return;
      }
      default:
    }
  }, [debouncedInput]);
};
