import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import tokml from "@fulcrum/tokml";

export type ExportFormat = "geojson" | "kml";

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONStoreFeatures[];
}

interface SimplestyleFeature {
  type: "Feature";
  id?: string | number;
  geometry: GeoJSONStoreFeatures["geometry"];
  properties: Record<string, unknown>;
}

/**
 * Convert TerraDraw feature to simplestyle-compatible feature for export
 * Properties are already in simplestyle format, so we just need to remove internal properties
 */
function convertToSimplestyle(
  feature: GeoJSONStoreFeatures,
): SimplestyleFeature {
  const { properties, geometry, id } = feature;

  // Copy properties and remove internal TerraDraw properties
  const simplestyleProperties: Record<string, unknown> = { ...properties };

  // Remove internal properties that should not be exported
  delete simplestyleProperties.selected;
  delete simplestyleProperties.marker;

  return {
    type: "Feature",
    id,
    geometry,
    properties: simplestyleProperties,
  };
}

export function getDrawFeatures(td: TerraDraw): GeoJSONFeatureCollection {
  const snapshot = td.getSnapshot();
  const features = snapshot.filter(
    (f) => f.properties.mode !== "select" && !f.properties.selected,
  );

  return {
    type: "FeatureCollection",
    features,
  };
}

export function exportToGeoJSON(td: TerraDraw): string {
  const geojson = getDrawFeatures(td);
  return JSON.stringify(geojson, null, 2);
}

export function exportToKML(td: TerraDraw, documentName?: string): string {
  const geojson = getDrawFeatures(td);

  const featuresWithSimplestyle = {
    ...geojson,
    features: geojson.features.map(convertToSimplestyle),
  };

  return tokml(featuresWithSimplestyle, {
    documentName: documentName ?? "作図データ",
    simplestyle: true,
  });
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getExportContent(
  td: TerraDraw,
  format: ExportFormat,
  documentName?: string,
): string {
  if (format === "geojson") {
    return exportToGeoJSON(td);
  } else {
    return exportToKML(td, documentName ?? "作図データ");
  }
}

export function downloadDrawData(
  td: TerraDraw,
  format: ExportFormat,
  filename?: string,
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultFilename = `draw-${timestamp}`;

  if (format === "geojson") {
    const content = exportToGeoJSON(td);
    downloadFile(
      content,
      `${filename ?? defaultFilename}.geojson`,
      "application/geo+json",
    );
  } else {
    const content = exportToKML(td, filename ?? defaultFilename);
    downloadFile(
      content,
      `${filename ?? defaultFilename}.kml`,
      "application/vnd.google-earth.kml+xml",
    );
  }
}

export async function downloadDrawDataAsync(
  td: TerraDraw,
  format: ExportFormat,
  filename?: string,
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultFilename = `draw-${timestamp}`;

  await new Promise((resolve) => setTimeout(resolve, 100));

  if (format === "geojson") {
    const content = exportToGeoJSON(td);
    downloadFile(
      content,
      `${filename ?? defaultFilename}.geojson`,
      "application/geo+json",
    );
  } else {
    const content = exportToKML(td, filename ?? defaultFilename);
    downloadFile(
      content,
      `${filename ?? defaultFilename}.kml`,
      "application/vnd.google-earth.kml+xml",
    );
  }
}
