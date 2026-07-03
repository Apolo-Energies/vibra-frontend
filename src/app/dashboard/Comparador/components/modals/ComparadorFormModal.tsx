"use client";

import React, { useEffect, useState } from "react";
import { FileDown, Zap } from "lucide-react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Button } from "@/components/buttons/button";
import { Slider } from "@/components/ui/Slider";
import { useForm } from "react-hook-form";
import { OcrData } from "../../interfaces/matilData";
import { useCommissionStore } from "@/app/store/commission/commission.store";
import { useCalculatorStore } from "@/app/store/calculator/calculator.stores";
import { FacturaResult, Periodo } from "@/app/store/calculator/calculator.types";
import { downloadPDF } from "@/app/services/FileService/pdf.service";
import { File, Unidad } from "@/app/services/interfaces/pdf";
import { parseTitular } from "@/utils/paserNameRs";
import { useTariffStore } from "@/app/store/tariff/tariff.store";

interface Props {
  open: boolean;
  onClose: () => void;
  matilData?: OcrData;
  fileId: string;
  token: string;
}

type FormData = {
  precioMedio: number;
};

const LABEL = "block text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest mb-1";
const INPUT = "w-full bg-[#1c1c1e] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#12AFF0]";

const fmt6 = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 6, maximumFractionDigits: 6 });

const PERIODS: Periodo[] = ["P1", "P2", "P3", "P4", "P5", "P6"];

