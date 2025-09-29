import { CalcularComisionParams } from "./commission.types";


export const calculateComisionFunction = ({
    matilData,
    feeEnergia,
    comisionEnergia,
    feePotencia,
  }: CalcularComisionParams): number => {
    
    if (!matilData?.energia || !matilData?.potencia) return 0;

    const consumoPeriodo =
      matilData.energia.reduce((acc, item) => acc + (item.kwh ?? 0), 0) ?? 0;
      
      const coeficienteEnergia = 10 * consumoPeriodo;
      const energia = (feeEnergia[0] * comisionEnergia * coeficienteEnergia) / 1000;
      
      const potenciaContratada = matilData.potencia.reduce(
        (acc, item) => acc + (item.kw ?? 0),
        0
      );
      
      const coeficientePotencia = 0.5;
      const potencia = feePotencia[0] * coeficientePotencia * potenciaContratada;
      
    return energia + potencia;
  };