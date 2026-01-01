import { DashboardShell } from "@/components/dashboard/shell";

/**
 * ============================================================================
 * DASHBOARD LAYOUT
 * ============================================================================
 * Layout wrapper for all dashboard pages.
 * NOTE: Auth is disabled for development.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

