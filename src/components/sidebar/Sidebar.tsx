"use client";

import React from 'react'
import { SidebarContent } from "./SidebarContent";
import { useSidebarStore } from '@/app/store/ui/sidebar.store';
interface Props {
  allowedUrls: string[];
}

export const Sidebar = ({ allowedUrls }: Props) => {
  const { open, close } = useSidebarStore();

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <SidebarContent allowedUrls={allowedUrls} />
      </div>

      {/* Mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <SidebarContent allowedUrls={allowedUrls} />
          <div className="flex-1 bg-black/50" onClick={close} />
        </div>
      )}
    </>
  );
};
