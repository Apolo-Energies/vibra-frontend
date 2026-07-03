"use client";

import React from "react";
import { Trash2 } from "lucide-react";

// Badge colors matching the screenshot (pastel pills)
const BADGE_COLORS: Record<number, string> = {
  1: "bg-red-200 text-red-700",
  2: "bg-orange-200 text-orange-700",
  3: "bg-yellow-200 text-yellow-700",
  4: "bg-green-200 text-green-700",
  5: "bg-blue-200 text-blue-700",
  6: "bg-purple-200 text-purple-700",
};

interface Props {
  periodNum: number;
  periodId: number;
  value: number;
  decimals?: number;
  cellId: string;
  isEditing: boolean;
  editValue: string;
  onEditStart: (cellId: string, value: number) => void;
  onEditChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export const PeriodoCell = ({
  periodNum,
  periodId,
  value,
  decimals = 6,
  cellId,
  isEditing,
  editValue,
  onEditStart,
  onEditChange,
  onSave,
  onCancel,
  onDelete,
}: Props) => {
  const isEmpty = periodId === -1;
  const badge = BADGE_COLORS[periodNum] ?? "bg-gray-200 text-gray-700";

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-[#1c1d20] border border-[#2e2f33] p-4">
      {/* Period badge */}
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge}`}>
        P{periodNum}
      </span>

      {isEditing ? (
        <>
          {/* Input */}
          <input
            type="number"
            step={decimals === 8 ? "0.00000001" : "0.000001"}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            autoFocus
            className="w-full text-center text-sm font-semibold bg-[#141416] border-2 border-blue-500 rounded-lg px-2 py-2 text-white focus:outline-none"
          />
          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-bold transition-colors"
            >
              ✓
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-base font-bold transition-colors"
            >
              ✕
            </button>
            <button
              onClick={onDelete}
              disabled={isEmpty}
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#3a3b3f] hover:bg-[#4a4b50] text-[#a1a1aa] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      ) : (
        /* Value display — click to edit */
        <div
          onClick={() => onEditStart(cellId, isEmpty ? NaN : value)}
          className="w-full text-center cursor-pointer bg-[#141416] border border-[#2e2f33] rounded-lg px-2 py-3 hover:border-[#4a4b50] transition-colors"
        >
          {isEmpty ? (
            <span className="text-sm text-[#a1a1aa]">—</span>
          ) : (
            <span className="text-base font-bold text-white">{fmt(value)}</span>
          )}
        </div>
      )}
    </div>
  );
};
