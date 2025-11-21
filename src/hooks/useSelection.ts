import { useState, useCallback, useEffect } from "react";

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const selectSingle = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    setLastSelectedId(id);
  }, []);

  const toggleSelect = useCallback((id: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
      setLastSelectedId(id);
    } else {
      selectSingle(id);
    }
  }, [selectSingle]);

  const selectRange = useCallback((id: string, allIds: string[]) => {
    if (!lastSelectedId) {
      selectSingle(id);
      return;
    }

    const lastIndex = allIds.indexOf(lastSelectedId);
    const currentIndex = allIds.indexOf(id);
    
    if (lastIndex === -1 || currentIndex === -1) {
      selectSingle(id);
      return;
    }

    const start = Math.min(lastIndex, currentIndex);
    const end = Math.max(lastIndex, currentIndex);
    const rangeIds = allIds.slice(start, end + 1);

    setSelectedIds(new Set(rangeIds));
  }, [lastSelectedId, selectSingle]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Clear selection on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return {
    selectedIds: Array.from(selectedIds),
    isSelected,
    selectSingle,
    toggleSelect,
    selectRange,
    clearSelection,
    selectAll,
  };
}
