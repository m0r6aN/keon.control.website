"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

type InteractionIntensity = "row" | "stage" | "rail";

type SurfaceTag = "div" | "button";

interface InteractiveSurfaceProps
  extends React.HTMLAttributes<HTMLElement>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: SurfaceTag;
  intensity?: InteractionIntensity;
  contentClassName?: string;
}

interface InvestigationSurfaceRowProps
  extends Omit<InteractiveSurfaceProps, "as" | "children" | "intensity" | "contentClassName"> {
  children: React.ReactNode;
  contentClassName: string;
  heatClassName: string;
  selected?: boolean;
}

interface Pulse {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface InteractionConfig {
  glowSize: number;
  glowOpacity: number;
  glowMidOpacity: number;
  maxLift: number;
  maxTilt: number;
  pulseSize: number;
  pulseOpacity: number;
}

const INTERACTION_CONFIG: Record<InteractionIntensity, InteractionConfig> = {
  row: {
    glowSize: 180,
    glowOpacity: 0.14,
    glowMidOpacity: 0.08,
    maxLift: 3,
    maxTilt: 1.2,
    pulseSize: 64,
    pulseOpacity: 0.48,
  },
  stage: {
    glowSize: 220,
    glowOpacity: 0.1,
    glowMidOpacity: 0.06,
    maxLift: 1.75,
    maxTilt: 0.75,
    pulseSize: 72,
    pulseOpacity: 0.34,
  },
  rail: {
    glowSize: 160,
    glowOpacity: 0.065,
    glowMidOpacity: 0.04,
    maxLift: 1,
    maxTilt: 0.35,
    pulseSize: 56,
    pulseOpacity: 0.24,
  },
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}

function getRelativePoint(target: HTMLElement, clientX: number, clientY: number) {
  const rect = target.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    width: rect.width || 1,
    height: rect.height || 1,
  };
}

