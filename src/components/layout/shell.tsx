"use client";

import { IncidentShell } from "@/components/incident";
import { useIncidentMode } from "@/lib/incident-mode";
import { useIncidentTrigger } from "@/lib/use-incident-trigger";
import { cn } from "@/lib/utils";
import * as React from "react";
import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const { state } = useIncidentMode();

  // Initialize incident trigger hook (handles Shift+Enter)
  useIncidentTrigger();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Cmd+/ or Ctrl+/ - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }

      // Escape - Close overlays
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If incident mode is active, render the incident shell
  if (state.active) {
    return <IncidentShell>{children}</IncidentShell>;
  }

  return (
    <div className={cn("relative flex h-screen w-full flex-col bg-[#0B0C10]", className)}>
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Top Bar - Fixed */}
      <TopBar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Collapsible */}
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

        {/* Main Content Area */}
        <main
          className={cn(
            "relative flex-1 overflow-y-auto transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-60"
          )}
        >
          {/* Optional Grid Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#384656_1px,transparent_1px),linear-gradient(to_bottom,#384656_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.02]" />

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
