"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { navigationSections } from "./navigation";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const nav = React.useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [onOpenChange, router]
  );

  const filteredSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const term = search.toLowerCase();
        return (
          !term ||
          item.label.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          section.title.toLowerCase().includes(term)
        );
      }),
    }))
    .filter((section) => section.items.length > 0);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent asChild>
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-[#0B0C10] bg-opacity-80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

          <Command
            className={cn(
              "relative z-10 w-full max-w-2xl overflow-hidden rounded border border-[#384656] bg-[#1F2833] shadow-2xl",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%]"
            )}
            shouldFilter={false}
          >
            <div className="flex items-center border-b border-[#384656] px-4">
              <Search className="mr-3 h-5 w-5 shrink-0 text-[#C5C6C7] opacity-50" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search pages and setup steps..."
                className="flex h-14 w-full bg-transparent font-mono text-sm text-[#C5C6C7] placeholder-[#C5C6C7] placeholder-opacity-50 outline-none"
              />
              <kbd className="ml-auto hidden rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#66FCF1] sm:inline-block">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[420px] overflow-y-auto p-2">
              <Command.Empty className="flex flex-col items-center justify-center py-12">
                <Search className="mb-2 h-8 w-8 text-[#C5C6C7] opacity-30" />
                <p className="font-mono text-sm text-[#C5C6C7] opacity-50">No matching pages found</p>
              </Command.Empty>

              {filteredSections.map((section) => (
                <Command.Group
                  key={section.title}
                  heading={section.title}
                  className="mb-2 px-2 font-mono text-xs uppercase tracking-wider text-[#66FCF1]"
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.href}
                        value={`${section.title} ${item.label} ${item.description}`}
                        onSelect={() => nav(item.href)}
                        className={cn(
                          "group relative flex cursor-pointer items-center gap-3 rounded px-3 py-2.5",
                          "text-[#C5C6C7] outline-none transition-colors",
                          "hover:bg-[#384656] hover:text-[#66FCF1]",
                          "data-[selected=true]:bg-[#384656] data-[selected=true]:text-[#66FCF1]"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="flex flex-1 flex-col">
                          <span className="font-mono text-sm font-medium">{item.label}</span>
                          <span className="font-mono text-xs opacity-50">{item.description}</span>
                        </div>
                        {item.badge ? (
                          <span className="rounded-full border border-[#384656] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#66FCF1]">
                            {item.badge}
                          </span>
                        ) : null}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
            </Command.List>

            <div className="flex items-center justify-between border-t border-[#384656] px-4 py-2">
              <div className="flex gap-2">
                <kbd className="rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#C5C6C7]">↑↓</kbd>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-50">Navigate</span>
              </div>
              <div className="flex gap-2">
                <kbd className="rounded bg-[#384656] px-2 py-1 font-mono text-xs text-[#C5C6C7]">↵</kbd>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-50">Open</span>
              </div>
            </div>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}
