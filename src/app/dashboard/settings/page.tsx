"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Github,
  Mail,
  Moon,
  Check,
  Loader2,
  X,
} from "lucide-react";

/**
 * ============================================================================
 * SETTINGS PAGE
 * ============================================================================
 * User settings and account management with GitHub OAuth.
 */

interface GitHubConnection {
  connected: boolean;
  username?: string;
  avatar_url?: string;
  connected_at?: string;
}

// Wrapper component to handle Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsLoading() {
  return (
    <div className="p-6 lg:p-8 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [githubStatus, setGithubStatus] = useState<GitHubConnection>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const justConnected = searchParams.get("github_connected") === "true";

  useEffect(() => {
    fetchGitHubStatus();
  }, []);

  const fetchGitHubStatus = async () => {
    try {
      const response = await fetch("/api/auth/github/status");
      const data = await response.json();
      setGithubStatus(data);
    } catch (error) {
      console.error("Error fetching GitHub status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = "/api/auth/github?returnTo=/dashboard/settings";
  };

  const handleDisconnectGitHub = async () => {
    setIsDisconnecting(true);
    try {
      await fetch("/api/auth/github/status", { method: "DELETE" });
      setGithubStatus({ connected: false });
    } catch (error) {
      console.error("Error disconnecting GitHub:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Settings className="w-5 h-5 text-zinc-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-zinc-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {justConnected && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400">
          <Check className="w-5 h-5" />
          GitHub connected successfully!
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <div className="flex items-center gap-6 mb-6">
          {githubStatus.avatar_url ? (
            <img
              src={githubStatus.avatar_url}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {githubStatus.username?.[0]?.toUpperCase() || "D"}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-white">
              {githubStatus.username || "Development User"}
            </h3>
            <p className="text-zinc-400">
              {githubStatus.connected 
                ? `Connected to GitHub as @${githubStatus.username}`
                : "Connect GitHub to get started"}
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Github className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Integrations</h2>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">GitHub</p>
                <p className="text-sm text-zinc-500">
                  {githubStatus.connected
                    ? `Connected as @${githubStatus.username}`
                    : "Connect for Code Police and Pitch Deck"}
                </p>
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            ) : githubStatus.connected ? (
              <button
                onClick={handleDisconnectGitHub}
                disabled={isDisconnecting}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent rounded-lg transition-colors flex items-center gap-2"
              >
                {isDisconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectGitHub}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Connect
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-zinc-800">
                <Mail className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-zinc-500">Receive code review reports via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Moon className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Appearance</h2>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">Theme</p>
              <p className="text-sm text-zinc-500">Select your preferred theme</p>
            </div>
            <select className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border-none focus:ring-2 focus:ring-violet-500">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </section>

      {/* Plan Section */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Plan & Billing</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold text-violet-400 bg-violet-500/20 rounded">FREE</span>
              <p className="font-medium text-white">Free Plan</p>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Perfect for getting started with GhostFounder
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-zinc-900/50 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-white">Delete Account</p>
            <p className="text-sm text-zinc-500">Permanently delete your account and all data</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
