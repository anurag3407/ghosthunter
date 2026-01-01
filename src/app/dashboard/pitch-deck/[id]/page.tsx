"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Presentation,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";

interface Slide {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  content?: string;
  order: number;
}

interface PitchDeck {
  id: string;
  projectName: string;
  tagline: string;
  slides: Slide[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  status: string;
}

const slideTypeColors: Record<string, string> = {
  title: "from-blue-500 to-purple-500",
  problem: "from-red-500 to-orange-500",
  solution: "from-green-500 to-emerald-500",
  features: "from-cyan-500 to-blue-500",
  market: "from-purple-500 to-pink-500",
  "business-model": "from-yellow-500 to-orange-500",
  traction: "from-emerald-500 to-green-500",
  team: "from-pink-500 to-rose-500",
  cta: "from-blue-600 to-indigo-600",
};

export default function PitchDeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlide, setEditedSlide] = useState<Slide | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(`/api/pitch-deck/decks/${deckId}`);
        if (response.ok) {
          const data = await response.json();
          setDeck(data.deck);
        } else {
          router.push("/dashboard/pitch-deck");
        }
      } catch (error) {
        console.error("Error fetching deck:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, router]);

  const currentSlide = deck?.slides[currentSlideIndex];

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setIsEditing(false);
    }
  };

  const handleNextSlide = () => {
    if (deck && currentSlideIndex < deck.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    if (currentSlide) {
      setEditedSlide({ ...currentSlide });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!deck || !editedSlide) return;

    setIsSaving(true);
    try {
      const updatedSlides = deck.slides.map((s) =>
        s.id === editedSlide.id ? editedSlide : s
      );

      const response = await fetch(`/api/pitch-deck/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: updatedSlides }),
      });

      if (response.ok) {
        setDeck({ ...deck, slides: updatedSlides });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Create a simple HTML representation and print
      const printWindow = window.open("", "_blank");
      if (!printWindow || !deck) return;

      const slidesHtml = deck.slides
        .map(
          (slide) => `
        <div style="page-break-after: always; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
          <h1 style="font-size: 2.5rem; color: white; margin-bottom: 1rem; text-align: center;">${slide.title}</h1>
          ${slide.subtitle ? `<h2 style="font-size: 1.5rem; color: #a0a0a0; margin-bottom: 2rem; text-align: center;">${slide.subtitle}</h2>` : ""}
          ${
            slide.bullets
              ? `<ul style="list-style: none; padding: 0; text-align: left; max-width: 600px;">
                  ${slide.bullets.map((b) => `<li style="font-size: 1.25rem; color: #e0e0e0; margin: 0.5rem 0; padding-left: 1.5rem; position: relative;"><span style="position: absolute; left: 0;">•</span>${b}</li>`).join("")}
                 </ul>`
              : ""
          }
          ${slide.content ? `<p style="font-size: 1.25rem; color: #e0e0e0; text-align: center; max-width: 600px;">${slide.content}</p>` : ""}
        </div>
      `
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${deck.projectName} - Pitch Deck</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>${slidesHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-400">Deck not found</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pitch-deck"
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="font-semibold text-white">{deck.projectName}</h1>
            <p className="text-sm text-zinc-500">{deck.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Slides Sidebar */}
        <div className="w-48 border-r border-zinc-800 p-3 overflow-y-auto">
          {deck.slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentSlideIndex(index);
                setIsEditing(false);
              }}
              className={`w-full p-2 rounded-lg mb-2 transition-all ${
                currentSlideIndex === index
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-zinc-800/50 hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <div
                className={`aspect-video rounded bg-gradient-to-br ${
                  slideTypeColors[slide.type] || "from-zinc-600 to-zinc-700"
                } p-2 mb-1`}
              >
                <p className="text-[8px] text-white/80 font-medium truncate">{slide.title}</p>
              </div>
              <p className="text-xs text-zinc-400 truncate">{slide.type}</p>
            </button>
          ))}
        </div>

        {/* Slide Preview/Editor */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Slide Content */}
          <div
            className={`flex-1 rounded-2xl bg-gradient-to-br ${
              slideTypeColors[currentSlide?.type || "title"] || "from-zinc-600 to-zinc-700"
            } p-8 flex flex-col justify-center items-center text-center relative`}
          >
            {isEditing && editedSlide ? (
              /* Edit Mode */
              <div className="w-full max-w-2xl space-y-4">
                <input
                  type="text"
                  value={editedSlide.title}
                  onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
                  className="w-full text-3xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                {editedSlide.subtitle !== undefined && (
                  <input
                    type="text"
                    value={editedSlide.subtitle || ""}
                    onChange={(e) => setEditedSlide({ ...editedSlide, subtitle: e.target.value })}
                    className="w-full text-xl text-white/80 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Subtitle"
                  />
                )}
                {editedSlide.bullets && (
                  <div className="space-y-2">
                    {editedSlide.bullets.map((bullet, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...editedSlide.bullets!];
                            newBullets[i] = e.target.value;
                            setEditedSlide({ ...editedSlide, bullets: newBullets });
                          }}
                          className="flex-1 text-lg text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <button
                          onClick={() => {
                            const newBullets = editedSlide.bullets!.filter((_, idx) => idx !== i);
                            setEditedSlide({ ...editedSlide, bullets: newBullets });
                          }}
                          className="p-2 text-white/60 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEditedSlide({
                          ...editedSlide,
                          bullets: [...(editedSlide.bullets || []), "New bullet point"],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
                    >
                      <Plus className="w-4 h-4" /> Add bullet
                    </button>
                  </div>
                )}
                {editedSlide.content !== undefined && (
                  <textarea
                    value={editedSlide.content || ""}
                    onChange={(e) => setEditedSlide({ ...editedSlide, content: e.target.value })}
                    rows={3}
                    className="w-full text-lg text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Content"
                  />
                )}
              </div>
            ) : (
              /* View Mode */
              <>
                <h2 className="text-4xl font-bold text-white mb-4">{currentSlide?.title}</h2>
                {currentSlide?.subtitle && (
                  <p className="text-xl text-white/80 mb-6">{currentSlide.subtitle}</p>
                )}
                {currentSlide?.bullets && (
                  <ul className="text-left space-y-2 mb-6">
                    {currentSlide.bullets.map((bullet, i) => (
                      <li key={i} className="text-lg text-white/90 flex items-start gap-2">
                        <span className="mt-2 w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                {currentSlide?.content && (
                  <p className="text-lg text-white/90 max-w-2xl">{currentSlide.content}</p>
                )}
              </>
            )}

            {/* Edit/Save Button */}
            <div className="absolute top-4 right-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Save className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="text-zinc-400">
              {currentSlideIndex + 1} / {deck.slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === deck.slides.length - 1}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
