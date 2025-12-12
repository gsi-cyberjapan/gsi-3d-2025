"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { useState } from "react";
import { useGeoCode } from "@/hooks/useGeoCode";

export const SearchInput = () => {
  const [input, setInput] = useState("");
  useGeoCode(input, { debounceMs: 300 });

  return (
    <div className="relative">
      <InputGroup className="h-7 w-120">
        <InputGroupInput
          className="text-sm"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="地名・住所・緯度経度・UTMで検索"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
