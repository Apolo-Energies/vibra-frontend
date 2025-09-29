import { ApiManager } from "../ApiManager/ApiManager";
// import { ApiManagerColaboradores } from "../ApiManager/ApiManagerColaboradores";

export const subirYProcesarDocumento = async (token :string, file: File, nombre: string, tipo: number) => {
  try {
    const formData = new FormData();
    formData.append("Archivo", file);
    formData.append("Nombre", nombre);
    formData.append("Tipo", tipo.toString());

    const response = await ApiManager.post("/archivos/upload-and-process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al subir y procesar documento:", error);
    throw error;
  }
};
