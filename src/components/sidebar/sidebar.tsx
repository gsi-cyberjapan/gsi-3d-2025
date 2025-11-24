import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { BaseLayerSelector } from "../map-control/base-layer-selector";

export const Sidebar = () => {
  return (
    <UISidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">地図</span>
            <BaseLayerSelector />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </UISidebar>
  );
};
