"use client";

import { EditingFeature } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import { FieldGroup, FieldLabel, Field } from "../ui/field";
import { useState } from "react";
import { GeoJSONStoreFeatures } from "terra-draw";

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
    td?.updateFeatureProperties(feature.featureId, p);
  };

  if (!properties) {
    return null;
  }

  return (
    <FieldGroup className="gap-4">
      {["circle"].includes(properties.mode as string) && (
        <Field orientation="horizontal">
          <FieldLabel>塗りつぶしの色</FieldLabel>
        </Field>
      )}
    </FieldGroup>
  );
};
