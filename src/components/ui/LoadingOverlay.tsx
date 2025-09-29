"use client";

import { useLoadingStore } from '@/app/store/ui/loading.store';
import React from 'react'
import { MoonLoader } from 'react-spinners';

export const LoadingOverlay = () => {
  const loading = useLoadingStore((state) => state.loading);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <MoonLoader color="#03116d" size={90} />
        <p className="text-white text-sm">Cargando...</p>
      </div>
    </div>
  );
};
