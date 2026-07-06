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
    <div className="flex items-center justify-center min-h-screen bg-body px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 relative">
        <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
          Acceso al Comparador
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Ingresa tu código de acceso para continuar
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="accessCode"
              className="block text-sm font-medium mb-1 text-foreground"
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
              className="w-full px-3 py-2 text-sm rounded-lg border bg-input border-border text-foreground placeholder-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:ring-opacity-50 transition-all duration-200"
              required
            />
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          <button
            type="submit"
            disabled={isPending}
            className="w-full text-sm font-medium cursor-pointer bg-primary hover:opacity-90 text-primary-foreground py-2 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-opacity-50 active:opacity-80 flex items-center justify-center"
          >
            {isPending ? <MoonLoader size={20} color="currentColor" /> : "Entrar"}
          </button>

          {errorMessage && (
            <p className="text-destructive text-sm mt-1 text-center">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
