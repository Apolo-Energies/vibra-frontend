"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { useTariffStore } from "@/app/store/tariff/tariff.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { ProductPeriod, Tariff } from "../../interfaces/tarifa.interface";
import { PeriodoCell } from "../PeriodoCell";
import {
  createProductPeriod,
  updateProductPeriod,
  deleteProductPeriod,
} from "@/app/services/TarifaService/tarifa.service";

interface Props { token: string }

const parsePeriodNum = (period: string): number => parseInt(period.replace("P", ""), 10) || 0;

const prepareProductPeriods = (productId: number, periods: ProductPeriod[]) => {
  const map = new Map(periods.map((p) => [p.period, p]));
  return Array.from({ length: 6 }, (_, i) => {
    const num = i + 1;
    const key = `P${num}` as string;
    const period: ProductPeriod = map.get(key) ?? { id: -1, period: key, value: 0, productId, product: null };
    return { period, num, cellId: `product-${productId}-${num}` };
  });
};

export const TarifasTab = ({ token }: Props) => {
  const { tariffs, setTariffs } = useTariffStore();
  const { showAlert } = useAlertStore();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedTariffId, setSelectedTariffId] = useState<string>("all");

  const filteredTariffs: Tariff[] =
    selectedTariffId === "all"
      ? tariffs
      : tariffs.filter((t) => String(t.id) === selectedTariffId);

  const handleEditStart = (cellId: string, value: number) => {
    setEditingCell(cellId);
    setEditValue(isNaN(value) ? "" : String(value));
  };

  const handleSave = async (period: ProductPeriod) => {
    const num = parseFloat(editValue.replace(",", "."));
    if (isNaN(num)) { setEditingCell(null); return; }

    try {
      if (period.id === -1) {
        const created = await createProductPeriod(token, {
          productId: period.productId,
          period: parsePeriodNum(period.period),
          value: num,
          product: null,
        });
        setTariffs(tariffs.map((t) => ({
          ...t,
          products: t.products.map((p) =>
            p.id === period.productId
              ? { ...p, periods: [...p.periods.filter((pp) => pp.period !== period.period), created] }
              : p
          ),
        })));
      } else {
        await updateProductPeriod(token, period.id, { ...period, value: num });
        setTariffs(tariffs.map((t) => ({
          ...t,
          products: t.products.map((p) =>
            p.id === period.productId
              ? { ...p, periods: p.periods.map((pp) => pp.id === period.id ? { ...pp, value: num } : pp) }
              : p
          ),
        })));
      }
      showAlert("Período guardado.", "success");
    } catch {
      showAlert("Error al guardar el período.", "error");
    }
    setEditingCell(null);
  };

  const handleDelete = async (period: ProductPeriod) => {
    if (period.id === -1) return;
    try {
      await deleteProductPeriod(token, period.id);
      setTariffs(tariffs.map((t) => ({
        ...t,
        products: t.products.map((p) =>
          p.id === period.productId
            ? { ...p, periods: p.periods.filter((pp) => pp.id !== period.id) }
            : p
        ),
      })));
      showAlert("Período eliminado.", "success");
    } catch {
      showAlert("Error al eliminar el período.", "error");
    }
    setEditingCell(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Seleccionar Tarifa</label>
            <select
              value={selectedTariffId}
              onChange={(e) => setSelectedTariffId(e.target.value)}
              className="w-full px-3 py-2 border bg-input border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
            >
              <option value="all">Mostrar todos</option>
              {tariffs.map((t) => (
                <option key={t.id} value={t.id}>{t.code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTariffs.map((tariff) =>
        tariff.products.map((product) => {
          const cells = prepareProductPeriods(product.id, product.periods);
          return (
            <div key={`${tariff.id}-${product.id}`} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <Calculator className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{tariff.code}</h3>
                  <span className="text-sm text-muted-foreground">{product.name}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-muted-foreground mb-4">Períodos (€/kWh)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {cells.map(({ period, num, cellId }) => (
                    <PeriodoCell
                      key={cellId}
                      periodNum={num}
                      periodId={period.id}
                      value={period.value}
                      decimals={6}
                      cellId={cellId}
                      isEditing={editingCell === cellId}
                      editValue={editValue}
                      onEditStart={handleEditStart}
                      onEditChange={setEditValue}
                      onSave={() => handleSave(period)}
                      onCancel={() => setEditingCell(null)}
                      onDelete={() => handleDelete(period)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}

      {filteredTariffs.every((t) => t.products.length === 0) && (
        <div className="bg-card rounded-lg border border-border p-12 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No hay productos para esta tarifa.</p>
        </div>
      )}
    </div>
  );
};
