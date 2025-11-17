"use client";
import { Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "../buttons/ModeToggle";
import { Button } from "../buttons/button";
import { useSidebarStore } from "@/app/store/ui/sidebar.store";
import { UserMenu } from "./UserMenu";
import { useSession } from "next-auth/react";

export const Header = () => {
  const { data: session, update } = useSession();
  const [sessionUpdated, setSessionUpdated] = useState(false);
  
  useEffect(() => {
    // Si hay sesión y aún no hemos hecho update
    if (session && !sessionUpdated) {
      update(); // fuerza recarga de sesión
      setSessionUpdated(true); // marca que ya se ejecutó
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUpdated]);

  const { toggle } = useSidebarStore();
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <Button
          onClick={toggle}
          variant="outline"
          size="icon"
          className="md:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-lg md:text-xl font-semibold text-foreground">
            {session?.user.id === "vibra-id" ? "VIBRA ENERGIES" : "TELKES ENERGIES"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          {/* <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button> */}

          <UserMenu />
        </div>
      </div>
    </header>
  );
};
