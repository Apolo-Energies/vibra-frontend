"use client";

import React, { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Button } from "@/components/buttons/button";
import { Slider } from "@/components/ui/Slider";
import { useForm } from "react-hook-form";
import { PRODUCTS_BY_TARIFF } from "@/utils/mocks/tarifas";
import { Select } from "@/components/Selects/Select";
import { OcrData } from "../../interfaces/matilData";
import { Input } from "@/components/Inputs/Input";
import { useCommissionStore } from "@/app/store/commission/commission.store";
import { useCalculatorStore } from "@/app/store/calculator/calculator.stores";
import { FacturaResult } from "@/app/store/calculator/calculator.types";
import { downloadPDF } from "@/app/services/FileService/pdf.service";
import { File, Unidad } from "@/app/services/interfaces/pdf";
import { useCommissionUserStore } from "@/app/store/commission-user/commission-user.store";
import { parseTitular } from "@/utils/paserNameRs";

interface Props {
  open: boolean;
  onClose: () => void;
  matilData?: OcrData;
  fileId: string;
  token: string;
}

type ExportType = "pdf" | "excel";

type FormData = {
  producto: string;
  precioMedio: number;
};

export const ComparadorFormModal = ({ open, onClose, matilData, fileId, token }: Props) => {

  // Tarifas permitidas
  const TARIFAS_VALIDAS = ["2.0TD"];

  // Validar tarifa
  const tarifa = matilData?.contrato?.tarifa ?? "";

  const defaultProducto =
    matilData?.contrato?.tarifa && PRODUCTS_BY_TARIFF[matilData.contrato.tarifa]?.length
      ? PRODUCTS_BY_TARIFF[matilData.contrato.tarifa][0]
      : "Index Base";

  const {
    register,
    formState: { errors },
    watch,
    // handleSubmit,
    // reset,
  } = useForm<FormData>({
    defaultValues: {
      producto: defaultProducto,
    },
  });

  const [feeEnergia, setFeeEnergia] = useState([0]);
  const [feePotencia, setFeePotencia] = useState([0]);
  const [resultadoFactura, setResultadoFactura] = useState<FacturaResult>();
  const { commission } = useCommissionUserStore();

  const productoSeleccionado = watch("producto");
  const comisionEnergia = commission ? commission / 100 : 0;
  const precioMedioOmieInput = Number(watch("precioMedio")) || 20;

  const { comision, calcular } = useCommissionStore();
  const calcularStore = useCalculatorStore();

  useEffect(() => {
    calcular({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matilData: matilData as any,
      feeEnergia,
      comisionEnergia,
      feePotencia,
      productoSeleccionado,
    });
  }, [
    matilData,
    feeEnergia,
    feePotencia,
    productoSeleccionado,
    comisionEnergia,
    calcular,
  ]);

  useEffect(() => {
    if (!matilData) return;
    const tarifa = matilData?.contrato?.tarifa;
    calcularStore.setTarifa(tarifa);

    calcularStore.setProducto(
      tarifa,
      productoSeleccionado,
      precioMedioOmieInput,
      feeEnergia[0]
    );
    calcularStore.setPotencia(tarifa, feePotencia[0], productoSeleccionado);

    const resultadoFactua = calcularStore.calcularFactura(matilData);
    setResultadoFactura(resultadoFactua ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matilData, productoSeleccionado, precioMedioOmieInput, feeEnergia, feePotencia]);

  const esTarifaValida = TARIFAS_VALIDAS.includes(tarifa);

  if (!esTarifaValida && matilData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <div className="p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-red-400">
            No es posible procesar este archivo
          </p>
          <p className="text-sm text-accent-foreground">
            Solo se permiten archivos con tarifa <strong>2.0TD</strong>.
            La tarifa detectada fue: <strong>{tarifa}</strong>
          </p>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Dialog>
    );
  }

  const handleDownloadFile = async (type: ExportType) => {
    try {
      const dias = matilData?.periodo_facturacion?.numero_dias
      const periodos = resultadoFactura?.periodos || [];

      console.log("resultado periodos: ", periodos);

      const { nombreEmpresa, razonSocial } = parseTitular(matilData?.cliente?.titular);
      const lineas = [
        // ENERGIA
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(matilData?.energia || []).map((e: any) => {
          const periodo = periodos.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (per: any) => per.periodo === `P${e.p}`
          );

          console.log("periodo encontrado energia:", periodo);

          return {
            termino: `ENERGÍA P${e.p}`,
            unidad: Unidad.KWh,

            valor: e.activa?.kwh ?? 0,
            precioActual: e.activa?.tarifa ?? 0,
            costeActual: e.activa?.importe ?? 0,

            precioOferta: periodo?.precioEnergiaOferta ?? 0,
            costeOferta: periodo?.costeEnergia ?? 0,
          };
        }),

        // POTENCIA
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(matilData?.potencia || []).map((pot: any) => {
          const periodo = periodos.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (per: any) => per.periodo === `P${pot.p}`
          );

          console.log("periodo encontrado potencia:", periodo);

          return {
            termino: `POTENCIA P${pot.p}`,
            unidad: Unidad.KW,

            valor: pot.contratada?.kw ?? 0,
            precioActual: pot.contratada?.tarifa ?? 0,
            costeActual: pot.contratada?.importe ?? 0,

            precioOferta: periodo?.precioPotenciaOferta ?? 0,
            costeOferta: periodo?.costePotencia ?? 0,
          };
        }),
      ];


      console.log("lineas para el pdf: ", lineas);

      const exportData: File = {
        lineas,
        archivoId: fileId,
        proveedorId: 1,
        // usuario: "usuario_ejemplo",
        cups: matilData?.cliente?.cups || "-",
        datos: {
          titulo: "Comparativa de oferta",
          tarifa: matilData?.contrato?.tarifa || "-",
          modalidad: productoSeleccionado,
          periodo: matilData?.periodo_facturacion?.fecha_fin || "-",
          diasFactura: dias ?? 0,
          ahorro: resultadoFactura?.ahorroEstudio || 0,
          ahorroPorcentaje: resultadoFactura?.ahorro_porcent || 0,
          ahorroAnual: resultadoFactura?.ahorroXAnio || 0,
          consumoAnual: resultadoFactura?.totalAnio || 0,
          precioPromedioOmie: precioMedioOmieInput,
          feeEnergia: feeEnergia[0],
          feePotencia: feePotencia[0],
        },
        cliente: {
          cif: matilData?.cliente?.nif || "-",
          nombreCliente: nombreEmpresa,
          razonSocial: razonSocial || "-",
          provincia: matilData?.cliente?.direccion.provincia || "-",
          cp: matilData?.cliente?.direccion.cp || "-",
          direccion:
            `${matilData?.cliente?.direccion?.tipo_via?.slice(0, 2).toUpperCase()} ${matilData?.cliente?.direccion?.nombre_via
            }, ${matilData?.cliente?.direccion?.numero} ${matilData?.cliente?.direccion?.detalles
            }` || "-",
        },
        totales: {
          baseActual: matilData?.iva.base || 0,
          baseOferta: resultadoFactura?.subTotal || 0,
          impuestoElectricoActual: matilData?.ie?.importe || 0,
          impuestoElectricoOferta: resultadoFactura?.impuestoElectrico || 0,
          alquilerEquipo: matilData?.equipos?.importe || 0,
          ivaActual: matilData?.iva?.importe || 0,
          ivaOferta: resultadoFactura?.iva || 0,
          totalActual: matilData?.total || 0,
          totalOferta: resultadoFactura?.total || 0,


          // otrosComunesConIeActual: resultadoFactura?.costesComunesConIE || 0,
          // otrosComunesConIeOferta: resultadoFactura?.costesComunesConIE || 0,
          otrosComunesConIeActual: matilData?.bono_social?.importe || 0,
          otrosComunesConIeOferta: matilData?.bono_social?.importe || 0,
          // datos un iniciertos
          otrosComunesSinIeActual: 0,
          otrosComunesSinIeOferta: 0,
          otrosNoComunesActual: (matilData?.otros_servicios ?? [])
            .reduce((total, s) => total + (s.importe ?? 0), 0),
          otrosNoComunesOferta: 0,
        },
      };

      if (type === "pdf") {
        await downloadPDF(token, exportData);
      }
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">
            Configura el producto
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Producto a ofertar"
            name="producto"
            options={
              matilData?.contrato?.tarifa
                ? PRODUCTS_BY_TARIFF[matilData?.contrato?.tarifa].map((p) => ({
                  label: p,
                  value: p,
                }))
                : []
            }
            placeholder="Elige una opción"
            register={register}
            required
            errors={errors}
          />
          <Input
            label="Precio medio OMIE (€/MWh)"
            type="number"
            name="precioMedio"
            placeholder="20"
            register={register}
            required
            errors={errors}
          />
        </div>

        <div className="space-y-2">
          <div className="flex pb-2 items-center">
            <label
              htmlFor="feeEnergia"
              className="text-sm font-medium text-foreground"
            >
              Fee energía
            </label>
          </div>

          <div className="relative w-full">
            <div
              className={`absolute -top-4 text-xs font-semibold transition-colors 
    ${feeEnergia[0] === 0
                  ? "text-red-500"
                  : feeEnergia[0] === 50
                    ? "text-green-600"
                    : "text-foreground"
                }`}
              style={{
                left: `${feeEnergia[0]}%`,
                transform: "translateX(-50%)",
              }}
            >
              {feeEnergia[0]}
            </div>

            <Slider
              value={feeEnergia}
              onValueChange={setFeeEnergia}
              max={50}
              min={0}
              step={1}
            />
            <div className="flex justify-end">
              <span
                className={`text-sm font-semibold transition-colors ${feeEnergia[0] === 50 ? "text-green-600" : "text-foreground"
                  }`}
              >
                50
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex pb-2 items-center">
            <label
              htmlFor="feePotencia"
              className="text-sm font-medium text-foreground"
            >
              Fee potencia
            </label>
          </div>

          <div className="relative w-full">
            <div
              className={`absolute -top-4 text-xs font-semibold transition-colors 
    ${feePotencia[0] === 0
                  ? "text-red-500"
                  : feePotencia[0] === 25
                    ? "text-green-600"
                    : "text-foreground"
                }`}
              style={{
                left: `${feePotencia[0]}%`,
                transform: "translateX(-50%)",
              }}
            >
              {feePotencia[0]}
            </div>

            <Slider
              value={feePotencia}
              onValueChange={setFeePotencia}
              max={25}
              min={0}
              step={1}
            />
          </div>
          <div className="flex justify-end">
            <span
              className={`text-sm font-semibold transition-colors ${feePotencia[0] === 25 ? "text-green-600" : "text-foreground"
                }`}
            >
              25
            </span>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-input">
            <p className="text-sm font-medium text-foreground mb-1">
              Comisión comercial
            </p>
            <p className="text-2xl font-bold text-foreground">
              {Math.trunc(Number(comision)) + "€"}
            </p>
            <p className="text-sm text-green-500">+ 10% extra</p>
          </div>

          <div className="p-4 rounded-lg bg-input">
            <p className="text-sm font-medium text-foreground mb-1">
              Ahorro cliente
            </p>
            <p className="text-xl font-bold text-foreground">
              {/* {resultadoFactura?.ahorroEstudio}€ al mes */}
              {Math.trunc(Number(resultadoFactura?.ahorroEstudio))}€ al mes
            </p>
            <p
              className={`text-xl font-bold text-foreground ${resultadoFactura?.ahorroXAnio &&
                resultadoFactura.ahorroXAnio > 0
                ? "text-green-500"
                : "text-red-500"
                }`}
            >
              {/* {resultadoFactura?.ahorroXAnio}€ al año */}
              {Math.trunc(Number(resultadoFactura?.ahorroXAnio))}€ al año
            </p>
            <p className="text-sm text-green-500">
              + {resultadoFactura?.ahorro_porcent}% de ahorro
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-2 border-t border-gray-200">
          {/* <Button
            variant="outline"
            onClick={() => handleDownloadFile("excel")}
            className="flex-1"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Descargar Excel
          </Button> */}
          <Button onClick={() => handleDownloadFile("pdf")} className="flex-1">
            <FileDown className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
