import axios from "axios";
import { ApiManager } from "../ApiManager/ApiManager";
import { ApiResponse } from "../interfaces/ApiResponse";

const ACCESS_CODES: Record<string, string> = {
  [process.env.NEXT_PUBLIC_ACCESS_CODE!]: process.env.NEXT_PUBLIC_API_KEY!,
  [process.env.NEXT_PUBLIC_ACCESS_CODE_2!]: process.env.NEXT_PUBLIC_API_KEY_2!,
};

export const userLogin = async (accessCode: string): Promise<ApiResponse<unknown>> => {
  if (!accessCode) {
    return {
      isSuccess: false,
      displayMessage: "Debes ingresar un código de acceso",
      errorMessages: ["Código vacío"],
      result: null,
      status: 400,
    };
  }

  // Buscar la API Key correspondiente al código ingresado
  const apiKey = ACCESS_CODES[accessCode];

  if (!apiKey) {
    return {
      isSuccess: false,
      displayMessage: "Código de acceso inválido",
      errorMessages: ["Código incorrecto"],
      result: null,
      status: 401,
    };
  }

  try {
    const response = await ApiManager.post(
      "/apikey/login",
      { api_key: apiKey },
      { withCredentials: false }
    );

    return {
      isSuccess: true,
      displayMessage: "Login exitoso",
      errorMessages: [],
      result: response?.data?.result?.token,
      status: response.status,
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
