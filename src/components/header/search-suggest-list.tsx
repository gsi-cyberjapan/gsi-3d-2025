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
  const filteredSearchResult = searchResult?.candidates.filter(
    ({ prefCode, cityCode, isResidentialAreaName }) =>
      (filterOption.prefCode === "all" || prefCode === filterOption.prefCode) &&
      (filterOption.cityCode === "all" || cityCode === filterOption.cityCode) &&
      (filterOption.type === "all" ||
        (filterOption.type === "place" && isResidentialAreaName) ||
        (filterOption.type === "not-place" && !isResidentialAreaName)),
  );

  if (isLoading) {
    return (
      <div className="h-70 w-full flex items-center justify-center text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 auto-cols-auto gap-2 p-2 **:data-[slot=native-select-wrapper]:flex-1 **:data-[slot=native-select-wrapper]:min-w-0">
        <NativeSelect
          size="xs"
          className="cursor-pointer"
          value={filterOption.prefCode}
          onChange={(e) => {
            setFilterOption({
              ...filterOption,
              prefCode: e.target.value,
              cityCode: "all",
            });
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
        {filteredSearchResult?.map((suggest) => (
          <SuggestItem key={suggest.id} item={suggest} />
        ))}
        {filteredSearchResult?.length === 0 && (
          <div className="h-50 w-full flex items-center justify-center text-muted-foreground text-xs">
            入力された住所は見つかりませんでした
          </div>
        )}
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
  const setIsAddressSearchSuggestOpen = useStore(
    (state) => state.setIsAddressSearchSuggestOpen,
  );

  return (
    <Button
      className="w-full p-0 justify-start px-1 rounded-xs"
      variant="ghost"
      size="xs"
      onClick={() => {
        setSelectedAddressCandidate(item.id);
        setIsAddressSearchSuggestOpen(false);
        setHoveringAddressSearchSuggestId(null);
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
