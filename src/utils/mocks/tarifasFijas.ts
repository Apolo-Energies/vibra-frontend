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
    modalidad: "Index Base",
    tarifa: "2.0TD",
    periodos: { P1: 0.1121142088, P2: 0.046933028, P3: 0.02155835 },
  },
  {
    modalidad: "Index Base",
    tarifa: "3.0TD",
    periodos: {
      P1: 0.0809619257,
      P2: 0.0556045379,
      P3: 0.0366587427,
      P4: 0.0280635428,
      P5: 0.0231665428,
      P6: 0.02119535,
    },
  },
  {
    modalidad: "Index Base",
    tarifa: "6.1TD",
    periodos: {
      P1: 0.0621439395,
      P2: 0.04206413625,
      P3: 0.0287916825,
      P4: 0.02323049865,
      P5: 0.01934449865,
      P6: 0.018276775,
    },
  },
  {
    modalidad: "Fijo Fácil",
    tarifa: "2.0TD",
    periodos: { P1: 0.2215, P2: 0.1435, P3: 0.1155 },
  },
  {
    modalidad: "Fijo Estable",
    tarifa: "2.0TD",
    periodos: { P1: 0.1545, P2: 0.1545, P3: 0.1545 },
  },
  {
    modalidad: "Fijo Fácil",
    tarifa: "3.0TD",
    periodos: {
      P1: 0.1795,
      P2: 0.1595,
      P3: 0.1395,
      P4: 0.1295,
      P5: 0.1055,
      P6: 0.1095,
    },
  },
  {
    modalidad: "Fijo Estable",
    tarifa: "3.0TD",
    periodos: {
      P1: 0.1295,
      P2: 0.1295,
      P3: 0.1295,
      P4: 0.1295,
      P5: 0.1295,
      P6: 0.1295,
    },
  },
  {
    modalidad: "Fijo Fácil",
    tarifa: "6.1TD",
    periodos: {
      P1: 0.1595,
      P2: 0.1295,
      P3: 0.1195,
      P4: 0.1095,
      P5: 0.0975,
      P6: 0.0995,
    },
  },
  {
    modalidad: "Fijo Estable",
    tarifa: "6.1TD",
    periodos: {
      P1: 0.1145,
      P2: 0.1145,
      P3: 0.1145,
      P4: 0.1145,
      P5: 0.1145,
      P6: 0.1145,
    },
  },
  {
    modalidad: "Passpool",
    tarifa: "2.0TD",
    periodos: { P1: 0.132786592, P2: 0.07295032, P3: 0.042579 },
  }, 
  {
    modalidad: "Passpool",
    tarifa: "3.0TD",
    periodos: {
      P1: 0.101640338,
      P2: 0.079924486,
      P3: 0.053667118,
      P4: 0.053596152,
      P5: 0.047481152,
      P6: 0.0408762,
    },
  },
  {
    modalidad: "Passpool",
    tarifa: "6.1TD",
    periodos: {
      P1: 0.079516578,
      P2: 0.065463185,
      P3: 0.04287227,
      P4: 0.0449841106,
      P5: 0.0394538106,
      P6: 0.03586368,
    },
  },
  {
    modalidad: "Fijo Dyn",
    tarifa: "3.0TD",
    periodos: {
      P1: 0.1475,
      P2: 0.1475,
      P3: 0.1475,
      P4: 0.1475,
      P5: 0.1475,
      P6: 0.1095,
    },
  },
  {
    modalidad: "Fijo Dyn",
    tarifa: "6.1TD",
    periodos: {
      P1: 0.1255,
      P2: 0.1255,
      P3: 0.1255,
      P4: 0.1255,
      P5: 0.1255,
      P6: 0.0995,
    },
  },

  {
    modalidad: "Fijo Snap Mini",
    tarifa: "2.0TD",
    periodos: { P1: 0.1095, P2: 0.1095, P3: 0.1095 },
  },
  {
    modalidad: "Fijo Snap Max",
    tarifa: "2.0TD",
    periodos: { P1: 0.1395, P2: 0.1395, P3: 0.1395 },
  }, 
  {
    modalidad: "Fijo Snap Fresh",
    tarifa: "2.0TD",
    periodos: { P1: 0.1295, P2: 0.1295, P3: 0.1295 },
  }, 
  {
    modalidad: "Fijo Snap",
    tarifa: "2.0TD",
    periodos: { P1: 0.1295, P2: 0.1295, P3: 0.1295 },
  }, 
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
        P1: 1.11272531611515,
        P2: 1.04654291094969,
        P3: 0.930992736077482,
      },
    },
  ],
};

// Mock para 3.0 y 6.1 en factor decimal
export const REPARTO_3_0_6_1: RepartoOmieMock[] = [
  {
    tarifa: "3.0TD",
    datos: [
      {
        periodo: "JULIO 24-JUNIO 25",
        periodos: {
          P1: 1.47524885660479,
          P2: 1.32754909873554,
          P3: 1.12294861447404,
          P4: 0.775087436104385,
          P5: 0.520715630885122,
          P6: 0.930992736077482,
        },
      },
    ],
  },
  {
    tarifa: "6.1TD",
    datos: [
      {
        periodo: "JULIO 24-JUNIO 25",
        periodos: {
          P1: 1.47524885660479,
          P2: 1.32754909873554,
          P3: 1.12294861447404,
          P4: 0.775087436104385,
          P5: 0.520715630885122,
          P6: 0.930992736077482,
        },
      },
    ],
  },
];

export type PotenciaBoe = {
  tarifa: string;
  periodos: { [key in Periodo]?: number };
};

export const POTENCIA_BOE_MOCKS: PotenciaBoe[] = [
  {
    tarifa: "2.0TD",
    periodos: {
      P1: 0.073782329,
      P2: 0.0019112,
      P3: undefined,
      P4: undefined,
      P5: undefined,
      P6: undefined,
    },
  },
  {
    tarifa: "3.0TD",
    periodos: {
      P1: 0.05385889,
      P2: 0.028086715,
      P3: 0.011678181,
      P4: 0.010086441,
      P5: 0.00637854,
      P6: 0.003716148,
    },
  },
  {
    tarifa: "6.1TD",
    periodos: {
      P1: 0.078881825,
      P2: 0.041308611,
      P3: 0.017970329,
      P4: 0.014170096,
      P5: 0.005295356,
      P6: 0.00250983,
    },
  },
];
