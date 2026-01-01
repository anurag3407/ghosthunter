"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Database,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  HardDrive,
  Link2,
} from "lucide-react";

type DatabaseType = "postgresql" | "mysql" | "mongodb" | "supabase";
type ConnectionMode = "form" | "string";

const databaseTypes = [
  { id: "postgresql" as DatabaseType, name: "PostgreSQL", color: "blue", icon: "🐘" },
  { id: "mysql" as DatabaseType, name: "MySQL", color: "orange", icon: "🐬" },
  { id: "mongodb" as DatabaseType, name: "MongoDB", color: "green", icon: "🍃" },
  { id: "supabase" as DatabaseType, name: "Supabase", color: "emerald", icon: "⚡" },
];

export default function ConnectDatabasePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<DatabaseType>("postgresql");
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("string");
  const [connectionName, setConnectionName] = useState("");
  
  // Connection string mode
  const [connectionString, setConnectionString] = useState("");
  
  // Form mode
  const [host, setHost] = useState("");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const defaultPorts: Record<DatabaseType, string> = {
    postgresql: "5432",
    mysql: "3306",
    mongodb: "27017",
    supabase: "5432",
  };

  const connectionStringPlaceholders: Record<DatabaseType, string> = {
    postgresql: "postgresql://user:password@host:5432/database",
    mysql: "mysql://user:password@host:3306/database",
    mongodb: "mongodb+srv://user:password@cluster.mongodb.net/database",
    supabase: "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres",
  };

  const handleTypeChange = (type: DatabaseType) => {
    setSelectedType(type);
    setPort(defaultPorts[type]);
    setTestStatus("idle");
    setError("");
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus("idle");
    setError("");

    try {
      const body = connectionMode === "string"
        ? { type: selectedType, connectionString }
        : {
            type: selectedType,
            host,
            port: parseInt(port),
            database,
            username,
            password,
          };

      const response = await fetch("/api/database/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Connection failed");
      }

      setTestStatus("success");
    } catch (err) {
      setTestStatus("error");
      setError(err instanceof Error ? err.message : "Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const body = connectionMode === "string"
        ? { name: connectionName, type: selectedType, connectionString }
        : {
            name: connectionName,
            type: selectedType,
            host,
            port: parseInt(port),
            database,
            username,
            password,
          };

      const response = await fetch("/api/database/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save connection");
      }

      router.push("/dashboard/database");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const isFormValid = connectionMode === "string" 
    ? connectionName && connectionString
    : connectionName && host && port && database && username && password;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/database"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Database Agent
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Database className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Connect Database</h1>
            <p className="text-zinc-400">Add a new database connection</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {/* Database Type Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Database Type</label>
          <div className="grid grid-cols-4 gap-3">
            {databaseTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`p-4 rounded-xl border transition-all text-center ${
                  selectedType === type.id
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className="text-xs font-medium text-white">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Connection Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Connection Method</label>
          <div className="flex rounded-xl bg-zinc-800 p-1">
            <button
              onClick={() => setConnectionMode("string")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                connectionMode === "string"
                  ? "bg-green-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Connection String
            </button>
            <button
              onClick={() => setConnectionMode("form")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                connectionMode === "form"
                  ? "bg-green-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" />
              Manual Entry
            </button>
          </div>
        </div>

        {/* Connection Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Connection Name</label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My Production Database"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Connection String Mode */}
        {connectionMode === "string" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Connection String
            </label>
            <textarea
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder={connectionStringPlaceholders[selectedType]}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Paste your {selectedType === "supabase" ? "Supabase" : selectedType} connection string
            </p>
          </div>
        )}

        {/* Form Mode */}
        {connectionMode === "form" && (
          <>
            {/* Host & Port */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Host</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost or your-db-host.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Port</label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Database Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Database Name</label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="mydb"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="postgres"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Test Status */}
        {testStatus === "success" && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Connection successful!
          </div>
        )}

        {testStatus === "error" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTestConnection}
            disabled={!isFormValid || isTesting}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Test Connection
              </>
            )}
          </button>
          <button
            onClick={handleConnect}
            disabled={!isFormValid || isConnecting}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HardDrive className="w-5 h-5" />
                Save Connection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
