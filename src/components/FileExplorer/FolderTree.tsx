import { useState, useCallback } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { FileNode } from "@/lib/fileSystem";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  nodes: FileNode[];
  getChildren: (id: string) => FileNode[];
  onFolderClick: (id: string) => void;
  currentFolderId: string;
  onDrop?: (draggedId: string, targetId: string) => void;
}

interface TreeItemProps {
  node: FileNode;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onClick: () => void;
  getChildren: (id: string) => FileNode[];
  currentFolderId: string;
  onDrop?: (draggedId: string, targetId: string) => void;
}

function TreeItem({
  node,
  level,
  isActive,
  isExpanded,
  onToggle,
  onClick,
  getChildren,
  currentFolderId,
  onDrop,
}: TreeItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandTimeout, setExpandTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const children = node.type === "folder" ? getChildren(node.id) : [];
  const hasChildren = children.length > 0;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (node.type === "folder") {
      setIsDragOver(true);
      
      // Auto-expand after hovering for 800ms
      if (!isExpanded && !expandTimeout) {
        const timeout = setTimeout(() => {
          onToggle();
        }, 800);
        setExpandTimeout(timeout);
      }
    }
  }, [node.type, isExpanded, expandTimeout, onToggle]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
  }, [expandTimeout]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
    
    const draggedId = e.dataTransfer.getData("nodeId");
    if (draggedId && draggedId !== node.id && node.type === "folder" && onDrop) {
      onDrop(draggedId, node.id);
    }
  }, [expandTimeout, node.id, node.type, onDrop]);

  return (
    <div>
      <div
        className={cn(
          "tree-item flex items-center gap-1.5 select-none",
          isActive && "active",
          isDragOver && "bg-primary/20 border-l-2 border-primary"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle();
          }}
          className={cn(
            "w-4 h-4 flex items-center justify-center transition-transform duration-220",
            !hasChildren && "invisible",
            isExpanded && "rotate-90"
          )}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-primary" />
        ) : (
          <Folder className="w-4 h-4 text-muted-foreground" />
        )}
        
        <span className="text-sm truncate flex-1">{node.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <div className="animate-tree-expand overflow-hidden">
          {children.map((child) => (
            <TreeItemWrapper
              key={child.id}
              node={child}
              level={level + 1}
              getChildren={getChildren}
              currentFolderId={currentFolderId}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeItemWrapper({
  node,
  level,
  getChildren,
  currentFolderId,
  onDrop,
}: Omit<TreeItemProps, "isActive" | "isExpanded" | "onToggle" | "onClick">) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <TreeItem
      node={node}
      level={level}
      isActive={currentFolderId === node.id}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      onClick={() => {
        if (node.type === "folder") {
          // This would trigger the main folder view change
          document.dispatchEvent(
            new CustomEvent("folderClick", { detail: node.id })
          );
        }
      }}
      getChildren={getChildren}
      currentFolderId={currentFolderId}
      onDrop={onDrop}
    />
  );
}

export function FolderTree({
  nodes,
  getChildren,
  onFolderClick,
  currentFolderId,
  onDrop,
}: FolderTreeProps) {
  const folders = nodes.filter((n) => n.type === "folder");

  // Listen for folder click events from tree items
  useState(() => {
    const handleFolderClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      onFolderClick(customEvent.detail);
    };

    document.addEventListener("folderClick", handleFolderClick);
    return () => document.removeEventListener("folderClick", handleFolderClick);
  });

  return (
    <div className="py-2">
      {folders.map((folder) => (
        <TreeItemWrapper
          key={folder.id}
          node={folder}
          level={0}
          getChildren={getChildren}
          currentFolderId={currentFolderId}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}
