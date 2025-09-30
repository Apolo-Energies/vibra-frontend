import axios from "axios";
import { ApiManager } from "../ApiManager/ApiManager";
import { ApiResponse } from "../interfaces/ApiResponse";

export const userLogin = async (api_key: string): Promise<ApiResponse<unknown>> => {
    console.log("apikey: ", api_key)
    if (!api_key) {
      return {
        isSuccess: false,
        displayMessage: "La url no es valida",
        errorMessages: ["No exite un api key"],
        result: null,
        status: 400
      };
    }
  
    try {
      const response = await ApiManager.post(
        "/renovae/login",
        { api_key },
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