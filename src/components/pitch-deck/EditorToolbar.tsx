/**
 * ============================================================================
 * PITCH DECK STUDIO - EDITOR TOOLBAR
 * ============================================================================
 * Top toolbar with tools, actions, zoom controls, and export options.
 */

"use client";

import React, { useState } from "react";
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Image,
  BarChart2,
  Table,
  Minus,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  Download,
  Save,
  Play,
  ChevronDown,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Palette,
  Settings,
  Presentation,
  LayoutGrid,
  Triangle,
  Star,
  Hexagon,
} from "lucide-react";

import { 
  useEditorStore, 
  useCanUndo, 
  useCanRedo 
} from "@/lib/pitch-deck/editor-store";
import { THEMES } from "@/lib/pitch-deck/themes";
import type { EditorTool } from "@/types/pitch-deck";

// ============================================================================
// TOOL BUTTON
// ============================================================================

interface ToolButtonProps {
  tool: EditorTool;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

function ToolButton({ tool, icon, label, shortcut }: ToolButtonProps) {
  const { currentTool, setTool } = useEditorStore();
  
  return (
    <button
      onClick={() => setTool(tool)}
      className={`relative p-2 rounded-lg transition-colors ${
        currentTool === tool
          ? "bg-blue-500/20 text-blue-400"
          : "text-zinc-400 hover:text-white hover:bg-zinc-700"
      }`}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// SHAPE DROPDOWN
// ============================================================================

function ShapeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { setTool, currentTool } = useEditorStore();
  
  const shapes = [
    { id: "shape-rectangle", icon: <Square className="w-4 h-4" />, label: "Rectangle" },
    { id: "shape-ellipse", icon: <Circle className="w-4 h-4" />, label: "Ellipse" },
    { id: "shape-triangle", icon: <Triangle className="w-4 h-4" />, label: "Triangle" },
    { id: "shape-star", icon: <Star className="w-4 h-4" />, label: "Star" },
    { id: "shape-hexagon", icon: <Hexagon className="w-4 h-4" />, label: "Hexagon" },
    { id: "shape-line", icon: <Minus className="w-4 h-4" />, label: "Line" },
  ];
  
  const isShapeTool = currentTool.startsWith("shape-");
  const currentShape = shapes.find(s => s.id === currentTool) || shapes[0];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${
          isShapeTool
            ? "bg-blue-500/20 text-blue-400"
            : "text-zinc-400 hover:text-white hover:bg-zinc-700"
        }`}
        title="Shapes"
      >
        {currentShape.icon}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[120px]">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => {
                  setTool(shape.id as EditorTool);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded"
              >
                {shape.icon}
                {shape.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// ZOOM CONTROLS
// ============================================================================

function ZoomControls() {
  const { viewport, setViewport } = useEditorStore();
  
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  
  const zoomIn = () => {
    const currentIndex = zoomLevels.findIndex(z => z >= viewport.zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setViewport({ zoom: zoomLevels[currentIndex + 1] });
    }
  };
  
  const zoomOut = () => {
    const currentIndex = zoomLevels.findIndex(z => z >= viewport.zoom);
    if (currentIndex > 0) {
      setViewport({ zoom: zoomLevels[currentIndex - 1] });
    }
  };
  
  return (
    <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
      <button
        onClick={zoomOut}
        className="p-1 text-zinc-400 hover:text-white"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="w-12 text-center text-xs text-zinc-300">
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button
        onClick={zoomIn}
        className="p-1 text-zinc-400 hover:text-white"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// EXPORT DROPDOWN
// ============================================================================

interface ExportDropdownProps {
  onExport: (format: "pdf" | "pptx" | "png") => void;
  isExporting: boolean;
}

function ExportDropdown({ onExport, isExporting }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && !isExporting && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[160px]">
            <button
              onClick={() => {
                onExport("pdf");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded"
            >
              <FileText className="w-4 h-4" />
              Export as PDF
            </button>
            <button
              onClick={() => {
                onExport("pptx");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded"
            >
              <Presentation className="w-4 h-4" />
              Export as PPTX
            </button>
            <button
              onClick={() => {
                onExport("png");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded"
            >
              <Image className="w-4 h-4" />
              Export as Images
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// HEALTH CHECK BUTTON
// ============================================================================

function HealthCheckButton() {
  const { healthCheck, setHealthCheck, deck } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const runHealthCheck = async () => {
    if (!deck) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/pitch-deck/studio/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deck.id }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setHealthCheck(result);
      }
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColor = () => {
    if (!healthCheck) return "text-zinc-400";
    if (healthCheck.overallScore >= 80) return "text-green-400";
    if (healthCheck.overallScore >= 60) return "text-amber-400";
    return "text-red-400";
  };
  
  return (
    <button
      onClick={runHealthCheck}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors ${getStatusColor()}`}
      title="Check deck health"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : healthCheck ? (
        healthCheck.overallScore >= 80 ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {healthCheck ? `${healthCheck.overallScore}%` : "Health"}
    </button>
  );
}

// ============================================================================
// MAIN TOOLBAR
// ============================================================================

interface EditorToolbarProps {
  onSave?: () => void;
  onPresent?: () => void;
  onExport?: (format: "pdf" | "pptx" | "png") => void;
  isSaving?: boolean;
  isExporting?: boolean;
}

export function EditorToolbar({
  onSave,
  onPresent,
  onExport,
  isSaving = false,
  isExporting = false,
}: EditorToolbarProps) {
  const { 
    deck,
    viewport,
    setViewport,
    undo, 
    redo 
  } = useEditorStore();
  
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  
  return (
    <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
      {/* Left: Tools */}
      <div className="flex items-center gap-1">
        {/* Selection tool */}
        <ToolButton
          tool="select"
          icon={<MousePointer2 className="w-4 h-4" />}
          label="Select"
          shortcut="V"
        />
        
        <div className="w-px h-6 bg-zinc-700 mx-2" />
        
        {/* Text tools */}
        <ToolButton
          tool="text"
          icon={<Type className="w-4 h-4" />}
          label="Text"
          shortcut="T"
        />
        
        {/* Shape dropdown */}
        <ShapeDropdown />
        
        {/* Image */}
        <ToolButton
          tool="image"
          icon={<Image className="w-4 h-4" />}
          label="Image"
          shortcut="I"
        />
        
        {/* Chart */}
        <ToolButton
          tool="chart"
          icon={<BarChart2 className="w-4 h-4" />}
          label="Chart"
        />
        
        {/* Table */}
        <ToolButton
          tool="table"
          icon={<Table className="w-4 h-4" />}
          label="Table"
        />
        
        <div className="w-px h-6 bg-zinc-700 mx-2" />
        
        {/* Undo/Redo */}
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Center: Title + Zoom */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={deck?.title || "Untitled Deck"}
          onChange={(e) => {
            // Would update deck title
          }}
          className="bg-transparent text-white text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
        />
        
        <ZoomControls />
        
        {/* View toggles */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-1 py-1">
          <button
            onClick={() => setViewport({ showGrid: !viewport.showGrid })}
            className={`p-1 rounded ${viewport.showGrid ? "bg-blue-500/20 text-blue-400" : "text-zinc-400 hover:text-white"}`}
            title="Show grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport({ snapToGrid: !viewport.snapToGrid })}
            className={`p-1 rounded ${viewport.snapToGrid ? "bg-blue-500/20 text-blue-400" : "text-zinc-400 hover:text-white"}`}
            title="Snap to grid"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <HealthCheckButton />
        
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
        
        <ExportDropdown
          onExport={onExport || (() => {})}
          isExporting={isExporting}
        />
        
        <button
          onClick={onPresent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          Present
        </button>
      </div>
    </div>
  );
}

export default EditorToolbar;
