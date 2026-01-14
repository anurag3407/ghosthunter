"use client";

import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { NotificationCard } from "@/components/ui/notification-card";
import { EmptyState } from "@/components/ui/empty-state";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

interface NotificationsClientProps {
    initialNotifications: Notification[];
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const filteredNotifications = filter === "unread"
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        // TODO: Persist to Firebase
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        // TODO: Persist to Firebase
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // TODO: Delete from Firebase
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Stay updated with your workspace activity
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-zinc-800/60">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${filter === "all"
                            ? "text-zinc-200 border-zinc-200"
                            : "text-zinc-500 border-transparent hover:text-zinc-300"
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${filter === "unread"
                            ? "text-zinc-200 border-zinc-200"
                            : "text-zinc-500 border-transparent hover:text-zinc-300"
                        }`}
                >
                    Unread
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <EmptyState
                    title={filter === "unread" ? "All caught up!" : "No notifications yet"}
                    description={filter === "unread"
                        ? "You've read all your notifications"
                        : "When there's activity in your workspace, you'll see it here"
                    }
                />
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                        <div key={notification.id} className="group relative">
                            <NotificationCard
                                userName={notification.title}
                                message={notification.message}
                                timestamp={formatTime(notification.createdAt)}
                                isRead={notification.isRead}
                                onClick={() => markAsRead(notification.id)}
                            />
                            <button
                                onClick={() => deleteNotification(notification.id)}
                                className="absolute top-4 right-4 p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-zinc-800/60 transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Delete notification"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
