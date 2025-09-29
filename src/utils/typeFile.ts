export const getTipoArchivo = (file: File): number => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return 1; // PDF
    case "jpg":
      return 2; // JPG
    case "png":
      return 3; // PNG
    case "jpeg":
      return 4; // JPEG
    default:
      throw new Error("Tipo de archivo no soportado");
  }
};
