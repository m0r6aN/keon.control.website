"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import {
  Search,
  LayoutDashboard,
  Shield,
  Zap,
  Lock,
  FileCheck,
  Settings,
  FileText,
  Activity,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "View system overview",
      icon: LayoutDashboard,
      action: () => {
        router.push("/");
        onOpenChange(false);
      },
    },
    {
      id: "governance",
      label: "Governance",
      description: "Manage key governance",
      icon: Shield,
      action: () => {
        router.push("/governance");
        onOpenChange(false);
      },
    },
    {
      id: "runtime",
      label: "Runtime",
      description: "Monitor runtime operations",
      icon: Zap,
      action: () => {
        router.push("/runtime");
        onOpenChange(false);
      },
    },
    {
      id: "security",
      label: "Security",
      description: "Security monitoring",
      icon: Lock,
      action: () => {
        router.push("/security");
        onOpenChange(false);
      },
    },
    {
      id: "compliance",
      label: "Compliance",
      description: "Compliance reports",
      icon: FileCheck,
      action: () => {
        router.push("/compliance");
        onOpenChange(false);
      },
    },
    {
      id: "settings",
      label: "Settings",
      description: "System configuration",
      icon: Settings,
      action: () => {
        router.push("/settings");
        onOpenChange(false);
      },
    },
  ];

  // Quick action commands
  const quickActions: CommandItem[] = [
    {
      id: "search-receipts",
      label: "Search Receipts",
      description: "Find provenance receipts",
      icon: Search,
      action: () => {
        router.push("/receipts");
        onOpenChange(false);
      },
      keywords: ["find", "receipt", "provenance"],
    },
    {
      id: "view-logs",
      label: "View Logs",
      description: "System activity logs",
      icon: FileText,
      action: () => {
        router.push("/logs");
        onOpenChange(false);
      },
      keywords: ["logs", "activity", "audit"],
    },
    {
      id: "quick-status",
      label: "System Status",
      description: "Check system health",
      icon: Activity,
      action: () => {
        router.push("/status");
        onOpenChange(false);
      },
      keywords: ["health", "status", "monitoring"],
    },
  ];

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent asChild>
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0B0C10] bg-opacity-80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Command Panel */}
          <Command
            className={cn(
              "relative z-10 w-full max-w-2xl overflow-hidden rounded border border-[#384656] bg-[#1F2833] shadow-2xl",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%]"
            )}
            shouldFilter={false}
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-[#384656] px-4">
              <Search className="mr-3 h-5 w-5 shrink-0 text-[#C5C6C7] opacity-50" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or search..."
                className="flex h-14 w-full bg-transparent font-mono text-sm text-[#C5C6C7] placeholder-[#C5C6C7] placeholder-opacity-50 outline-none"
              />
              <kbd className="ml-auto hidden rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#66FCF1] sm:inline-block">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              {/* Empty State */}
              <Command.Empty className="flex flex-col items-center justify-center py-12">
                <Search className="mb-2 h-8 w-8 text-[#C5C6C7] opacity-30" />
                <p className="font-mono text-sm text-[#C5C6C7] opacity-50">
                  No results found
                </p>
              </Command.Empty>

              {/* Navigation Section */}
              <Command.Group
                heading="Navigation"
                className="mb-2 px-2 font-mono text-xs uppercase tracking-wider text-[#66FCF1]"
              >
                {navigationCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <Command.Item
                      key={command.id}
                      value={command.label}
                      onSelect={command.action}
                      className={cn(
                        "group relative flex cursor-pointer items-center gap-3 rounded px-3 py-2.5",
                        "text-[#C5C6C7] outline-none transition-colors",
                        "hover:bg-[#384656] hover:text-[#66FCF1]",
                        "data-[selected=true]:bg-[#384656] data-[selected=true]:text-[#66FCF1]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-mono text-sm font-medium">
                          {command.label}
                        </span>
                        {command.description && (
                          <span className="font-mono text-xs opacity-50">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>

              {/* Quick Actions Section */}
              <Command.Group
                heading="Quick Actions"
                className="mb-2 mt-4 px-2 font-mono text-xs uppercase tracking-wider text-[#66FCF1]"
              >
                {quickActions.map((command) => {
                  const Icon = command.icon;
                  return (
                    <Command.Item
                      key={command.id}
                      value={`${command.label} ${command.keywords?.join(" ") || ""}`}
                      onSelect={command.action}
                      className={cn(
                        "group relative flex cursor-pointer items-center gap-3 rounded px-3 py-2.5",
                        "text-[#C5C6C7] outline-none transition-colors",
                        "hover:bg-[#384656] hover:text-[#66FCF1]",
                        "data-[selected=true]:bg-[#384656] data-[selected=true]:text-[#66FCF1]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-mono text-sm font-medium">
                          {command.label}
                        </span>
                        {command.description && (
                          <span className="font-mono text-xs opacity-50">
                            {command.description}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#384656] px-4 py-2">
              <div className="flex gap-2">
                <kbd className="rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#C5C6C7]">
                  ↑↓
                </kbd>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-50">
                  Navigate
                </span>
              </div>
              <div className="flex gap-2">
                <kbd className="rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#C5C6C7]">
                  ↵
                </kbd>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-50">Select</span>
              </div>
            </div>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}
