import { create } from "zustand";
import { calculateComisionFunction } from "./commission.helpers";
import { CalcularComisionParams } from "./commission.types";

interface CommissionState {
    comision: number;
    calcular: (params: CalcularComisionParams) => void;
  }
  
  export const useCommissionStore = create<CommissionState>((set) => ({
    comision: 0,
  
    calcular: (params) => {
      const result = calculateComisionFunction(params);
      set({ comision: result });
    },
  }));