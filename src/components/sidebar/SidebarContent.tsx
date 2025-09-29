
import React, { useEffect, useState } from "react";

import { sidebarItems } from "@/constants/SidebarItems";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export const SidebarContent = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { data: session, update } = useSession();
  const [sessionUpdated, setSessionUpdated] = useState(false);

  
  useEffect(() => {
    // Si hay sesión y aún no hemos hecho update
    if (session && !sessionUpdated) {
      update(); // fuerza recarga de sesión
      setSessionUpdated(true); // marca que ya se ejecutó
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const logoSrc =
    theme === "dark" ? "/logos/apolologo2.webp" : "/logos/apolologo.webp";

  const userRole = session?.user.role || ""; 
 
  // Filtramos los items segun el rol del usuario
  const itemsToRender = sidebarItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <Link
        href="/dashboard"
        className="flex justify-center items-center w-full h-20 py-4 px-2"
      >
        <div className="relative w-full h-full max-w-xs">
          <Image
            src={logoSrc}
            alt="Apolo Energies"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </Link>

      <nav className="px-3">
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
                <item.icon
                  className={`w-4 h-4 ${
                    isSelected
                      ? "text-sidebar-selected-text"
                      : "text-sidebar-text"
                  }`}
                />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
