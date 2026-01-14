"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    FileText,
    Clock,
    Download,
    PenTool,
    Trash2,
    Loader2,
} from "lucide-react";

interface PitchDeck {
    id: string;
    projectName: string;
    tagline: string;
    status: "draft" | "completed";
    slidesCount: number;
    createdAt: string;
}

interface DeckListProps {
    initialDecks: PitchDeck[];
}

export function DeckList({ initialDecks }: DeckListProps) {
    const router = useRouter();
    const [decks, setDecks] = useState<PitchDeck[]>(initialDecks);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleDelete = async (deckId: string) => {
        try {
            const response = await fetch(`/api/pitch-deck/decks/${deckId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setDecks(decks.filter(d => d.id !== deckId));
            }
        } catch (error) {
            console.error("Error deleting deck:", error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
                <DeckCard
                    key={deck.id}
                    deck={deck}
                    formatDate={formatDate}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}

function DeckCard({
    deck,
    formatDate,
    onDelete,
}: {
    deck: PitchDeck;
    formatDate: (date: string) => string;
    onDelete: (deckId: string) => void;
}) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isConfirming) {
            setIsDeleting(true);
            await onDelete(deck.id);
            setIsDeleting(false);
        } else {
            setIsConfirming(true);
        }
    };

    return (
        <div className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
            {/* Preview placeholder */}
            <Link href={`/dashboard/pitch-deck/${deck.id}`}>
                <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl mb-4 flex items-center justify-center border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors">
                    <FileText className="w-12 h-12 text-zinc-600" />
                </div>
            </Link>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {deck.projectName}
                    </h3>
                    <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${deck.status === "completed"
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
                {isConfirming ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Confirm"
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsConfirming(false);
                            }}
                            disabled={isDeleting}
                            className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleDeleteClick}
                        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
                <Link
                    href={`/dashboard/pitch-deck/studio/${deck.id}`}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <PenTool className="w-4 h-4" />
                    Edit in Studio
                </Link>
            </div>
        </div>
    );
}
