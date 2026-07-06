"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/buttons/button";
import { DropzoneUpload } from "./upload/DropzoneUpload";
import { ComparadorFormModal } from "./modals/ComparadorFormModal";
import { useLoadingStore } from "@/app/store/ui/loading.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { subirYProcesarDocumento } from "@/app/services/MatilService/ocr.service";
import { OcrData } from "../interfaces/matilData";
import { getTipoArchivo } from "@/utils/typeFile";
import { useTariffStore } from "@/app/store/tariff/tariff.store";
import { getTariffs } from "@/app/services/TarifaService/tarifa.service";

interface Props {
  token: string;
}

export const Comparador = ({ token }: Props) => {
  const [matilData, setMatilData] = useState<unknown | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [file, setFile] = useState<File | string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const { setLoading } = useLoadingStore();
  const { showAlert } = useAlertStore();
  const { tariffs, setTariffs } = useTariffStore();

  useEffect(() => {
    if (!token || tariffs.length > 0) return;
    getTariffs(token)
      .then(setTariffs)
      .catch(() => showAlert("Error al cargar tarifas.", "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFileSelect = (file: File | string) => {
    setFile(file);
  };

  const handleComparar = async () => {
    if (!file || typeof file === "string") return;

    setLoading(true);
    try {
      const tipo = getTipoArchivo(file);
      const nombre = file.name.split(".")[0];

      const resultado = await subirYProcesarDocumento(token, file, nombre, tipo);

      setMatilData(resultado?.ocrData);
      setFileId(resultado?.fileId);
      setOpenModal(true);
      showAlert("Documento procesado correctamente.", "success");
    } catch {
      showAlert("Error al procesar el documento.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="w-full rounded-lg px-6 py-6 space-y-4">
        <DropzoneUpload onFileSelect={handleFileSelect} />
        <div className="border-t border-border pt-4 flex justify-center">
          <Button onClick={handleComparar} disabled={!file}>
            Comparar
          </Button>
        </div>
      </Card>

      <ComparadorFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        matilData={matilData as OcrData | undefined}
        fileId={fileId || ""}
        token={token}
      />
    </div>
  );
};
