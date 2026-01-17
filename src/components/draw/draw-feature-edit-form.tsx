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

interface FeatureEditFormProps {
  feature: EditingFeature;
}

export const DrawFeatureEditForm = ({ feature }: FeatureEditFormProps) => {
  const td = useStore((state) => state.maps[feature.mapId].td);
  const [properties, setProperties] = useState(
    td?.getSnapshotFeature(feature.featureId)?.properties,
  );
  const mode = properties?.mode as string | undefined;
  const isLine = mode && ["linestring", "freehand-linestring"].includes(mode);
  const isText = mode === "text";
  const [widthInput, setWidthInput] = useState<string>(
    String(
      properties
        ? ((isLine
            ? properties.lineStringWidth
            : properties.outlineWidth) as number)
        : 2,
    ),
  );
  const [textSizeInput, setTextSizeInput] = useState<string>(() => {
    const size = properties?.textSize;
    return String(typeof size === "number" ? size : DEFAULT_TEXT_SIZE);
  });
  const handlePropertiesChange = (p: GeoJSONStoreFeatures["properties"]) => {
    setProperties(p);
    td?.updateFeatureProperties(feature.featureId, omit(p, "mode", "selected"));
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

  return (
    <FieldGroup className="gap-4">
      {isPolygonOrCircle && (
        <Field>
          <FieldLabel>塗りつぶしの色</FieldLabel>
          <InputColor
            alpha
            value={properties.fillColor as string}
            onChange={(color) => {
              handlePropertiesChange({
                ...properties,
                fillColor: color,
              });
            }}
          />
        </Field>
      )}
      <Field>
        <FieldLabel>{isLine ? "線の色" : "枠線の色"}</FieldLabel>
        <InputColor
          alpha
          value={
            (isLine
              ? properties.lineStringColor
              : properties.outlineColor) as string
          }
          onChange={(color) => {
            handlePropertiesChange({
              ...properties,
              ...(isLine
                ? { lineStringColor: color }
                : { outlineColor: color }),
            });
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
                ...(isLine
                  ? { lineStringWidth: numValue }
                  : { outlineWidth: numValue }),
              });
            }
          }}
        />
      </Field>
    </FieldGroup>
  );
};
