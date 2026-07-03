"use client";

import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";

const PERIOD_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-orange-100 text-orange-800 border-orange-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  4: "bg-green-100 text-green-800 border-green-200",
  5: "bg-blue-100 text-blue-800 border-blue-200",
  6: "bg-purple-100 text-purple-800 border-purple-200",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 6, maximumFractionDigits: 6 }).format(v);

interface Props {
  periodNumber: number;
  periodId: number;
  value: number | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: number) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}

export const PeriodoCard = ({
  periodNumber,
  periodId,
  value,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) => {
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");
  const badgeClass = PERIOD_COLORS[periodNumber] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isEmpty = periodId === -1;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const num = parseFloat(inputValue.replace(",", "."));
      if (!isNaN(num)) onSave(num);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleSave = () => {
    const num = parseFloat(inputValue.replace(",", "."));
    if (!isNaN(num)) onSave(num);
  };

  return (
    <div className="text-center p-4 bg-body rounded-lg group hover:bg-card transition-all duration-200 border border-border relative">
      <div className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg mb-3 border ${badgeClass}`}>
        P{periodNumber}
      </div>

      {isEmpty && !isEditing ? (
        <div
          onClick={onStartEdit}
          className="flex flex-col bg-input items-center justify-center cursor-pointer p-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-body transition"
        >
          <Plus size={20} className="text-accent-foreground" />
          <span className="text-xs text-muted-foreground">Agregar P{periodNumber}</span>
        </div>
      ) : isEditing ? (
        <div className="space-y-2">
          <input
            type="number"
            step="0.000001"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-sm p-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
          />
          <div className="flex justify-center gap-2">
            <button
              onClick={handleSave}
              className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✓
            </button>
            <button
              onClick={onCancel}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ✕
            </button>
            {!isEmpty && (
              <button
                onClick={onDelete}
                className="p-1.5 bg-gray-200 text-red-500 rounded-lg hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setInputValue(value?.toString() ?? "");
            onStartEdit();
          }}
          className="cursor-text bg-input p-2 rounded-lg hover:bg-body transition"
        >
          <div className="text-lg font-bold text-foreground">{value !== null ? fmt(value) : "—"}</div>
        </div>
      )}
    </div>
  );
};
