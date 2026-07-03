"use client";

import React from "react";
import { Zap, Target } from "lucide-react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Product, Tariff } from "../../interfaces/tarifa.interface";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(v);

interface Props {
  open: boolean;
  onClose: () => void;
  product: (Product & { tariffCode: string }) | null;
  tariff: Tariff | null;
}

export const VerProductoModal = ({ open, onClose, product }: Props) => {
  if (!product) return null;

  const n = product.tariffCode.trim().startsWith("2.") ? 3 : 6;
  const periodNums = Array.from({ length: n }, (_, i) => i + 1);
  const gridCls =
    n === 3
      ? "grid grid-cols-3 gap-3 mt-4"
      : "grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4";

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg w-full border border-[#3f3f46]">
      {/* Title */}
      <h2 className="text-2xl font-bold text-[#fafafa] pr-8">Detalle del producto</h2>
      <p className="text-sm text-[#a1a1aa] mt-0.5 mb-6">
        {product.tariffCode} — {product.name}
      </p>

      {/* Meta: Tarifa | Tipo | Estado */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-[#a1a1aa] mb-1">Tarifa</p>
          <p className="text-base font-bold text-[#fafafa]">{product.tariffCode}</p>
        </div>
        <div>
          <p className="text-sm text-[#a1a1aa] mb-1">Tipo</p>
          <p className="text-base font-bold text-[#fafafa]">{product.type ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-[#a1a1aa] mb-1">Estado</p>
          <p className={`text-base font-bold ${product.isAvailable ? "text-green-400" : "text-[#a1a1aa]"}`}>
            {product.isAvailable ? "Activo" : "Inactivo"}
          </p>
        </div>
      </div>

      {/* Comisión */}
      <div className="mb-6">
        <p className="text-sm text-[#a1a1aa] mb-1">Comisión</p>
        {product.commissionPercentage != null ? (
          <p className="text-base font-bold text-[#fafafa]">{product.commissionPercentage}%</p>
        ) : (
          <p className="text-base font-bold text-[#a1a1aa]">—</p>
        )}
      </div>

      {/* Energía */}
      <div className="rounded-xl border border-[#3f3f46] bg-[rgba(39,39,42,0.3)] p-4 mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-[#fafafa]">Energía (€/kWh)</span>
        </div>
        {product.periods.length === 0 ? (
          <p className="text-sm text-[#a1a1aa] mt-3">Sin datos de energía</p>
        ) : (
          <div className={gridCls}>
            {periodNums.map((p) => {
              const found = product.periods.find((x) => x.period === `P${p}`);
              return (
                <div
                  key={p}
                  className="rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-3"
                >
                  <p className="text-xs text-[#a1a1aa] mb-1">P{p}</p>
                  <p className="text-sm font-bold text-[#fafafa]">
                    {found ? fmt(found.value) : <span className="text-[#a1a1aa] font-normal">—</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Potencia */}
      <div className="rounded-xl border border-[#3f3f46] bg-[rgba(39,39,42,0.3)] p-4 mb-6">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-[#fafafa]">Potencia (€/kW/día)</span>
        </div>
        {!product.powerPeriods?.length ? (
          <p className="text-sm text-[#a1a1aa] mt-3">Sin datos de potencia</p>
        ) : (
          <div className={gridCls}>
            {periodNums.map((p) => {
              const found = product.powerPeriods?.find((x) => x.period === `P${p}`);
              return (
                <div
                  key={p}
                  className="rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-3"
                >
                  <p className="text-xs text-[#a1a1aa] mb-1">P{p}</p>
                  <p className="text-sm font-bold text-[#fafafa]">
                    {found ? fmt(found.value) : <span className="text-[#a1a1aa] font-normal">—</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cerrar */}
      <button
        onClick={onClose}
        className="h-10 px-5 rounded-lg border border-[#3f3f46] bg-transparent text-sm font-semibold text-[#fafafa] hover:bg-[#3f3f46] transition-colors"
      >
        Cerrar
      </button>
    </Dialog>
  );
};
