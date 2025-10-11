import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Enhanced theme variants
        "theme-primary": "bg-theme-primary text-white hover:bg-theme-primary-700 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-secondary": "bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-accent": "bg-theme-accent text-white hover:bg-theme-accent-700 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-success": "bg-success text-white hover:bg-success/90 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-warning": "bg-warning text-white hover:bg-warning/90 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-error": "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        "theme-info": "bg-info text-white hover:bg-info/90 shadow-theme-sm transition-all duration-200 hover:shadow-theme-md hover:-translate-y-0.5",
        // Legacy XEN Forex variants (for backward compatibility)
        "xen-red": "bg-xen-red text-white hover:bg-xen-red/90",
        "xen-blue": "bg-xen-blue text-white hover:bg-xen-blue/90",
        "xen-orange": "bg-xen-orange text-white hover:bg-xen-orange/90",
        "xen-green": "bg-xen-green text-white hover:bg-xen-green/90",
        "xen-purple": "bg-xen-purple text-white hover:bg-xen-purple/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
