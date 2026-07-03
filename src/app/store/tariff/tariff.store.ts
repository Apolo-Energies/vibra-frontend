import { create } from "zustand";
import { Tariff, Provider } from "@/app/dashboard/Tarifas/interfaces/tarifa.interface";

interface TariffStore {
  tariffs: Tariff[];
  currentProvider: Provider | null;
  setTariffs: (tariffs: Tariff[]) => void;
  setCurrentProvider: (provider: Provider) => void;
}

export const useTariffStore = create<TariffStore>((set) => ({
  tariffs: [],
  currentProvider: null,
  setTariffs: (tariffs) => set({ tariffs }),
  setCurrentProvider: (provider) => set({ currentProvider: provider }),
}));
