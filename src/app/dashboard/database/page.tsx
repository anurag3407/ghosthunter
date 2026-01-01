import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  Database,
  Plus,
  MessageSquare,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";

/**
 * ============================================================================
 * DATABASE AGENT - MAIN PAGE
 * ============================================================================
 * Lists database connections from Firestore.
 */

interface DatabaseConnection {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "mongodb";
  database: string;
  host: string;
  lastUsedAt: Date | null;
  conversationsCount: number;
}

export default async function DatabasePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch connections from Firestore
  let connections: DatabaseConnection[] = [];
  const adminDb = getAdminDb();
  
  if (adminDb) {
    try {
      const connectionsSnapshot = await adminDb
        .collection("database_connections")
        .where("userId", "==", userId)
        .orderBy("lastUsedAt", "desc")
        .get();

    connections = connectionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        database: data.database,
        host: data.host,
        lastUsedAt: data.lastUsedAt?.toDate?.() || null,
        conversationsCount: data.conversationsCount || 0,
      };
    });
    } catch (error) {
      console.error("Error fetching database connections:", error);
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Database Agent</h1>
          </div>
          <p className="text-zinc-400">
            Chat with your databases using natural language
          </p>
        </div>
        <Link
          href="/dashboard/database/connect"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Connection
        </Link>
      </div>

      {/* Connections List */}
      {connections.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-500/10 flex items-center justify-center">
        <Database className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        No database connections
      </h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Connect your PostgreSQL, MySQL, or MongoDB database to start chatting with your data using natural language.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard/database/connect"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
        >
          <Zap className="w-4 h-4" />
          Connect Database
        </Link>
      </div>
      
      {/* Supported Databases */}
      <div className="mt-8 pt-8 border-t border-zinc-800">
        <p className="text-sm text-zinc-500 mb-4">Supported databases</p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-400">PG</span>
            </div>
            <span className="text-xs text-zinc-500">PostgreSQL</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-400">My</span>
            </div>
            <span className="text-xs text-zinc-500">MySQL</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-green-400">MG</span>
            </div>
            <span className="text-xs text-zinc-500">MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionCard({
  connection,
  formatDate,
}: {
  connection: DatabaseConnection;
  formatDate: (date: Date | null) => string;
}) {
  const typeColors = {
    postgresql: "bg-blue-500/10 text-blue-400",
    mysql: "bg-orange-500/10 text-orange-400",
    mongodb: "bg-green-500/10 text-green-400",
  };

  const typeLabels = {
    postgresql: "PostgreSQL",
    mysql: "MySQL",
    mongodb: "MongoDB",
  };

  return (
    <Link
      href={`/dashboard/database/${connection.id}`}
      className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${typeColors[connection.type]}`}>
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
            {connection.name}
          </h3>
          <p className="text-sm text-zinc-500">
            {typeLabels[connection.type]} • {connection.database}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MessageSquare className="w-4 h-4" />
          {connection.conversationsCount} chats
        </div>
        <div className="flex items-center gap-1 text-sm text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(connection.lastUsedAt)}
        </div>
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
