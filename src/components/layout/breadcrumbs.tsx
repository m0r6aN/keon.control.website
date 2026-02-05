"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  className?: string;
  separator?: "slash" | "chevron";
}

export function Breadcrumbs({ className, separator = "chevron" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumb segments from pathname
  const segments = React.useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);

    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return { href, label };
    });
  }, [pathname]);

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  const Separator = separator === "chevron" ? ChevronRight : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex h-12 items-center border-b border-[#384656] bg-[#1F2833] px-6",
        className
      )}
    >
      <ol className="flex items-center gap-2">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-sm text-[#C5C6C7] transition-colors hover:text-[#66FCF1]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </li>

        {/* Segment links */}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={segment.href}>
              {/* Separator */}
              <li className="flex items-center text-[#C5C6C7] opacity-30">
                {separator === "chevron" ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <span className="font-mono text-sm">/</span>
                )}
              </li>

              {/* Breadcrumb link */}
              <li className="flex items-center">
                {isLast ? (
                  <span
                    className="font-mono text-sm font-medium text-[#66FCF1]"
                    aria-current="page"
                  >
                    {segment.label}
                  </span>
                ) : (
                  <Link
                    href={segment.href}
                    className="font-mono text-sm text-[#C5C6C7] transition-colors hover:text-[#66FCF1]"
                  >
                    {segment.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
