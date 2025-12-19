export interface MatilData {
    id:            string;
    nombre:        string;
    url:           string;
    fechaCreacion: Date;
    ocrData:       OcrData;
}

export interface OcrData {
    tipo_documento:       string;
    cliente:              Cliente;
    contrato:             Contrato;
    fecha_emision:        string;
    periodo_facturacion:  PeriodoFacturacion;
    energia:              EnergiaElement[];
    potencia:             PotenciaElement[];
    energia_vertida:      EnergiaVertida;
    totales_electricidad: TotalesElectricidad;
    descuentos:           Descuento[];
    bono_social:          BonoSocial;
    equipos:              BonoSocial;
    otros_servicios:      BonoSocial[];
    ie:                   Ie;
    iva:                  Ie;
    total:                number;
}

export interface BonoSocial {
    importe:        number;
    en_base_ie:     boolean;
    porcentaje_iva: number;
    concepto?:      string;
}

export interface Cliente {
    tipo:      string;
    titular:   string;
    iban:      string;
    nif:       string;
    cups:      string;
    direccion: Direccion;
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

export interface Contrato {
    tarifa:                        string;
    nombre_comercializadora:       string;
    numero_orden_comercializadora: string;
    fecha_fin:                     string;
}

export interface Descuento {
    base:           number;
    porcentaje:     number;
    importe:        number;
    concepto:       string;
    afecta_a:       string;
    en_base_ie:     boolean;
    porcentaje_iva: number;
}

export interface EnergiaElement {
    p:        number;
    activa:   Activa;
    reactiva: Reactiva;
}

export interface Activa {
    kwh?:           number;
    importe:        number;
    tarifa:         number;
    es_lectura:     boolean;
    porcentaje_iva: number;
    detalle_tarifa: DetalleTarifa;
    kw?:            number;
}

export interface DetalleTarifa {
    componentes_lectura: ComponentesLectura[];
    tarifa_lectura:      number;
    tarifa_division:     number;
    diferencia:          number;
}

export interface ComponentesLectura {
    tipo:  string;
    valor: number;
}

export interface Reactiva {
    kvarh:          number;
    importe:        number;
    porcentaje_iva: number;
}

export interface EnergiaVertida {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excedentes:                       any[];
    descuento_energia_vertida:        number;
    tiene_bateria_virtual:            boolean;
    precio_bateria_virtual:           number;
    incremento_saldo_bateria_virtual: number;
    ahorro_bateria_virtual:           number;
}

export interface Ie {
    base:            number;
    porcentaje:      number;
    importe:         number;
    porcentaje_iva?: number;
    detalle?:        Ie[];
    tipo?:           string;
}

export interface PeriodoFacturacion {
    fecha_inicio:         string;
    fecha_fin:            string;
    numero_dias:          number;
    cambio_precios:       boolean;
    fecha_cambio_precios: null;
}

export interface PotenciaElement {
    p:          number;
    contratada: Activa;
    exceso:     Exceso;
}

export interface Exceso {
    kw_max:         number;
    kw_exceso:      number;
    importe:        number;
    porcentaje_iva: number;
}

export interface TotalesElectricidad {
    energia:  TotalesElectricidadEnergia;
    potencia: TotalesElectricidadPotencia;
}

export interface TotalesElectricidadEnergia {
    activa:     number;
    reactiva:   number;
    excedentes: number;
}

export interface TotalesElectricidadPotencia {
    contratada: number;
    exceso:     number;
}
