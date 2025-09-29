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
    return <div className="h-screen bg-white dark:bg-gray-900" />;
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false} themes={["light", "dark", "neutral"]}>
      {children}
    </ThemeProvider>
  );
};
