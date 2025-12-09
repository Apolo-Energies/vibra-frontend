export type Periodo = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type TarifaPorPeriodo = {
  [key in Periodo]?: number;
};

export type TarifaProducto = {
  modalidad: string;
  tarifa: string;
  periodos: TarifaPorPeriodo;
};

export const TARIFF_MOCKS: TarifaProducto[] = [
  {
    modalidad: "Fijo Vibra",
    tarifa: "2.0TD",
    periodos: { P1: 0.119000, P2: 0.119000, P3: 0.119000 },
  }
];

export type RepartoOmie = {
  periodo: string; // ejemplo: "JULIO 24-JUNIO 25"
  periodos: { [key in Periodo]?: number }; // factor decimal (0-1)
};

export type RepartoOmieMock = {
  tarifa: string;
  datos: RepartoOmie[];
};

// Mock para 2.0 en factor decimal
export const REPARTO_2_0: RepartoOmieMock = {
  tarifa: "2.0TD",
  datos: [
    {
      periodo: "JULIO 24-JUNIO 25",
      periodos: {
        P1: 0.119900,
        P2: 0.119900,
        P3: 0.119900,
      },
    },
  ],
};


export type PotenciaBoe = {
  tarifa: string;
  periodos: { [key in Periodo]?: number };
};

export const POTENCIA_BOE_MOCKS: PotenciaBoe[] = [
  {
    tarifa: "2.0TD",
    periodos: {
      P1: 0.09041,
      P2: 0.09041,
      P3: undefined,
      P4: undefined,
      P5: undefined,
      P6: undefined,
    },
  }
];
