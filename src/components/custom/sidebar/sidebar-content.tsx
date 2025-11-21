import {
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { MapBaseSelector } from "../map-base-selector";

export const SidebarContent = () => {
  return (
    <ShadcnSidebarContent>
      <SidebarGroup>
        <MapBaseSelector />
      </SidebarGroup>
    </ShadcnSidebarContent>
  );
};
