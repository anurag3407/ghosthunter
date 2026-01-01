"use client";

/**
 * ============================================================================
 * DASHBOARD SHELL
 * ============================================================================
 * Main layout wrapper for the dashboard with floating dock navigation.
 * Matches the hero section aesthetic with glassmorphic design.
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

  // Navigation items with agent-specific styling
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
    <div className="relative min-h-screen bg-black">
      {/* Background gradient effects matching hero */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header with logo */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl border-b border-zinc-800/50">
        <a href="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <IconSparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-violet-600/20 rounded-xl blur-lg -z-10" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            GhostFounder
          </span>
        </a>
        
        {/* User Button from Clerk */}
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "bg-zinc-900 border-zinc-800",
              userButtonPopoverActionButton: "hover:bg-zinc-800",
              userButtonPopoverActionButtonText: "text-zinc-300",
              userButtonPopoverFooter: "hidden",
            },
          }}
        />
      </header>

      {/* Main Content */}
      <main className="relative pt-16 pb-24 min-h-screen">
        {children}
      </main>

      {/* Floating Dock - Fixed at bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <FloatingDock items={dockItems} />
      </div>
    </div>
  );
}

