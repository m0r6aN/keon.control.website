import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variants for Keon Command Center
 * Design: Physical switch-like feedback, instant response, mechanical precision
 * No shadows, minimal borders, glow effects on active states
 */
const buttonVariants = cva(
  [
    // Base styles - mechanical foundation
    "inline-flex items-center justify-center gap-2",
    "text-sm font-medium font-mono uppercase tracking-wide",
    "transition-all duration-75", // Instant snap feedback
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--reactor-blue]",
    "active:scale-[0.98]", // Physical switch depression
    "border border-[--tungsten]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[--reactor-blue] text-[--void]",
          "hover:bg-[--reactor-glow] hover:shadow-[0_0_10px_rgba(102,252,241,0.4)]",
          "border-[--reactor-blue]",
        ].join(" "),
        secondary: [
          "bg-[--gun-metal] text-[--flash]",
          "hover:bg-[--tungsten] hover:border-[--steel]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[--steel]",
          "hover:bg-[--gun-metal] hover:text-[--flash]",
          "border-transparent hover:border-[--tungsten]",
        ].join(" "),
        destructive: [
          "bg-[--ballistic-red] text-[--flash]",
          "hover:shadow-[0_0_10px_rgba(255,46,46,0.4)]",
          "border-[--ballistic-red]",
        ].join(" "),
        outline: [
          "bg-transparent text-[--flash]",
          "hover:bg-[--gun-metal]",
          "border-[--tungsten] hover:border-[--reactor-blue]",
        ].join(" "),
      },
      size: {
        sm: "h-7 px-3 py-1 text-xs",
        md: "h-9 px-4 py-2 text-sm",
        lg: "h-11 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button Component - Mission Control Switch
 *
 * Variants:
 * - primary: Reactor blue with glow effect (default)
 * - secondary: Gun metal, tactical operations
 * - ghost: Transparent, minimal presence
 * - destructive: Ballistic red, critical actions
 * - outline: Bordered, secondary actions
 *
 * @example
 * <Button variant="primary" size="md">Launch Sequence</Button>
 * <Button variant="destructive">Abort Mission</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
