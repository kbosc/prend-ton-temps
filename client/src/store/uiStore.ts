import { create } from 'zustand';

interface UiStore {
  isDragging: boolean;
  dragCardId: string | null;
  isResolutionVisible: boolean;
  errorMessage: string | null;

  setDragging: (dragging: boolean, cardId?: string) => void;
  showResolution: () => void;
  hideResolution: () => void;
  setError: (msg: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isDragging: false,
  dragCardId: null,
  isResolutionVisible: false,
  errorMessage: null,

  setDragging: (dragging: boolean, cardId?: string | null) =>
    set({ isDragging: dragging, dragCardId: dragging ? (cardId ?? null) : null }),
  showResolution: () => set({ isResolutionVisible: true }),
  hideResolution: () => set({ isResolutionVisible: false }),
  setError: (msg) => set({ errorMessage: msg }),
}));
