"use client";

import React, { useEffect, useState } from "react";
import { Zap, Target, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Product, ProductPeriod, ProductType, Tariff } from "../../interfaces/tarifa.interface";

/* ── Design tokens ────────────────────────────────────────────────────────── */
const INPUT =
  "h-9 w-full px-3 py-2 rounded-md border border-[#3f3f46] bg-[#27272a] text-sm text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const INPUT_SM =
  "h-9 w-32 px-2 rounded-md border border-[#3f3f46] bg-[#25272A] text-xs text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent";

const BTN_OUTLINE =
  "h-9 px-4 rounded-md border border-[#3f3f46] bg-transparent text-sm font-medium text-[#fafafa] hover:bg-[#3f3f46] transition-colors whitespace-nowrap";

const BTN_GHOST =
  "h-9 px-3 rounded-md bg-transparent text-sm text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa] transition-colors whitespace-nowrap";

const LABEL = "block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1";

const CARD = "rounded-lg border border-[#3f3f46] bg-[rgba(39,39,42,0.2)] p-4";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const getNumPeriods = (code: string) => (code.trim().startsWith("2.") ? 3 : 6);

// period viene como "P1", "P2"... del API
type PeriodValues = Record<number, string>;

const buildFromApiPeriods = (periods: ProductPeriod[] | undefined | null, n: number): PeriodValues => {
  const map: PeriodValues = {};
  for (let i = 1; i <= n; i++) {
    const found = (periods ?? []).find((p) => p.period === `P${i}`);
    map[i] = found != null ? String(found.value) : "";
  }
  return map;
};

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "Fixed", label: "Fixed (precio configurado tal cual)" },
  { value: "Indexed", label: "Indexed (precio + OMIE × factor)" },
];

/* ── Types ───────────────────────────────────────────────────────────────── */
interface Props {
  open: boolean;
  onClose: () => void;
  product: (Product & { tariffCode: string }) | null;
  tariff: Tariff | null;
  onSave: (data: {
    name: string;
    type: ProductType;
    commission: number | null;
    energyPeriods: PeriodValues;
    powerPeriods: PeriodValues;
  }) => Promise<void>;
}

const Err = ({ msg }: { msg: string }) => (
  <div className="flex items-center gap-1.5 mt-1.5">
    <AlertCircle size={12} className="text-red-400 shrink-0" />
    <span className="text-xs text-red-400">{msg}</span>
  </div>
);

