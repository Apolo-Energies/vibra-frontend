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
      "/api-key/login",
      { apiKey },
      { withCredentials: false }
    );

    console.log("Login response:", response);

    return {
      isSuccess: true,
      displayMessage: "Login exitoso",
      errorMessages: [],
      result: response?.data?.token,
      status: response.status,
    };
  } catch (error) {
    console.error("Login error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Login error response body:", JSON.stringify(error.response?.data));
      const errorMsg = error.response?.data?.error ?? error.response?.data?.message ?? "Unknown error";
      return {
        isSuccess: false,
        displayMessage: errorMsg,
        errorMessages: [errorMsg],
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
