"use client";

import React from 'react'
import { SidebarContent } from "./SidebarContent";
import { useSidebarStore } from '@/app/store/ui/sidebar.store';

export const Sidebar = () => {
  const { open, close } = useSidebarStore();

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <SidebarContent />
          <div className="flex-1 bg-black/50" onClick={close} />
        </div>
      )}
    </>
  );
};
