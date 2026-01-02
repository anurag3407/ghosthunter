"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import {
  Database,
  ArrowLeft,
  Send,
  Loader2,
  User,
  Bot,
  Copy,
  Check,
  Table,
  RotateCcw,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  query?: string | Record<string, unknown>;
  results?: Record<string, unknown>[];
  timestamp: Date;
}

// Helper to safely convert query to string for rendering
function stringifyQuery(query: string | Record<string, unknown> | undefined): string {
  if (!query) return "";
  if (typeof query === "string") return query;
  return JSON.stringify(query, null, 2);
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

export default function DatabaseChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: connectionId } = use(params);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/database/conversations?connectionId=${connectionId}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
          if (data.conversations?.length > 0) {
            setActiveConversationId(data.conversations[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [connectionId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/database/chat?conversationId=${activeConversationId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  const handleNewConversation = async () => {
    try {
      const response = await fetch("/api/database/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newConversation = {
          id: data.conversationId,
          title: "New Conversation",
          updatedAt: new Date(),
        };
        setConversations([newConversation, ...conversations]);
        setActiveConversationId(data.conversationId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await fetch(`/api/database/conversations?id=${convId}`, { method: "DELETE" });
      setConversations(conversations.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(conversations[0]?.id || null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create a new conversation if none exists
    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        const response = await fetch("/api/database/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId }),
        });
        if (response.ok) {
          const data = await response.json();
          conversationId = data.conversationId;
          if (conversationId) {
            setActiveConversationId(conversationId);
            setConversations([
              { id: conversationId, title: "New Conversation", updatedAt: new Date() },
              ...conversations,
            ]);
          }
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/database/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          connectionId,
          message: input,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Sorry, I encountered an error.",
        query: data.query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation title in list
      if (messages.length === 0) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, title: input.slice(0, 30) + (input.length > 30 ? "..." : "") }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Conversations */}
      <div
        className={`${
          showSidebar ? "w-64" : "w-0"
        } transition-all duration-200 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-hidden`}
      >
        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800/50"
                }`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <MessageSquare className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-zinc-300 truncate">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 text-zinc-400 transition-transform ${!showSidebar ? "rotate-180" : ""}`} />
            </button>
            <Link
              href="/dashboard/database"
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="font-semibold text-white">Database Chat</h1>
                <p className="text-xs text-zinc-500">Ask questions in plain English</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-green-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-2xl bg-green-500/10 mb-4">
                <Database className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Start a Conversation</h2>
              <p className="text-zinc-400 max-w-md mb-6">
                Ask me anything about your database in plain English. I'll generate the right queries for you.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Show me all tables", "What's the schema?", "Count all users"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-green-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-green-500 text-white rounded-2xl rounded-br-md px-4 py-2"
                      : "space-y-3"
                  }`}
                >
                  {message.role === "user" ? (
                    <p>{message.content}</p>
                  ) : (
                    <>
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl rounded-tl-md p-4">
                        <p className="text-zinc-300 whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {message.query && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-500">Generated Query</span>
                            <button
                              onClick={() => handleCopy(stringifyQuery(message.query), message.id + "-query")}
                              className="text-zinc-400 hover:text-white"
                            >
                              {copiedId === message.id + "-query" ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <code className="text-sm text-green-400 font-mono whitespace-pre-wrap">{stringifyQuery(message.query)}</code>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-400" />
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl rounded-tl-md p-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your question...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data in plain English..."
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
