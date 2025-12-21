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

export const SearchInput = () => {
  const [input, setInput] = useState("");
  const geocode = useStore((state) => state.geocode);
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
    <div>
      <InputGroup className="h-7 w-120">
        <InputGroupInput
          className="text-sm"
          value={input}
          onChange={(e) => {
            handleInputChange(e.target.value);
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
      <Popover
        open={isAddressSearchSuggestOpen}
        onOpenChange={setIsAddressSearchSuggestOpen}
      >
        <PopoverTrigger />
        <PopoverContent className="absolute left-0 -top-5 p-2">
          <SearchSuggestList />
        </PopoverContent>
      </Popover>
    </div>
  );
};
