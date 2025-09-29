export interface MatilData {
    id:            string;
    nombre:        string;
    url:           string;
    fechaCreacion: Date;
    ocrData:       OcrData;
}

export interface OcrData {
    tarifa:                string;
    nif:                   string;
    titular:               string;
    cups:                  string;
    fecha_inicio:          string;
    fecha_fin:             string;
    num_periodos_energia:  number;
    num_periodos_potencia: number;
    potencia:              Potencia[];
    direccion:             Direccion;
    energia:               Energia[];
    detalle:               Detalle;
}

export interface Detalle {
    totales_energia:        TotalesEnergia;
    totales_potencia:       TotalesPotencia;
    descuento_electricidad: number;
    bono_social:            number;
    ie:                     number;
    equipos:                number;
    otros:                  number;
    descuento_otros:        number;
    subtotal:               number;
    iva_igic:               IvaIgic;
    ahorro_bateria_virtual: number;
    total:                  number;
}

export interface IvaIgic {
    tipo:  string;
    valor: number;
}

export interface TotalesEnergia {
    activa_eur:   number;
    reactiva_eur: number;
}

export interface TotalesPotencia {
    potencia_eur: number;
    exceso_eur:   number;
}

export interface Direccion {
    tipo_via:   string;
    nombre_via: string;
    numero:     string;
    detalles:   string;
    cp:         string;
    ciudad:     string;
    provincia:  string;
    ccaa:       string;
}

export interface Energia {
    p:            number;
    kwh:          number;
    activa_eur:   number;
    reactiva_eur: number;
}

export interface Potencia {
    p:            number;
    kw:           number;
    potencia_eur: number;
    exceso_eur:   number;
}
