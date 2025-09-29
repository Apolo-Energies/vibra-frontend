// Datos de entrada que usa la función de cálculo de comisión
export interface CalcularComisionParams {
    matilData: MatilData | null;           // Datos de la factura (energía, potencia, etc.)
    feeEnergia: number[];                  // Array de valores de fee de energía
    comisionEnergia: number;               // Porcentaje o multiplicador de comisión de energía
    feePotencia: number[];                 // Array de valores de fee de potencia
    productoSeleccionado: string;          // Ej. "Index Base", "Index Coste"
    // getIndexBase: (producto: string) => number; // función que devuelve coeficiente de potencia
  }
  
  // Estructura de matilData
  export interface MatilData {
      energia: { kwh: number }[];
      potencia: { kw: number }[];
  }
  