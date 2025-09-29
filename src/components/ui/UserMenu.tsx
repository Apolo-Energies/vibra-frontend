"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../buttons/button";
import { LogOut, Settings, User } from "lucide-react";
import { logout } from "@/actions";

export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen((prev) => !prev)}
      >
        <User className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
          <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
            <li
              onClick={() => {
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </li>
            <li
              onClick={() => {
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <User className="w-4 h-4" />
              Mi perfil
            </li>
            
            <form
              action={async () => {
                setOpen(false);
                await logout();
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </form>
          </ul>
        </div>
      )}
    </div>
  );
};
