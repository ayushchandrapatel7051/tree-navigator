import { FileNode } from "@/lib/fileSystem";
import { X, File, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  node: FileNode | null;
  onClose: () => void;
  getPath: (nodeId: string) => string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

export function PreviewPanel({ node, onClose, getPath }: PreviewPanelProps) {
  if (!node) return null;

  return (
    <div className="w-96 border-l border-border bg-surface flex flex-col animate-scale-in">
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <h2 className="font-semibold">Properties</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[14px] bg-muted flex items-center justify-center">
            {node.type === "folder" ? (
              <Folder className="w-12 h-12 text-primary" />
            ) : (
              <File className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <h3 className="text-lg font-semibold text-center break-words">
            {node.name}
          </h3>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm font-medium capitalize">{node.type}</span>
          </div>

          {node.type === "file" && node.meta.size && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm font-medium">
                {formatFileSize(node.meta.size)}
              </span>
            </div>
          )}

          {node.type === "folder" && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Items</span>
              <span className="text-sm font-medium">
                {node.children.length}
              </span>
            </div>
          )}

          {node.meta.mimeType && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">MIME Type</span>
              <span className="text-sm font-medium text-right break-all max-w-[180px]">
                {node.meta.mimeType}
              </span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm font-medium">
              {formatDate(node.meta.createdAt)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Modified</span>
            <span className="text-sm font-medium">
              {formatDate(node.meta.updatedAt)}
            </span>
          </div>

          <div className="py-2 border-b border-border">
            <span className="text-sm text-muted-foreground block mb-1">Path</span>
            <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all block">
              {getPath(node.id)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
