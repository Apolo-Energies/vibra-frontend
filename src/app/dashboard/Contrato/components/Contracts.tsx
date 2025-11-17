"use client";

import React, { useState } from "react";
import { DropzoneTwoUpload } from "./upload/DropZoneTwoUpload";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/buttons/button";
import { useLoadingStore } from "@/app/store/ui/loading.store";
import { useAlertStore } from "@/app/store/ui/alert.store";
import { useSession } from "next-auth/react";
import { getTipoArchivo } from "@/utils/typeFile";
import { subirYProcesarDocumento } from "@/app/services/MatilService/ocr.service";

export const Contracts = () => {
    const [matilData, setMatilData] = useState<unknown | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [files, setFiles] = useState<(File | string)[]>([]); // ahora manejamos un array
    const [openModal, setOpenModal] = useState(false);

    const { setLoading } = useLoadingStore();
    const { showAlert } = useAlertStore();
    const { data: session } = useSession();

    // Recibe los 2 archivos desde DropzoneTwoUpload
    const handleFileSelect = (files: (File | string)[]) => {
        setFiles(files);
    };

    const handleComparar = async () => {
        if (files.length === 0) {
            showAlert("Debes subir al menos un archivo.", "info");
            return;
        }

        setLoading(true);
        try {
            const token = session?.user?.token;
            if (!token) {
                showAlert("No se encontró el token de autenticación.", "error");
                setLoading(false);
                return;
            }

            // Aquí puedes decidir si procesas los 2 archivos juntos o uno por uno.
            // Por ejemplo, procesar ambos secuencialmente:
            const resultados = [];

            for (const file of files) {
                if (typeof file === "string") continue; // ignorar si no es File
                const tipo = getTipoArchivo(file);
                const nombre = file.name.split(".")[0];

                const resultado = await subirYProcesarDocumento(token, file, nombre, tipo);
                resultados.push(resultado);
            }

            // Guarda el resultado del primero o combínalos
            setMatilData(resultados.map((r) => r?.result?.ocrData));
            setFileId(resultados[0]?.result?.id || null);
            setOpenModal(true);
            showAlert("Documentos procesados correctamente.", "success");
        } catch (error) {
            console.error("Error al analizar documento:", error);
            showAlert("Error al procesar los documentos.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-6 py-8 space-y-6">
            <div>
                <p className="text-2xl text-foreground font-bold">Contratos</p>
                <p className="text-muted-foreground">
                    Sube 2 archivos para generar contratos.
                </p>
            </div>

            <div className="flex justify-center">
                <Card className="w-full max-w-2xl rounded-xl p-6 space-y-4">
                    <DropzoneTwoUpload onFileSelect={handleFileSelect} />
                    <div className="flex justify-center">
                        <Button size="sm" onClick={handleComparar} disabled={files.length === 0}>
                            Comparar
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Si usas el modal, lo reactivas aquí */}
            {/* 
      <ComparadorFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        matilData={matilData as OcrData[] | undefined}
        fileId={fileId || ""}
        token={session?.user.token || ""} 
      /> 
      */}
        </div>
    );
};
