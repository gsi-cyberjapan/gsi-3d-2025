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

  const handlePropertiesChange = (p: GeoJSONStoreFeatures["properties"]) => {
    setProperties(p);
    td?.updateFeatureProperties(feature.featureId, omit(p, "mode"));
  };

  if (!properties) {
    return null;
  }

  return (
    <FieldGroup className="gap-4">
      {["circle"].includes(properties.mode as string) && (
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
        <FieldLabel>枠線の色</FieldLabel>
        <InputColor
          alpha
          value={properties.outlineColor as string}
          onChange={(color) => {
            handlePropertiesChange({
              ...properties,
              outlineColor: color,
            });
          }}
        />
      </Field>
      {["circle"].includes(properties.mode as string) && (
        <Field>
          <FieldLabel>線の太さ</FieldLabel>
          <Input
            type="number"
            className="h-7"
            min="1"
            max="20"
            step="1"
            value={properties.outlineWidth as number}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 0) {
                handlePropertiesChange({
                  ...properties,
                  outlineWidth: value,
                });
              }
            }}
          />
        </Field>
      )}
    </FieldGroup>
  );
};
