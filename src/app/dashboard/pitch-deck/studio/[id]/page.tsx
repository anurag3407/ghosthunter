/**
 * ============================================================================
 * PITCH DECK STUDIO - MAIN EDITOR PAGE
 * ============================================================================
 * Full-featured pitch deck editor with canvas, toolbar, and properties panel.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";

import { SlideCanvas, SlideList, PropertiesPanel, EditorToolbar } from "@/components/pitch-deck";
import { useEditorStore } from "@/lib/pitch-deck/editor-store";
import { getTheme } from "@/lib/pitch-deck/themes";
import type { Deck, DeckHealthCheck } from "@/types/pitch-deck";

// ============================================================================
// HEALTH CHECK MODAL
// ============================================================================

interface HealthCheckModalProps {
  healthCheck: DeckHealthCheck;
  onClose: () => void;
}

function HealthCheckModal({ healthCheck, onClose }: HealthCheckModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Deck Health Check</h2>
            <p className="text-sm text-zinc-400 mt-1">AI-powered analysis of your pitch deck</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score */}
        <div className="p-6 border-b border-zinc-800">
          <div className={`flex items-center justify-center w-24 h-24 mx-auto rounded-full ${getScoreBg(healthCheck.overallScore)}`}>
            <span className={`text-4xl font-bold ${getScoreColor(healthCheck.overallScore)}`}>
              {healthCheck.overallScore}
            </span>
          </div>
          <p className="text-center text-sm text-zinc-400 mt-2">Overall Score</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[40vh] space-y-6">
          {/* Issues */}
          {healthCheck.issues.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Issues to Address ({healthCheck.issues.length})
              </h3>
              <ul className="space-y-2">
                {healthCheck.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-400">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {healthCheck.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Suggestions ({healthCheck.suggestions.length})
              </h3>
              <ul className="space-y-2">
                {healthCheck.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-400">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {healthCheck.strengths.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Strengths ({healthCheck.strengths.length})
              </h3>
              <ul className="space-y-2">
                {healthCheck.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-400">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Slide Feedback */}
          {healthCheck.slideFeedback.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Slide-by-Slide Feedback</h3>
              <div className="space-y-3">
                {healthCheck.slideFeedback.map((feedback) => (
                  <div
                    key={feedback.slideId}
                    className="p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-300 capitalize">
                        {feedback.slideType.replace("-", " ")}
                      </span>
                      <span className={`text-sm font-medium ${getScoreColor(feedback.score)}`}>
                        {feedback.score}%
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRESENTATION MODE
// ============================================================================

interface PresentationModeProps {
  deck: Deck;
  onClose: () => void;
}

function PresentationMode({ deck, onClose }: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const theme = getTheme(deck.themeId) || getTheme("minimal-dark")!;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck.slides.length, onClose]);

  const visibleSlides = deck.slides.filter(s => !s.hidden);
  const currentSlide = visibleSlides[currentSlideIndex];

  if (!currentSlide) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: theme.tokens.background }}
    >
      <div className="w-full h-full flex items-center justify-center p-8">
        <div
          className="w-full max-w-[1280px] aspect-video rounded-lg shadow-2xl overflow-hidden relative"
          style={{ backgroundColor: currentSlide.background || theme.tokens.background }}
        >
          {/* Render slide content here - simplified for now */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: theme.tokens.textPrimary }}>
              Slide {currentSlideIndex + 1} of {visibleSlides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white text-sm">
          {currentSlideIndex + 1} / {visibleSlides.length}
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

// ============================================================================
// MAIN EDITOR
// ============================================================================

export default function PitchDeckStudioPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.id as string;

  const {
    deck,
    setDeck,
    currentSlideId: _currentSlideId,
    healthCheck,
    setHealthCheck,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  // Load deck
  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) {
        setError("No deck ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/pitch-deck/decks/${deckId}`);
        if (!response.ok) {
          throw new Error("Failed to load deck");
        }

        const data = await response.json();
        setDeck(data.deck);
      } catch (err) {
        console.error("Failed to load deck:", err);
        setError("Failed to load deck");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeck();
  }, [deckId, setDeck]);

  // Show health check modal when updated
  useEffect(() => {
    if (healthCheck) {
      setShowHealthCheck(true);
    }
  }, [healthCheck]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!deck) return;

    setIsSaving(true);
    try {
      await fetch(`/api/pitch-deck/decks/${deck.id}`, {
        method: "PATCH", // Changed from PUT to match API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deck), // Send deck properties directly, not wrapped in { deck }
      });
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  }, [deck]);

  // Export handler
  const handleExport = useCallback(async (format: "pdf" | "pptx" | "png") => {
    if (!deck) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/pitch-deck/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deck.id, format }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${deck.title}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  }, [deck]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-zinc-400">Loading deck...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !deck) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-xl font-semibold text-white">Failed to load deck</h1>
          <p className="text-zinc-400">{error || "Deck not found"}</p>
          <button
            onClick={() => router.push("/dashboard/pitch-deck")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  // Get theme for CSS variables
  const theme = getTheme(deck.themeId) || getTheme("minimal-dark")!;

  return (
    <div
      className="h-screen bg-zinc-950 flex flex-col overflow-hidden"
      style={{
        ["--deck-bg" as string]: theme?.tokens.background || "#0f172a",
        ["--deck-surface" as string]: theme?.tokens.surface || "#1e293b",
        ["--deck-text-primary" as string]: theme?.tokens.textPrimary || "#f8fafc",
        ["--deck-text-secondary" as string]: theme?.tokens.textSecondary || "#94a3b8",
        ["--deck-accent" as string]: theme?.tokens.accent || "#3b82f6",
        ["--deck-accent-secondary" as string]: theme?.tokens.accentSecondary || "#8b5cf6",
      }}
    >
      {/* Toolbar */}
      <EditorToolbar
        onSave={handleSave}
        onPresent={() => setShowPresentation(true)}
        onExport={handleExport}
        isSaving={isSaving}
        isExporting={isExporting}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: Slides */}
        <div className="w-64 flex-shrink-0">
          <SlideList />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-hidden">
          <SlideCanvas />
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-72 flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>

      {/* Modals */}
      {showHealthCheck && healthCheck && (
        <HealthCheckModal
          healthCheck={healthCheck}
          onClose={() => {
            setShowHealthCheck(false);
            setHealthCheck(null);
          }}
        />
      )}

      {showPresentation && (
        <PresentationMode
          deck={deck}
          onClose={() => setShowPresentation(false)}
        />
      )}
    </div>
  );
}
