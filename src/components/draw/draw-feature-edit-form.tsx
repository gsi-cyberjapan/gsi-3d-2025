"use client";

import { EditingFeature } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import { FieldGroup, FieldLabel, Field } from "../ui/field";
import { useState } from "react";
import { GeoJSONStoreFeatures } from "terra-draw";
import { omit } from "@/lib/utils";
import { InputColor } from "../ui/input-color-picker";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import { Checkbox } from "../ui/checkbox";
import { Bold, Italic, Underline } from "lucide-react";
import {
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_BOLD,
  DEFAULT_TEXT_ITALIC,
  DEFAULT_TEXT_UNDERLINE,
  DEFAULT_IS_HTML,
  DEFAULT_TEXT_CONTENT,
} from "@/lib/draw/getTextModeStyle";
import {
  DEFAULT_FILL,
  DEFAULT_FILL_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH,
} from "@/lib/draw/getPolygonModeStyle";
import {
  DEFAULT_STROKE as DEFAULT_LINE_STROKE,
  DEFAULT_STROKE_OPACITY as DEFAULT_LINE_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH as DEFAULT_LINE_STROKE_WIDTH,
} from "@/lib/draw/getLineStringModeStyle";
import { colorToRgba, rgbaToColorAndOpacity } from "@/lib/colorConverter";
import { PointFeatureEditForm } from "./point-feature-edit-form";

interface FeatureEditFormProps {
  feature: EditingFeature;
}

/**
 * Get combined color (#RRGGBBAA) from simplestyle properties
 */
function getColorWithOpacity(
  properties: GeoJSONStoreFeatures["properties"],
  colorProp: string,
  opacityProp: string,
  defaultColor: string,
  defaultOpacity: number,
): string {
  const colorValue = properties[colorProp];
  const opacityValue = properties[opacityProp];
  const color = typeof colorValue === "string" ? colorValue : defaultColor;
  const opacity =
    typeof opacityValue === "number" ? opacityValue : defaultOpacity;
  return colorToRgba(color, opacity);
}

