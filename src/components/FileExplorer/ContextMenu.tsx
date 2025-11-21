import { FileNode } from "@/lib/fileSystem";
import { 
  FolderOpen, 
  Edit2, 
  Trash2, 
  Copy, 
  Info 
} from "lucide-react";

interface ContextMenuProps {
  position: { x: number; y: number };
  node: FileNode;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCopyPath: () => void;
  onProperties: () => void;
  onClose: () => void;
}

export function ContextMenu({
  position,
  node,
  onOpen,
  onRename,
  onDelete,
  onCopyPath,
  onProperties,
  onClose,
}: ContextMenuProps) {
  const menuItems = [
    {
      label: "Open",
      icon: FolderOpen,
      onClick: onOpen,
      show: node.type === "folder",
    },
    {
      label: "Rename",
      icon: Edit2,
      onClick: onRename,
      shortcut: "F2",
      show: true,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      shortcut: "Del",
      show: true,
      destructive: true,
    },
    {
      label: "Copy Path",
      icon: Copy,
      onClick: onCopyPath,
      show: true,
    },
    {
      label: "Properties",
      icon: Info,
      onClick: onProperties,
      show: true,
    },
  ].filter(item => item.show);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        className="context-menu fixed z-50 w-56 py-1"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted ${
              item.destructive ? "text-destructive" : ""
            }`}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-muted-foreground">
                {item.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
