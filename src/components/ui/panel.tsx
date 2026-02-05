import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Panel variants for Keon Command Center
 * Design: Industrial surfaces with minimal chrome, no rounded corners
 * Renamed from "Card" to "Panel" for cockpit aesthetic
 */
const panelVariants = cva(
  [
    "bg-[--gun-metal]",
    "border border-[--tungsten]",
    "rounded-sm", // 2px max
  ].join(" "),
  {
    variants: {
      noise: {
        true: "bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.02)_1px,_transparent_0)] bg-[length:40px_40px]",
        false: "",
      },
      glow: {
        true: "shadow-[0_0_1px_rgba(69,162,158,0.2)]",
        false: "",
      },
      notch: {
        true: "keon-notch",
        false: "",
      },
    },
    defaultVariants: {
      noise: false,
      glow: false,
      notch: false,
    },
  }
);

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {}

/**
 * Panel Component - Command Center Surface
 *
 * Options:
 * - noise: Subtle texture overlay for industrial feel
 * - glow: Minimal reactor blue edge glow
 * - notch: Corner notches (Keon visual signature)
 *
 * @example
 * <Panel notch>
 *   <PanelHeader>System Status</PanelHeader>
 *   <PanelContent>...</PanelContent>
 * </Panel>
 */
const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, noise, glow, notch, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(panelVariants({ noise, glow, notch, className }))}
      {...props}
    />
  )
);
Panel.displayName = "Panel";

const PanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-4 border-b border-[--tungsten]",
      className
    )}
    {...props}
  >
    {typeof children === "string" ? (
      <h3 className="font-mono text-sm uppercase tracking-wider text-[--flash]">
        {children}
      </h3>
    ) : (
      children
    )}
  </div>
));
PanelHeader.displayName = "PanelHeader";

const PanelTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-mono text-sm uppercase tracking-wider text-[--flash]",
      className
    )}
    {...props}
  />
));
PanelTitle.displayName = "PanelTitle";

const PanelDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-[--steel] font-mono", className)}
    {...props}
  />
));
PanelDescription.displayName = "PanelDescription";

const PanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
PanelContent.displayName = "PanelContent";

const PanelFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 p-4 border-t border-[--tungsten]",
      className
    )}
    {...props}
  />
));
PanelFooter.displayName = "PanelFooter";

export {
  Panel,
  PanelHeader,
  PanelFooter,
  PanelTitle,
  PanelDescription,
  PanelContent,
};
