import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/getBaseLayers", () => ({
  getBaseLayers: () => [
    { id: "std", type: "vector", label: "Standard" },
    { id: "pale", type: "vector", label: "Pale" },
  ],
}));

vi.mock("@/lib/customBaseLayers", () => ({
  getCustomLayers: () => [],
}));

vi.mock("@/lib/relief/colorPatterns", () => ({
  DEFAULT_PATTERN_ID: "default",
  getDefaultRanges: () => [],
}));

import {
  serializeState,
  deserializeState,
  SerializableStoreState,
} from "@/lib/stateSerializer";

const makeBaseState = (
  overrides?: Partial<SerializableStoreState>,
): SerializableStoreState => ({
  viewStates: { main: null, sub: null },
  layoutMode: "single",
  isSyncPosition: false,
  subMapOpacityOnOverlay: 0.5,
  overlaySliderPosition: 0.5,
  isDisplayCenterLine: true,
  isDisplayOverview: false,
  isClickToMoveEnabled: false,
  isDisplayMagneticNorth: false,
  maps: {
    main: {
      baseLayer: { id: "std" },
      optionalLayers: [],
      projection: "mercator",
      isHillshadeEnabled: false,
      isTerrainEnabled: false,
      isPointCloudEnabled: false,
      isDenshi3dEnabled: false,
      roofElevationType: "medElv",
    },
    sub: {
      baseLayer: { id: "std" },
      optionalLayers: [],
      projection: "mercator",
      isHillshadeEnabled: false,
      isTerrainEnabled: false,
      isPointCloudEnabled: false,
      isDenshi3dEnabled: false,
      roofElevationType: "medElv",
    },
  },
  isDisplayLatLngGrid: false,
  isDisplayUtmGrid: false,
  isDisplayTileGrid: false,
  isDisplayRegionalMesh: false,
  isDisplayMapSheetNumbers: false,
  isReliefWindowOpen: false,
  isHillshadeEnabled: false,
  selectedPatternId: "default",
  elevationRanges: [],
  ...overrides,
});

