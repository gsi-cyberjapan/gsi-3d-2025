"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useDrawFeatures, FeatureGroup } from "@/hooks/useDrawFeatures";
import { useStore } from "@/hooks/store/useStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Get display name for a source
 */
const getSourceDisplayName = (source: string): string => {
  if (source === "terradraw") {
    return "手書き";
  }
  return source;
};

/**
 * Get map display name for split mode
 */
const getMapDisplayName = (mapId: "main" | "sub"): string => {
  return mapId === "main" ? "左の地図" : "右の地図";
};

interface FeatureSourceItemProps {
  group: FeatureGroup;
  showMapBadge: boolean;
  isHidden: boolean;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

const FeatureSourceItem = ({
  group,
  showMapBadge,
  isHidden,
  onToggleVisibility,
  onDelete,
}: FeatureSourceItemProps) => {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm truncate">
          {getSourceDisplayName(group.source)}
        </span>
        {showMapBadge && (
          <Badge variant="secondary" className="text-xs shrink-0">
            {getMapDisplayName(group.mapId)}
          </Badge>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {group.count}件
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleVisibility}
              className="size-7"
            >
              {isHidden ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isHidden ? "表示する" : "非表示にする"}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="size-7 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>削除する</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export const FeatureSourceList = () => {
  const featureGroups = useDrawFeatures();
  const layoutMode = useStore((state) => state.layoutMode);
  const hiddenSources = useStore((state) => state.hiddenSources);
  const toggleSourceVisibility = useStore(
    (state) => state.toggleSourceVisibility,
  );
  const mainTd = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<FeatureGroup | null>(null);

  const isSplitMode = layoutMode === "split" || layoutMode === "overlay";

  const handleDeleteClick = (group: FeatureGroup) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!groupToDelete) return;

    const td = groupToDelete.mapId === "main" ? mainTd : subTd;
    if (!td) return;

    // Delete all features in the group
    for (const featureId of groupToDelete.featureIds) {
      td.removeFeatures([featureId]);
    }

    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  if (featureGroups.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col">
        {featureGroups.map((group) => (
          <FeatureSourceItem
            key={group.key}
            group={group}
            showMapBadge={isSplitMode}
            isHidden={hiddenSources.has(group.key)}
            onToggleVisibility={() => {
              toggleSourceVisibility(group.key);
            }}
            onDelete={() => {
              handleDeleteClick(group);
            }}
          />
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader>
            <DialogTitle>フィーチャーの削除</DialogTitle>
            <DialogDescription>
              {groupToDelete && (
                <>
                  「{getSourceDisplayName(groupToDelete.source)}」の
                  {groupToDelete.count}件のフィーチャーを削除しますか？
                  <br />
                  この操作は取り消せません。
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleCancelDelete}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
