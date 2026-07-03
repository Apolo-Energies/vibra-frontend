// Datos de entrada que usa la función de cálculo de comisión
export interface CalcularComisionParams {
    matilData: MatilData | null;           // Datos de la factura (energía, potencia, etc.)
    feeEnergia: number[];                  // Array de valores de fee de energía
    comisionEnergia: number;               // Porcentaje o multiplicador de comisión de energía
    feePotencia: number[];                 // Array de valores de fee de potencia
    productoSeleccionado: string;
}

// Estructura de matilData
export interface MatilData {
    energia: EnergiaPeriodo[];
    potencia: PotenciaPeriodo[];
    periodo_facturacion?: { numero_dias: number };
}

export interface PotenciaPeriodo {
    p: number;
    contratada: {
        kw: number;
        importe: number;
        tarifa: number;
        porcentaje_iva: number;
    };
    exceso?: {
        kw_exceso: number;
        importe: number;
        porcentaje_iva: number;
    };
}

export interface EnergiaPeriodo {
    p: number;
    activa: {
        kwh: number;
        importe: number;
        tarifa: number;
        porcentaje_iva: number;
    };
    reactiva?: {
        kvarh: number;
        importe: number;
        porcentaje_iva: number;
    };
}


