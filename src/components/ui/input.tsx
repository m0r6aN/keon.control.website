import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * ForgePilot Input Variants
 * Design: Clean inputs with clear borders, functional focus states
 * Glow capped at 8% per Visual Language Guidance
 */
const inputVariants = cva(
  [
    "flex w-full",
    "px-3 py-2",
    "bg-background text-foreground",
    "text-sm",
    "border border-input",
    "rounded-sm", // max 4px radius per VLG
    "transition-colors duration-75",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
  ].join(" "),
  {
    variants: {
      inputSize: {
        sm: "h-7 text-xs px-2",
        md: "h-9 text-sm px-3",
        lg: "h-11 text-base px-4",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

/**
 * ForgePilot Input Component
 *
 * Features:
 * - Clean focus ring (no glow in light mode)
 * - Consistent border radius (max 4px)
 * - Semantic color tokens for theme support
 *
 * @example
 * <Input type="text" placeholder="Enter your idea..." />
 * <Input type="email" inputSize="sm" placeholder="you@example.com" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };

