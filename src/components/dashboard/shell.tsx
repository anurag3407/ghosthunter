"use client";

/**
 * ============================================================================
 * DASHBOARD SHELL - SUPER DARK MONOCHROME
 * ============================================================================
 * Main layout wrapper with minimal, ultra-dark aesthetic.
 */

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  IconLayoutDashboard,
  IconShield,
  IconPresentation,
  IconCoins,
  IconDatabase,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { FloatingDock, DockItem } from "@/components/ui/floating-dock";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Navigation items - monochrome
  const dockItems: DockItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <IconLayoutDashboard className="h-full w-full" />,
      active: isActive("/dashboard"),
    },
    {
      title: "Code Police",
      href: "/dashboard/code-police",
      icon: <IconShield className="h-full w-full" />,
      active: isActive("/dashboard/code-police"),
    },
    {
      title: "Pitch Deck",
      href: "/dashboard/pitch-deck",
      icon: <IconPresentation className="h-full w-full" />,
      active: isActive("/dashboard/pitch-deck"),
    },
    {
      title: "Equity",
      href: "/dashboard/equity",
      icon: <IconCoins className="h-full w-full" />,
      active: isActive("/dashboard/equity"),
    },
    {
      title: "Database",
      href: "/dashboard/database",
      icon: <IconDatabase className="h-full w-full" />,
      active: isActive("/dashboard/database"),
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <IconSettings className="h-full w-full" />,
      active: isActive("/dashboard/settings"),
    },
  ];

  return (
    <div className="relative min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-neutral-950/90 backdrop-blur-sm border-b border-zinc-800/40">
        <a href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
            <IconSparkles className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-base font-semibold text-zinc-200">
            GhostFounder
          </span>
        </a>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-zinc-900 border-zinc-800",
              userButtonPopoverActionButton: "hover:bg-zinc-800",
              userButtonPopoverActionButtonText: "text-zinc-300",
              userButtonPopoverFooter: "hidden",
            },
          }}
        />
      </header>

      {/* Main Content */}
      <main className="relative pt-14 pb-20 min-h-screen">
        {children}
      </main>

      {/* Floating Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <FloatingDock items={dockItems} />
      </div>
    </div>
  );
}


