import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileNode } from "@/lib/fileSystem";

interface BreadcrumbProps {
  currentFolderId: string;
  rootId: string;
  getNode: (id: string) => FileNode | undefined;
  onNavigate: (folderId: string) => void;
}

export function Breadcrumb({
  currentFolderId,
  rootId,
  getNode,
  onNavigate,
}: BreadcrumbProps) {
  // Build path from current folder to root
  const buildPath = (): FileNode[] => {
    const path: FileNode[] = [];
    let current = getNode(currentFolderId);

    while (current) {
      path.unshift(current);
      if (current.parentId === null) break;
      current = getNode(current.parentId);
    }

    return path;
  };

  const path = buildPath();
  const currentNode = getNode(currentFolderId);
  const canGoBack = currentNode && currentNode.parentId !== null;

  return (
    <div className="border-b border-border bg-surface px-4 py-2.5 flex items-center gap-2">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (currentNode?.parentId) {
            onNavigate(currentNode.parentId);
          }
        }}
        disabled={!canGoBack}
        className="h-8 px-2"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto custom-scrollbar">
        {path.map((node, index) => (
          <div key={node.id} className="flex items-center gap-1 shrink-0">
            {index === 0 ? (
              <button
                onClick={() => onNavigate(node.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">{node.name}</span>
              </button>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => onNavigate(node.id)}
                  className={`px-2 py-1 rounded-[8px] text-sm transition-colors ${
                    index === path.length - 1
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {node.name}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
