// store/mapStore.ts
import { create } from 'zustand';
import type { Volcano } from '@/lib/types';

interface MapStore {
  volcanoes: Volcano[];
  selectedVolcano: Volcano | null;
  showGeothermal: boolean;
  lastRefresh: Date | null;
  isLoading: boolean;
  error: string | null;

  setVolcanoes: (volcanoes: Volcano[]) => void;
  setSelectedVolcano: (volcano: Volcano | null) => void;
  toggleGeothermal: () => void;
  setLastRefresh: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  volcanoes: [],
  selectedVolcano: null,
  showGeothermal: false,
  lastRefresh: null,
  isLoading: false,
  error: null,

  setVolcanoes: (volcanoes) => set({ volcanoes }),
  setSelectedVolcano: (selectedVolcano) => set({ selectedVolcano }),
  toggleGeothermal: () => set((s) => ({ showGeothermal: !s.showGeothermal })),
  setLastRefresh: (lastRefresh) => set({ lastRefresh }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
