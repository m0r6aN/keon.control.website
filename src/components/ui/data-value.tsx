"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Copy, TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";

/**
 * DataValue variants for Keon Command Center
 * Design: Specialized component for displaying mission-critical data
 * Always monospace, tabular numerals, copy-to-clipboard functionality
 */
const dataValueVariants = cva(
  [
    "inline-flex items-center gap-2",
    "font-mono",
    "transition-all duration-75",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
      variant: {
        default: "text-[--flash]",
        text: "text-[--flash]",
        hash: "text-[--reactor-blue] font-normal tracking-tight",
        number: "text-[--flash] tabular-nums",
        timestamp: "text-[--steel] tabular-nums",
        status: "text-[--reactor-glow] uppercase tracking-wider",
      },
      clickable: {
        true: "cursor-pointer hover:text-[--reactor-glow] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      clickable: false,
    },
  }
);

export interface DataValueProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataValueVariants> {
  value: string | number;
  copyable?: boolean;
  trend?: "up" | "down" | null;
  label?: string;
  /** @deprecated DataValue is always monospace - this prop is ignored */
  mono?: boolean;
}

/**
 * DataValue Component - Mission Data Display
 *
 * Specialized component for displaying:
 * - Hashes (truncated with copy)
 * - Timestamps (ISO format)
 * - Numbers (tabular numerals)
 * - Status values (uppercase)
 *
 * Features:
 * - Click to copy functionality
 * - Optional trend indicators
 * - Monospace font always
 * - Responsive sizing
 *
 * @example
 * <DataValue variant="hash" value="0x1234...5678" copyable />
 * <DataValue variant="number" value={1234567} trend="up" />
 * <DataValue variant="timestamp" value="2026-01-04T12:00:00Z" />
 */
const DataValue = React.forwardRef<HTMLDivElement, DataValueProps>(
  (
    {
      className,
      value,
      size,
      variant,
      copyable = false,
      trend = null,
      label,
      mono: _mono, // Destructure and ignore - DataValue is always monospace
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      if (!copyable) return;

      try {
        await navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };

    const displayValue = React.useMemo(() => {
      if (variant === "number" && typeof value === "number") {
        return value.toLocaleString();
      }
      return String(value);
    }, [value, variant]);

    return (
      <div
        ref={ref}
        className={cn(
          dataValueVariants({
            size,
            variant,
            clickable: copyable,
            className,
          })
        )}
        onClick={copyable ? handleCopy : undefined}
        title={copyable ? "Click to copy" : undefined}
        {...props}
      >
        {label && (
          <span className="text-[--steel] uppercase text-[0.7em] tracking-wider">
            {label}:
          </span>
        )}
        <span className="select-all">{displayValue}</span>
        {trend === "up" && (
          <TrendingUp className="w-3 h-3 text-[--reactor-blue]" />
        )}
        {trend === "down" && (
          <TrendingDown className="w-3 h-3 text-[--safety-orange]" />
        )}
        {copyable && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? (
              <Check className="w-3 h-3 text-[--reactor-glow]" />
            ) : (
              <Copy className="w-3 h-3 text-[--steel]" />
            )}
          </span>
        )}
      </div>
    );
  }
);
DataValue.displayName = "DataValue";

export { DataValue, dataValueVariants };

