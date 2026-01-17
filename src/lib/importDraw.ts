import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { kml } from "@tmcw/togeojson";
import { DrawMode } from "@/hooks/store/drawState";

export type ImportFormat = "geojson" | "kml";

// Default style values (from getPolygonModeStyle.ts and getLineStringModeStyle.ts)
const DEFAULT_FILL_COLOR = "#0011FF10";
const DEFAULT_OUTLINE_COLOR = "#0011FFFF";
const DEFAULT_OUTLINE_WIDTH = 2;
const DEFAULT_LINESTRING_COLOR = "#0011FFFF";
const DEFAULT_LINESTRING_WIDTH = 2;

export interface ImportResult {
  added: number;
  failed: number;
  errors: string[];
}

interface SimplestyleProperties {
  stroke?: string;
  "stroke-width"?: number;
  "stroke-opacity"?: number;
  fill?: string;
  "fill-opacity"?: number;
  [key: string]: unknown;
}

/**
 * Map geometry type to TerraDraw mode
 */
function getModeFromGeometry(geometryType: string): DrawMode | null {
  switch (geometryType) {
    case "Point":
      return "point";
    case "LineString":
      return "linestring";
    case "Polygon":
      return "polygon";
    default:
      return null;
  }
}

/**
 * Convert simplestyle properties to TerraDraw properties
 */
function convertSimplestyleToTerraDraw(
  properties: SimplestyleProperties,
  geometryType: string,
): Record<string, unknown> {
  const terraDrawProps: Record<string, unknown> = { ...properties };
  const isLine = geometryType === "LineString";

  if (isLine) {
    // LineString properties
    if (properties.stroke) {
      terraDrawProps.lineStringColor = properties.stroke;
      delete terraDrawProps.stroke;
    } else if (!terraDrawProps.lineStringColor) {
      terraDrawProps.lineStringColor = DEFAULT_LINESTRING_COLOR;
    }

    if (properties["stroke-width"] !== undefined) {
      terraDrawProps.lineStringWidth = properties["stroke-width"];
      delete terraDrawProps["stroke-width"];
    } else if (!terraDrawProps.lineStringWidth) {
      terraDrawProps.lineStringWidth = DEFAULT_LINESTRING_WIDTH;
    }
  } else {
    // Polygon/Point properties
    if (properties.fill) {
      terraDrawProps.fillColor = properties.fill;
      delete terraDrawProps.fill;
    } else if (!terraDrawProps.fillColor) {
      terraDrawProps.fillColor = DEFAULT_FILL_COLOR;
    }

    if (properties.stroke) {
      terraDrawProps.outlineColor = properties.stroke;
      delete terraDrawProps.stroke;
    } else if (!terraDrawProps.outlineColor) {
      terraDrawProps.outlineColor = DEFAULT_OUTLINE_COLOR;
    }

    if (properties["stroke-width"] !== undefined) {
      terraDrawProps.outlineWidth = properties["stroke-width"];
      delete terraDrawProps["stroke-width"];
    } else if (!terraDrawProps.outlineWidth) {
      terraDrawProps.outlineWidth = DEFAULT_OUTLINE_WIDTH;
    }
  }

  // Remove simplestyle opacity properties (we use alpha in color)
  delete terraDrawProps["stroke-opacity"];
  delete terraDrawProps["fill-opacity"];

  return terraDrawProps;
}

/**
 * Validate coordinates structure
 */
function validateCoordinates(geometry: unknown): boolean {
  if (!geometry || typeof geometry !== "object") return false;

  const geom = geometry as { type?: string; coordinates?: unknown };

  switch (geom.type) {
    case "Point":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 2 &&
        typeof geom.coordinates[0] === "number" &&
        typeof geom.coordinates[1] === "number"
      );

    case "LineString":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 2 &&
        geom.coordinates.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length >= 2 &&
            typeof coord[0] === "number" &&
            typeof coord[1] === "number",
        )
      );

    case "Polygon":
      return (
        Array.isArray(geom.coordinates) &&
        geom.coordinates.length >= 1 &&
        geom.coordinates.every(
          (ring) =>
            Array.isArray(ring) &&
            ring.length >= 4 &&
            ring.every(
              (coord) =>
                Array.isArray(coord) &&
                coord.length >= 2 &&
                typeof coord[0] === "number" &&
                typeof coord[1] === "number",
            ),
        )
      );

    default:
      return false;
  }
}

/**
 * Parse KML content to GeoJSON
 */
function parseKML(content: string): GeoJSON.FeatureCollection {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("KMLファイルの形式が正しくありません");
  }

  // Convert to GeoJSON
  const geoJSON = kml(xmlDoc);
  return geoJSON as GeoJSON.FeatureCollection;
}

/**
 * Parse GeoJSON content
 */
function parseGeoJSON(content: string): GeoJSON.FeatureCollection {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("GeoJSONファイルの形式が正しくありません");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("type" in parsed) ||
    parsed.type !== "FeatureCollection"
  ) {
    throw new Error("FeatureCollectionではありません");
  }

  return parsed as GeoJSON.FeatureCollection;
}

/**
 * Parse file content based on format
 */
export function parseFileContent(
  content: string,
  format: ImportFormat,
): GeoJSON.FeatureCollection {
  if (format === "kml") {
    return parseKML(content);
  } else {
    return parseGeoJSON(content);
  }
}

/**
 * Import drawing data from file
 */
export function importDrawData(
  td: TerraDraw,
  content: string,
  format: ImportFormat,
  filename: string,
): ImportResult {
  const result: ImportResult = {
    added: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Parse file content
    const featureCollection = parseFileContent(content, format);

    if (featureCollection.features.length === 0) {
      result.errors.push("インポート可能なフィーチャがありませんでした");
      return result;
    }

    // Process each feature
    const validFeatures: GeoJSONStoreFeatures[] = [];

    for (const feature of featureCollection.features) {
      const geometryType = feature.geometry.type;

      // Check if geometry type is supported
      const mode = getModeFromGeometry(geometryType);
      if (!mode) {
        result.failed++;
        result.errors.push(
          `サポートされていないジオメトリタイプ: ${geometryType}`,
        );
        continue;
      }

      // Validate coordinates
      if (!validateCoordinates(feature.geometry)) {
        result.failed++;
        result.errors.push("座標データが不正です");
        continue;
      }

      // Convert properties
      const properties = feature.properties || {};
      const terraDrawProps = convertSimplestyleToTerraDraw(
        properties as SimplestyleProperties,
        geometryType,
      );

      // Set mode and source
      terraDrawProps.mode = mode;
      terraDrawProps.source = filename;

      // Create TerraDraw feature
      validFeatures.push({
        type: "Feature",
        geometry: feature.geometry as GeoJSONStoreFeatures["geometry"],
        properties: terraDrawProps as GeoJSONStoreFeatures["properties"],
      });
    }

    // Add features to TerraDraw
    if (validFeatures.length > 0) {
      const results = td.addFeatures(validFeatures);

      for (const addResult of results) {
        if (addResult.valid) {
          result.added++;
        } else {
          result.failed++;
          result.errors.push(
            addResult.reason || "フィーチャの追加に失敗しました",
          );
        }
      }
    }

    return result;
  } catch (error) {
    result.failed++;
    result.errors.push(
      error instanceof Error ? error.message : "不明なエラーが発生しました",
    );
    return result;
  }
}
