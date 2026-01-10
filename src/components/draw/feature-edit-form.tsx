"use client";

import { EditingFeature } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import { FieldGroup, FieldLabel, Field } from "../ui/field";

interface FeatureEditFormProps {
  feature: EditingFeature;
}

export const FeatureEditForm = ({ feature }: FeatureEditFormProps) => {
  const td = useStore((state) => state.maps[feature.mapId].td);
  const properties = td?.getSnapshotFeature(feature.featureId)?.properties;

  if (!properties) {
    return null;
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>塗りつぶしの色</FieldLabel>
      </Field>
    </FieldGroup>
  );
};
