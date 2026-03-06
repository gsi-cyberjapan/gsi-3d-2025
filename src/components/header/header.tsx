"use client";

import { Logo } from "./logo";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  CircleQuestionMark,
  Ellipsis,
  Image as ImageIcon,
  Menu,
  Pen,
  Printer,
  Ruler,
  Save,
  Settings,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GENERAL_CONFIG } from "@/lib/config";
import { OthersDropdownContent } from "./others-dropdown-content";
import { SettingDropdownContent } from "./setting-dropdown-content";
import { ButtonGroup } from "../ui/button-group";
import { useStore } from "@/hooks/store/useStore";
import { SearchInput } from "./search-input";
import { ShareDialog } from "@/components/share/share-dialog";

export const Header = () => {
  const setIsDrawWindowOpen = useStore((state) => state.setIsDrawWindowOpen);
  const setIsMeasureWindowOpen = useStore(
    (state) => state.setIsMeasureWindowOpen,
  );
  const setIsSaveImageWindowOpen = useStore(
    (state) => state.setIsSaveImageWindowOpen,
  );
  const setIsPrintDialogOpen = useStore((state) => state.setIsPrintDialogOpen);
  const setIsShareDialogOpen = useStore((state) => state.setIsShareDialogOpen);

  return (
    <div className="flex border-b py-1 px-2 gap-2 justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Logo className="md:block hidden" />
        <SearchInput className="flex-1" />
      </div>
      <div className="md:flex items-center gap-2 hidden">
        <ButtonGroup>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setIsMeasureWindowOpen(true);
            }}
          >
            <Ruler /> 計測
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setIsDrawWindowOpen(true);
            }}
          >
            <Pen /> 作図
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                <Save /> 保存
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setIsSaveImageWindowOpen(true);
                  }}
                >
                  <ImageIcon /> 画像
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsPrintDialogOpen(true);
                  }}
                >
                  <Printer /> 印刷
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setIsShareDialogOpen(true);
            }}
          >
            <Share2 /> 共有
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                <Settings /> 設定
              </Button>
            </DropdownMenuTrigger>
            <SettingDropdownContent />
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                <Ellipsis /> その他
              </Button>
            </DropdownMenuTrigger>
            <OthersDropdownContent />
          </DropdownMenu>
          <Button asChild size="xs" variant="outline">
            <Link href={GENERAL_CONFIG.HELP_PAGE_URL} target="_blank">
              <CircleQuestionMark /> ヘルプ
            </Link>
          </Button>
        </ButtonGroup>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="md:hidden" asChild>
          <Button size="icon-sm" className="size-7" variant="outline">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setIsMeasureWindowOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <Ruler /> 計測
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsDrawWindowOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <Pen /> 作図
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsSaveImageWindowOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <ImageIcon /> 画像として保存
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsPrintDialogOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <Printer /> 印刷
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsShareDialogOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <Share2 /> 共有
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex gap-2 items-center">
                    <Ellipsis /> その他
                  </div>
                </DropdownMenuTrigger>
                <OthersDropdownContent />
              </DropdownMenu>
            </DropdownMenuItem>
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
      <ShareDialog />
    </div>
  );
};
