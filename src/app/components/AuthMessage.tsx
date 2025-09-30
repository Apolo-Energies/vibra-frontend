"use client";

import { ModeToggle } from "@/components/buttons/ModeToggle";
import { BeatLoader } from "react-spinners";

interface Props {
  isVerifying: boolean;
}

export const AuthMessage = ({ isVerifying }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      {isVerifying ? (
        <>
          <p className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
            Verificando API Key <BeatLoader size={10} color="#ffff" />
          </p>
          <p className="text-foreground">Por favor espere un momento.</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold mb-2">
            Debe ingresar con un enlace válido que contenga una API Key
          </p>
          <p className="text-foreground">
            Si no tiene una API Key, contacte al administrador.
          </p>
        </>
      )}
    </div>
  );
};
