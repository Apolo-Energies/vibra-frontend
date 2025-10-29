import axios from "axios";
import { ApiManager } from "../ApiManager/ApiManager";
import { ApiResponse } from "../interfaces/ApiResponse";
const VALID_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE; 
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const userLogin = async (accessCode: string): Promise<ApiResponse<unknown>> => {

  console.log("caodigo valido: ", VALID_CODE, "codigo ingresado: ", accessCode)

  console.log("APIKEY: ", API_KEY)

  if (!accessCode) {
    return {
      isSuccess: false,
      displayMessage: "Debes ingresar un código de acceso",
      errorMessages: ["Código vacío"],
      result: null,
      status: 400
    };
  }

  if (accessCode !== VALID_CODE) {
    return {
      isSuccess: false,
      displayMessage: "Código de acceso inválido",
      errorMessages: ["Código incorrecto"],
      result: null,
      status: 401,
    };
  }

  if (!API_KEY) {
    return {
      isSuccess: false,
      displayMessage: "API Key no configurada en el servidor",
      errorMessages: ["API Key faltante"],
      result: null,
      status: 500
    };
  }

  try {
    const response = await ApiManager.post(
      "/apikey/login",
      { api_key: API_KEY },
      { withCredentials: false }
    );

    return {
      isSuccess: true,
      displayMessage: "Login exitoso",
      errorMessages: [],
      result: response?.data?.result?.token,
      status: response.status
    };
  } catch (error) {
    console.error("Login error:", error);
    if (axios.isAxiosError(error)) {
      return {
        isSuccess: false,
        displayMessage: error.response?.data?.message ?? "Unknown error",
        errorMessages: [error.response?.data?.message ?? "Unknown error"],
        result: null,
        status: error.response?.status ?? 500,
      };
    }
    return {
      isSuccess: false,
      displayMessage: "Unexpected error",
      errorMessages: ["Unexpected error"],
      result: null,
      status: 500,
    };
  }
};
