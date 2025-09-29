import React from "react";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  required?: boolean;
  errors?: FieldErrors<T>;
  defaultValue?: string | number;
}

export const Input = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  register,
  required = false,
  errors,
  defaultValue
}: Props<T>) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, { required })}
        className={`w-full placeholder:text-gray-400 bg-input text-sm rounded border px-3 py-1.5 focus:outline-none focus:ring ${
          errors && errors[name]
            ? "border-red-500 ring-red-500"
            : "border-border ring-blue-500"
        }`}
        defaultValue={defaultValue}
      />
      {errors && errors[name] && (
        <p className="text-xs text-red-600 mt-1">Este campo es obligatorio</p>
      )}
    </div>
  );
};
