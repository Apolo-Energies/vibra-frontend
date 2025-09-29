import React from "react";

interface Option {
  id: string | number;
  name: string;
  percentage?: number; // opcional, solo para comisiones
}

interface Props<T extends Option> {
  value: string | number;
  options: T[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SelectOptions = <T extends Option>({
  options,
  value,
  onChange,
  placeholder = "Seleccionar",
  className,
}: Props<T>) => {
  const showPlaceholder = !value;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-40 text-sm border bg-input border-border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {showPlaceholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.percentage ? `${opt.name} (${opt.percentage}%)` : opt.name}
        </option>
      ))}
    </select>
  );
};
