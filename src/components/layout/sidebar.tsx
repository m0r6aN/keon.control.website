"use client";

import { navigationSections } from "@/components/layout/navigation";
import { useOnboardingState } from "@/lib/onboarding/store";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onCollapse, className }: SidebarProps) {
  const pathname = usePathname();
  const { state } = useOnboardingState();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const visibleSections = state.completed
    ? navigationSections
        .map((section) =>
          section.title === "Start"
            ? { ...section, items: section.items.filter((item) => item.href === "/control") }
            : section
        )
        .filter((section) => section.items.length > 0)
    : navigationSections;

  const visibleItems = visibleSections.flatMap((section) => section.items);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "j") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % visibleItems.length);
      } else if (e.key === "k") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        const item = visibleItems[selectedIndex];
        if (item) {
          window.location.href = item.href;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, visibleItems]);

  React.useEffect(() => {
    const index = visibleItems.findIndex((item) => item.href === pathname);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [pathname, visibleItems]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-[#384656] bg-[#1F2833] transition-all duration-300",
        collapsed ? "w-16" : "w-72",
        className
      )}
    >
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleSections.map((section, sectionIdx) => {
          let globalOffset = 0;
          for (let i = 0; i < sectionIdx; i += 1) {
            globalOffset += visibleSections[i].items.length;
          }

          return (
            <div key={section.title} className={cn(sectionIdx > 0 && "mt-4")}>
              {!collapsed && (
                <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-[#66FCF1] opacity-60">
                  {section.title}
                </div>
              )}
              {sectionIdx > 0 && <div className="mb-2 border-t border-[#384656]" />}
              {section.items.map((item, itemIdx) => {
                const globalIndex = globalOffset + itemIdx;
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isSelected = globalIndex === selectedIndex;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-start gap-3 rounded px-3 py-2.5 transition-all",
                      "text-[#C5C6C7] hover:bg-[#384656] hover:text-[#66FCF1]",
                      isActive && "border-l-2 border-[#66FCF1] bg-[#384656] text-[#66FCF1]",
                      isSelected && !isActive && "ring-1 ring-[#66FCF1] ring-opacity-50"
                    )}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    {isActive && <div className="absolute inset-0 rounded bg-[#66FCF1] opacity-5" />}
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0 transition-colors", isActive && "text-[#66FCF1]")} />
                    {!collapsed && (
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">{item.label}</span>
                          {item.badge ? (
                            <span className="rounded-full border border-[#384656] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#66FCF1]">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-pretty font-mono text-[11px] leading-5 text-[#C5C6C7] opacity-55">
                          {item.description}
                        </div>
                      </div>
                    )}
                    {collapsed && (
                      <div className="absolute left-full top-1/2 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded border border-[#384656] bg-[#1F2833] px-3 py-2 font-mono text-sm text-[#C5C6C7] group-hover:block">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#384656] p-3">
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded px-3 py-2.5 text-[#C5C6C7] transition-all hover:bg-[#384656] hover:text-[#66FCF1]",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span className="font-mono text-sm">Collapse</span>}
        </button>
      </div>

      {!collapsed && !state.completed && (
        <div className="border-t border-[#384656] p-3">
          <div className="rounded bg-[#0B0C10] p-2 text-center">
            <p className="font-mono text-[11px] text-[#C5C6C7] opacity-40">
              Welcome and Setup stay visible so first-time users always know where to start and what remains.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
