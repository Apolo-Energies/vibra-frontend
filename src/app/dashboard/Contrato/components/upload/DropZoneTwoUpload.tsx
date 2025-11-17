"use client";

import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils/utils";

const acceptedFormats = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "application/pdf",
];

interface Props {
    onFileSelect: (files: (File | string)[]) => void;
}

export const DropzoneTwoUpload = ({ onFileSelect }: Props) => {
    const [previews, setPreviews] = useState<
        { url: string; isPdf: boolean; file: File | null }[]
    >([
        { url: "", isPdf: false, file: null }, // posición 0 = Factura
        { url: "", isPdf: false, file: null }, // posición 1 = Datos del cliente
    ]);

    const fileInputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
    const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);

    const handleFiles = (files: FileList, index: number) => {
        const file = files[0];
        if (!file || !acceptedFormats.includes(file.type)) {
            alert("Formato no soportado.");
            return;
        }

        const newPreview = {
            url: URL.createObjectURL(file),
            isPdf: file.type === "application/pdf",
            file,
        };

        const updated = [...previews];
        updated[index] = newPreview;
        setPreviews(updated);

        const selectedFiles = updated.map((p) => p.file).filter((f): f is File => !!f);
        onFileSelect(selectedFiles);
    };

    const handleClear = (index: number) => {
        const updated = [...previews];
        updated[index] = { url: "", isPdf: false, file: null };
        setPreviews(updated);

        const selectedFiles = updated.map((p) => p.file).filter((f): f is File => !!f);
        onFileSelect(selectedFiles);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">
                Sube tus archivos (máx. 2 archivos)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["Factura", "Datos del cliente"].map((label, index) => (
                    <div
                        key={index}
                        onClick={() => fileInputs[index].current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setHoveringIndex(index);
                        }}
                        onDragLeave={() => setHoveringIndex(null)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setHoveringIndex(null);
                            if (e.dataTransfer.files.length > 0)
                                handleFiles(e.dataTransfer.files, index);
                        }}
                        className={cn(
                            "w-full min-h-[220px] bg-info-bg rounded-xl border border-dashed border-blue-300 px-6 py-5 flex flex-col items-center justify-center text-center transition relative cursor-pointer hover:bg-blue-200/30",
                            hoveringIndex === index && "ring-2 ring-blue-400"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputs[index]}
                            accept={acceptedFormats.join(",")}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) handleFiles(e.target.files, index);
                            }}
                        />

                        {previews[index].file ? (
                            <div className="relative w-full flex flex-col items-center space-y-2">
                                {previews[index].isPdf ? (
                                    <iframe
                                        src={previews[index].url}
                                        className="w-full h-56 rounded-md border"
                                        title={`PDF Preview ${index}`}
                                    />
                                ) : (
                                    <Image
                                        src={previews[index].url}
                                        alt={`preview-${index}`}
                                        width={300}
                                        height={200}
                                        className="w-full max-h-48 rounded-md object-contain"
                                    />
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear(index);
                                    }}
                                    className="absolute cursor-pointer top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    <X size={18} />
                                </button>
                                <div className="w-full text-center py-2 text-xs font-medium text-gray-600 border-t bg-gray-50 rounded-b-md">
                                    {label}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload
                                    className={cn(
                                        "w-8 h-8 mb-2",
                                        index === 0 ? "text-blue-500" : "text-green-500"
                                    )}
                                    strokeWidth={1.5}
                                />
                                <p className="text-sm font-semibold text-gray-700">{label}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Haz clic o arrastra un archivo
                                    <br />
                                    (PDF o imágenes: JPG, PNG, WEBP, BMP, TIFF)
                                </p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
