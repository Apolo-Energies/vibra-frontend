export const calcularDias = (
  fechaInicio: string | Date | undefined,
  fechaFin: string | Date | undefined
): number => {
  if (!fechaInicio || !fechaFin) return 0;

  const convertirAFecha = (f: string | Date): Date => {
    if (f instanceof Date) return f;
    const partes = f.split("/").map(Number);
    if (partes.length !== 3) return new Date(NaN);
    const [dia, mes, anio] = partes;
    return new Date(anio, mes - 1, dia);
  };

  const inicio = convertirAFecha(fechaInicio);
  const fin = convertirAFecha(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;

  const diffMs = fin.getTime() - inicio.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDias >= 0 ? diffDias : 0;
};
