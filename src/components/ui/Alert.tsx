"use client";
import React, { useEffect } from 'react'
import { useAlertStore } from '@/app/store/ui/alert.store';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

export const Alert = () => {
 const { alert, hideAlert } = useAlertStore();

  useEffect(() => {
    if (alert.visible) {
      const timeout = setTimeout(() => hideAlert(), 3000);
      return () => clearTimeout(timeout);
    }
  }, [alert.visible, hideAlert]);

  if (!alert.visible) return null;

  const styles = {
    success: {
      bg: "bg-green-500",
      Icon: CheckCircle2,
    },
    error: {
      bg: "bg-red-500",
      Icon: AlertTriangle,
    },
    info: {
      bg: "bg-blue-500",
      Icon: Zap,
    },
  };

  type AlertType = keyof typeof styles;
  const alertType = alert.type as AlertType;
  const { bg, Icon } = styles[alertType];

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm">{alert.message}</span>
    </div>
  );
};