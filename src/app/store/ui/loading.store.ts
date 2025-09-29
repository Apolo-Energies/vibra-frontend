import { create } from "zustand";

interface LoadingStore {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loading: false,
  setLoading: (state) => set({ loading: state }),
}));
