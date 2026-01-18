"use client";

import { EditingFeature } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import { FieldGroup, FieldLabel, Field } from "@/components/ui/field";
import { useState } from "react";
import { GeoJSONStoreFeatures } from "terra-draw";
import { omit } from "@/lib/utils";
import { IconPicker } from "./icon-picker";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  DEFAULT_MARKER_SYMBOL,
  DEFAULT_MARKER_SIZE,
} from "@/lib/draw/getPointModeStyle";
import { MarkerSize, MARKER_ICON_CONFIG } from "@/lib/config";

interface PointFeatureEditFormProps {
  feature: EditingFeature;
}

export const PointFeatureEditForm = ({
  feature,
}: PointFeatureEditFormProps) => {
  const td = useStore((state) => state.maps[feature.mapId].td);
  const [properties, setProperties] = useState(
    td?.getSnapshotFeature(feature.featureId)?.properties,
  );

  const markerSymbol =
    typeof properties?.["marker-symbol"] === "string"
      ? properties["marker-symbol"]
      : DEFAULT_MARKER_SYMBOL;
  const rawMarkerSize = properties?.["marker-size"];
  const markerSize =
    typeof rawMarkerSize === "string" &&
    ["small", "medium", "large"].includes(rawMarkerSize)
      ? (rawMarkerSize as MarkerSize)
      : DEFAULT_MARKER_SIZE;

  const handlePropertiesChange = (p: GeoJSONStoreFeatures["properties"]) => {
    setProperties(p);
    td?.updateFeatureProperties(
      feature.featureId,
      omit(p, "mode", "selected", "marker"),
    );
  };

  if (!properties) {
    return null;
  }

  return (
    <FieldGroup className="gap-4">
      <Field>
        <IconPicker
          value={markerSymbol}
          onChange={(symbol) => {
            handlePropertiesChange({
              ...properties,
              "marker-symbol": symbol,
            });
          }}
        />
      </Field>
      <Field>
        <FieldLabel>サイズ</FieldLabel>
        <NativeSelect
          value={markerSize}
          onChange={(e) => {
            handlePropertiesChange({
              ...properties,
              "marker-size": e.target.value as MarkerSize,
            });
          }}
          size="sm"
        >
          <NativeSelectOption value="small">
            小 ({MARKER_ICON_CONFIG.SIZES.small}px)
          </NativeSelectOption>
          <NativeSelectOption value="medium">
            中 ({MARKER_ICON_CONFIG.SIZES.medium}px)
          </NativeSelectOption>
          <NativeSelectOption value="large">
            大 ({MARKER_ICON_CONFIG.SIZES.large}px)
          </NativeSelectOption>
        </NativeSelect>
      </Field>
    </FieldGroup>
  );
};
