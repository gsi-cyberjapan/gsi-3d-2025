"use client";

import { EditingFeature } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import { FieldGroup, FieldLabel, Field } from "../ui/field";
import { useState } from "react";
import { GeoJSONStoreFeatures } from "terra-draw";
import { omit } from "@/lib/utils";
import { InputColor } from "../ui/input-color-picker";
import { Input } from "../ui/input";

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
  const [widthInput, setWidthInput] = useState<string>(
    String(
      properties
        ? ((isLine
            ? properties.lineStringWidth
            : properties.outlineWidth) as number)
        : 2,
    ),
  );
  const handlePropertiesChange = (p: GeoJSONStoreFeatures["properties"]) => {
    setProperties(p);
    td?.updateFeatureProperties(feature.featureId, omit(p, "mode", "selected"));
  };
  const isPolygonOrCircle = mode && ["circle", "polygon"].includes(mode);

  if (!properties) {
    return null;
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
