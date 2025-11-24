import { Logo } from "./logo";
import { Button } from "../ui/button";
import Link from "next/link";
import { CircleQuestionMark, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GENERAL_CONFIG } from "@/lib/config";

export const Header = () => {
  return (
    <div className="flex border-b py-1 px-2 justify-between">
      <Logo />
      <div className="md:flex items-center gap-2 hidden">
        <Button asChild size="xs" variant="outline">
          <Link href={GENERAL_CONFIG.HELP_PAGE_URL} target="_blank">
            <CircleQuestionMark /> ヘルプ
          </Link>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="md:hidden" asChild>
          <Button size="icon-sm" variant="outline">
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
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
