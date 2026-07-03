"use client";

import React from "react";

interface Proveedor {
  name: string;
  status: "Activo" | "Inactivo";
  tarifasRegistradas: number;
  estadoOperativo: string;
}

interface Props {
  proveedor: Proveedor | null;
}

export const ProveedorTab = ({ proveedor }: Props) => {
  if (!proveedor) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No hay proveedor configurado.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{proveedor.name}</h2>
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
            proveedor.status === "Activo"
              ? "bg-text-green/20 text-text-green"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {proveedor.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-lg bg-body border border-border">
          <p className="text-sm font-medium text-foreground mb-1">Tarifas registradas</p>
          <p className="text-4xl font-bold text-foreground">{proveedor.tarifasRegistradas}</p>
        </div>
        <div className="p-4 rounded-lg bg-body border border-border">
          <p className="text-sm font-medium text-foreground mb-1">Estado</p>
          <p className="text-3xl font-bold text-text-green">{proveedor.estadoOperativo}</p>
        </div>
      </div>
    </div>
  );
};
