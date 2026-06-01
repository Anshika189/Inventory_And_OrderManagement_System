import { create } from "./vanilla";

/**
 * Lightweight state store for UI bits that are read across many components
 * (command palette visibility, sidebar collapse). Avoids prop-drilling
 * without pulling in a full state library.
 */

export const uiStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  paletteOpen: false,
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
}));

export function useUIStore(selector) {
  return uiStore(selector);
}
