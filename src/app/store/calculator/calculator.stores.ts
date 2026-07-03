import { create } from "zustand";
import { FacturaResult, Periodo, PotenciaResult, ProductoResult } from "./calculator.types";
import { calcularFacturaHelper, calcularPotencia, calcularPrecios } from "./calculator.helpers";
import { OcrData } from "@/app/dashboard/Comparador/interfaces/matilData";
import { Tariff, Product } from "@/app/dashboard/Tarifas/interfaces/tarifa.interface";

const PERIODS: Periodo[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

interface CalculatorState {
  tarifa: string | null;
  producto: string;
  resultados: ProductoResult | null;
  resultadosPotencia: { tarifa: string; periodos: PotenciaResult[] } | null;
  factura: FacturaResult | null;

  setTarifa: (tarifa: string) => void;
  setProducto: (tariff: Tariff, product: Product, precioMedioOmie: number, feeEnergia: number) => ProductoResult;
  setPotencia: (tariff: Tariff, product: Product, feePotencia: number) => { tarifa: string; periodos: PotenciaResult[] };
  calcularFactura: (matilData: OcrData) => FacturaResult | null;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  tarifa: null,
  producto: "",
  resultados: null,
  resultadosPotencia: null,
  factura: null,

  setTarifa: (tarifa) => set({ tarifa }),

  setProducto: (tariff, product, precioMedioOmie, feeEnergia) => {
    const periodos = PERIODS.map((periodo) => {
      const { base, oferta } = calcularPrecios(tariff, product, periodo, precioMedioOmie, feeEnergia);
      return { periodo, base, oferta };
    });
    const resultados: ProductoResult = { producto: product.name, periodos };
    set({ producto: product.name, resultados });
    return resultados;
  },

  setPotencia: (tariff, product, feePotencia) => {
    const periodos = PERIODS.map((periodo) => {
      const { base, oferta } = calcularPotencia(tariff, product, periodo, feePotencia);
      return { periodo, basePotencia: base, ofertaPotencia: oferta };
    });
    const resultadosPotencia = { tarifa: tariff.code, periodos };
    set({ resultadosPotencia });
    return resultadosPotencia;
  },

  calcularFactura: (matilData) => {
    const { resultados, resultadosPotencia } = get();
    if (!resultados || !resultadosPotencia) return null;
    const factura = calcularFacturaHelper(resultados, resultadosPotencia, matilData);
    set({ factura });
    return factura;
  },
}));
