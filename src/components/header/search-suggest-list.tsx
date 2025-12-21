"use client";

import { useStore } from "@/hooks/store/useStore";
import { Spinner } from "../ui/spinner";
import type { AddressSearchResult } from "@/lib/geocode";
import { useState } from "react";

interface SuggestFilterOption {
  prefCode: string | null;
  cityCode: number | null;
  isOnlyResidentialAreaName: boolean | null;
}

export const SearchSuggestList = () => {
  const isLoading = useStore((state) => state.isAddressSearchLoading);
  const searchResult = useStore((state) => state.addressSearchResult);
  const [filterOption, setFilterOption] = useState<SuggestFilterOption>({
    prefCode: null,
    cityCode: null,
    isOnlyResidentialAreaName: null,
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
    <div className="w-full max-h-[40vh] overflow-y-scroll scrollbar-transparent-thin">
      <div className="flex gap-2"></div>
      {searchResult?.candidates.map((suggest) => (
        <SuggestItem key={suggest.id} item={suggest} />
      ))}
    </div>
  );
};

const SuggestItem = ({
  item,
}: {
  item: AddressSearchResult["candidates"][number];
}) => {
  return <div>{item.title}</div>;
};
