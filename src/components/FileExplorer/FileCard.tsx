import { FileNode } from "@/lib/fileSystem";
import { cn } from "@/lib/utils";
import { 
  Folder, 
  FileText, 
  File, 
  FileImage, 
  FileCode,
  FileSpreadsheet,
  FileVideo,
  FileArchive,
} from "lucide-react";

interface FileCardProps {
  node: FileNode;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: (ctrlKey: boolean, shiftKey: boolean) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

function getFileIcon(node: FileNode) {
  if (node.type === "folder") {
    return <Folder className="w-8 h-8 text-primary" />;
  }

  // For files, check MIME type and file extension
  const mime = node.meta.mimeType?.toLowerCase() || "";
  const fileName = node.name.toLowerCase();
  const extension = fileName.split('.').pop() || "";
  
  // Images
  if (mime.startsWith("image/") || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
    return <FileImage className="w-8 h-8 text-success" />;
  }
  
  // Videos
  if (mime.startsWith("video/") || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) {
    return <FileVideo className="w-8 h-8 text-warning" />;
  }
  
  // PDFs
  if (mime.includes("pdf") || extension === "pdf") {
    return <FileText className="w-8 h-8 text-destructive" />;
  }
  
  // Documents
  if (mime.includes("word") || mime.includes("document") || ['doc', 'docx', 'odt', 'rtf'].includes(extension)) {
    return <FileText className="w-8 h-8 text-primary" />;
  }
  
  // Code/Text files
  if (mime.includes("text") || mime.includes("json") || mime.includes("xml") || 
      ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h'].includes(extension)) {
    return <FileCode className="w-8 h-8 text-accent" />;
  }
  
  // Spreadsheets
  if (mime.includes("spreadsheet") || mime.includes("csv") || ['csv', 'xls', 'xlsx', 'ods'].includes(extension)) {
    return <FileSpreadsheet className="w-8 h-8 text-success" />;
  }
  
  // Archives
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || 
      ['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(extension)) {
    return <FileArchive className="w-8 h-8 text-muted-foreground" />;
  }
  
  // Executables
  if (['exe', 'msi', 'dmg', 'app', 'deb', 'rpm'].includes(extension)) {
    return <File className="w-8 h-8 text-warning" />;
  }

  // Default file icon (NOT folder)
  return <File className="w-8 h-8 text-foreground" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

export function FileCard({
  node,
  viewMode,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onDragStart,
}: FileCardProps) {
  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-[10px] cursor-pointer transition-all duration-160",
          "hover:bg-surface-hover",
          isSelected && "bg-primary/10 border border-primary"
        )}
        onClick={(e) => onSelect(e.ctrlKey || e.metaKey, e.shiftKey)}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        draggable
        onDragStart={onDragStart}
      >
        <div className="shrink-0">
          {getFileIcon(node)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{node.name}</p>
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">
          {node.type === "file" && formatFileSize(node.meta.size)}
        </div>
        <div className="shrink-0 text-xs text-muted-foreground w-24 text-right">
          {formatDate(node.meta.updatedAt)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "explorer-card group cursor-pointer",
        isSelected && "selected"
      )}
      onClick={(e) => onSelect(e.ctrlKey || e.metaKey, e.shiftKey)}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 flex items-center justify-center">
          {getFileIcon(node)}
        </div>
        <div className="text-center w-full">
          <p className="text-sm font-medium truncate px-2">{node.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {node.type === "file" 
              ? formatFileSize(node.meta.size)
              : `${node.children.length} items`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
