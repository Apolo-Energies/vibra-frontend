import { ApiManager } from "../ApiManager/ApiManager";
// import { ApiManagerColaboradores } from "../ApiManager/ApiManagerColaboradores";
import { File } from "../interfaces/pdf";

export const downloadPDF = async (token: string, data: File) => {
    try {
      // Enviamos los datos al endpoint que genera el PDF
      const response = await ApiManager.post("/historialComparador/pdf", data, {
        responseType: "blob", // importante: recibir archivo
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Creamos un blob con la respuesta
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
  
      // Creamos un link temporal y forzamos la descarga
      const link = document.createElement("a");
      link.href = url;
  
      // Asignamos un nombre dinámico para el archivo
      link.download = `Comparacion_${data.archivoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Liberamos memoria
      window.URL.revokeObjectURL(url);
  
      return true; 
    } catch (error) {
      console.error("Error al generar/descargar PDF:", error);
      throw error;
    }
  };

