"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MoonLoader } from "react-spinners";
import { authenticate } from "@/actions";

export default function AuthPage() {
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/Comparador";
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const lastErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (errorMessage && errorMessage !== lastErrorRef.current) {
      lastErrorRef.current = errorMessage;
    }
  }, [errorMessage]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6 relative">
        {/* Encabezado con icono */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            🔑
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
          Acceso al Comparador
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Ingresa tu código de acceso para continuar
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="accessCode"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Código de acceso
            </label>
            <input
              type="text"
              id="accessCode"
              name="accessCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Introduce tu código"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              required
            />
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          <button
            type="submit"
            disabled={isPending}
            className="w-full text-sm font-medium cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 flex items-center justify-center"
          >
            {isPending ? <MoonLoader size={20} color="#fff" /> : "Entrar"}
          </button>

          {errorMessage && (
            <p className="text-red-500 text-sm mt-1 text-center">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
