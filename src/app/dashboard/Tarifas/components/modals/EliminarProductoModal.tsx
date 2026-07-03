"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/Dialogs/Dialog";
import { Product } from "../../interfaces/tarifa.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  product: (Product & { tariffCode: string }) | null;
  onConfirm: () => Promise<void>;
}

export const EliminarProductoModal = ({ open, onClose, product, onConfirm }: Props) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <h2 className="text-xl font-bold text-foreground mb-2">Eliminar producto</h2>
      <p className="text-sm text-muted-foreground mb-6">
        ¿Estás seguro de que quieres eliminar el producto{" "}
        <strong className="text-foreground">{product.name}</strong>? Esta acción no se puede deshacer.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
        >
          Cancelar
        </button>
      </div>
    </Dialog>
  );
};
