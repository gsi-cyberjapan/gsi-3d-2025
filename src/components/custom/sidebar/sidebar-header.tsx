import {
  SidebarHeader as ShadcnSidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { GENERAL_CONFIG } from "@/lib/config";
import Link from "next/link";

export const SidebarHeader = () => {
  return (
    <ShadcnSidebarHeader className="border-b h-12 flex justify-center">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Link href="/">
              <h1 className="font-semibold text-lg">{GENERAL_CONFIG.TITLE}</h1>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </ShadcnSidebarHeader>
  );
};
