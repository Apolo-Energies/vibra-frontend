import { CalcularComisionParams } from "./commission.types";

const round3 = (n: number) => Math.round(n * 1000) / 1000;

const SNAP_PRODUCTS = new Set(["Fijo Snap Mini", "Fijo Snap", "Fijo Snap Maxi"]);

export const calculateComisionFunction = ({
  matilData,
  feeEnergia,
  comisionEnergia,
  feePotencia,
  productoSeleccionado,
}: CalcularComisionParams): number => {
  if (!matilData?.energia || !matilData?.potencia) return 0;

  if (SNAP_PRODUCTS.has(productoSeleccionado)) {
    return comisionEnergia;
  }

  const fee = feeEnergia[0];
  const feePot = feePotencia[0];
  const consumoPeriodo = matilData.energia.reduce((acc, item) => acc + (item?.activa?.kwh ?? 0), 0);
  const potenciaContratada = matilData.potencia.reduce((acc, item) => acc + (item?.contratada?.kw ?? 0), 0);

  if (productoSeleccionado === "Promo 3M Pro") {
    const consumoEnergia = (consumoPeriodo / 12) * 3;
    const energia = (fee / 100) * consumoEnergia * comisionEnergia;
    const potencia = feePot * 0.5 * potenciaContratada;
    return round3(energia + potencia);
  }

  const dias = Math.max(matilData.periodo_facturacion?.numero_dias ?? 30, 1);
  const consumoAnual = consumoPeriodo * (365 / dias);
  const energia = (fee * comisionEnergia * consumoAnual) / 1000;
  const potencia = feePot * 0.5 * potenciaContratada;
  return round3(energia + potencia);
};
