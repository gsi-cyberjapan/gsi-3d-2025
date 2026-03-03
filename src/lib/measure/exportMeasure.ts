import { MeasureResult } from "@/hooks/store/measureState";
import { downloadFile } from "@/lib/exportDraw";

interface MeasureFeatureProperties {
  mode: string;
  measureType: "distance" | "area";
  measureValue: number;
  measureUnit: string;
}

interface MeasureGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: GeoJSON.Geometry;
    properties: MeasureFeatureProperties;
  }>;
}

export const exportMeasureResults = (
  results: MeasureResult[],
  features: Partial<Record<string, GeoJSON.Feature>>,
): void => {
  const geojsonFeatures = results
    .map((result) => {
      const feature = features[String(result.featureId)];
      if (!feature) return null;
      return {
        type: "Feature" as const,
        geometry: feature.geometry,
        properties: {
          mode:
            result.type === "distance"
              ? "measure-linestring"
              : "measure-polygon",
          measureType: result.type,
          measureValue: result.value,
          measureUnit: result.type === "distance" ? "meters" : "square_meters",
        },
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const geojson: MeasureGeoJSON = {
    type: "FeatureCollection",
    features: geojsonFeatures,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadFile(
    JSON.stringify(geojson, null, 2),
    `measure-${timestamp}.geojson`,
    "application/geo+json",
  );
};
