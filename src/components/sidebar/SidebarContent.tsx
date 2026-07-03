"use client";

import React, { useEffect, useState } from "react";
import { sidebarItems } from "@/constants/SidebarItems";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export const SidebarContent = () => {
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [sessionUpdated, setSessionUpdated] = useState(false);

  useEffect(() => {
    if (session && !sessionUpdated) {
      update();
      setSessionUpdated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUpdated]);

  const userRole = session?.user.role || "";

  const itemsToRender = sidebarItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Nav items */}
      <nav className="flex-1 px-3 pt-6 overflow-y-auto">
        {itemsToRender.map((item, index) => {
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
