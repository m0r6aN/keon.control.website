import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * ForgePilot Badge Variants
 * Design: Status indicators with semantic colors, thin borders
 * Glow capped at 8% per Visual Language Guidance
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "px-2 py-0.5",
    "text-xs font-medium uppercase tracking-wide",
    "border rounded-sm", // max 4px radius per VLG
    "transition-colors duration-75",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-transparent text-muted-foreground",
          "border-border",
        ].join(" "),
        healthy: [
          "bg-transparent text-primary",
          "border-primary",
          "dark:shadow-[0_0_4px_rgba(69,162,158,0.08)]",
        ].join(" "),
        warning: [
          "bg-transparent text-amber-600 dark:text-amber-400",
          "border-amber-600 dark:border-amber-400",
          "dark:shadow-[0_0_4px_rgba(255,107,0,0.08)]",
        ].join(" "),
        critical: [
          "bg-destructive text-destructive-foreground",
          "border-destructive",
          "dark:shadow-[0_0_4px_rgba(255,46,46,0.08)]",
        ].join(" "),
        neutral: [
          "bg-transparent text-muted-foreground",
          "border-border",
        ].join(" "),
        outline: [
          "bg-transparent text-muted-foreground",
          "border-border",
        ].join(" "),
        offline: [
          "bg-transparent text-muted-foreground",
          "border-border",
          "opacity-60",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * ForgePilot Badge Component — Status Indicator
 *
 * Variants:
 * - healthy: Primary color, operational status
 * - warning: Amber, attention required
 * - critical: Destructive fill, immediate action
 * - neutral: Muted, informational
 * - offline: Muted + reduced opacity, inactive state
 *
 * @example
 * <Badge variant="healthy">Active</Badge>
 * <Badge variant="critical">Alert</Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
