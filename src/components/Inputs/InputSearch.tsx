import { LucideIcon } from "lucide-react";
import React from "react";

interface FilterInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type: string;
  icon?: LucideIcon;
}

export const InputSearch = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  icon: Icon,
}: FilterInputProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground" />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full placeholder:text-foreground bg-input text-sm rounded border px-3 py-1.5 focus:outline-none focus:ring ${
            error
              ? "border-red-500 ring-red-500"
              : "border-border ring-blue-500"
          } ${Icon ? "pl-10" : ""}`}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
