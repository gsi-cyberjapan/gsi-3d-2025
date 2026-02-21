import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("maplibre-gl", () => {
  class LngLat {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number) {
      this.lng = lng;
      this.lat = lat;
    }
    toArray() {
      return [this.lng, this.lat];
    }
    wrap() {
      return new LngLat(this.lng, this.lat);
    }
  }

  class LngLatBounds {
    _sw: LngLat;
    _ne: LngLat;
    constructor(sw?: [number, number], ne?: [number, number]) {
      this._sw = new LngLat(sw?.[0] ?? 0, sw?.[1] ?? 0);
      this._ne = new LngLat(ne?.[0] ?? 0, ne?.[1] ?? 0);
    }
    getSouthWest() {
      return this._sw;
    }
    getNorthEast() {
      return this._ne;
    }
    extend() {
      return this;
    }
  }

  class Map {
    _listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    on(event: string, callback: (...args: unknown[]) => void) {
      this._listeners[event] ??= [];
      this._listeners[event].push(callback);
      return this;
    }
    off(event: string, callback: (...args: unknown[]) => void) {
      this._listeners[event] = (this._listeners[event] ?? []).filter(
        (cb) => cb !== callback,
      );
      return this;
    }
    getCenter() {
      return new LngLat(0, 0);
    }
    getZoom() {
      return 10;
    }
    getBounds() {
      return new LngLatBounds();
    }
    getCanvas() {
      return { width: 800, height: 600 };
    }
    remove() {}
  }

  return { LngLat, LngLatBounds, Map, default: { Map, LngLat, LngLatBounds } };
});
