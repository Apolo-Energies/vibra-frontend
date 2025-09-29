"use client"

import { X } from "lucide-react"
import { ReactNode } from "react"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}


export const Dialog = ({ open, onClose, children, className }: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className={`relative w-full max-w-lg rounded-xl p-6 shadow-xl bg-card text-card-foreground ${className}`}
      >
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Cerrar</span>
        </button>
        {children}
      </div>
    </div>
  )
}
