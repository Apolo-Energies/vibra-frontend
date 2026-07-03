"use client";

import React, { useState, useEffect } from "react";
import { Zap, Target, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Tariff, ProductType } from "../../interfaces/tarifa.interface";

/* ── Design tokens ────────────────────────────────────────────────────────── */
// Input principal (h-9, bg #27272a, border #3f3f46)
const INPUT =
  "h-9 w-full px-3 py-2 rounded-md border border-[#3f3f46] bg-[#27272a] text-sm text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// Input pequeño "Valor común" (h-9, w-32, bg #25272A)
const INPUT_SM =
  "h-9 w-32 px-2 rounded-md border border-[#3f3f46] bg-[#25272A] text-xs text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent";

// Botón outline: "Aplicar a todos", "Cancelar"
const BTN_OUTLINE =
  "h-9 px-4 rounded-md border border-[#3f3f46] bg-transparent text-sm font-medium text-[#fafafa] hover:bg-[#3f3f46] transition-colors whitespace-nowrap";

// Botón ghost: "Cargar BOE"
const BTN_GHOST =
  "h-9 px-3 rounded-md bg-transparent text-sm text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa] transition-colors whitespace-nowrap";

// Label TARIFA / TIPO / NOMBRE
const LABEL = "block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1";

// Card de períodos
const CARD = "rounded-lg border border-[#3f3f46] bg-[rgba(39,39,42,0.2)] p-4";

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "Fixed", label: "Fixed (precio configurado tal cual)" },
  { value: "Indexed", label: "Indexed (precio + OMIE × factor)" },
];

const getNumPeriods = (code: string) => (code.trim().startsWith("2.") ? 3 : 6);

type PeriodMap = Record<string, string>;

const emptyPeriods = (n: number): PeriodMap => {
  const m: PeriodMap = {};
  for (let i = 1; i <= n; i++) m[`P${i}`] = "";
  return m;
};

const boeToPeriodMap = (
  boe: { period: string; value: number }[],
  n: number
): PeriodMap => {
  const m: PeriodMap = {};
  for (let i = 1; i <= n; i++) {
    const found = boe.find((p) => p.period === `P${i}`);
    m[`P${i}`] = found != null ? String(found.value) : "";
  }
  return m;
};

interface ValidationErrors {
  tariff?: string;
  name?: string;
  energy?: string;
  power?: string;
  commission?: string;
}

export interface CreateProductData {
  tariffId: number;
  name: string;
  type: ProductType;
  energyPeriods: { period: string; value: number }[];
  powerPeriods?: { period: string; value: number }[];
  commissionPercentage: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  tariffs: Tariff[];
  defaultTariffCode?: string;
  onSave: (data: CreateProductData) => Promise<void>;
}

const Err = ({ msg }: { msg: string }) => (
  <div className="flex items-center gap-1.5 mt-1.5">
    <AlertCircle size={12} className="text-red-400 shrink-0" />
    <span className="text-xs text-red-400">{msg}</span>
  </div>
);

