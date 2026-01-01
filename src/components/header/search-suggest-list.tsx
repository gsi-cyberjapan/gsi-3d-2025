"use client";

import { useStore } from "@/hooks/store/useStore";
import { Spinner } from "@/components/ui/spinner";
import type { AddressSearchResult } from "@/lib/geocode";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMuniData } from "@/lib/getMuniData";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Button } from "../ui/button";

interface SuggestFilterOption {
  prefCode: string;
  cityCode: string;
  type: "all" | "place" | "not-place";
}

export const SearchSuggestList = () => {
  const isLoading = useStore((state) => state.isAddressSearchLoading);
  const searchResult = useStore((state) => state.addressSearchResult);
  const { data: muni } = useQuery({
    queryKey: ["muniData"],
    queryFn: getMuniData,
  });
  const [filterOption, setFilterOption] = useState<SuggestFilterOption>({
    prefCode: "all",
    cityCode: "all",
    type: "all",
  });

  if (isLoading) {
    return (
      <div className="h-70 w-full flex items-center justify-center text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  if (searchResult?.candidates.length === 0) {
    return (
      <div className="h-70 w-full flex items-center justify-center text-muted-foreground text-xs">
        入力された住所は見つかりませんでした
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 p-2">
        <NativeSelect
          size="xs"
          className="cursor-pointer"
          value={filterOption.prefCode}
          onChange={(e) => {
            setFilterOption({ ...filterOption, prefCode: e.target.value });
          }}
        >
          <NativeSelectOption value="all">都道府県</NativeSelectOption>
          {muni &&
            [
              ...new Map(
                Object.entries(muni).map(([, m]) => [m.prefName, m]),
              ).values(),
            ].map((m) => (
              <NativeSelectOption key={m.prefCode} value={m.prefCode}>
                {m.prefName}
              </NativeSelectOption>
            ))}
        </NativeSelect>
        <NativeSelect
          size="xs"
          className="cursor-pointer"
          value={filterOption.cityCode}
          onChange={(e) => {
            setFilterOption({ ...filterOption, cityCode: e.target.value });
          }}
        >
          <NativeSelectOption value="all">市区町村</NativeSelectOption>
          {muni &&
            filterOption.prefCode !== "all" &&
            [
              ...new Map(
                Object.entries(muni)
                  .filter(([, m]) => m.prefCode === filterOption.prefCode)
                  .map(([, m]) => [m.cityName, m]),
              ).values(),
            ].map((m) => (
              <NativeSelectOption key={m.cityCode} value={m.cityCode}>
                {m.cityName}
              </NativeSelectOption>
            ))}
        </NativeSelect>
        <NativeSelect
          size="xs"
          className="cursor-pointer"
          value={filterOption.type}
          onChange={(e) => {
            setFilterOption({
              ...filterOption,
              type: e.target.value as typeof filterOption.type,
            });
          }}
        >
          <NativeSelectOption value="all">すべての場所</NativeSelectOption>
          <NativeSelectOption value="place">居住地名</NativeSelectOption>
          <NativeSelectOption value="not-place">
            居住地名以外
          </NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="overflow-y-scroll scrollbar-transparent-thin max-h-[38vh] px-1">
        {searchResult?.candidates.map((suggest) => (
          <SuggestItem key={suggest.id} item={suggest} />
        ))}
      </div>
    </div>
  );
};

const SuggestItem = ({
  item,
}: {
  item: AddressSearchResult["candidates"][number];
}) => {
  const setSelectedAddressCandidate = useStore(
    (state) => state.setSelectedAddressCandidate,
  );
  const setHoveringAddressSearchSuggestId = useStore(
    (state) => state.setHoveringAddressSearchSuggestId,
  );
  return (
    <Button
      className="w-full p-0 justify-start px-1 rounded-xs"
      variant="ghost"
      size="xs"
      onClick={() => {
        setSelectedAddressCandidate(item.id);
      }}
      onMouseEnter={() => {
        setHoveringAddressSearchSuggestId(item.id);
      }}
      onMouseLeave={() => {
        setHoveringAddressSearchSuggestId(null);
      }}
    >
      <div className="flex items-center gap-4">
        <div>{item.title}</div>
        <div className="text-xs text-muted-foreground">{item.subTitle}</div>
      </div>
    </Button>
  );
};
