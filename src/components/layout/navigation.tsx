"use client";

import {
  Activity,
  BookOpen,
  Home,
  KeyRound,
  Settings,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import type * as React from "react";

export interface NavigationItem {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    title: "Start",
    items: [
      {
        label: "Welcome",
        href: "/welcome",
        description: "What Keon Control does and how setup works.",
        icon: Sparkles,
      },
      {
        label: "Workspace overview",
        href: "/control",
        description: "See whether your workspace is ready and what to do next.",
        icon: Home,
      },
      {
        label: "Setup checklist",
        href: "/setup",
        description: "Finish the required setup steps for first use.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Setup",
    items: [
      {
        label: "Guardrails",
        href: "/policies",
        description: "Choose the starter review and approval rules for AI actions.",
        icon: ShieldCheck,
      },
      {
        label: "Integrations",
        href: "/integrations",
        description: "Connect your first runtime or service to Keon.",
        icon: Waves,
      },
      {
        label: "Settings",
        href: "/settings",
        description: "Manage notifications, access hygiene, and workspace details.",
        icon: Settings,
      },
    ],
  },
  {
    title: "Operate",
    items: [
      {
        label: "Receipts",
        href: "/receipts",
        description: "Review the evidence trail for monitored actions.",
        icon: KeyRound,
      },
      {
        label: "Reviews",
        href: "/collective",
        description: "Bring collaborative review into higher-risk decisions.",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        label: "Diagnostics",
        href: "/cockpit",
        description: "Open advanced system inspection after setup is complete.",
        icon: Activity,
        badge: "Advanced",
      },
    ],
  },
];

export const navigationItems = navigationSections.flatMap((section) => section.items);