export function InteractiveSurface({
  as = "div",
  intensity = "row",
  className,
  contentClassName,
  children,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  ...rest
}: InteractiveSurfaceProps) {
  const Component = as;
  const reducedMotion = usePrefersReducedMotion();
  const config = INTERACTION_CONFIG[intensity];
  const surfaceRef = React.useRef<HTMLElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const pointRef = React.useRef({ x: 0, y: 0, active: false });
  const timeoutRef = React.useRef<number[]>([]);
  const pulseIdRef = React.useRef(0);

  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [pulses, setPulses] = React.useState<Pulse[]>([]);

  const resetField = React.useCallback(() => {
    const node = surfaceRef.current;
    if (!node) return;

    node.style.setProperty("--if-x", "50%");
    node.style.setProperty("--if-y", "50%");
    node.style.setProperty("--if-lift", "0px");
    node.style.setProperty("--if-tilt-x", "0deg");
    node.style.setProperty("--if-tilt-y", "0deg");
  }, []);

  const flushFrame = React.useCallback(() => {
    rafRef.current = null;

    const node = surfaceRef.current;
    if (!node) return;

    const { x, y, active } = pointRef.current;
    const width = node.clientWidth || 1;
    const height = node.clientHeight || 1;

    const normalizedX = (x / width - 0.5) * 2;
    const normalizedY = (y / height - 0.5) * 2;
    const distance = Math.min(1, Math.hypot(normalizedX, normalizedY));
    const liftStrength = active ? 1 - distance * 0.5 : 0;

    node.style.setProperty("--if-x", `${x.toFixed(2)}px`);
    node.style.setProperty("--if-y", `${y.toFixed(2)}px`);

    if (reducedMotion) {
      node.style.setProperty("--if-lift", "0px");
      node.style.setProperty("--if-tilt-x", "0deg");
      node.style.setProperty("--if-tilt-y", "0deg");
      return;
    }

    const rotateX = normalizedY * -config.maxTilt;
    const rotateY = normalizedX * config.maxTilt;
    const lift = -config.maxLift * liftStrength;

    node.style.setProperty("--if-lift", `${lift.toFixed(3)}px`);
    node.style.setProperty("--if-tilt-x", `${rotateX.toFixed(3)}deg`);
    node.style.setProperty("--if-tilt-y", `${rotateY.toFixed(3)}deg`);
  }, [config.maxLift, config.maxTilt, reducedMotion]);

  const scheduleFieldUpdate = React.useCallback(
    (x: number, y: number, active = true) => {
      pointRef.current = { x, y, active };
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(flushFrame);
    },
    [flushFrame],
  );

  const queuePulse = React.useCallback(
    (x: number, y: number) => {
      if (reducedMotion) return;

      const nextPulse: Pulse = {
        id: pulseIdRef.current++,
        x,
        y,
        size: config.pulseSize,
      };

      setPulses((current) => [...current.slice(-1), nextPulse]);
      const timeout = window.setTimeout(() => {
        setPulses((current) => current.filter((pulse) => pulse.id !== nextPulse.id));
      }, 440);
      timeoutRef.current.push(timeout);
    },
    [config.pulseSize, reducedMotion],
  );

  React.useEffect(() => {
    resetField();
    const timeouts = timeoutRef.current;
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      for (const timeout of timeouts) {
        window.clearTimeout(timeout);
      }
    };
  }, [resetField]);

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);
    const point = getRelativePoint(event.currentTarget, event.clientX, event.clientY);
    setIsHovered(true);
    scheduleFieldUpdate(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);
    const point = getRelativePoint(event.currentTarget, event.clientX, event.clientY);
    scheduleFieldUpdate(point.x, point.y);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    setIsHovered(false);
    setIsPressed(false);
    resetField();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    onPointerDown?.(event);
    if (event.button !== 0) return;

    const point = getRelativePoint(event.currentTarget, event.clientX, event.clientY);
    setIsPressed(true);
    scheduleFieldUpdate(point.x, point.y);
    queuePulse(point.x, point.y);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    onPointerUp?.(event);
    setIsPressed(false);
  };

  const glowOpacity = reducedMotion
    ? Math.min(config.glowOpacity, 0.055)
    : isPressed
      ? config.glowOpacity + 0.02
      : config.glowOpacity;

  const componentStyle = {
    ...style,
    "--if-x": "50%",
    "--if-y": "50%",
    "--if-lift": "0px",
    "--if-tilt-x": "0deg",
    "--if-tilt-y": "0deg",
  } as React.CSSProperties;

  const buttonProps = as === "button" ? { type: "button" as const } : {};

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        surfaceRef.current = node;
      }}
      className={cn(
        "relative overflow-hidden [contain:paint] [transform-style:preserve-3d]",
        className,
      )}
      style={componentStyle}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...buttonProps}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-200 ease-out",
          isHovered && "opacity-100",
        )}
        style={{
          background: `radial-gradient(circle ${config.glowSize}px at var(--if-x) var(--if-y), rgba(102,252,241,${glowOpacity}) 0%, rgba(69,162,158,${config.glowMidOpacity}) 32%, rgba(11,12,16,0) 78%)`,
        }}
      />

      {pulses.map((pulse) => (
        <span
          key={pulse.id}
          aria-hidden
          className="pointer-events-none absolute z-[1] rounded-full"
          style={{
            left: pulse.x,
            top: pulse.y,
            width: pulse.size,
            height: pulse.size,
            opacity: config.pulseOpacity,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(102,252,241,0.7) 0%, rgba(102,252,241,0.24) 28%, rgba(102,252,241,0.08) 52%, rgba(102,252,241,0) 72%)",
            animation: "interaction-field-pulse 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      ))}

      <span
        className={cn(
          "relative z-10 block h-full w-full transition-transform duration-200 ease-out will-change-transform",
          contentClassName,
        )}
        style={
          reducedMotion
            ? undefined
            : {
                transform:
                  "perspective(1200px) rotateX(var(--if-tilt-x)) rotateY(var(--if-tilt-y)) translate3d(0, var(--if-lift), 0)",
              }
        }
      >
        {children}
      </span>
    </Component>
  );
}

export function InvestigationSurfaceRow({
  children,
  className,
  contentClassName,
  heatClassName,
  selected = false,
  ...rest
}: InvestigationSurfaceRowProps) {
  return (
    <InteractiveSurface
      as="button"
      intensity="row"
      className={cn(
        "flex w-full items-stretch border-b border-[#1F2833]/20 text-left transition-[background-color,border-color] duration-200 ease-out",
        selected
          ? "bg-[#1F2833]/50"
          : "bg-transparent hover:bg-[#1F2833]/16 focus-visible:bg-[#1F2833]/18",
        className,
      )}
      contentClassName="flex h-full w-full items-stretch"
      {...rest}
    >
      <div className={cn("relative z-10 w-1 shrink-0", heatClassName)} />
      <div className={cn("relative z-10 flex-1", contentClassName)}>{children}</div>
    </InteractiveSurface>
  );
}
