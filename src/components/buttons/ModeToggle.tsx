"use client"

import React, { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const themes = ["light", "dark", "neutral"]
  const nextTheme = (() => {
    const index = themes.indexOf(theme ?? "light")
    return themes[(index + 1) % themes.length]
  })()

  const getIcon = (theme: string | undefined) => {
    switch (theme) {
      case "dark":
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
      case "neutral":
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />
      default:
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  return (
    <Button className="cursor-pointer" onClick={() => setTheme(nextTheme)} variant="outline" size="icon">
      {getIcon(theme)}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
