export type Periodo = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export interface PeriodoResult {
  periodo: Periodo;
  base: number;
  oferta: number;
}

export interface ProductoResult {
  producto: string;
  periodos: PeriodoResult[];
}


export interface PotenciaResult {
  periodo: Periodo;
  basePotencia: number;
  ofertaPotencia: number;
}

export interface FacturaPeriodo {
  periodo: Periodo;
  kwh: number;
  kw: number;
  precioEnergiaOferta: number;
  precioPotenciaOferta: number;
  costeEnergia: number;
  costePotencia: number;
}

export interface FacturaResult {
  periodos: FacturaPeriodo[];
  totalEnergia: number;
  totalPotencia: number;
  total: number;
  ahorroEstudio: number;
  ahorro_porcent: number;
  ahorroXAnio: number;
  subTotal: number;
  impuestoElectrico: number;
  iva: number;
  totalAnio: number;
}