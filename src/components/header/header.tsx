import { Logo } from "./logo";
import { Button } from "../ui/button";
import Link from "next/link";
import { CircleQuestionMark, Menu, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GENERAL_CONFIG } from "@/lib/config";
import { SettingDropdownContent } from "./setting-dropdown-content";
import { SearchInput } from "./search-input";

export const Header = () => {
  return (
    <div className="flex border-b py-1 px-2 gap-2 justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Logo className="md:block hidden" />
        <SearchInput className="flex-1" />
      </div>
      <div className="md:flex items-center gap-2 hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs" variant="outline">
              <Settings /> 設定
            </Button>
          </DropdownMenuTrigger>
          <SettingDropdownContent />
        </DropdownMenu>
        <Button asChild size="xs" variant="outline">
          <Link href={GENERAL_CONFIG.HELP_PAGE_URL} target="_blank">
            <CircleQuestionMark /> ヘルプ
          </Link>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="md:hidden" asChild>
          <Button size="icon-sm" className="size-7" variant="outline">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href={GENERAL_CONFIG.HELP_PAGE_URL} target="_blank">
                <div className="flex gap-2 items-center">
                  <CircleQuestionMark /> ヘルプ
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex gap-2 items-center">
                    <Settings /> 設定
                  </div>
                </DropdownMenuTrigger>
                <SettingDropdownContent />
              </DropdownMenu>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
