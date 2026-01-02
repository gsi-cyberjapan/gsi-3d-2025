"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useStore } from "@/hooks/store/useStore";
import { Search } from "lucide-react";
import { useState, useCallback } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { SearchSuggestList } from "./search-suggest-list";
import { cn } from "@/lib/utils";

export const SearchInput = ({ className }: { className?: string }) => {
  const [input, setInput] = useState("");
  const geocode = useStore((state) => state.geocode);
  const addressSearchResult = useStore((state) => state.addressSearchResult);
  const isAddressSearchSuggestOpen = useStore(
    (state) => state.isAddressSearchSuggestOpen,
  );
  const setIsAddressSearchSuggestOpen = useStore(
    (state) => state.setIsAddressSearchSuggestOpen,
  );
  const clearAddressSearchResult = useStore(
    (state) => state.clearAddressSearchResult,
  );

  const handleInputChange = (value: string) => {
    clearAddressSearchResult();
    setInput(value);
  };

  const handleEnter = useCallback(() => {
    const value = input.trim();
    if (!value) return;
    void geocode(value);
  }, [geocode, input]);

  return (
    <Popover
      open={isAddressSearchSuggestOpen}
      onOpenChange={setIsAddressSearchSuggestOpen}
    >
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <div className={cn("h-7", className)}>
          <InputGroup className="h-7 max-w-120">
            <InputGroupInput
              className="text-sm"
              value={input}
              onChange={(e) => {
                handleInputChange(e.target.value);
              }}
              onFocus={() => {
                setIsAddressSearchSuggestOpen(addressSearchResult !== null);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (e.nativeEvent.isComposing) return; // 変換確定(IME)中は実行しない
                e.preventDefault(); // フォーム内でも意図せずsubmitさせない
                handleEnter();
              }}
              placeholder="地名・住所・緯度経度・UTMで検索"
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-2", "w-(--radix-popover-trigger-width)", "max-w-120")}
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <SearchSuggestList />
      </PopoverContent>
    </Popover>
  );
};
