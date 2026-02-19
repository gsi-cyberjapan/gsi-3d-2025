"use client";

import { FeaturePopupFeature } from "@/hooks/store/featurePopupState";

interface Props {
  features: FeaturePopupFeature[];
}

export const FeaturePopupContent = ({ features }: Props) => {
  const grouped = new Map<string, FeaturePopupFeature[]>();
  for (const feature of features) {
    const key = feature.sourceLayer;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(feature);
    } else {
      grouped.set(key, [feature]);
    }
  }

  return (
    <div className="max-h-64 overflow-y-auto text-xs">
      {[...grouped.entries()].map(([sourceLayer, group]) => (
        <div key={sourceLayer} className="mb-2 last:mb-0">
          <div className="font-bold text-muted-foreground mb-1 px-1">
            {sourceLayer}
          </div>
          {group.map((feature, i) => (
            <table
              key={`${feature.layerId}-${String(i)}`}
              className="w-full border-collapse mb-1 last:mb-0"
            >
              <tbody>
                {Object.entries(feature.properties).map(([key, value]) => (
                  <tr
                    key={key}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-1 py-0.5 font-medium text-muted-foreground whitespace-nowrap align-top">
                      {key}
                    </td>
                    <td className="px-1 py-0.5 break-all">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      ))}
    </div>
  );
};
