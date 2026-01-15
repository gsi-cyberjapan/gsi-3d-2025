declare module "@fulcrum/tokml" {
  interface TokmlOptions {
    documentName?: string;
    documentDescription?: string;
    simplestyle?: boolean;
  }

  interface GeoJSON {
    type: string;
    features?: GeoJSON[];
    geometry?: unknown;
    properties?: Record<string, unknown>;
  }

  function tokml(geojson: GeoJSON, options?: TokmlOptions): string;

  export default tokml;
}
