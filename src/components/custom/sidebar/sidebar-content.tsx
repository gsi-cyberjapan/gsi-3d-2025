import {
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { MapBaseLayerSelector } from "../map-base-layer-selector";

export const SidebarContent = () => {
  return (
    <ShadcnSidebarContent>
      <SidebarGroup>
        <MapBaseLayerSelector />
      </SidebarGroup>
    </ShadcnSidebarContent>
  );
};
