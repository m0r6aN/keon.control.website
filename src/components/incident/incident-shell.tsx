"use client";

import * as React from "react";
import { useIncidentMode } from "@/lib/incident-mode";
import { IncidentTopBar } from "./incident-topbar";
import { TacticalRail } from "./tactical-rail";
import { BlastRadiusView } from "./blast-radius";
import { EvidenceTimeline } from "./evidence-timeline";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Activity,
  Eye,
  FileText,
  Users,
  Bell,
  Settings,
} from "lucide-react";

/**
 * INCIDENT MODE SHELL
 * 
 * The "War Table" layout.
 * When Incident Mode activates, reality reorders.
 * 
 * Layout:
 * - Top: Incident Spine (replaces normal topbar)
 * - Left: Collapsed icon-only nav
 * - Center: Blast Radius (60-70%)
 * - Right: Tactical Command Rail (always visible)
 * - Bottom: Evidence Timeline
 */

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Receipts", href: "/governance/receipts", icon: Receipt },
  { label: "Executions", href: "/runtime/executions", icon: Activity },
  { label: "Traces", href: "/observability/traces", icon: Eye },
  { label: "Policies", href: "/policies", icon: FileText },
  { label: "Tenants", href: "/tenants", icon: Users },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function IncidentShell({ children }: { children: React.ReactNode }) {
  const { state } = useIncidentMode();
  const pathname = usePathname();

  // If not in incident mode, render children normally
  if (!state.active) {
    return <>{children}</>;
  }

  return (
    <div 
      className="flex h-screen w-full flex-col bg-[#080909]"
      data-incident-mode="active"
    >
      {/* Incident Spine (Top Bar) */}
      <IncidentTopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsed Icon-Only Nav */}
        <aside className="flex w-16 flex-col border-r border-[#2a3342] bg-[#0B0C10]">
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex h-10 w-10 items-center justify-center rounded transition-colors",
                    "text-[#C5C6C7] hover:bg-[#384656]/50 hover:text-[#66FCF1]",
                    isActive && "bg-[#384656]/30 text-[#66FCF1]"
                  )}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  {/* Tooltip */}
                  <div className="absolute left-full top-1/2 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded border border-[#384656] bg-[#1F2833] px-2 py-1 font-mono text-xs text-[#C5C6C7] group-hover:block">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Center + Right Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main War Table */}
          <div className="flex flex-1 overflow-hidden">
            {/* Center: Blast Radius + Timeline */}
            <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
              {/* Blast Radius - Primary Focus */}
              <div className="flex-[2]">
                <BlastRadiusView />
              </div>
              
              {/* Evidence Timeline */}
              <div className="flex-1 min-h-[200px]">
                <EvidenceTimeline />
              </div>
            </div>

            {/* Right: Tactical Command Rail */}
            <TacticalRail />
          </div>
        </div>
      </div>
    </div>
  );
}

