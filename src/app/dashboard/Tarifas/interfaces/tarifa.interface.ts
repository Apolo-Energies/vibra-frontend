export interface Provider {
  id: number;
  name: string;
  users: unknown[];
  tariffs: Tariff[];
}

export interface Tariff {
  id: number;
  code: string;
  providerId: number;
  provider: null;
  products: Product[];
  omieDistributions: OmieDistribution[];
  boePowers: BoePower[];
}

export type ProductType = "Fixed" | "Indexed";

export interface Product {
  id: number;
  name: string;
  tariffId: number;
  tariff: null;
  type?: ProductType;
  isAvailable?: boolean;
  commissionPercentage?: number | null;
  periods: ProductPeriod[];
  powerPeriods?: ProductPeriod[];
}

export interface ProductPeriod {
  id: number;
  period: string;  // "P1", "P2", etc.
  value: number;
  productId: number;
  product: null;
}

export interface OmieDistribution {
  id: number;
  periodName: string;
  tariffId: number;
  tariff: null;
  periods: OmieDistributionPeriod[];
}

export interface OmieDistributionPeriod {
  id: number;
  period: string;  // "P1", "P2", etc. (API returns string)
  factor: number;
  omieDistributionId: number;
  omieDistribution: null;
}

export interface BoePower {
  id: number;
  tariffId: number;
  tariff: null;
  periods: BoePowerPeriod[];
}

export interface BoePowerPeriod {
  id: number;
  period: string;  // "P1", "P2", etc. (API returns string)
  value: number;
  boePowerId: number;
  boePower: null;
}