export const ComparadorFormModal = ({ open, onClose, matilData, fileId, token }: Props) => {
  const { tariffs } = useTariffStore();

  const tarifaOcr = matilData?.contrato?.tarifa ?? "";
  const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

  // Si el OCR devuelve tarifa y no es 2.x → no compatible
  const esTarifaNoPermitida = tarifaOcr !== "" && !tarifaOcr.trim().startsWith("2.");

  // Buscar tarifa: primero por coincidencia con OCR, si viene vacío usar la primera 2.x del store
  const tariffObj = esTarifaNoPermitida
    ? null
    : tarifaOcr !== ""
      ? (tariffs.find(t => norm(t.code) === norm(tarifaOcr)) ?? null)
      : (tariffs.find(t => t.code.trim().startsWith("2.")) ?? null);

  const tarifa = tariffObj?.code ?? tarifaOcr;
  const availableProducts = tariffObj?.products ?? [];

  const { register, watch, setValue } = useForm<FormData>({
    defaultValues: { precioMedio: 20 },
  });

  const [productoId, setProductoId] = useState<number | null>(null);
  const [feeEnergia, setFeeEnergia] = useState([0]);
  const [feePotencia, setFeePotencia] = useState([0]);
  const [resultadoFactura, setResultadoFactura] = useState<FacturaResult>();
  const [preciosOpen, setPreciosOpen] = useState(true);

  const precioMedioOmieInput = Number(watch("precioMedio")) || 20;

  const { comision, calcular } = useCommissionStore();
  const calcularStore = useCalculatorStore();

  const selectedProduct = availableProducts.find(p => p.id === productoId) ?? availableProducts[0] ?? null;
  const comisionEnergia = (selectedProduct?.commissionPercentage ?? 65) / 100;

  // Seleccionar primer producto cuando cambia la tarifa
  useEffect(() => {
    if (availableProducts.length > 0) {
      setProductoId(availableProducts[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariffObj?.id]);

  // Comisión
  useEffect(() => {
    calcular({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matilData: matilData as any,
      feeEnergia,
      comisionEnergia,
      feePotencia,
      productoSeleccionado: selectedProduct?.name ?? "",
    });
  }, [matilData, feeEnergia, feePotencia, selectedProduct?.name, comisionEnergia, calcular]);

  // Cálculo factura
  useEffect(() => {
    if (!matilData || !tariffObj || !selectedProduct) return;
    calcularStore.setTarifa(tarifa);
    calcularStore.setProducto(tariffObj, selectedProduct, precioMedioOmieInput, feeEnergia[0]);
    calcularStore.setPotencia(tariffObj, selectedProduct, feePotencia[0]);
    const resultado = calcularStore.calcularFactura(matilData);
    setResultadoFactura(resultado ?? undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matilData, productoId, precioMedioOmieInput, feeEnergia, feePotencia]);

  // Solo períodos con datos reales en el OCR
  const activePeriods: Periodo[] = PERIODS.filter(p => {
    const idx = Number(p.slice(1)) - 1;
    const kwh = matilData?.energia?.[idx]?.activa?.kwh ?? 0;
    const kw  = matilData?.potencia?.[idx]?.contratada?.kw ?? 0;
    return kwh > 0 || kw > 0;
  });

  const preciosEnergia = tariffObj && selectedProduct
    ? activePeriods.map(p => ({
        periodo: p,
        oferta: calcularStore.resultados?.periodos.find(r => r.periodo === p)?.oferta ?? 0,
      }))
    : [];
  const preciosPotencia = tariffObj && selectedProduct
    ? activePeriods.map(p => ({
        periodo: p,
        oferta: calcularStore.resultadosPotencia?.periodos.find(r => r.periodo === p)?.ofertaPotencia ?? 0,
      }))
    : [];

  const handleDownloadFile = async (type: "pdf" | "excel") => {
    try {
      const dias = matilData?.periodo_facturacion?.numero_dias;
      const periodos = resultadoFactura?.periodos || [];
      const { nombreEmpresa, razonSocial } = parseTitular(matilData?.cliente?.titular);

      const lineas = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(matilData?.energia || []).map((e: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = periodos.find((per: any) => per.periodo === `P${e.p}`);
          return {
            termino: `ENERGÍA P${e.p}`, unidad: Unidad.KWh,
            valor: e.activa?.kwh ?? 0, precioActual: e.activa?.tarifa ?? 0, costeActual: e.activa?.importe ?? 0,
            precioOferta: p?.precioEnergiaOferta ?? 0, costeOferta: p?.costeEnergia ?? 0,
          };
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(matilData?.potencia || []).map((pot: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = periodos.find((per: any) => per.periodo === `P${pot.p}`);
          return {
            termino: `POTENCIA P${pot.p}`, unidad: Unidad.KW,
            valor: pot.contratada?.kw ?? 0, precioActual: pot.contratada?.tarifa ?? 0, costeActual: pot.contratada?.importe ?? 0,
            precioOferta: p?.precioPotenciaOferta ?? 0, costeOferta: p?.costePotencia ?? 0,
          };
        }),
      ];

      const exportData: File = {
        lineas, archivoId: fileId, proveedorId: 1,
        cups: matilData?.cliente?.cups || "-",
        datos: {
          titulo: "Comparativa de oferta",
          tarifa: tarifa || "-",
          modalidad: selectedProduct?.name ?? "-",
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
          direccion: `${matilData?.cliente?.direccion?.tipo_via?.slice(0, 2).toUpperCase()} ${matilData?.cliente?.direccion?.nombre_via}, ${matilData?.cliente?.direccion?.numero} ${matilData?.cliente?.direccion?.detalles}` || "-",
        },
        totales: {
          baseActual: matilData?.iva?.base || 0,
          baseOferta: resultadoFactura?.subTotal || 0,
          impuestoElectricoActual: matilData?.ie?.importe || 0,
          impuestoElectricoOferta: resultadoFactura?.impuestoElectrico || 0,
          alquilerEquipo: matilData?.equipos?.importe || 0,
          ivaActual: matilData?.iva?.importe || 0,
          ivaOferta: resultadoFactura?.iva || 0,
          totalActual: matilData?.total || 0,
          totalOferta: resultadoFactura?.total || 0,
          otrosComunesConIeActual: matilData?.bono_social?.importe || 0,
          otrosComunesConIeOferta: matilData?.bono_social?.importe || 0,
          otrosComunesSinIeActual: 0, otrosComunesSinIeOferta: 0,
          otrosNoComunesActual: (matilData?.otros_servicios ?? []).reduce((t, s) => t + (s.importe ?? 0), 0),
          otrosNoComunesOferta: 0,
        },
      };

      if (type === "pdf") await downloadPDF(token, exportData);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  // ── Tarifa no permitida (el OCR detectó algo distinto de 2.x) ───────────
  if (esTarifaNoPermitida && matilData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <p className="text-base font-semibold text-[#fafafa]">
            Tarifa no compatible
          </p>
          <p className="text-sm text-[#a1a1aa]">
            El comparador solo procesa facturas con tarifa <strong className="text-[#fafafa]">2.0TD</strong>.
            <br />Se detectó: <strong className="text-red-400">{tarifaOcr}</strong>
          </p>
          <Button variant="outline" onClick={onClose} className="mt-2">
            Cerrar
          </Button>
        </div>
      </Dialog>
    );
  }

  // ── Tarifa 2.x pero sin productos en el sistema ──────────────────────────
  if (!esTarifaNoPermitida && availableProducts.length === 0 && matilData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <div className="p-8 text-center space-y-4">
          <p className="text-base font-semibold text-[#fafafa]">Sin productos configurados</p>
          <p className="text-sm text-[#a1a1aa]">
            La tarifa <strong className="text-[#fafafa]">{tarifa}</strong> no tiene productos asociados en el sistema.
          </p>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl w-full">
      <div className="space-y-5 p-1">
        {/* Title */}
        <h2 className="text-lg font-bold text-[#fafafa]">Configura el producto</h2>

        {/* Producto + OMIE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Producto</label>
            <select
              value={productoId ?? ""}
              onChange={e => setProductoId(Number(e.target.value))}
              className={INPUT}
            >
              <option value="" disabled hidden>Selecciona producto</option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Precio medio OMIE (€/MWh)</label>
            <input
              type="number"
              placeholder="20"
              {...register("precioMedio")}
              className={INPUT}
            />
          </div>
        </div>

        {/* Fee Energía */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#fafafa]">
              Fee Energía <span className="text-[#71717a] font-normal">€/MWh</span>
            </span>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#12AFF0] text-[#17181A] text-xs font-bold">
              {feeEnergia[0]}
            </span>
          </div>
          <Slider value={feeEnergia} onValueChange={setFeeEnergia} max={50} min={0} step={1} />
        </div>

        {/* Fee Potencia */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#fafafa]">
              Fee Potencia <span className="text-[#71717a] font-normal">€/kW/año</span>
            </span>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#12AFF0] text-[#17181A] text-xs font-bold">
              {feePotencia[0]}
            </span>
          </div>
          <Slider value={feePotencia} onValueChange={setFeePotencia} max={25} min={0} step={1} />
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#1c1c1e] border border-[#3f3f46]">
            <p className="text-sm font-medium text-[#a1a1aa] mb-1">Comisión comercial</p>
            <p className="text-3xl font-bold text-[#fafafa]">{Math.trunc(Number(comision))}€</p>
            <p className="text-sm text-[#22c55e] mt-1">+ 10% extra</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1c1c1e] border border-[#3f3f46]">
            <p className="text-sm font-medium text-[#a1a1aa] mb-1">Ahorro cliente</p>
            <p className="text-2xl font-bold text-[#fafafa]">
              {Math.trunc(Number(resultadoFactura?.ahorroEstudio))}€ al mes
            </p>
            <p className={`text-2xl font-bold mt-0.5 ${(resultadoFactura?.ahorroXAnio ?? 0) > 0 ? "text-[#22c55e]" : "text-red-400"}`}>
              {Math.trunc(Number(resultadoFactura?.ahorroXAnio))}€ al año
            </p>
            <p className="text-sm text-[#22c55e] mt-1">
              + {resultadoFactura?.ahorro_porcent ?? 0}% de ahorro
            </p>
          </div>
        </div>

        {/* Precios ofertados colapsable */}
        <div className="rounded-xl border border-[#3f3f46] overflow-hidden">
          <button
            type="button"
            onClick={() => setPreciosOpen(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#1c1c1e] hover:bg-[#27272a] transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#27272a] border border-[#3f3f46]">
              <Zap size={16} className="text-[#12AFF0]" />
            </span>
            <span className="flex-1 text-left text-sm font-semibold text-[#fafafa]">Precios ofertados</span>
            <span className="flex items-center justify-center w-7 h-7 rounded-lg border border-[#3f3f46] bg-[#27272a] text-[#fafafa] text-lg leading-none">
              {preciosOpen ? "−" : "+"}
            </span>
          </button>

          {preciosOpen && (
            <div className="px-4 py-3 bg-[#17181A] grid grid-cols-2 gap-x-6 gap-y-1.5">
              {PERIODS.map((p) => {
                const idx = Number(p.slice(1)) - 1;
                const hasEnergy = (matilData?.energia?.[idx]?.activa?.kwh ?? 0) > 0;
                const hasPower  = (matilData?.potencia?.[idx]?.contratada?.kw ?? 0) > 0;
                const eOferta = hasEnergy ? (preciosEnergia.find(x => x.periodo === p)?.oferta ?? 0) : 0;
                const pOferta = hasPower  ? (preciosPotencia.find(x => x.periodo === p)?.oferta ?? 0) : 0;
                return (
                  <React.Fragment key={p}>
                    <p className="text-sm text-[#a1a1aa]">
                      Energía {p}:{" "}
                      <span className="text-[#12AFF0] font-medium">{fmt6(eOferta)}</span>
                    </p>
                    <p className="text-sm text-[#a1a1aa]">
                      Potencia {p}:{" "}
                      <span className="text-[#12AFF0] font-medium">{fmt6(pOferta)}</span>
                    </p>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-5 mt-1 -mx-7 px-7 border-t border-[#3f3f46]">
          <button
            type="button"
            onClick={() => handleDownloadFile("pdf")}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#12AFF0] text-[#17181A] text-sm font-semibold hover:bg-[#10a0d8] transition-colors"
          >
            <FileDown size={15} />
            Descargar PDF
          </button>
        </div>
      </div>
    </Dialog>
  );
};
