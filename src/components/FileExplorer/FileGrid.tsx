import { FileNode } from "@/lib/fileSystem";
import { FileCard } from "./FileCard";
import { cn } from "@/lib/utils";

interface FileGridProps {
  nodes: FileNode[];
  viewMode: "grid" | "list";
  selectedIds: string[];
  onSelect: (id: string, ctrlKey: boolean, shiftKey: boolean) => void;
  onDoubleClick: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onDragStart: (e: React.DragEvent, node: FileNode) => void;
}

export function FileGrid({
  nodes,
  viewMode,
  selectedIds,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onDragStart,
}: FileGridProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>This folder is empty</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6",
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          : "flex flex-col gap-2"
      )}
    >
      {nodes.map((node) => (
        <FileCard
          key={node.id}
          node={node}
          viewMode={viewMode}
          isSelected={selectedIds.includes(node.id)}
          onSelect={(ctrlKey, shiftKey) => onSelect(node.id, ctrlKey, shiftKey)}
          onDoubleClick={() => onDoubleClick(node)}
          onContextMenu={(e) => onContextMenu(e, node)}
          onDragStart={(e) => onDragStart(e, node)}
        />
      ))}
    </div>
  );
}
