"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

export const ThemeProviderClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-screen bg-[#25272A]" />;
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark"]}>
      {children}
    </ThemeProvider>
  );
};
