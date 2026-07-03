"use client";

import React, { useState } from "react";
import { Zap, Plus, Trash2 } from "lucide-react";
import { useTariffStore } from "@/app/store/tariff/tariff.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { BoePower, BoePowerPeriod, Tariff } from "../../interfaces/tarifa.interface";
import {
  createPotenciaBoePeriodo,
  updatePotenciaBoePeriodo,
  deletePotenciaBoePeriodo,
  createBoePower,
} from "@/app/services/TarifaService/tarifa.service";

interface Props { token: string }

const PERIOD_COLOR: Record<string, string> = {
  P1: "bg-red-100 text-red-800 border-red-200",
  P2: "bg-orange-100 text-orange-800 border-orange-200",
  P3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  P4: "bg-green-100 text-green-800 border-green-200",
  P5: "bg-blue-100 text-blue-800 border-blue-200",
  P6: "bg-purple-100 text-purple-800 border-purple-200",
};

const fmtValue = (v: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(v);

const getNumPeriods = (code: string) => code.trim().startsWith("2.") ? 3 : 6;

// N slots fijos (3 para 2.x, 6 para el resto) — huecos con id:-1
// period en API viene como string "P1", "P2", etc.
const preparePeriodoData = (power: BoePower, tariffCode: string, editingCell: string) => {
  const n = getNumPeriods(tariffCode);
  const map = new Map(power.periods.map((p) => [p.period, p]));
  return Array.from({ length: n }, (_, i) => {
    const num = i + 1;
    const key = `P${num}`;
    const period: BoePowerPeriod = map.get(key) ?? {
      id: -1, period: key, value: 0,
      boePowerId: power.id, boePower: null,
    };
    const cellId = `boe-${power.id}-${num}`;
    return { period, num, cellId, isEditing: editingCell === cellId };
  });
};

// Estado para tarifa SIN boePower todavía
interface PendingNew { tariffId: number; period: number }

export const PotenciaBOETab = ({ token }: Props) => {
  const tariffs = useTariffStore((s) => s.tariffs);
  const setTariffs = useTariffStore((s) => s.setTariffs);
  const { showAlert } = useAlertStore();

  const [selectedTariff, setSelectedTariff] = useState("all");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingNew, setPendingNew] = useState<PendingNew | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredTariffs: Tariff[] =
    selectedTariff === "all"
      ? tariffs
      : tariffs.filter((t) => String(t.id) === selectedTariff);

  const handleCancel = () => { setEditingCell(null); setEditValue(""); };
  const handleCancelNew = () => { setPendingNew(null); setEditValue(""); };

  // ── Guardar en boePower EXISTENTE ──────────────────────────────────────────
  const handleSave = async (period: BoePowerPeriod) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) { handleCancel(); return; }
    setSaving(true);
    try {
      if (period.id === -1) {
        const created = await createPotenciaBoePeriodo(token, {
          boePowerId: period.boePowerId,
          period: period.period, value,
        });
        showAlert("Período agregado", "success");
        setTariffs(tariffs.map((t) => ({
          ...t,
          boePowers: t.boePowers.map((p) =>
            p.id === period.boePowerId
              ? { ...p, periods: [...p.periods.filter((pp) => pp.period !== period.period), created] }
              : p
          ),
        })));
      } else {
        const updated = await updatePotenciaBoePeriodo(token, period.id, {
          boePowerId: period.boePowerId, period: period.period, value,
        });
        showAlert("Período actualizado", "success");
        setTariffs(tariffs.map((t) => ({
          ...t,
          boePowers: t.boePowers.map((p) =>
            p.id === period.boePowerId
              ? { ...p, periods: p.periods.map((pp) => pp.id === period.id ? updated : pp) }
              : p
          ),
        })));
      }
    } catch { showAlert("Error al guardar.", "error"); }
    finally { setSaving(false); }
    handleCancel();
  };

  const handleDelete = async (period: BoePowerPeriod) => {
    if (period.id === -1) return;
    setSaving(true);
    try {
      await deletePotenciaBoePeriodo(token, period.id);
      showAlert("Período eliminado", "success");
      setTariffs(tariffs.map((t) => ({
        ...t,
        boePowers: t.boePowers.map((p) =>
          p.id === period.boePowerId
            ? { ...p, periods: p.periods.filter((pp) => pp.id !== period.id) }
            : p
        ),
      })));
    } catch { showAlert("Error al eliminar.", "error"); }
    finally { setSaving(false); }
    handleCancel();
  };

  // ── Guardar en tarifa SIN boePower → crear boePower + período juntos ───────
  const handleSaveNew = async (tariffId: number, periodNum: number) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) { handleCancelNew(); return; }
    setSaving(true);
    try {
      const bp = await createBoePower(token, { tariffId });
      const newBp: BoePower = { ...bp, periods: [] };

      const created = await createPotenciaBoePeriodo(token, {
        boePowerId: newBp.id,
        period: `P${periodNum}`, value,
      });
      setTariffs(tariffs.map((t) =>
        t.id === tariffId
          ? { ...t, boePowers: [...t.boePowers, { ...newBp, periods: [created] }] }
          : t
      ));
      showAlert("Guardado correctamente", "success");
    } catch { showAlert("Error al guardar.", "error"); }
    finally { setSaving(false); }
    handleCancelNew();
  };

  // ── Render celda en boePower existente ─────────────────────────────────────
  const renderCell = (period: BoePowerPeriod, cellId: string, isEditing: boolean) => (
    <div className="text-center p-4 bg-body rounded-lg border border-border">
      <div className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg mb-3 border ${PERIOD_COLOR[period.period] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {period.period}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="number" step="0.000001" value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(period); if (e.key === "Escape") handleCancel(); }}
            className="w-full text-sm p-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            autoFocus disabled={saving}
          />
          <div className="flex justify-center gap-2">
            <button onClick={() => handleSave(period)} disabled={saving}
              className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50">✓</button>
            <button onClick={handleCancel} disabled={saving}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50">✕</button>
            <button onClick={() => handleDelete(period)} disabled={saving || period.id === -1}
              className="p-1.5 bg-gray-200 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : period.id === -1 ? (
        <div
          onClick={() => { setEditingCell(cellId); setEditValue(""); }}
          className="flex flex-col bg-input items-center justify-center cursor-pointer p-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-body transition"
        >
          <Plus size={20} className="text-accent-foreground" />
          <span className="text-xs text-muted-foreground">Agregar {period.period}</span>
        </div>
      ) : (
        <div
          onClick={() => { setEditingCell(cellId); setEditValue(period.value.toString()); }}
          className="cursor-text bg-input p-2 rounded-lg hover:bg-body transition"
        >
          <div className="text-lg font-bold text-card-foreground">{fmtValue(period.value)}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-foreground mb-2">Seleccionar Tarifa</label>
        <select
          value={selectedTariff}
          onChange={(e) => setSelectedTariff(e.target.value)}
          className="w-full px-3 py-2 border bg-input border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
        >
          <option value="all">Mostrar todos</option>
          {tariffs.map((t) => <option key={t.id} value={t.id}>{t.code}</option>)}
        </select>
      </div>

      <div className="space-y-6">
        {filteredTariffs.map((tariff) => {
          const hasPower = tariff.boePowers.length > 0;

          return (
            <div key={tariff.id} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{tariff.code}</h3>
                  <span className="text-sm text-muted-foreground">
                    {hasPower ? "Potencia BOE registrada" : "Sin potencia — agrega un período para comenzar"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-muted-foreground mb-4">Períodos de Potencia BOE</p>

                {(() => {
                  const n = getNumPeriods(tariff.code);
                  const gridCls = n === 3
                    ? "grid grid-cols-2 sm:grid-cols-3 gap-4"
                    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4";
                  return hasPower ? (
                  // ── Con boePower: N slots fijos via preparePeriodoData ──
                  <div className="space-y-6">
                    {tariff.boePowers.map((bp) => (
                      <div key={bp.id}>
                        <div className={gridCls}>
                          {preparePeriodoData(bp, tariff.code, editingCell ?? "").map(({ period, cellId, isEditing }) => (
                            <React.Fragment key={cellId}>
                              {renderCell(period, cellId, isEditing)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // ── Sin boePower: N slots vacíos, solo llama API al presionar ✓ ──
                  <div className={gridCls}>
                    {Array.from({ length: n }, (_, i) => i + 1).map((p) => {
                      const isThisOpen = pendingNew?.tariffId === tariff.id && pendingNew?.period === p;
                      return (
                        <div key={p} className="text-center p-4 bg-body rounded-lg border border-border">
                          <div className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg mb-3 border ${PERIOD_COLOR[`P${p}`] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            P{p}
                          </div>
                          {isThisOpen ? (
                            <div className="space-y-2">
                              <input
                                type="number" step="0.000001" value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSaveNew(tariff.id, p); if (e.key === "Escape") handleCancelNew(); }}
                                className="w-full text-sm p-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                                autoFocus disabled={saving}
                              />
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleSaveNew(tariff.id, p)} disabled={saving}
                                  className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50">✓</button>
                                <button onClick={handleCancelNew} disabled={saving}
                                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50">✕</button>
                                <button disabled
                                  className="p-1.5 bg-gray-200 text-gray-400 rounded-lg opacity-30 cursor-not-allowed">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => { setPendingNew({ tariffId: tariff.id, period: p }); setEditValue(""); }}
                              className="flex flex-col bg-input items-center justify-center cursor-pointer p-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-body transition"
                            >
                              <Plus size={20} className="text-accent-foreground" />
                              <span className="text-xs text-muted-foreground">Agregar P{p}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );})()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
