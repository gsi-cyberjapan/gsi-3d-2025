import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/header/logo";
import { BaseLayerSelector } from "./base-layer-selector";
import { LayoutSelector } from "./layout-control/layout-selector";
import { OptionalLayerSelector } from "./optional-layer/optional-layer-selector";
import { OptionalLayerControler } from "./optional-layer/optional-layer-controler";
import { GlobeModeCheckbox } from "./globe-mode-checkbox";
import { MapDisplayToggles } from "./map-display-toggles";
import { OptionalLayerResetButton } from "./optional-layer/optional-layer-reset-button";

export const Sidebar = () => {
  return (
    <UISidebar>
      <SidebarHeader className="md:hidden">
        <Logo />
      </SidebarHeader>
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
            <OptionalLayerSelector />
          </div>
        </SidebarGroup>
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                選択中の地図
              </span>
              <OptionalLayerResetButton />
            </div>
            <OptionalLayerControler />
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">表示モード</span>
          <LayoutSelector />
          <GlobeModeCheckbox />
          <MapDisplayToggles />
        </div>
      </SidebarFooter>
    </UISidebar>
  );
};
