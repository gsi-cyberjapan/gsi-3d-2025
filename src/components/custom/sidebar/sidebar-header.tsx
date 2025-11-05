import {
  SidebarHeader as ShadcnSidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { GENERAL } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";

export const SidebarHeader = () => {
  return (
    <ShadcnSidebarHeader className="border-b h-12 flex justify-center">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Link href="/">
              <div className="flex gap-2 items-center">
                <div className="relative size-6">
                  <Image src="/geolonia_logo.svg" alt="Geoloniaのロゴ" fill />
                </div>
                <h1 className="font-semibold text-lg">{GENERAL.TITLE}</h1>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </ShadcnSidebarHeader>
  );
};
