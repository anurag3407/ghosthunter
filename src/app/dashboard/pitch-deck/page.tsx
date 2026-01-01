import Link from "next/link";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  Presentation,
  Plus,
  FileText,
  Clock,
  Download,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/**
 * ============================================================================
 * PITCH DECK - MAIN PAGE
 * ============================================================================
 * Lists all generated pitch decks from Firestore.
 */

interface PitchDeck {
  id: string;
  projectName: string;
  tagline: string;
  status: "draft" | "completed";
  slidesCount: number;
  createdAt: Date;
}

export default async function PitchDeckPage() {
  // Development: Use a dev user ID
  // TODO: Replace with real auth in production
  const userId = "dev-user-123";

  // Fetch decks from Firestore
  let decks: PitchDeck[] = [];
  const db = getAdminDb();
  
  if (db) {
    try {
      const decksSnapshot = await db
        .collection("pitchDecks")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      decks = decksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          projectName: data.projectName || "Untitled",
          tagline: data.tagline || "",
          status: data.status || "draft",
          slidesCount: data.slides?.length || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
    } catch (error) {
      console.error("Error fetching pitch decks:", error);
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Presentation className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Pitch Deck Generator</h1>
          </div>
          <p className="text-zinc-400">
            Generate professional pitch decks from your GitHub README
          </p>
        </div>
        <Link
          href="/dashboard/pitch-deck/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Pitch Deck
        </Link>
      </div>

      {/* Decks List */}
      {decks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center">
        <Presentation className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        No pitch decks yet
      </h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Create your first pitch deck by selecting a GitHub repository. Our AI will analyze your README and generate professional slides.
      </p>
      <Link
        href="/dashboard/pitch-deck/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Create Your First Deck
      </Link>
    </div>
  );
}

function DeckCard({
  deck,
  formatDate,
}: {
  deck: PitchDeck;
  formatDate: (date: Date) => string;
}) {
  return (
    <Link
      href={`/dashboard/pitch-deck/${deck.id}`}
      className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all"
    >
      {/* Preview placeholder */}
      <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl mb-4 flex items-center justify-center border border-zinc-800">
        <FileText className="w-12 h-12 text-zinc-600" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
            {deck.projectName}
          </h3>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              deck.status === "completed"
                ? "bg-green-500/10 text-green-400"
                : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {deck.status}
          </span>
        </div>
        <p className="text-sm text-zinc-400 truncate">{deck.tagline || "No tagline"}</p>
        <div className="flex items-center justify-between pt-2 text-sm text-zinc-500">
          <span>{deck.slidesCount} slides</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(deck.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <button className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
