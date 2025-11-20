import type {
  StyleSpecification,
  SourceSpecification,
  LayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
  VectorSourceSpecification,
  FilterSpecification,
  ExpressionSpecification,
} from "maplibre-gl";

/* -------------------------------------------------------------------------- */
/* GSI design JSON types                                                      */
/* -------------------------------------------------------------------------- */

export interface GsiDesignFile {
  title: string;
  maxNativeZoom?: number;
  group?: GsiGroup[];
  list: GsiNode[];
}

export interface GsiGroup {
  id: string;
  title: string;
  zoom?: number[];
  filter?: FilterSpecification;
  "additional-filter"?: FilterSpecification;
  hasOutline?: boolean;
}

export type GsiNode = GsiDirectory | GsiItem;

export interface GsiDirectory {
  type: "directory";
  title: string;
  list: GsiNode[];
  filter?: FilterSpecification;
}

export interface GsiItem {
  type: "item";
  title: string;
  group?: string[];
  list: GsiLayer[];
  zIndex?: number;
  filter?: FilterSpecification;
}

export interface GsiLayer {
  type: "layer";
  title?: string;
  visible?: boolean;
  minzoom: number;
  maxzoom: number;
  "source-layer"?: string;
  list: GsiDraw[];
  filter?: FilterSpecification;
}

export type GsiDrawType = "fill" | "line" | "symbol";

export interface GsiDraw {
  type: GsiDrawType;
  visible?: boolean;
  "source-layer"?: string;
  info?: {
    "text-field"?: string;
    "text-vertical-field"?: string;
    "text-rotate-field"?: string;
    "text-anchor-field"?: string;
  };
  draw: GsiDrawStyle;
}

export type GsiDrawStyle =
  | GsiFillDrawStyle
  | GsiLineDrawStyle
  | GsiSymbolDrawStyle;

export interface GsiFillDrawStyle {
  "fill-visible"?: boolean;
  "outline-visible"?: boolean;
  "fill-color"?: string;
  "fill-style"?: string;
  "fill-hatch-bgcolor"?: string;
  "outline-color"?: string;
  "outline-width"?: number;
  "outline-dasharray"?: number[];
}

export interface GsiLineDrawStyle {
  "line-visible"?: boolean;
  "line-color"?: string;
  "line-width"?: number;
  "line-dasharray"?: number[];
  "line-cap"?: "butt" | "round" | "square";
  "line-join"?: "bevel" | "round" | "miter";
  "line-offset"?: number;
}

export interface GsiSymbolDrawStyle {
  "icon-visible"?: boolean;
  "icon-image"?: string;
  "icon-size"?: number;
  "icon-anchor"?: string;
  "icon-pitch-alignment"?: string;
  "icon-rotation-alignment"?: string;
  "text-visible"?: boolean;
  "text-color"?: string;
  "text-size"?: number;
  "text-halo-color"?: string;
  "text-halo-width"?: number;
  "text-offset"?: number | number[];
  "text-anchor"?: string;
  "text-pitch-alignment"?: string;
  "text-rotation-alignment"?: string;
}

/* -------------------------------------------------------------------------- */
/* Options                                                                    */
/* -------------------------------------------------------------------------- */

