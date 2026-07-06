import { ApiManager } from "../ApiManager/ApiManager";
import {
  Tariff,
  ProductPeriod,
  OmieDistributionPeriod,
  BoePowerPeriod,
} from "@/app/dashboard/Tarifas/interfaces/tarifa.interface";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

// ── Lectura ──────────────────────────────────────────────────────────────────

export const getTariffs = async (token: string): Promise<Tariff[]> => {
  const res = await ApiManager.get("/provider/tariffs", auth(token));
  const data = res.data?.result ?? res.data ?? [];
  return Array.isArray(data) ? data : data.tariffs ?? [];
};

// ── Gestión de Productos ──────────────────────────────────────────────────────

export const getAllProducts = async (token: string): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").Product[]> => {
  const res = await ApiManager.get("/products", auth(token));
  return res.data?.result ?? res.data ?? [];
};

export const getProductById = async (
  token: string,
  id: number
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").Product> => {
  const res = await ApiManager.get(`/products/${id}`, auth(token));
  return res.data?.result ?? res.data;
};

export const createProduct = async (
  token: string,
  payload: {
    name: string;
    tariffId: number;
    type: string;
    energyPeriods: { period: string; value: number }[];
    powerPeriods?: { period: string; value: number }[];
  }
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").Product> => {
  const res = await ApiManager.post("/products", payload, auth(token));
  return res.data?.result ?? res.data;
};

export const setProductCommission = async (
  token: string,
  productId: number,
  percentage: number
): Promise<void> => {
  await ApiManager.patch(`/products/commission/${productId}`, { percentage }, auth(token));
};

export const updateProduct = async (
  token: string,
  id: number,
  payload: {
    name: string;
    type: string;
    commission?: number | null;
    energyPeriods?: { period: string; value: number }[];
    powerPeriods?: { period: string; value: number }[];
  }
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").Product> => {
  const res = await ApiManager.put(`/products/${id}`, payload, auth(token));
  return res.data?.result ?? res.data;
};

export const toggleProductAvailability = async (
  token: string,
  productId: number,
  isAvailable: boolean
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").Product> => {
  const res = await ApiManager.patch(`/products/availability/${productId}`, { isAvailable }, auth(token));
  return res.data?.result ?? res.data;
};

export const deleteProduct = async (token: string, productId: number): Promise<void> => {
  await ApiManager.delete(`/products/${productId}`, auth(token));
};

// ── Períodos de Producto ──────────────────────────────────────────────────────

export const createProductPeriod = async (
  token: string,
  payload: { productId: number; period: number; value: number; product: null }
): Promise<ProductPeriod> => {
  const res = await ApiManager.post("/productperiod", payload, auth(token));
  return res.data?.result ?? res.data;
};

export const updateProductPeriod = async (
  token: string,
  id: number,
  payload: ProductPeriod
): Promise<ProductPeriod> => {
  const res = await ApiManager.put(`/product-period/${id}`, payload, auth(token));
  return res.data?.result ?? res.data;
};

export const deleteProductPeriod = async (token: string, id: number): Promise<void> => {
  await ApiManager.delete(`/product-period/${id}`, auth(token));
};

// ── Distribuciones OMIE ───────────────────────────────────────────────────────

export const createOmieDistribution = async (
  token: string,
  payload: { tariffId: number; periodName: string }
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").OmieDistribution> => {
  const res = await ApiManager.post("/omie-distribution", payload, auth(token));
  return res.data?.result ?? res.data;
};

// ── Poderes BOE ───────────────────────────────────────────────────────────────

export const createBoePower = async (
  token: string,
  payload: { tariffId: number }
): Promise<import("@/app/dashboard/Tarifas/interfaces/tarifa.interface").BoePower> => {
  const res = await ApiManager.post("/boe-power", payload, auth(token));
  return res.data?.result ?? res.data;
};

// ── Reparto OMIE períodos ─────────────────────────────────────────────────────

export const createRepartoOmiePeriodo = async (
  token: string,
  payload: { omieDistributionId: number; period: string; factor: number }
): Promise<OmieDistributionPeriod> => {
  const res = await ApiManager.post("/omie-distribution-period", payload, auth(token));
  return res.data?.result ?? res.data;
};

export const updateRepartoOmiePeriodo = async (
  token: string,
  id: number,
  payload: { omieDistributionId: number; period: string; factor: number }
): Promise<OmieDistributionPeriod> => {
  const res = await ApiManager.put(`/omie-distribution-period/${id}`, payload, auth(token));
  return res.data?.result ?? res.data;
};

export const deleteRepartoOmiePeriodo = async (
  token: string,
  id: number
): Promise<void> => {
  await ApiManager.delete(`/omie-distribution-period/${id}`, auth(token));
};

// ── Potencia BOE períodos ─────────────────────────────────────────────────────

export const createPotenciaBoePeriodo = async (
  token: string,
  payload: { boePowerId: number; period: string; value: number }
): Promise<BoePowerPeriod> => {
  const res = await ApiManager.post("/boe-power-period", payload, auth(token));
  return res.data?.result ?? res.data;
};

export const updatePotenciaBoePeriodo = async (
  token: string,
  id: number,
  payload: { boePowerId: number; period: string; value: number }
): Promise<BoePowerPeriod> => {
  const res = await ApiManager.put(`/boe-power-period/${id}`, payload, auth(token));
  return res.data?.result ?? res.data;
};

export const deletePotenciaBoePeriodo = async (
  token: string,
  id: number
): Promise<void> => {
  await ApiManager.delete(`/boe-power-period/${id}`, auth(token));
};

// ── Excel / PDF ───────────────────────────────────────────────────────────────

export const downloadExcel = async (token: string, providerId: number): Promise<Blob> => {
  const res = await ApiManager.post(
    `/provider/excel/${providerId}`,
    {},
    { ...auth(token), responseType: "blob" }
  );
  return res.data;
};
