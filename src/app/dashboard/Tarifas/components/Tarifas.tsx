"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Building2, Package, TrendingUp, Zap, Download } from "lucide-react";
import { ProveedorTab } from "./tabs/ProveedorTab";
import { ProductosTab } from "./tabs/ProductosTab";
import { RepartoOMIETab } from "./tabs/RepartoOMIETab";
import { PotenciaBOETab } from "./tabs/PotenciaBOETab";
import { useTariffStore } from "@/app/store/tariff/tariff.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { useLoadingStore } from "@/app/store/ui/loading.store";
import { getTariffs, downloadExcel } from "@/app/services/TarifaService/tarifa.service";

type Tab = "proveedor" | "productos" | "omie" | "boe";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "proveedor", label: "Proveedor", icon: Building2 },
  { id: "productos", label: "Productos", icon: Package },
  { id: "omie", label: "Reparto OMIE", icon: TrendingUp },
  { id: "boe", label: "Potencia BOE", icon: Zap },
];

const PROVEEDOR_MOCK = {
  name: "Apolo",
  status: "Activo" as const,
  tarifasRegistradas: 4,
  estadoOperativo: "Operativo",
};

export const Tarifas = () => {
  const { data: session } = useSession();
  const token = session?.user?.token ?? "";
  const { tariffs, setTariffs } = useTariffStore();
  const { showAlert } = useAlertStore();
  const { setLoading } = useLoadingStore();
  const [activeTab, setActiveTab] = useState<Tab>("proveedor");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getTariffs(token)
      .then(setTariffs)
      .catch(() => showAlert("Error al cargar tarifas.", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleExcel = async () => {
    if (!token) return;
    try {
      const blob = await downloadExcel(token, 1);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tarifas.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showAlert("Error al exportar Excel.", "error");
    }
  };

  const proveedorData = {
    ...PROVEEDOR_MOCK,
    tarifasRegistradas: tariffs.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestión de Tarifarios</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Administra tarifas, reparto OMIE y potencias BOE
          </p>
        </div>
        <button
          onClick={handleExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-accent transition-colors"
        >
          <Download size={16} />
          Exportar Excel
        </button>
      </div>

      {/* Tab navigator */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-medium text-sm transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "proveedor" && <ProveedorTab proveedor={proveedorData} />}
      {activeTab === "productos" && <ProductosTab token={token} />}
{activeTab === "omie" && <RepartoOMIETab token={token} />}
      {activeTab === "boe" && <PotenciaBOETab token={token} />}
    </div>
  );
};
