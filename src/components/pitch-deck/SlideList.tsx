/**
 * ============================================================================
 * PITCH DECK STUDIO - SLIDE LIST
 * ============================================================================
 * Left panel showing slide thumbnails with drag-to-reorder.
 */

"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Presentation,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  DollarSign,
  Rocket,
  Users,
  Shield,
  Map,
  HandCoins,
  FileText,
} from "lucide-react";

import { useEditorStore } from "@/lib/pitch-deck/editor-store";
import { SLIDE_TEMPLATES } from "@/lib/pitch-deck/templates";
import type { Slide, SlideType } from "@/types/pitch-deck";

// ============================================================================
// SLIDE TYPE ICONS
// ============================================================================

const SLIDE_ICONS: Record<SlideType, React.ReactNode> = {
  title: <Presentation className="w-4 h-4" />,
  vision: <Lightbulb className="w-4 h-4" />,
  problem: <AlertCircle className="w-4 h-4" />,
  solution: <Lightbulb className="w-4 h-4" />,
  product: <Target className="w-4 h-4" />,
  market: <TrendingUp className="w-4 h-4" />,
  "business-model": <DollarSign className="w-4 h-4" />,
  traction: <Rocket className="w-4 h-4" />,
  "go-to-market": <Target className="w-4 h-4" />,
  competition: <Users className="w-4 h-4" />,
  "competitive-advantage": <Shield className="w-4 h-4" />,
  roadmap: <Map className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  ask: <HandCoins className="w-4 h-4" />,
  appendix: <FileText className="w-4 h-4" />,
  custom: <Plus className="w-4 h-4" />,
};

const SLIDE_COLORS: Record<SlideType, string> = {
  title: "from-blue-500 to-purple-500",
  vision: "from-purple-500 to-pink-500",
  problem: "from-red-500 to-orange-500",
  solution: "from-green-500 to-emerald-500",
  product: "from-cyan-500 to-blue-500",
  market: "from-purple-500 to-pink-500",
  "business-model": "from-yellow-500 to-orange-500",
  traction: "from-emerald-500 to-green-500",
  "go-to-market": "from-indigo-500 to-purple-500",
  competition: "from-rose-500 to-red-500",
  "competitive-advantage": "from-blue-500 to-cyan-500",
  roadmap: "from-orange-500 to-yellow-500",
  team: "from-pink-500 to-rose-500",
  ask: "from-blue-600 to-indigo-600",
  appendix: "from-zinc-500 to-zinc-600",
  custom: "from-zinc-600 to-zinc-700",
};

// ============================================================================
// SORTABLE SLIDE ITEM
// ============================================================================

interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
}

function SortableSlideItem({
  slide,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleHidden,
}: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const template = SLIDE_TEMPLATES.find(t => t.slideType === slide.type);
  const slideColor = SLIDE_COLORS[slide.type] || SLIDE_COLORS.custom;
  const slideIcon = SLIDE_ICONS[slide.type] || SLIDE_ICONS.custom;
  
  // Get headline from first heading/text element
  const headlineElement = slide.elements.find(
    el => el.type === "heading" || el.type === "text"
  );
  const headline = (headlineElement as { content?: string })?.content || template?.displayName || "Untitled";
  
  const hasWarnings = slide.warnings && slide.warnings.length > 0;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg transition-all cursor-pointer
        ${isDragging ? "opacity-50 z-50" : ""}
        ${isSelected 
          ? "bg-blue-500/20 ring-2 ring-blue-500/50" 
          : "hover:bg-zinc-800/50"
        }
      `}
      onClick={onSelect}
    >
      {/* Drag handle and slide preview */}
      <div
        {...attributes}
        {...listeners}
        className="p-2"
      >
        {/* Slide number */}
        <div className="absolute top-2 left-2 text-xs font-medium text-zinc-500">
          {index + 1}
        </div>
        
        {/* Thumbnail */}
        <div
          className={`
            aspect-video rounded-md bg-gradient-to-br ${slideColor}
            flex items-center justify-center relative overflow-hidden
            ${slide.hidden ? "opacity-50" : ""}
          `}
        >
          {/* Content preview */}
          <div className="absolute inset-0 flex flex-col p-2">
            <p className="text-[8px] font-semibold text-white/90 truncate">
              {headline}
            </p>
          </div>
          
          {/* Hidden indicator */}
          {slide.hidden && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <EyeOff className="w-4 h-4 text-white/60" />
            </div>
          )}
          
          {/* Warning indicator */}
          {hasWarnings && !slide.hidden && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
          )}
        </div>
        
        {/* Slide type label */}
        <div className="mt-1 flex items-center gap-1.5 px-0.5">
          <span className="text-zinc-400">{slideIcon}</span>
          <span className="text-xs text-zinc-400 truncate">
            {template?.displayName || slide.type}
          </span>
        </div>
      </div>
      
      {/* Action buttons (visible on hover) */}
      <div className={`
        absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
        ${isSelected ? "opacity-100" : ""}
      `}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleHidden(); }}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
          title={slide.hidden ? "Show slide" : "Hide slide"}
        >
          {slide.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
          title="Duplicate slide"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
          title="Delete slide"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ADD SLIDE DROPDOWN
// ============================================================================

interface AddSlideDropdownProps {
  onAdd: (type: SlideType) => void;
}

function AddSlideDropdown({ onAdd }: AddSlideDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const slideTypes: SlideType[] = [
    "title", "problem", "solution", "product", "market",
    "business-model", "traction", "go-to-market", "competition",
    "competitive-advantage", "roadmap", "team", "ask", "custom"
  ];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 
          bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 
          rounded-lg border border-dashed border-blue-500/30 
          transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Slide
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 right-0 mt-2 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            {slideTypes.map((type) => {
              const template = SLIDE_TEMPLATES.find(t => t.slideType === type);
              return (
                <button
                  key={type}
                  onClick={() => { onAdd(type); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 transition-colors text-left"
                >
                  <span className="text-zinc-400">{SLIDE_ICONS[type]}</span>
                  <div>
                    <div className="text-sm text-white">
                      {template?.displayName || type}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {template?.description || ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN SLIDE LIST COMPONENT
// ============================================================================

export function SlideList() {
  const {
    deck,
    selectedSlideId,
    selectSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
    updateSlide,
  } = useEditorStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!deck || !over || active.id === over.id) return;
    
    const oldIndex = deck.slides.findIndex(s => s.id === active.id);
    const newIndex = deck.slides.findIndex(s => s.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSlides(oldIndex, newIndex);
    }
  };
  
  if (!deck) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No deck loaded
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">
          Slides ({deck.slides.length})
        </h3>
      </div>
      
      {/* Slides list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={deck.slides.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {deck.slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                isSelected={slide.id === selectedSlideId}
                onSelect={() => selectSlide(slide.id)}
                onDuplicate={() => duplicateSlide(slide.id)}
                onDelete={() => deleteSlide(slide.id)}
                onToggleHidden={() => updateSlide(slide.id, { hidden: !slide.hidden })}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      
      {/* Add slide button */}
      <div className="p-3 border-t border-zinc-800">
        <AddSlideDropdown onAdd={(type) => addSlide(type, selectedSlideId || undefined)} />
      </div>
    </div>
  );
}

export default SlideList;
