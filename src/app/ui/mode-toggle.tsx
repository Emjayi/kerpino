"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


export function ModeToggle({ className, ...props }: { className?: string }) {
    const { setTheme } = useTheme()

    const handleTheme = () => {
        setTheme((theme) => (theme === "dark" ? "light" : "dark"))
    }

    return (
        <Button variant="outline" onClick={handleTheme} size="icon" className={cn("rounded-full", className)}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
