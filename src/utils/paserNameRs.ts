export const parseTitular = (titularRaw: string | undefined | null) => {
  if (!titularRaw) {
    return { nombreEmpresa: "-", razonSocial: "-" };
  }

  // Expresiones comunes de razón social
  const regex = /(.*?)(\b(SA|S\.?A\.?|SL|S\.?L\.?|SAC|S\.?A\.?C\.?|SRL|S\.?R\.?L\.?)\b.*)$/i;

  const match = titularRaw.match(regex);

  const nombreEmpresa = match ? match[1].trim() : titularRaw.trim();
  const razonSocial = match ? match[2].replace(/\./g, "").toUpperCase() : "-";

  return { nombreEmpresa, razonSocial };
}
