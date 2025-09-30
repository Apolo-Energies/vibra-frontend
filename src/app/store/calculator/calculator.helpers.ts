import {
  POTENCIA_BOE_MOCKS,
  REPARTO_2_0,
  TARIFF_MOCKS,
} from "@/utils/mocks/tarifasFijas";
import { FacturaResult, Periodo, PotenciaResult, ProductoResult } from "./calculator.types";
import { Detalle } from "@/app/dashboard/Comparador/interfaces/matilData";
import { calcularDias } from "@/utils/dates";

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
const round3 = (num: number) => Math.round(num * 1000) / 1000;

export const getBaseValue = (
  tarifa: string,
  producto: string,
  periodo: Periodo
): number => {
  const prod = TARIFF_MOCKS.find(
    (p) => p.tarifa === tarifa && p.modalidad === producto
  );
  return prod?.periodos[periodo] ?? 0;
};

export const getRepartoOmie = (tarifa: string, periodo: Periodo): number => {
  if (tarifa === "2.0TD") {
    return REPARTO_2_0.datos[0].periodos[periodo] ?? 0;
  }
  return 0;
};

export const getPotenciaBOE = (tarifa: string, periodo: Periodo): number => {
  const pot = POTENCIA_BOE_MOCKS.find((p) => p.tarifa === tarifa);
  return pot?.periodos[periodo] ?? 0;
};


export const calcularPrecios = (
  tarifa: string,
  periodo: Periodo,
  precioMedioOmie: number,
  feeEnergia: number
) => {
  const valorTarifa = getBaseValue(tarifa, "Fijo Vibra", periodo);

  const precioBase = valorTarifa;

  const precioOferta = precioBase + feeEnergia / 1000;

  return {
    base: round6(precioBase),
    oferta: round6(precioOferta),
  };
};


export const calcularPotencia = (
  tarifa: string,
  periodo: Periodo,
  feePotencia: number
) => {
  const potenciaBase = getPotenciaBOE(tarifa, periodo);

  const potenciaOferta = potenciaBase + feePotencia / 365;

  return {
    base: round6(potenciaBase),
    oferta: round6(potenciaOferta),
  };
};

export const calcularFacturaHelper = (
  resultados: ProductoResult,
  resultadosPotencia: { tarifa: string; periodos: PotenciaResult[] },
  matilData: {
    fecha_inicio: string,
    fecha_fin: string,
    energia: { p: number; kwh: number }[],
    potencia: { p: number; kw: number }[],
    detalle: Detalle
  }
): FacturaResult => {
  const PS: Periodo[] = ["P1","P2","P3","P4","P5","P6"];
  const dias = calcularDias(matilData.fecha_inicio, matilData.fecha_fin);

  const periodos = PS.map((periodo, idx) => {
    const kwh = matilData.energia[idx]?.kwh ?? 0;
    const kw  = matilData.potencia[idx]?.kw ?? 0;

    if (kwh === 0 && kw === 0) return null;

    const precioEnergiaOferta   = resultados.periodos[idx]?.oferta ?? 0;
    const precioPotenciaOferta  = resultadosPotencia.periodos[idx]?.ofertaPotencia ?? 0;

    return {
      periodo,
      kwh,
      kw,
      precioEnergiaOferta,
      precioPotenciaOferta,
      costeEnergia: round6(kwh * precioEnergiaOferta),
      costePotencia: round6(kw * precioPotenciaOferta * dias),
      totalPeriodo: round6(kwh * precioEnergiaOferta + kw * precioPotenciaOferta * dias)
    };
  }).filter(Boolean) as {
    periodo: Periodo;
    kwh: number;
    kw: number;
    precioEnergiaOferta: number;
    precioPotenciaOferta: number;
    costeEnergia: number;
    costePotencia: number;
    totalPeriodo: number;
  }[];

  const totalEnergia = round6(periodos.reduce((acc, p) => acc + p.costeEnergia, 0));
  const totalPotencia = round6(periodos.reduce((acc, p) => acc + p.costePotencia, 0));
  const impuestoElectrico = round6((totalEnergia + totalPotencia + 0.2) * 0.0511269632);
  const subTotal = totalEnergia + totalPotencia + 0.2 + impuestoElectrico + matilData.detalle.equipos;
  const iva = subTotal * 0.21;
  const total = round6(subTotal + iva);
  const ahorroEstudio = round3(matilData.detalle.total - total);
  const ahorro_porcent = parseFloat(((ahorroEstudio / matilData.detalle.total) * 100).toFixed(2));

  const kwhEnergia = round6(periodos.reduce((acc, p) => acc + p.kwh, 0));
  const diasFacturados = dias;
  const totalAnio = 10 * kwhEnergia;
  const ahorroAnio = (
    (
      ((matilData.detalle.totales_energia.activa_eur - totalEnergia) / kwhEnergia * totalAnio) +
      ((matilData.detalle.totales_potencia.potencia_eur - totalPotencia) / diasFacturados * 365) +
      (matilData.detalle.otros / diasFacturados) * 365
    ) * (1 + 0.0511269632 + 0.21)
  );
  const ahorroXAnio = Number(ahorroAnio.toFixed(2));

  return { periodos, totalEnergia, totalPotencia, total, ahorroEstudio, ahorro_porcent, ahorroXAnio, subTotal, impuestoElectrico, iva, totalAnio };
};
