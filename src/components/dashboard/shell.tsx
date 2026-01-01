"use client";

/**
 * ============================================================================
 * DASHBOARD SHELL
 * ============================================================================
 * Main layout wrapper for the dashboard with Aceternity-style sidebar.
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Presentation,
  Coins,
  Database,
  Settings,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

// Navigation items with agent-specific styling
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Code Police",
    href: "/dashboard/code-police",
    icon: <Shield className="w-5 h-5 text-red-400" />,
  },
  {
    label: "Pitch Deck",
    href: "/dashboard/pitch-deck",
    icon: <Presentation className="w-5 h-5 text-blue-400" />,
  },
  {
    label: "Equity",
    href: "/dashboard/equity",
    icon: <Coins className="w-5 h-5 text-purple-400" />,
  },
  {
    label: "Database",
    href: "/dashboard/database",
    icon: <Database className="w-5 h-5 text-green-400" />,
  },
];

const bottomNavItems = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          {/* Top Section */}
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {/* Logo */}
            <Logo open={open} />
            
            {/* Navigation */}
            <div className="mt-8 flex flex-col gap-1">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col gap-1">
            {bottomNavItems.map((item) => (
              <SidebarLink
                key={item.href}
                link={item}
                active={isActive(item.href)}
              />
            ))}
            
            {/* User Section */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <UserAvatar open={open} />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function Logo({ open }: { open: boolean }) {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center gap-3 py-1"
    >
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -inset-1 bg-violet-600/20 rounded-xl blur-lg -z-10" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent whitespace-pre"
      >
        GhostFounder
      </motion.span>
    </a>
  );
}

function UserAvatar({ open }: { open: boolean }) {
  const [githubUser, setGithubUser] = useState<{ username: string; avatar_url: string } | null>(null);

  useEffect(() => {
    // Check GitHub connection status
    fetch("/api/auth/github/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected) {
          setGithubUser({
            username: data.username,
            avatar_url: data.avatar_url,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <a
      href="/dashboard/settings"
      className="flex items-center gap-3 py-2 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
    >
      {githubUser?.avatar_url ? (
        <img
          src={githubUser.avatar_url}
          className="h-8 w-8 flex-shrink-0 rounded-full"
          alt="Avatar"
        />
      ) : (
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="text-sm font-medium whitespace-pre"
      >
        {githubUser?.username || "Dev User"}
      </motion.span>
    </a>
  );
}
