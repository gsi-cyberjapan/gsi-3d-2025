import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { BaseLayerSelector } from "../map-control/base-layer-selector";
import { LayoutSelector } from "../layout-control/layout-selector";
import { OptionalLayerSelector } from "../map-control/optional-layer-selector";

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
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">地図の種類</span>
          </div>
          <OptionalLayerSelector />
        </SidebarGroup>
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">選択中の地図</span>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">表示モード</span>
          <LayoutSelector />
        </div>
      </SidebarFooter>
    </UISidebar>
  );
};
