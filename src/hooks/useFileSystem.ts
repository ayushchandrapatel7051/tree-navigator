import { useState, useCallback, useEffect } from "react";
import { FileSystemTree, FileNode, NodeType, getFileSystem, saveFileSystem } from "@/lib/fileSystem";

export interface UndoAction {
  type: "delete" | "move";
  nodeId: string;
  data: any;
  description: string;
}

export function useFileSystem() {
  const [tree, setTree] = useState<FileSystemTree>(() => getFileSystem());
  const [, setUpdateTrigger] = useState(0);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  // Force re-render
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
    saveFileSystem(tree);
  }, [tree]);

  const createNode = useCallback(
    (name: string, type: NodeType, parentId: string) => {
      const node = tree.createNode(name, type, parentId);
      if (node) {
        forceUpdate();
        return node;
      }
      return null;
    },
    [tree, forceUpdate]
  );

  const renameNode = useCallback(
    (id: string, newName: string) => {
      const success = tree.renameNode(id, newName);
      if (success) {
        forceUpdate();
      }
      return success;
    },
    [tree, forceUpdate]
  );

  const deleteNode = useCallback(
    (id: string) => {
      const node = tree.deleteNode(id);
      if (node) {
        // Add to undo stack
        setUndoStack(prev => [
          ...prev,
          {
            type: "delete",
            nodeId: id,
            data: { parentId: node.parentId },
            description: `Deleted "${node.name}"`,
          },
        ]);
        forceUpdate();
        return true;
      }
      return false;
    },
    [tree, forceUpdate]
  );

  const moveNode = useCallback(
    (nodeId: string, newParentId: string) => {
      const node = tree.getNode(nodeId);
      if (!node) return false;
      
      const oldParentId = node.parentId;
      const success = tree.moveNode(nodeId, newParentId);
      
      if (success) {
        // Add to undo stack
        setUndoStack(prev => [
          ...prev,
          {
            type: "move",
            nodeId,
            data: { oldParentId, newParentId },
            description: `Moved "${node.name}"`,
          },
        ]);
        forceUpdate();
      }
      return success;
    },
    [tree, forceUpdate]
  );

  const undo = useCallback(() => {
    const action = undoStack[undoStack.length - 1];
    if (!action) return false;

    if (action.type === "delete") {
      tree.restoreNode(action.nodeId);
    } else if (action.type === "move") {
      tree.moveNode(action.nodeId, action.data.oldParentId);
    }

    setUndoStack(prev => prev.slice(0, -1));
    forceUpdate();
    return true;
  }, [undoStack, tree, forceUpdate]);

  const clearUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  const search = useCallback(
    (query: string) => {
      return tree.search(query);
    },
    [tree]
  );

  const getNode = useCallback(
    (id: string) => {
      return tree.getNode(id);
    },
    [tree]
  );

  const getChildren = useCallback(
    (parentId: string) => {
      return tree.getChildren(parentId);
    },
    [tree]
  );

  const getPath = useCallback(
    (nodeId: string) => {
      return tree.getPath(nodeId);
    },
    [tree]
  );

  return {
    tree,
    rootId: tree.getRootId(),
    createNode,
    renameNode,
    deleteNode,
    moveNode,
    search,
    getNode,
    getChildren,
    getPath,
    undo,
    clearUndo,
    undoStack,
  };
}