export const DrawFeatureEditForm = ({ feature }: FeatureEditFormProps) => {
  const td = useStore((state) => state.maps[feature.mapId].td);
  const [properties, setProperties] = useState(
    td?.getSnapshotFeature(feature.featureId)?.properties,
  );
  const mode = properties?.mode as string | undefined;
  const isLine = mode && ["linestring", "freehand-linestring"].includes(mode);
  const isText = mode === "text";
  const isPoint = mode === "point";

  const rawStrokeWidth = properties?.["stroke-width"];
  const strokeWidth =
    typeof rawStrokeWidth === "number"
      ? rawStrokeWidth
      : isLine
        ? DEFAULT_LINE_STROKE_WIDTH
        : DEFAULT_STROKE_WIDTH;

  const [widthInput, setWidthInput] = useState<string>(String(strokeWidth));
  const [textSizeInput, setTextSizeInput] = useState<string>(() => {
    const size = properties?.textSize;
    return String(typeof size === "number" ? size : DEFAULT_TEXT_SIZE);
  });

  const handlePropertiesChange = (p: GeoJSONStoreFeatures["properties"]) => {
    setProperties(p);
    td?.updateFeatureProperties(
      feature.featureId,
      omit(p, "mode", "selected", "marker"),
    );
  };

  /**
   * Handle color change from color picker (#RRGGBBAA) to simplestyle (color + opacity)
   */
  const handleColorChange = (
    colorProp: string,
    opacityProp: string,
    rgba: string,
  ) => {
    const { color, opacity } = rgbaToColorAndOpacity(rgba);
    handlePropertiesChange({
      ...properties,
      [colorProp]: color,
      [opacityProp]: opacity,
    });
  };

  const isPolygonOrCircle = mode && ["circle", "polygon"].includes(mode);

  if (!properties) {
    return null;
  }

  if (isText) {
    const textContent =
      typeof properties.textContent === "string"
        ? properties.textContent
        : DEFAULT_TEXT_CONTENT;
    const textColor =
      typeof properties.textColor === "string"
        ? properties.textColor
        : DEFAULT_TEXT_COLOR;
    const textBold =
      typeof properties.textBold === "boolean"
        ? properties.textBold
        : DEFAULT_TEXT_BOLD;
    const textItalic =
      typeof properties.textItalic === "boolean"
        ? properties.textItalic
        : DEFAULT_TEXT_ITALIC;
    const textUnderline =
      typeof properties.textUnderline === "boolean"
        ? properties.textUnderline
        : DEFAULT_TEXT_UNDERLINE;
    const isHtml =
      typeof properties.isHtml === "boolean"
        ? properties.isHtml
        : DEFAULT_IS_HTML;

    return (
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel>テキスト内容</FieldLabel>
          <Textarea
            value={textContent}
            onChange={(e) => {
              handlePropertiesChange({
                ...properties,
                textContent: e.target.value,
              });
            }}
            placeholder="テキストを入力"
            className="min-h-20"
          />
        </Field>
        <Field>
          <FieldLabel>テキストの色</FieldLabel>
          <InputColor
            value={textColor}
            onChange={(color) => {
              handlePropertiesChange({
                ...properties,
                textColor: color,
              });
            }}
          />
        </Field>
        <Field>
          <FieldLabel>文字サイズ</FieldLabel>
          <Input
            type="number"
            className="h-7"
            value={textSizeInput}
            min={1}
            onChange={(e) => {
              setTextSizeInput(e.target.value);
              const numValue = Number(e.target.value);
              if (!isNaN(numValue) && numValue > 0) {
                handlePropertiesChange({
                  ...properties,
                  textSize: numValue,
                });
              }
            }}
          />
        </Field>
        <Field>
          <FieldLabel>書式</FieldLabel>
          <ButtonGroup>
            <Button
              type="button"
              size="icon-sm"
              variant={textBold ? "default" : "outline"}
              onClick={() => {
                handlePropertiesChange({
                  ...properties,
                  textBold: !textBold,
                });
              }}
              title="太字"
            >
              <Bold className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={textItalic ? "default" : "outline"}
              onClick={() => {
                handlePropertiesChange({
                  ...properties,
                  textItalic: !textItalic,
                });
              }}
              title="斜体"
            >
              <Italic className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={textUnderline ? "default" : "outline"}
              onClick={() => {
                handlePropertiesChange({
                  ...properties,
                  textUnderline: !textUnderline,
                });
              }}
              title="下線"
            >
              <Underline className="size-4" />
            </Button>
          </ButtonGroup>
        </Field>
        <Field orientation="horizontal" className="items-center gap-2">
          <Checkbox
            id="isHtml"
            checked={isHtml}
            onCheckedChange={(checked) => {
              handlePropertiesChange({
                ...properties,
                isHtml: checked === true,
              });
            }}
          />
          <FieldLabel htmlFor="isHtml" className="cursor-pointer">
            HTMLとして描画
          </FieldLabel>
        </Field>
      </FieldGroup>
    );
  }

  if (isPoint) {
    return <PointFeatureEditForm feature={feature} />;
  }

  // Get current colors with opacity for display
  const fillColorValue = getColorWithOpacity(
    properties,
    "fill",
    "fill-opacity",
    DEFAULT_FILL,
    DEFAULT_FILL_OPACITY,
  );
  const strokeColorValue = getColorWithOpacity(
    properties,
    "stroke",
    "stroke-opacity",
    isLine ? DEFAULT_LINE_STROKE : DEFAULT_STROKE,
    isLine ? DEFAULT_LINE_STROKE_OPACITY : DEFAULT_STROKE_OPACITY,
  );

  return (
    <FieldGroup className="gap-4">
      {isPolygonOrCircle && (
        <Field>
          <FieldLabel>塗りつぶしの色</FieldLabel>
          <InputColor
            alpha
            value={fillColorValue}
            onChange={(color) => {
              handleColorChange("fill", "fill-opacity", color);
            }}
          />
        </Field>
      )}
      <Field>
        <FieldLabel>{isLine ? "線の色" : "枠線の色"}</FieldLabel>
        <InputColor
          alpha
          value={strokeColorValue}
          onChange={(color) => {
            handleColorChange("stroke", "stroke-opacity", color);
          }}
        />
      </Field>
      <Field>
        <FieldLabel>線の太さ</FieldLabel>
        <Input
          type="number"
          className="h-7"
          value={widthInput}
          onChange={(e) => {
            setWidthInput(e.target.value);
            const numValue = Number(e.target.value);
            if (!isNaN(numValue) && numValue >= 0) {
              handlePropertiesChange({
                ...properties,
                "stroke-width": numValue,
              });
            }
          }}
        />
      </Field>
    </FieldGroup>
  );
};
