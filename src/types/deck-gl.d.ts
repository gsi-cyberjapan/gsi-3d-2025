declare module "@deck.gl/mapbox" {
  interface MapboxOverlayProps {
    interleaved?: boolean;
    layers?: unknown[];
  }
  export class MapboxOverlay {
    constructor(props: MapboxOverlayProps);
    setProps(props: Partial<MapboxOverlayProps>): void;
  }
}

declare module "@deck.gl/layers" {
  interface GeoJsonLayerProps {
    id: string;
    data: unknown;
    lineWidthUnits?: string;
    getLineColor?:
      | ((f: { properties: Record<string, unknown> }) => number[])
      | number[];
    getLineWidth?:
      | ((f: { properties: Record<string, unknown> }) => number)
      | number;
    getFillColor?:
      | ((f: { properties: Record<string, unknown> }) => number[])
      | number[];
    getElevation?:
      | ((f: { properties: Record<string, unknown> }) => number)
      | number;
    lineCapRounded?: boolean;
    lineJointRounded?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    opacity?: number;
  }
  export class GeoJsonLayer {
    constructor(props: GeoJsonLayerProps);
    readonly id: string;
  }
}

declare module "@deck.gl/geo-layers" {
  interface MVTLayerProps {
    id: string;
    data: string[];
    minZoom?: number;
    maxZoom?: number;
    getFillColor?:
      | ((f: { properties: Record<string, unknown> }) => number[])
      | number[];
    getElevation?:
      | ((f: { properties: Record<string, unknown> }) => number)
      | number;
    extruded?: boolean;
    wireframe?: boolean;
    opacity?: number;
  }
  export class MVTLayer {
    constructor(props: MVTLayerProps);
    readonly id: string;
  }

  interface Tile3DLayerProps {
    id: string;
    data: string;
    pointSize?: number;
  }
  export class Tile3DLayer {
    constructor(props: Tile3DLayerProps);
    readonly id: string;
  }
}
