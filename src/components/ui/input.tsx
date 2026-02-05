import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input variants for Keon Command Center
 * Design: Dark inputs with tactical borders, monospace for data entry
 * No rounded corners, instant focus feedback with reactor glow
 */
const inputVariants = cva(
  [
    "flex w-full",
    "px-3 py-2",
    "bg-[--void] text-[--flash]",
    "font-mono text-sm",
    "border border-[--tungsten]",
    "rounded-none", // No rounded corners
    "transition-all duration-75",
    "placeholder:text-[--steel] placeholder:opacity-50",
    "focus-visible:outline-none",
    "focus-visible:border-[--reactor-blue]",
    "focus-visible:shadow-[0_0_8px_rgba(69,162,158,0.3)]",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[--gun-metal]",
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
 * Input Component - Data Entry Field
 *
 * Features:
 * - Monospace font for precise data entry
 * - Reactor blue glow on focus
 * - No rounded corners (mission control aesthetic)
 * - Tabular numerals for numeric data
 *
 * @example
 * <Input type="text" placeholder="Enter hash..." />
 * <Input type="number" inputSize="sm" placeholder="0x..." />
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
