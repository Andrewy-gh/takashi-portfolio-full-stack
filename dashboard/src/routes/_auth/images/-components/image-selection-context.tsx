/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type SelectionMode = 'browse' | 'select';

type ImageSelectionContextValue = {
  mode: SelectionMode;
  selectedIds: Set<string>;
  selectionCount: number;
  hasSelection: boolean;
  startSelection: () => void;
  stopSelection: () => void;
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearSelection: () => void;
};

const ImageSelectionContext = createContext<
  ImageSelectionContextValue | undefined
>(undefined);

export function ImageSelectionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SelectionMode>('browse');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const startSelection = () => setMode('select');
  const stopSelection = () => {
    setMode('browse');
    setSelectedIds(new Set());
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      mode,
      selectedIds,
      selectionCount: selectedIds.size,
      hasSelection: selectedIds.size > 0,
      startSelection,
      stopSelection,
      toggleSelection,
      isSelected: (id: string) => selectedIds.has(id),
      clearSelection,
    }),
    [mode, selectedIds]
  );

  return (
    <ImageSelectionContext.Provider value={value}>
      {children}
    </ImageSelectionContext.Provider>
  );
}

export function useImageSelection() {
  const context = useContext(ImageSelectionContext);
  if (!context) {
    throw new Error(
      'useImageSelection must be used within ImageSelectionProvider'
    );
  }
  return context;
}
