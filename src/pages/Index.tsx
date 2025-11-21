import { useState, useEffect, useCallback } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useSelection } from "@/hooks/useSelection";
import { FileNode } from "@/lib/fileSystem";
import { TopBar } from "@/components/FileExplorer/TopBar";
import { Breadcrumb } from "@/components/FileExplorer/Breadcrumb";
import { FolderTree } from "@/components/FileExplorer/FolderTree";
import { FileGrid } from "@/components/FileExplorer/FileGrid";
import { PreviewPanel } from "@/components/FileExplorer/PreviewPanel";
import { ContextMenu } from "@/components/FileExplorer/ContextMenu";
import { UndoToast } from "@/components/FileExplorer/UndoToast";
import { RenameDialog } from "@/components/FileExplorer/RenameDialog";
import { DeleteConfirmDialog } from "@/components/FileExplorer/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState("");
  const [previewNode, setPreviewNode] = useState<FileNode | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    node: FileNode;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    nodeId: string;
    currentName: string;
  }>({ isOpen: false, nodeId: "", currentName: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    nodeIds: string[];
  }>({ isOpen: false, nodeIds: [] });

  const {
    rootId,
    createNode,
    renameNode,
    deleteNode,
    moveNode,
    search,
    getNode,
    getChildren,
    getPath,
    undo,
    undoStack,
    clearUndo,
  } = useFileSystem();

  const {
    selectedIds,
    isSelected,
    selectSingle,
    toggleSelect,
    selectRange,
    clearSelection,
    selectAll,
  } = useSelection();

  // Initialize current folder
  useEffect(() => {
    if (!currentFolderId) {
      setCurrentFolderId(rootId);
    }
  }, [rootId, currentFolderId]);

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Get current folder contents
  const currentFolderContents = searchQuery
    ? search(searchQuery)
    : getChildren(currentFolderId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === "Delete" && selectedIds.length > 0) {
        handleDelete(selectedIds);
      }
      
      // Rename (F2)
      if (e.key === "F2" && selectedIds.length === 1) {
        const node = getNode(selectedIds[0]);
        if (node) {
          setRenameDialog({
            isOpen: true,
            nodeId: node.id,
            currentName: node.name,
          });
        }
      }
      
      // Select All (Ctrl/Cmd + A)
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allIds = currentFolderContents.map(n => n.id);
        selectAll(allIds);
      }
      
      // Search (Ctrl/Cmd + F)
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, currentFolderContents, getNode, selectAll]);

  const handleCreateFolder = useCallback(() => {
    const node = createNode("New Folder", "folder", currentFolderId);
    if (node) {
      // Enter rename mode immediately
      setRenameDialog({
        isOpen: true,
        nodeId: node.id,
        currentName: node.name,
      });
      toast.success("Folder created");
    } else {
      toast.error("Failed to create folder");
    }
  }, [createNode, currentFolderId]);

  const handleRename = useCallback(
    (nodeId: string, newName: string) => {
      return renameNode(nodeId, newName);
    },
    [renameNode]
  );

  const handleDelete = useCallback(
    (nodeIds: string[]) => {
      if (nodeIds.length > 20) {
        setDeleteConfirm({ isOpen: true, nodeIds });
        return;
      }

      nodeIds.forEach(id => deleteNode(id));
      clearSelection();
      toast.success(`Deleted ${nodeIds.length} item(s)`);
    },
    [deleteNode, clearSelection]
  );

  const handleMove = useCallback(
    (nodeId: string, newParentId: string) => {
      const success = moveNode(nodeId, newParentId);
      if (success) {
        toast.success("Moved successfully");
      } else {
        toast.error("Failed to move item");
      }
    },
    [moveNode]
  );

  const handleDoubleClick = useCallback(
    (node: FileNode) => {
      if (node.type === "folder") {
        setCurrentFolderId(node.id);
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleSelect = useCallback(
    (id: string, ctrlKey: boolean, shiftKey: boolean) => {
      if (shiftKey) {
        const allIds = currentFolderContents.map(n => n.id);
        selectRange(id, allIds);
      } else {
        toggleSelect(id, ctrlKey);
      }
    },
    [currentFolderContents, selectRange, toggleSelect]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: FileNode) => {
      e.preventDefault();
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        node,
      });
    },
    []
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, node: FileNode) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("nodeId", node.id);
    },
    []
  );

  const handleCopyPath = useCallback(
    (nodeId: string) => {
      const path = getPath(nodeId);
      navigator.clipboard.writeText(path);
      toast.success("Path copied to clipboard");
    },
    [getPath]
  );

  const currentUndoAction = undoStack[undoStack.length - 1];

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar - Folder Tree */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="h-14 border-b border-sidebar-border flex items-center px-4">
          <h2 className="font-semibold text-sm">Folders</h2>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <FolderTree
            nodes={getChildren(rootId)}
            getChildren={getChildren}
            onFolderClick={setCurrentFolderId}
            currentFolderId={currentFolderId}
            onDrop={handleMove}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        {/* Breadcrumb Navigation */}
        {!searchQuery && (
          <Breadcrumb
            currentFolderId={currentFolderId}
            rootId={rootId}
            getNode={getNode}
            onNavigate={(folderId) => {
              setCurrentFolderId(folderId);
              clearSelection();
            }}
          />
        )}

        {/* Toolbar */}
        <div className="border-b border-border bg-surface px-4 py-2 flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateFolder}
            className="gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </Button>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <FileGrid
            nodes={currentFolderContents}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
          />
        </div>
      </div>

      {/* Right Panel - Preview */}
      {previewNode && (
        <PreviewPanel
          node={previewNode}
          onClose={() => setPreviewNode(null)}
          getPath={getPath}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          node={contextMenu.node}
          onOpen={() => {
            if (contextMenu.node.type === "folder") {
              setCurrentFolderId(contextMenu.node.id);
            }
          }}
          onRename={() => {
            setRenameDialog({
              isOpen: true,
              nodeId: contextMenu.node.id,
              currentName: contextMenu.node.name,
            });
          }}
          onDelete={() => {
            handleDelete([contextMenu.node.id]);
          }}
          onCopyPath={() => {
            handleCopyPath(contextMenu.node.id);
          }}
          onProperties={() => {
            setPreviewNode(contextMenu.node);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        currentName={renameDialog.currentName}
        onRename={(newName) => handleRename(renameDialog.nodeId, newName)}
        onClose={() => setRenameDialog({ isOpen: false, nodeId: "", currentName: "" })}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        count={deleteConfirm.nodeIds.length}
        onConfirm={() => {
          deleteConfirm.nodeIds.forEach(id => deleteNode(id));
          clearSelection();
        }}
        onClose={() => setDeleteConfirm({ isOpen: false, nodeIds: [] })}
      />

      {/* Undo Toast */}
      {currentUndoAction && (
        <UndoToast
          message={currentUndoAction.description}
          onUndo={undo}
          onDismiss={clearUndo}
        />
      )}
    </div>
  );
};

export default Index;