export interface ConvertGsiDesignToStyleOptions {
  sourceId?: string;
  tilesUrl?: string;
  sourceMinzoom?: number;
  sourceMaxzoom?: number;
  spriteUrl?: string;
  glyphsUrl?: string;
  enableHatchPattern?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function convertGsiDesignToStyle(
  input: unknown,
  options: ConvertGsiDesignToStyleOptions = {},
): StyleSpecification {
  if (isStyleSpecification(input)) return input;

  if (!isGsiDesignFile(input)) {
    throw new Error(
      "Given JSON is not a GSI design file: missing `list` array, and also not a style.json (no `version`/`layers`).",
    );
  }

  const design = input;

  const {
    sourceId = "gsi-v",
    tilesUrl = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf",
    sourceMinzoom = 4,
    sourceMaxzoom = design.maxNativeZoom ?? 16,
    spriteUrl = "https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/sprite/std",
    glyphsUrl = "https://maps.gsi.go.jp/xyz/noto-jp/{fontstack}/{range}.pbf",
    enableHatchPattern = true,
  } = options;

  const groupOrder = buildGroupOrder(design.group);

  const tmpLayers: TmpLayer[] = [];
  let orderCounter = 0;

  const pushLayer = (
    layer: LayerSpecification,
    groupIndex: number,
    zIndex: number,
  ) => {
    tmpLayers.push({ layer, groupIndex, zIndex, order: orderCounter++ });
  };

  const walk = (node: GsiNode, ctx: WalkContext) => {
    if (node.type === "directory") {
      const next: WalkContext = {
        path: [...ctx.path, node.title],
        filter: andFilters(ctx.filter, node.filter),
      };
      node.list.forEach((child) => {
        walk(child, next);
      });
      return;
    }

    const item = node;
    const itemCtx: WalkContext = {
      path: [...ctx.path, item.title],
      filter: andFilters(ctx.filter, item.filter),
    };

    item.list.forEach((layer) => {
      const groupIds = item.group ?? [];
      const groupIndex = resolveGroupIndex(groupIds, groupOrder);

      const combinedFilter = andFilters(
        itemCtx.filter,
        layer.filter,
        ...collectGroupFilters(design.group, groupIds),
      );

      layer.list.forEach((draw, drawIndex) => {
        if (!isVisible(layer, draw)) return;

        const baseSourceLayer = draw["source-layer"] ?? layer["source-layer"];
        const baseIdPrefix = sanitizeId(
          [
            "gsi",
            groupIds[0] ?? "nogroup",
            ...itemCtx.path,
            layer.title ?? "",
            draw.type,
            drawIndex,
          ]
            .filter(Boolean)
            .join("_"),
        );

        const layersFromDraw = generateLayersFromDraw(draw, {
          minzoom: layer.minzoom,
          maxzoom: layer.maxzoom,
          filter: combinedFilter,
          path: itemCtx.path,
          itemTitle: item.title,
          groupIds,
          baseSourceLayer,
          baseIdPrefix,
          enableHatchPattern,
          sourceId,
        });

        layersFromDraw.forEach((l) => {
          pushLayer(l, groupIndex, item.zIndex ?? 0);
        });
      });
    });
  };

  design.list.forEach((n) => {
    walk(n, { path: [], filter: undefined });
  });

  tmpLayers.sort((a, b) => {
    if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
    return a.order - b.order;
  });

  const sources: Record<string, SourceSpecification> = {
    [sourceId]: {
      type: "vector",
      tiles: [tilesUrl],
      minzoom: sourceMinzoom,
      maxzoom: sourceMaxzoom,
      attribution:
        '<a href="https://maps.gsi.go.jp/vector/" target="_blank">地理院地図Vector（仮称）</a>',
    } satisfies VectorSourceSpecification,
  };

  return {
    version: 8,
    name: design.title,
    sprite: spriteUrl,
    glyphs: glyphsUrl,
    sources,
    layers: tmpLayers.map((t) => t.layer),
    metadata: { "gsi:design-title": design.title },
  };
}

/* -------------------------------------------------------------------------- */
/* draw -> layers                                                             */
/* -------------------------------------------------------------------------- */

type CommonLayerProps = {
  source: string;
  "source-layer"?: string;
  minzoom: number;
  maxzoom: number;
  filter?: FilterSpecification;
};

type WalkContext = {
  path: string[];
  filter?: FilterSpecification;
};

type TmpLayer = {
  layer: LayerSpecification;
  groupIndex: number;
  zIndex: number;
  order: number;
};

interface DrawContext {
  minzoom: number;
  maxzoom: number;
  filter?: FilterSpecification;
  path: string[];
  itemTitle: string;
  groupIds: string[];
  baseSourceLayer?: string;
  baseIdPrefix: string;
  enableHatchPattern: boolean;
  sourceId: string;
}

function generateLayersFromDraw(
  draw: GsiDraw,
  ctx: DrawContext,
): LayerSpecification[] {
  switch (draw.type) {
    case "fill":
      return generateFillLayers(draw, ctx);
    case "line":
      return generateLineLayers(draw, ctx);
    case "symbol":
      return generateSymbolLayers(draw, ctx);
    default:
      return [];
  }
}

function generateFillLayers(
  draw: GsiDraw,
  ctx: DrawContext,
): LayerSpecification[] {
  const style = draw.draw as GsiFillDrawStyle;
  const base = commonProps(ctx);
  const meta = baseMeta(ctx);
  const out: LayerSpecification[] = [];

  if (style["fill-visible"] !== false) {
    const paint: Record<string, unknown> = {};

    if (
      ctx.enableHatchPattern &&
      style["fill-style"] &&
      style["fill-style"] !== "fill"
    ) {
      const bg =
        style["fill-hatch-bgcolor"] ?? style["fill-color"] ?? "rgba(0,0,0,1)";
      const styleName = style["fill-style"];
      const hash = bg.replace(/[^0-9a-fA-F]+/g, "");
      paint["fill-pattern"] = `gsi-fill-hatch-${styleName}-${hash}`;
    } else if (style["fill-color"]) {
      paint["fill-color"] = style["fill-color"];
    } else if (style["fill-hatch-bgcolor"]) {
      paint["fill-color"] = style["fill-hatch-bgcolor"];
    }

    out.push({
      id: `${ctx.baseIdPrefix}_fill`,
      type: "fill",
      ...base,
      paint: paint as unknown as FillLayerSpecification["paint"],
      metadata: { ...meta, "gsi:draw-type": "fill" },
    } satisfies FillLayerSpecification);
  }

  if (style["outline-visible"] !== false && style["outline-color"]) {
    const paint: Record<string, unknown> = {
      "line-color": style["outline-color"],
    };
    if (typeof style["outline-width"] === "number") {
      paint["line-width"] = style["outline-width"];
    }
    if (Array.isArray(style["outline-dasharray"])) {
      paint["line-dasharray"] = style["outline-dasharray"];
    }

    out.push({
      id: `${ctx.baseIdPrefix}_outline`,
      type: "line",
      ...base,
      paint: paint as unknown as LineLayerSpecification["paint"],
      metadata: { ...meta, "gsi:draw-type": "fill-outline" },
    } satisfies LineLayerSpecification);
  }

  return out;
}

function generateLineLayers(
  draw: GsiDraw,
  ctx: DrawContext,
): LayerSpecification[] {
  const style = draw.draw as GsiLineDrawStyle;
  if (style["line-visible"] === false) return [];

  const base = commonProps(ctx);
  const meta = baseMeta(ctx);

  const paint: Record<string, unknown> = {};
  const layout: Record<string, unknown> = {};

  if (style["line-color"]) paint["line-color"] = style["line-color"];
  if (typeof style["line-width"] === "number")
    paint["line-width"] = style["line-width"];
  if (Array.isArray(style["line-dasharray"]))
    paint["line-dasharray"] = style["line-dasharray"];
  if (typeof style["line-offset"] === "number")
    paint["line-offset"] = style["line-offset"];
  if (style["line-cap"]) layout["line-cap"] = style["line-cap"];
  if (style["line-join"]) layout["line-join"] = style["line-join"];

  return [
    {
      id: `${ctx.baseIdPrefix}_line`,
      type: "line",
      ...base,
      ...(Object.keys(paint).length
        ? { paint: paint as unknown as LineLayerSpecification["paint"] }
        : {}),
      ...(Object.keys(layout).length
        ? { layout: layout as unknown as LineLayerSpecification["layout"] }
        : {}),
      metadata: { ...meta, "gsi:draw-type": "line" },
    } satisfies LineLayerSpecification,
  ];
}

function generateSymbolLayers(
  draw: GsiDraw,
  ctx: DrawContext,
): LayerSpecification[] {
  const style = draw.draw as GsiSymbolDrawStyle;
  const info = draw.info ?? {};
  const base = commonProps(ctx);
  const meta = baseMeta(ctx);
  const out: LayerSpecification[] = [];

  const iconImage = style["icon-image"];
  const hasIcon = style["icon-visible"] !== false && !!iconImage;

  const textField = info["text-field"];
  const hasText = style["text-visible"] !== false && !!textField;

  if (hasIcon && iconImage) {
    const layout: Record<string, unknown> = {
      "icon-image": iconImage,
    };
    if (typeof style["icon-size"] === "number")
      layout["icon-size"] = style["icon-size"];
    if (style["icon-anchor"]) layout["icon-anchor"] = style["icon-anchor"];
    if (style["icon-pitch-alignment"])
      layout["icon-pitch-alignment"] = style["icon-pitch-alignment"];
    if (style["icon-rotation-alignment"])
      layout["icon-rotation-alignment"] = style["icon-rotation-alignment"];

    out.push({
      id: `${ctx.baseIdPrefix}_icon`,
      type: "symbol",
      ...base,
      layout: layout as unknown as SymbolLayerSpecification["layout"],
      metadata: { ...meta, "gsi:draw-type": "symbol-icon" },
    } satisfies SymbolLayerSpecification);
  }

  if (hasText && textField) {
    const layout: Record<string, unknown> = {
      "text-field": ["get", textField] as ExpressionSpecification,
      "text-font": ["Noto Sans CJK JP Regular"],
    };
    const paint: Record<string, unknown> = {};

    if (style["text-size"]) layout["text-size"] = style["text-size"];
    if (style["text-anchor"]) layout["text-anchor"] = style["text-anchor"];
    if (style["text-offset"] !== undefined)
      layout["text-offset"] = style["text-offset"];
    if (style["text-pitch-alignment"])
      layout["text-pitch-alignment"] = style["text-pitch-alignment"];
    if (style["text-rotation-alignment"])
      layout["text-rotation-alignment"] = style["text-rotation-alignment"];

    if (style["text-color"]) paint["text-color"] = style["text-color"];
    if (style["text-halo-color"])
      paint["text-halo-color"] = style["text-halo-color"];
    if (style["text-halo-width"] !== undefined)
      paint["text-halo-width"] = style["text-halo-width"];

    out.push({
      id: `${ctx.baseIdPrefix}_text`,
      type: "symbol",
      ...base,
      ...(Object.keys(paint).length
        ? { paint: paint as unknown as SymbolLayerSpecification["paint"] }
        : {}),
      layout: layout as unknown as SymbolLayerSpecification["layout"],
      metadata: { ...meta, "gsi:draw-type": "symbol-text" },
    } satisfies SymbolLayerSpecification);
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isStyleSpecification(v: unknown): v is StyleSpecification {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.version === "number" && Array.isArray(o.layers);
}

function isGsiDesignFile(v: unknown): v is GsiDesignFile {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.title === "string" && Array.isArray(o.list);
}

function buildGroupOrder(groups?: GsiGroup[]): Record<string, number> {
  const order: Record<string, number> = {};
  groups?.forEach((g, idx) => {
    order[g.id] = idx;
  });
  return order;
}

function resolveGroupIndex(
  groupIds: string[],
  groupOrder: Record<string, number>,
): number {
  const indices = groupIds.map((id) => groupOrder[id]);
  return indices.length ? Math.min(...indices) : Number.MAX_SAFE_INTEGER;
}

function collectGroupFilters(
  groups: GsiGroup[] | undefined,
  groupIds: string[],
) {
  if (!groups?.length || !groupIds.length) return [];
  const out: FilterSpecification[] = [];
  groupIds.forEach((id) => {
    const g = groups.find((gg) => gg.id === id);
    if (!g) return;
    if (g.filter) out.push(g.filter);
    if (g["additional-filter"]) out.push(g["additional-filter"]);
  });
  return out;
}

function andFilters(
  ...filters: Array<FilterSpecification | undefined>
): FilterSpecification | undefined {
  const f = filters.filter(Boolean) as FilterSpecification[];
  if (!f.length) return undefined;
  if (f.length === 1) return f[0];
  return ["all", ...f] as unknown as FilterSpecification;
}

function isVisible(layer: GsiLayer, draw: GsiDraw): boolean {
  const layerVisible = layer.visible ?? true;
  const drawVisible = draw.visible ?? true;

  if (draw.type === "fill") {
    const s = draw.draw as GsiFillDrawStyle;
    if (s["fill-visible"] === false) return false;
  }

  if (draw.type === "line") {
    const s = draw.draw as GsiLineDrawStyle;
    if (s["line-visible"] === false) return false;
  }

  if (draw.type === "symbol") {
    const s = draw.draw as GsiSymbolDrawStyle;
    if (s["icon-visible"] === false && s["text-visible"] === false)
      return false;
  }

  return layerVisible && drawVisible;
}

function commonProps(ctx: DrawContext): CommonLayerProps {
  const props: CommonLayerProps = {
    source: ctx.sourceId,
    minzoom: ctx.minzoom,
    maxzoom: ctx.maxzoom,
  };
  if (ctx.baseSourceLayer) props["source-layer"] = ctx.baseSourceLayer;
  if (ctx.filter) props.filter = ctx.filter;
  return props;
}

function baseMeta(ctx: DrawContext) {
  return {
    "gsi:path": ctx.path.join("/"),
    "gsi:item": ctx.itemTitle,
    "gsi:group": ctx.groupIds,
  };
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, "_");
}
