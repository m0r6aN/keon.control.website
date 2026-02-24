import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * ForgePilot Button Variants
 * Design: Clean, functional, precision feedback
 * Glow capped at 8% per Visual Language Guidance
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "text-sm font-medium tracking-wide",
    "rounded-sm", // max 4px radius per VLG
    "transition-colors duration-75",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "border",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "border-primary",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "border-border",
        ].join(" "),
        ghost: [
          "bg-transparent text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "border-transparent",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "border-destructive",
        ].join(" "),
        outline: [
          "bg-transparent text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "border-border hover:border-primary",
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
 * ForgePilot Button Component
 *
 * Variants:
 * - primary: Primary action (default)
 * - secondary: Secondary action
 * - ghost: Minimal presence
 * - destructive: Critical/danger actions
 * - outline: Bordered, tertiary actions
 *
 * @example
 * <Button variant="primary" size="md">Get Started</Button>
 * <Button variant="outline">Learn More</Button>
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

