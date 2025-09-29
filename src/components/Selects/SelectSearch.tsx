import { LucideIcon } from "lucide-react";
import React from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: LucideIcon;
  options: Option[];
}

export const SelectSearch = ({ label, value, onChange, error, icon: Icon, options }: Props) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3"
          } pr-4 py-1.5 text-sm rounded border focus:outline-none focus:ring ${
            error
              ? "border-red-500 ring-red-500"
              : "border-border ring-blue-500"
          } appearance-none bg-input`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
