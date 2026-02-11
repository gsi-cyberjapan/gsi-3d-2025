"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import parse, {
  domToReact,
  type HTMLReactParserOptions,
  Element,
  type DOMNode,
} from "html-react-parser";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getLayerMetadata } from "@/lib/getOptionalLayers";

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === "a") {
      const { attribs, children } = domNode;
      return (
        <a
          href={attribs.href}
          target="_blank"
          rel="noopener noreferrer"
          className={attribs.class}
        >
          {domToReact(children as DOMNode[], parserOptions)}
        </a>
      );
    }
  },
};

interface LayerInfoPopoverProps {
  layerId: string;
}

export const LayerInfoPopover = ({ layerId }: LayerInfoPopoverProps) => {
  const metadata = getLayerMetadata(layerId);
  const html = metadata?.html;
  const parsedHtml = useMemo(() => {
    if (!html) return null;
    const sanitized = DOMPurify.sanitize(html);
    return parse(sanitized, parserOptions);
  }, [html]);

  if (!metadata) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-muted-foreground border rounded-sm p-0.5"
          aria-label="レイヤー情報を表示"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-72 max-h-80 overflow-y-auto">
        <div className="flex flex-col gap-2 text-xs">
          {parsedHtml && (
            <div className="layer-info-html prose prose-xs max-w-none [&_a]:text-blue-600 [&_a]:underline">
              {parsedHtml}
            </div>
          )}
          {metadata.legendUrl && (
            <a
              href={metadata.legendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs"
            >
              凡例を表示
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
