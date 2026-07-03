import { FacturaResult, FacturaPeriodo, Periodo, PotenciaResult, ProductoResult } from "./calculator.types";
import { OcrData } from "@/app/dashboard/Comparador/interfaces/matilData";
import { Tariff, Product } from "@/app/dashboard/Tarifas/interfaces/tarifa.interface";

const IE_RATE  = 0.00511269632;
const IVA_RATE = 0.21;

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
const round3 = (n: number) => Math.round(n * 1e3) / 1e3;

const periodValue = (periods: { period: string; value: number }[], key: string): number =>
  periods.find((p) => p.period === key)?.value ?? 0;

const periodFactor = (periods: { period: string; factor: number }[], key: string): number =>
  periods.find((p) => p.period === key)?.factor ?? 0;

export const calcularPrecios = (
  tariff: Tariff,
  product: Product,
  periodo: Periodo,
  precioMedioOmie: number,
  feeEnergia: number
): { base: number; oferta: number } => {
  // Index Coste e Index Promo usan los períodos de Index Base como valor base
  const needsIndexBase = product.name === "Index Coste" || product.name === "Index Promo";
  const baseProduct = needsIndexBase
    ? (tariff.products.find(p => p.name === "Index Base") ?? product)
    : product;

  let precioBase: number;
  if (product.type === "Indexed") {
    const atrMultiplier = tariff.code.trim().startsWith("6.") ? 1.07 : 1.15;
    const dist = tariff.omieDistributions[0];
    const repartoFactor = dist ? periodFactor(dist.periods, periodo) : 0;
    let omieMargin = 0;
    if (product.name === "Index Base")  omieMargin = 5;
    if (product.name === "Index Promo") omieMargin = 8;
    precioBase = periodValue(baseProduct.periods, periodo) + ((precioMedioOmie + omieMargin) * repartoFactor * atrMultiplier) / 1000;
  } else {
    precioBase = periodValue(baseProduct.periods, periodo);
  }
  return { base: round6(precioBase), oferta: round6(precioBase + feeEnergia / 1000) };
};

export const calcularPotencia = (
  tariff: Tariff,
  product: Product,
  periodo: Periodo,
  feePotencia: number
): { base: number; oferta: number } => {
  // Index Coste e Index Promo usan los powerPeriods de Index Base
  const needsIndexBase = product.name === "Index Coste" || product.name === "Index Promo";
  const basePotProduct = needsIndexBase
    ? (tariff.products.find(p => p.name === "Index Base") ?? product)
    : product;

  let potenciaBase: number;
  if (basePotProduct.powerPeriods && basePotProduct.powerPeriods.length > 0) {
    potenciaBase = periodValue(basePotProduct.powerPeriods, periodo);
  } else {
    const boePower = tariff.boePowers[0];
    potenciaBase = boePower ? periodValue(boePower.periods, periodo) : 0;
  }
  return { base: round6(potenciaBase), oferta: round6(potenciaBase + feePotencia / 365) };
};

