"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  children: React.ReactNode
  title: string
  description?: string
  defaultOpen?: boolean
  icon?: React.ReactNode
  className?: string
}

export function Collapsible({
  children,
  title,
  description,
  defaultOpen = false,
  icon,
  className,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("border border-theme rounded-lg bg-card", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-theme-primary">{icon}</div>}
          <div>
            <h3 className="font-semibold text-theme">{title}</h3>
            {description && (
              <p className="text-sm text-theme-secondary mt-1">{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-theme-tertiary" />
        ) : (
          <ChevronRight className="h-5 w-5 text-theme-tertiary" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-theme">
          {children}
        </div>
      )}
    </div>
  )
}
