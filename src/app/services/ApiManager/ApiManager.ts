import axios from "axios";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const ApiManager = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_ENVIRONMENT_LOCAL,
  baseURL: process.env.NEXT_PUBLIC_ENVIRONMENT_PROD,
  // baseURL: "https://ee.renovaenergy.es/api/VicoApi",
  responseType: "json",
  withCredentials: true,
});
;
export function setAuthToken(token: string): void {
  ApiManager.defaults.headers.common.Authorization = `Bearer ${token}`;
}
