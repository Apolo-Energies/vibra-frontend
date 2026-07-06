"use client";

import React from "react";
import { sidebarItems } from "@/constants/SidebarItems";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface Props {
  allowedUrls: string[];
}

export const SidebarContent = ({ allowedUrls }: Props) => {
  const pathname = usePathname();
  const items = sidebarItems.filter((item) => allowedUrls.includes(item.url));

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Nav items */}
      <nav className="flex-1 px-3 pt-6 overflow-y-auto">
        {items.map((item, index) => {
          const isSelected = pathname === item.url;
          return (
            <Link href={item.url} key={index}>
              <button
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 cursor-pointer
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="px-3 pb-4 shrink-0 border-t border-border pt-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};