describe("serializeState / deserializeState", () => {
  describe("optional layer zoom range round-trip", () => {
    it("minZoom/maxZoom ありのレイヤーを正しくシリアライズ・デシリアライズする", () => {
      const state = makeBaseState({
        maps: {
          main: {
            baseLayer: { id: "std" },
            optionalLayers: [
              {
                layerId: "afm",
                title: "活断層図",
                opacity: 1,
                visible: true,
                tileUrl: "https://example.com/tiles/{z}/{x}/{y}.png",
                minZoom: 2,
                maxZoom: 18,
              },
            ],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
          sub: {
            baseLayer: { id: "std" },
            optionalLayers: [],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(deserialized.mainOptionalLayers).toHaveLength(1);
      expect(deserialized.mainOptionalLayers?.[0]).toMatchObject({
        layerId: "afm",
        title: "活断層図",
        opacity: 1,
        visible: true,
        tileUrl: "https://example.com/tiles/{z}/{x}/{y}.png",
        minZoom: 2,
        maxZoom: 18,
      });
    });

    it("minZoom/maxZoom なしのレイヤーも正しく動作する", () => {
      const state = makeBaseState({
        maps: {
          main: {
            baseLayer: { id: "std" },
            optionalLayers: [
              {
                layerId: "layer1",
                title: "テストレイヤー",
                opacity: 0.8,
                visible: true,
                tileUrl: "https://example.com/tiles/{z}/{x}/{y}.png",
              },
            ],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
          sub: {
            baseLayer: { id: "std" },
            optionalLayers: [],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      expect(deserialized.mainOptionalLayers).toHaveLength(1);
      const layer = deserialized.mainOptionalLayers?.[0];
      expect(layer?.layerId).toBe("layer1");
      expect(layer?.minZoom).toBeUndefined();
      expect(layer?.maxZoom).toBeUndefined();
    });

    it("minZoom のみのレイヤーを正しく処理する", () => {
      const state = makeBaseState({
        maps: {
          main: {
            baseLayer: { id: "std" },
            optionalLayers: [
              {
                layerId: "layer1",
                title: "テスト",
                opacity: 1,
                visible: true,
                tileUrl: "https://example.com/tiles/{z}/{x}/{y}.png",
                minZoom: 5,
              },
            ],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
          sub: {
            baseLayer: { id: "std" },
            optionalLayers: [],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
        },
      });

      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);

      const layer = deserialized.mainOptionalLayers?.[0];
      expect(layer?.minZoom).toBe(5);
      expect(layer?.maxZoom).toBeUndefined();
    });
  });

  describe("overlay slider position", () => {
    it("overlaySliderPosition をシリアライズ・デシリアライズする", () => {
      const state = makeBaseState({
        layoutMode: "overlay",
        overlaySliderPosition: 0.3,
      });
      const serialized = serializeState(state);
      const deserialized = deserializeState(serialized);
      expect(deserialized.overlaySliderPosition).toBeCloseTo(0.3);
    });

    it("デフォルト値 0.5 はシリアライズされない", () => {
      const state = makeBaseState({
        layoutMode: "overlay",
        overlaySliderPosition: 0.5,
      });
      const serialized = serializeState(state);
      expect(serialized).not.toContain("spos");
    });
  });

  describe("後方互換性", () => {
    it("4パーツの既存形式（minZoom/maxZoom なし）をパースできる", () => {
      // Simulate a legacy URL hash with 4-part layer format
      const legacyHash =
        "4.000/36.104611/140.084556/&ls=std,1.00|afm,1.00,%E6%B4%BB%E6%96%AD%E5%B1%A4%E5%9B%B3,https%3A%2F%2Fexample.com%2Ftiles&disp=11";

      const deserialized = deserializeState(legacyHash);

      expect(deserialized.mainOptionalLayers).toHaveLength(1);
      expect(deserialized.mainOptionalLayers?.[0]).toMatchObject({
        layerId: "afm",
        title: "活断層図",
        opacity: 1,
        visible: true,
        tileUrl: "https://example.com/tiles",
      });
      expect(deserialized.mainOptionalLayers?.[0]?.minZoom).toBeUndefined();
      expect(deserialized.mainOptionalLayers?.[0]?.maxZoom).toBeUndefined();
    });

    it("6パーツの新形式をパースできる", () => {
      const newHash =
        "4.000/36.104611/140.084556/&ls=std,1.00|afm,1.00,%E6%B4%BB%E6%96%AD%E5%B1%A4%E5%9B%B3,https%3A%2F%2Fexample.com%2Ftiles,2,18&disp=11";

      const deserialized = deserializeState(newHash);

      expect(deserialized.mainOptionalLayers).toHaveLength(1);
      expect(deserialized.mainOptionalLayers?.[0]).toMatchObject({
        layerId: "afm",
        title: "活断層図",
        opacity: 1,
        visible: true,
        tileUrl: "https://example.com/tiles",
        minZoom: 2,
        maxZoom: 18,
      });
    });
  });

  describe("roofElevationType round-trip", () => {
    it("デフォルト値 medElv はURLに含まれない", () => {
      const state = makeBaseState();
      const serialized = serializeState(state);
      expect(serialized).not.toContain("ret=");
    });

    it("非デフォルト値を正しくシリアライズ・デシリアライズする", () => {
      const state = makeBaseState({
        maps: {
          main: {
            baseLayer: { id: "std" },
            optionalLayers: [],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "maxElv",
          },
          sub: {
            baseLayer: { id: "std" },
            optionalLayers: [],
            projection: "mercator",
            isHillshadeEnabled: false,
            isTerrainEnabled: false,
            isPointCloudEnabled: false,
            isDenshi3dEnabled: false,
            roofElevationType: "medElv",
          },
        },
      });
      const serialized = serializeState(state);
      expect(serialized).toContain("ret=maxElv");

      const deserialized = deserializeState(serialized);
      expect(deserialized.mainRoofElevationType).toBe("maxElv");
    });

    it("不正な値はデシリアライズ時に無視される", () => {
      const hash = "4.000/36.104611/140.084556/&ls=std,1.00&disp=1&ret=invalid";
      const deserialized = deserializeState(hash);
      expect(deserialized.mainRoofElevationType).toBeUndefined();
    });
  });
});
