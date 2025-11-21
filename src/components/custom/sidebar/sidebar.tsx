import { Sidebar as ShadcnSidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar-header";
import { SidebarContent } from "./sidebar-content";

export const Sidebar = () => {
  return (
    <ShadcnSidebar>
      <SidebarHeader />
      <SidebarContent />
    </ShadcnSidebar>
  );
};