export const NuevoProductoModal = ({
  open, onClose, tariffs, defaultTariffCode, onSave,
}: Props) => {
  const [tariffId, setTariffId] = useState<number | "">("");
  const [type, setType] = useState<ProductType>("Fixed");
  const [name, setName] = useState("");
  const [energy, setEnergy] = useState<PeriodMap>({});
  const [power, setPower] = useState<PeriodMap>({});
  const [commonE, setCommonE] = useState("");
  const [commonP, setCommonP] = useState("");
  const [commission, setCommission] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const tariff = tariffs.find((t) => t.id === tariffId) ?? null;
  const n = tariff ? getNumPeriods(tariff.code) : 6;
  const keys = Array.from({ length: n }, (_, i) => `P${i + 1}`);
  const gridCls = n === 3 ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3";

  // Pre-select tariff when modal opens
  useEffect(() => {
    if (!open) return;
    if (defaultTariffCode) {
      const t = tariffs.find((t) => t.code === defaultTariffCode);
      if (t) {
        setTariffId(t.id);
        const periods = getNumPeriods(t.code);
        setEnergy(emptyPeriods(periods));
        setPower(emptyPeriods(periods));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onTariffChange = (val: string) => {
    const id = val ? Number(val) : "";
    setTariffId(id);
    const t = tariffs.find((x) => x.id === id);
    const periods = t ? getNumPeriods(t.code) : 6;
    setEnergy(emptyPeriods(periods));
    setPower(emptyPeriods(periods));
    setCommonE(""); setCommonP(""); setErrors({});
  };

  const applyAll = (
    val: string,
    setter: React.Dispatch<React.SetStateAction<PeriodMap>>,
    k: string[]
  ) => {
    if (!val) return;
    const u: PeriodMap = {};
    k.forEach((key) => (u[key] = val));
    setter(u);
  };

  const loadBOE = () => {
    if (!tariff) return;
    const boe = tariff.boePowers?.[0]?.periods ?? [];
    setPower(boeToPeriodMap(boe, n));
  };

  const validate = (): ValidationErrors => {
    const e: ValidationErrors = {};
    if (!tariffId) e.tariff = "Selecciona una tarifa.";
    if (!name.trim()) e.name = "El nombre es obligatorio.";

    const ev = keys.map((k) => energy[k]?.trim() ?? "");
    const ef = ev.filter((v) => v !== "").length;
    if (ef === 0) e.energy = "Debes indicar los precios de energía.";
    else if (ef < n) e.energy = `Completa los ${n} períodos de energía.`;
    else if (ev.some((v) => isNaN(parseFloat(v)) || parseFloat(v) < 0)) e.energy = "Precios deben ser ≥ 0.";

    const pv = keys.map((k) => power[k]?.trim() ?? "");
    if (pv.filter((v) => v !== "").some((v) => isNaN(parseFloat(v)) || parseFloat(v) < 0)) {
      e.power = "Los precios de potencia deben ser ≥ 0.";
    }

    if (commission !== "") {
      const c = parseFloat(commission);
      if (isNaN(c) || c < 0 || c > 100) e.commission = "Comisión debe ser 0–100.";
    }
    return e;
  };

  const reset = () => {
    setTariffId(""); setType("Fixed"); setName("");
    setEnergy({}); setPower({});
    setCommonE(""); setCommonP("");
    setCommission(""); setErrors({});
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const energyList = keys.map((k) => ({ period: k, value: parseFloat(energy[k]) }));
      const powerList = keys
        .filter((k) => power[k]?.trim() !== "")
        .map((k) => ({ period: k, value: parseFloat(power[k]) }));
      const powerListOrUndefined = powerList.length > 0 ? powerList : undefined;
      await onSave({
        tariffId: tariffId as number,
        name: name.trim(),
        type,
        energyPeriods: energyList,
        powerPeriods: powerListOrUndefined,
        commissionPercentage: commission !== "" ? parseFloat(commission) : null,
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="max-w-5xl w-full overflow-y-auto max-h-[90vh] border border-[#3f3f46]"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold text-[#fafafa] pr-8">Nuevo Producto</h2>
      <p className="text-sm text-[#a1a1aa] mt-0.5 mb-5">
        Selecciona la tarifa y configura los precios de energía y potencia.
      </p>

      <div className="space-y-5">
        {/* Row 1: Tarifa | Tipo | Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL}>Tarifa</label>
            <select value={tariffId} onChange={(e) => onTariffChange(e.target.value)} className={INPUT}>
              <option value="">—</option>
              {tariffs.map((t) => <option key={t.id} value={t.id}>{t.code}</option>)}
            </select>
            {errors.tariff && <Err msg={errors.tariff} />}
          </div>
          <div>
            <label className={LABEL}>Tipo de producto</label>
            <select value={type} onChange={(e) => setType(e.target.value as ProductType)} className={INPUT}>
              {PRODUCT_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
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
            {errors.name && <Err msg={errors.name} />}
          </div>
        </div>

        {/* Energy card */}
        <div className={CARD}>
          {/* Header */}
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-[#fafafa] flex-1">
              Precios de energía (€/kWh)
            </span>
            <input
              type="number"
              value={commonE}
              onChange={(e) => setCommonE(e.target.value)}
              placeholder="Valor común"
              className={INPUT_SM}
            />
            <button type="button" onClick={() => applyAll(commonE, setEnergy, keys)} className={BTN_OUTLINE}>
              Aplicar a todos
            </button>
          </div>
          {/* Periods */}
          <div className={gridCls}>
            {keys.map((k) => (
              <div key={k}>
                <p className="text-sm text-[#fafafa] mb-1.5">{k}</p>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={energy[k] ?? ""}
                  onChange={(e) => setEnergy((prev) => ({ ...prev, [k]: e.target.value }))}
                  placeholder="0.000000"
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          {errors.energy && <Err msg={errors.energy} />}
        </div>

        {/* Power card */}
        <div className={CARD}>
          {/* Header */}
          <div className="flex items-center gap-3">
            <Target size={16} className="text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-[#fafafa] flex-1">
              Precios de potencia (€/kW/día)
            </span>
            <button type="button" onClick={loadBOE} disabled={!tariff} className={BTN_GHOST}>
              Cargar BOE
            </button>
            <input
              type="number"
              value={commonP}
              onChange={(e) => setCommonP(e.target.value)}
              placeholder="Valor común"
              className={INPUT_SM}
            />
            <button type="button" onClick={() => applyAll(commonP, setPower, keys)} className={BTN_OUTLINE}>
              Aplicar a todos
            </button>
          </div>
          {/* Periods */}
          <div className={gridCls}>
            {keys.map((k) => (
              <div key={k}>
                <p className="text-sm text-[#fafafa] mb-1.5">{k}</p>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={power[k] ?? ""}
                  onChange={(e) => setPower((prev) => ({ ...prev, [k]: e.target.value }))}
                  placeholder="0.00000000"
                  className={INPUT}
                />
              </div>
            ))}
          </div>
          {errors.power && <Err msg={errors.power} />}
        </div>

        {/* Comisión */}
        <div>
          <label className={LABEL}>Comisión (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Sin override — dejar vacío si no aplica"
            className={INPUT}
          />
          {errors.commission && <Err msg={errors.commission} />}
        </div>
      </div>

      {/* Buttons */}
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
              Creando...
            </span>
          ) : (
            "Crear producto"
          )}
        </button>
        <button onClick={handleClose} className={BTN_OUTLINE}>
          Cancelar
        </button>
      </div>
    </Dialog>
  );
};