export const EditarProductoModal = ({ open, onClose, product, tariff, onSave }: Props) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("Fixed");
  const [commission, setCommission] = useState("");
  const [energyPeriods, setEnergyPeriods] = useState<PeriodValues>({});
  const [powerPeriods, setPowerPeriods] = useState<PeriodValues>({});
  const [commonEnergy, setCommonEnergy] = useState("");
  const [commonPower, setCommonPower] = useState("");
  const [nameError, setNameError] = useState("");
  const [energyError, setEnergyError] = useState("");
  const [powerError, setPowerError] = useState("");
  const [saving, setSaving] = useState(false);

  const n = product ? getNumPeriods(product.tariffCode) : 6;
  const periods = Array.from({ length: n }, (_, i) => i + 1);
  const gridCls = n === 3 ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3";

  useEffect(() => {
    if (!open || !product) return;

    const numPeriods = getNumPeriods(product.tariffCode);
    setName(product.name);
    setType(product.type ?? "Fixed");
    setCommission(product.commissionPercentage != null ? String(product.commissionPercentage) : "");
    setEnergyPeriods(buildFromApiPeriods(product.periods, numPeriods));
    setPowerPeriods(buildFromApiPeriods(product.powerPeriods, numPeriods));
    setCommonEnergy(""); setCommonPower("");
    setNameError(""); setEnergyError(""); setPowerError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const applyCommon = (value: string, setter: React.Dispatch<React.SetStateAction<PeriodValues>>, ps: number[]) => {
    if (!value) return;
    const u: PeriodValues = {};
    ps.forEach((p) => (u[p] = value));
    setter(u);
  };

  const loadBOE = () => {
    const boePeriods = tariff?.boePowers?.[0]?.periods ?? [];
    const map: PeriodValues = {};
    for (let i = 1; i <= n; i++) {
      const found = boePeriods.find((p) => p.period === `P${i}`);
      map[i] = found != null ? String(found.value) : "";
    }
    setPowerPeriods(map);
  };

  const validate = () => {
    let ok = true;
    setNameError(""); setEnergyError(""); setPowerError("");

    if (!name.trim()) { setNameError("El nombre es obligatorio."); ok = false; }

    const ev = periods.map((p) => energyPeriods[p]?.trim() ?? "");
    const ef = ev.filter((v) => v !== "").length;
    if (ef === 0) { setEnergyError("Debes indicar los precios de energía."); ok = false; }
    else if (ef < n) { setEnergyError(`Completa los ${n} períodos de energía.`); ok = false; }
    else if (ev.some((v) => isNaN(parseFloat(v)) || parseFloat(v) < 0)) { setEnergyError("Precios deben ser ≥ 0."); ok = false; }

    const pv = periods.map((p) => powerPeriods[p]?.trim() ?? "");
    if (pv.filter((v) => v !== "").some((v) => isNaN(parseFloat(v)) || parseFloat(v) < 0)) {
      setPowerError("Los precios de potencia deben ser ≥ 0."); ok = false;
    }

    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        commission: commission !== "" ? parseFloat(commission) : null,
        energyPeriods,
        powerPeriods,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-5xl w-full overflow-y-auto max-h-[90vh] border border-[#3f3f46]"
    >
      <h2 className="text-lg font-semibold text-[#fafafa] pr-8">Editar producto</h2>
      <p className="text-sm text-[#a1a1aa] mt-0.5 mb-5">
        Tarifa <span className="text-[#fafafa] font-medium">{product.tariffCode}</span> — modifica nombre, energía, potencia o comisión.
      </p>

      <div className="space-y-5">
        {/* Tipo | Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Tipo de producto</label>
            <select value={type} onChange={(e) => setType(e.target.value as ProductType)} className={INPUT}>
              {PRODUCT_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Nombre del producto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Producto Luz Estable"
              className={INPUT}
            />
            {nameError && <Err msg={nameError} />}
          </div>
        </div>

        {/* Energy card */}
        <div className={CARD}>
          <div className="flex items-center gap-3 mb-3">
            <Zap size={16} className="text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-[#fafafa] flex-1">Precios de energía (€/kWh)</span>
            <input type="number" value={commonEnergy} onChange={(e) => setCommonEnergy(e.target.value)} placeholder="Valor común" className={INPUT_SM} />
            <button type="button" onClick={() => applyCommon(commonEnergy, setEnergyPeriods, periods)} className={BTN_OUTLINE}>Aplicar a todos</button>
          </div>
          <div className={gridCls}>
            {periods.map((p) => (
              <div key={p}>
                <p className="text-sm text-[#fafafa] mb-1.5">P{p}</p>
                <input
                  type="number" step="0.000001" min="0"
                  value={energyPeriods[p] ?? ""}
                  onChange={(e) => setEnergyPeriods((prev) => ({ ...prev, [p]: e.target.value }))}
                  placeholder="0.000000"
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          {energyError && <Err msg={energyError} />}
        </div>

        {/* Power card */}
        <div className={CARD}>
          <div className="flex items-center gap-3 mb-3">
            <Target size={16} className="text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-[#fafafa] flex-1">Precios de potencia (€/kW/día)</span>
            <button type="button" onClick={loadBOE} className={BTN_GHOST}>Cargar BOE</button>
            <input type="number" value={commonPower} onChange={(e) => setCommonPower(e.target.value)} placeholder="Valor común" className={INPUT_SM} />
            <button type="button" onClick={() => applyCommon(commonPower, setPowerPeriods, periods)} className={BTN_OUTLINE}>Aplicar a todos</button>
          </div>
          <div className={gridCls}>
            {periods.map((p) => (
              <div key={p}>
                <p className="text-sm text-[#fafafa] mb-1.5">P{p}</p>
                <input
                  type="number" step="0.00000001" min="0"
                  value={powerPeriods[p] ?? ""}
                  onChange={(e) => setPowerPeriods((prev) => ({ ...prev, [p]: e.target.value }))}
                  placeholder="0.00000000"
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          {powerError && <Err msg={powerError} />}
        </div>

        {/* Comisión */}
        <div>
          <label className={LABEL}>Comisión (%)</label>
          <input
            type="number" min="0" max="100"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Sin override — dejar vacío si no aplica"
            className={INPUT}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-9 px-4 rounded-md bg-[#12AFF0] text-[#17181A] text-sm font-semibold hover:bg-[#10a0d8] disabled:opacity-50 transition-colors min-w-32"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Guardando...
            </span>
          ) : "Guardar cambios"}
        </button>
        <button onClick={onClose} className={BTN_OUTLINE}>Cancelar</button>
      </div>
    </Dialog>
  );
};
