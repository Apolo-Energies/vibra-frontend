"use client";

import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTariffStore } from "@/app/store/tariff/tariff.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { useLoadingStore } from "@/app/store/ui/loading.store";
import { Product, ProductType } from "../../interfaces/tarifa.interface";
import {
  toggleProductAvailability,
  deleteProduct,
  createProduct,
  setProductCommission,
  updateProduct,
  getTariffs,
} from "@/app/services/TarifaService/tarifa.service";
import { NuevoProductoModal, CreateProductData } from "../modals/NuevoProductoModal";
import { EditarProductoModal } from "../modals/EditarProductoModal";
import { EliminarProductoModal } from "../modals/EliminarProductoModal";
import { VerProductoModal } from "../modals/VerProductoModal";

interface Props {
  token: string;
}

type ModalMode = "nuevo" | "editar" | "eliminar" | "ver" | null;

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none
      ${checked ? "bg-text-green" : "bg-border"}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
        ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

export const ProductosTab = ({ token }: Props) => {
  const { tariffs: rawTariffs, setTariffs } = useTariffStore();
  const tariffs = Array.isArray(rawTariffs) ? rawTariffs : [];
  const { showAlert } = useAlertStore();
  const { setLoading } = useLoadingStore();
  const [selectedTariff, setSelectedTariff] = useState<string>("Todas");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { tariffCode: string }) | null>(null);

  const allProducts = useMemo(
    () => tariffs.flatMap((t) => t.products.map((p) => ({ ...p, tariffCode: t.code }))),
    [tariffs]
  );

  const filtered = useMemo(
    () =>
      selectedTariff === "Todas"
        ? allProducts
        : allProducts.filter((p) => p.tariffCode === selectedTariff),
    [allProducts, selectedTariff]
  );

  const tariffCodes = ["Todas", ...tariffs.map((t) => t.code)];

  const getTariffByProduct = (product: Product & { tariffCode: string }) =>
    tariffs.find((t) => t.code === product.tariffCode) ?? null;

  const openModal = (mode: ModalMode, product?: Product & { tariffCode: string }) => {
    setSelectedProduct(product ?? null);
    setModalMode(mode);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const refetch = async () => {
    try {
      const fresh = await getTariffs(token);
      setTariffs(fresh);
    } catch {
      // silently ignore — data may be stale but UI stays functional
    }
  };

  // ── Toggle disponibilidad ────────────────────────────────────────────────────
  const handleToggle = async (product: Product & { tariffCode: string }, val: boolean) => {
    // Optimistic update for the toggle (fast feedback)
    setTariffs(
      tariffs.map((t) => ({
        ...t,
        products: t.products.map((p) =>
          p.id === product.id ? { ...p, isAvailable: val } : p
        ),
      }))
    );
    try {
      await toggleProductAvailability(token, product.id, val);
    } catch {
      // Revert on error
      setTariffs(
        tariffs.map((t) => ({
          ...t,
          products: t.products.map((p) =>
            p.id === product.id ? { ...p, isAvailable: !val } : p
          ),
        }))
      );
      showAlert("Error al cambiar disponibilidad.", "error");
    }
  };

  // ── Crear producto ───────────────────────────────────────────────────────────
  const handleCreate = async (data: CreateProductData) => {
    setLoading(true);
    try {
      const newProduct = await createProduct(token, {
        name: data.name,
        tariffId: data.tariffId,
        type: data.type,
        energyPeriods: data.energyPeriods,
        powerPeriods: data.powerPeriods,
      });
      if (data.commissionPercentage != null) {
        await setProductCommission(token, newProduct.id, data.commissionPercentage);
      }
      await refetch();
      showAlert("Producto creado correctamente.", "success");
    } finally {
      setLoading(false);
    }
  };

  // ── Editar producto ──────────────────────────────────────────────────────────
  const handleEdit = async (data: {
    name: string;
    type: ProductType;
    commission: number | null;
    energyPeriods: Record<number, string>;
    powerPeriods: Record<number, string>;
  }) => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const toApiPeriods = (map: Record<number, string>) =>
        Object.entries(map)
          .filter(([, v]) => v.trim() !== "")
          .map(([k, v]) => ({ period: `P${k}`, value: parseFloat(v) }));

      const energyPeriods = toApiPeriods(data.energyPeriods);
      const powerList = toApiPeriods(data.powerPeriods);
      const powerPeriods = powerList.length > 0 ? powerList : undefined;

      await updateProduct(token, selectedProduct.id, {
        name: data.name,
        type: data.type,
        commission: data.commission,
        energyPeriods,
        powerPeriods,
      });
      await refetch();
      showAlert("Producto actualizado correctamente.", "success");
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar producto ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await deleteProduct(token, selectedProduct.id);
      await refetch();
      showAlert("Producto eliminado.", "success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros + botón */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {tariffCodes.map((code) => (
            <button
              key={code}
              onClick={() => setSelectedTariff(code)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${
                  selectedTariff === code
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                }`}
            >
              {code}
            </button>
          ))}
        </div>
        <button
          onClick={() => openModal("nuevo")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Agregar producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[110px_1fr_140px_180px_160px] px-6 py-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarifa</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comisión</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disponible</span>
              <span />
            </div>

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm">
                No hay productos para esta tarifa.
              </div>
            )}

            {filtered.map((product, i) => (
              <div
                key={product.id}
                className={`grid grid-cols-[110px_1fr_140px_180px_160px] px-6 py-4 items-center
                  ${i < filtered.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-sm text-foreground font-medium">{product.tariffCode}</span>
                <span className="text-sm text-foreground truncate pr-3">{product.name}</span>
                <span className="text-sm">
                  {product.commissionPercentage != null ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-medium">
                      {product.commissionPercentage}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {product.isAvailable ? "Activo" : "Inactivo"}
                  </span>
                  <Toggle checked={!!product.isAvailable} onChange={(val) => handleToggle(product, val)} />
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => openModal("ver", product)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => openModal("editar", product)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openModal("eliminar", product)}
                    className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NuevoProductoModal
        open={modalMode === "nuevo"}
        onClose={closeModal}
        tariffs={tariffs}
        defaultTariffCode={selectedTariff !== "Todas" ? selectedTariff : undefined}
        onSave={handleCreate}
      />

      <EditarProductoModal
        open={modalMode === "editar"}
        onClose={closeModal}
        product={selectedProduct}
        tariff={selectedProduct ? getTariffByProduct(selectedProduct) : null}
        onSave={handleEdit}
      />

      <EliminarProductoModal
        open={modalMode === "eliminar"}
        onClose={closeModal}
        product={selectedProduct}
        onConfirm={handleDelete}
      />

      <VerProductoModal
        open={modalMode === "ver"}
        onClose={closeModal}
        product={selectedProduct}
        tariff={selectedProduct ? getTariffByProduct(selectedProduct) : null}
      />
    </div>
  );
};