export const calcularFacturaHelper = (
  resultados: ProductoResult,
  resultadosPotencia: { tarifa: string; periodos: PotenciaResult[] },
  matilData: OcrData
): FacturaResult => {
  const PS: Periodo[] = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const dias = Math.max(matilData.periodo_facturacion.numero_dias, 1);

  const periodos = PS.map((periodo, idx) => {
    const kwh = matilData.energia[idx]?.activa?.kwh     ?? 0;
    const kw  = matilData.potencia[idx]?.contratada?.kw ?? 0;
    if (kwh === 0 && kw === 0) return null;
    const precioEnergiaOferta  = resultados.periodos.find(p => p.periodo === periodo)?.oferta ?? 0;
    const precioPotenciaOferta = resultadosPotencia.periodos.find(p => p.periodo === periodo)?.ofertaPotencia ?? 0;
    return {
      periodo, kwh, kw, precioEnergiaOferta, precioPotenciaOferta,
      costeEnergia:  round6(kwh * precioEnergiaOferta),
      costePotencia: round6(kw  * precioPotenciaOferta * dias),
    };
  }).filter(Boolean) as FacturaPeriodo[];

  const totalEnergia  = round6(periodos.reduce((acc, p) => acc + p.costeEnergia,  0));
  const totalPotencia = round6(periodos.reduce((acc, p) => acc + p.costePotencia, 0));

  const bonoImporte  = matilData.bono_social?.importe    ?? 0;
  const bonoEnBaseIE = matilData.bono_social?.en_base_ie ?? false;
  const alqImporte   = matilData.equipos?.importe        ?? 0;
  const alqEnBaseIE  = matilData.equipos?.en_base_ie     ?? false;

  const costesComunesConIE =
    (matilData.totales_electricidad?.energia?.reactiva ?? 0) +
    (matilData.totales_electricidad?.potencia?.exceso  ?? 0) +
    (bonoEnBaseIE ? bonoImporte : 0) +
    (alqEnBaseIE  ? alqImporte  : 0) +
    (matilData.otros_servicios ?? []).filter(s => s.en_base_ie).reduce((a, s) => a + (s.importe ?? 0), 0);

  const otrosSinIE = (matilData.otros_servicios ?? []).filter(s => !s.en_base_ie).reduce((a, s) => a + (s.importe ?? 0), 0);

  const baseIE            = totalEnergia + totalPotencia + costesComunesConIE;
  const impuestoElectrico = round6(baseIE * IE_RATE);
  const extraSinIE        = (!bonoEnBaseIE ? bonoImporte : 0) + otrosSinIE;
  const alquilerSinIE     = !alqEnBaseIE ? alqImporte : 0;
  const subTotal          = baseIE + impuestoElectrico + extraSinIE + alquilerSinIE;
  const iva               = round6(subTotal * IVA_RATE);
  const total             = round6(subTotal + iva);

  const totalEnergiaActual  = matilData.totales_electricidad?.energia?.activa      ?? 0;
  const totalPotenciaActual = matilData.totales_electricidad?.potencia?.contratada ?? 0;
  const descuentosConIE     = (matilData.descuentos ?? []).filter(d =>  d.en_base_ie).reduce((a, d) => a + (d.importe ?? 0), 0);
  const descuentosSinIE     = (matilData.descuentos ?? []).filter(d => !d.en_base_ie).reduce((a, d) => a + (d.importe ?? 0), 0);

  const baseIEActual   = totalEnergiaActual + totalPotenciaActual + costesComunesConIE + descuentosConIE;
  const ieActual       = round6(baseIEActual * IE_RATE);
  const subTotalActual = baseIEActual + ieActual + extraSinIE + alquilerSinIE;
  const ivaActual      = round6(subTotalActual * IVA_RATE);
  const totalActual    = round6(subTotalActual + ivaActual);

  const ahorroEstudio  = round3(totalActual - total);
  const ahorro_porcent = parseFloat(((ahorroEstudio / (totalActual || 1)) * 100).toFixed(2));

  const kwhTotal     = round6((matilData.energia ?? []).reduce((s, e) => s + (e.activa?.kwh ?? 0), 0));
  const consumoAnual = kwhTotal * (365 / dias);
  const totalAnio    = round6(consumoAnual);

  const otrosNoComunesActual = descuentosConIE + descuentosSinIE;

  const deltaEnergia  = kwhTotal > 0 ? ((totalEnergiaActual - totalEnergia) / kwhTotal) * consumoAnual : 0;
  const deltaPotencia = (totalPotenciaActual - totalPotencia) / dias * 365;
  const deltaOtros    = otrosNoComunesActual / dias * 365;
  const ahorroXAnio   = round3((deltaEnergia + deltaPotencia + deltaOtros) * (1 + IE_RATE + IVA_RATE));

  return { periodos, totalEnergia, totalPotencia, total, ahorroEstudio, ahorro_porcent, ahorroXAnio, subTotal, impuestoElectrico, iva, totalAnio };
};
