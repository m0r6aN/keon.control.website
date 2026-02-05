"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Breadcrumbs } from "./breadcrumbs";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  withBreadcrumbs?: boolean;
  header?: React.ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className,
  maxWidth = "2xl",
  withBreadcrumbs = true,
  header,
}: PageContainerProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumbs */}
      {withBreadcrumbs && <Breadcrumbs />}

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1">
        <div
          className={cn(
            "mx-auto w-full px-6 py-6",
            maxWidthClasses[maxWidth],
            className
          )}
        >
          {/* Optional Page Header */}
          {header && <div className="mb-6">{header}</div>}

          {/* Main Content */}
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex-1 space-y-1">
        <h1 className="font-['Rajdhani'] text-3xl font-bold tracking-tight text-[#C5C6C7]">
          {title}
        </h1>
        {description && (
          <p className="font-mono text-sm text-[#C5C6C7] opacity-70">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="font-['Rajdhani'] text-xl font-semibold tracking-tight text-[#C5C6C7]">
              {title}
            </h2>
          )}
          {description && (
            <p className="font-mono text-sm text-[#C5C6C7] opacity-60">
              {description}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-[#384656] bg-[#1F2833] p-6",
        hover && "transition-colors hover:border-[#66FCF1]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 pb-4", className)}>
      <div className="flex-1 space-y-1">
        <h3 className="font-['Rajdhani'] text-lg font-semibold tracking-tight text-[#C5C6C7]">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-xs text-[#C5C6C7] opacity-60">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
