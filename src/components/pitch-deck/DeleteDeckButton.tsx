"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteDeckButtonProps {
    deckId: string;
    deckName: string;
    onDeleted: () => void;
}

export function DeleteDeckButton({ deckId, deckName, onDeleted }: DeleteDeckButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/pitch-deck/decks/${deckId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                onDeleted();
            } else {
                console.error("Failed to delete deck");
                setIsConfirming(false);
            }
        } catch (error) {
            console.error("Error deleting deck:", error);
            setIsConfirming(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isConfirming) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDelete}
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
                    onClick={() => setIsConfirming(false)}
                    disabled={isDeleting}
                    className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsConfirming(true);
            }}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition-colors"
            title={`Delete ${deckName}`}
        >
            <Trash2 className="w-4 h-4" />
            Delete
        </button>
    );
}
