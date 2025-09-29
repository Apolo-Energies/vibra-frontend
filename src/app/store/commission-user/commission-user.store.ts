import { create } from "zustand";

interface UserState {
  commission: number;
  setCommission: (value: number) => void;
}

export const useCommissionUserStore = create<UserState>((set) => ({
  commission: 0.55,
  setCommission: (value) => set({ commission: value }),
}));
