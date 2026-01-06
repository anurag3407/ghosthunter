/**
 * ============================================================================
 * PITCH DECK STUDIO - PROPERTIES PANEL
 * ============================================================================
 * Right panel for editing element properties, styles, and AI actions.
 */

"use client";

import React, { useState } from "react";
import {
  Type,
  Palette,
  Layout,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Move,
  Layers,
  Image,
  BarChart2,
  Table,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Wand2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

import { useEditorStore, useCurrentSlide, useSelectedElements } from "@/lib/pitch-deck/editor-store";
import { THEMES, getTheme } from "@/lib/pitch-deck/themes";
import { SLIDE_TEMPLATES } from "@/lib/pitch-deck/templates";
import type { 
  SlideElement, 
  TextElement, 
  BulletListElement, 
  ShapeElement,
  TextStyle 
} from "@/types/pitch-deck";

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        )}
        {icon && <span className="text-zinc-400">{icon}</span>}
        <span className="text-sm font-medium text-zinc-300">{title}</span>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-zinc-400">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-16 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {unit && <span className="text-xs text-zinc-500">{unit}</span>}
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse CSS variable to actual color for display
  const displayColor = value.startsWith("var(") ? "#94a3b8" : value;
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-400">{label}</label>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors"
        >
          <div
            className="w-4 h-4 rounded border border-zinc-600"
            style={{ backgroundColor: displayColor }}
          />
          <span className="text-xs text-zinc-300">
            {value.startsWith("var(") ? "Theme" : value}
          </span>
        </button>
      </div>
      
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute right-0 mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50">
            <HexColorPicker color={displayColor} onChange={onChange} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onChange("var(--deck-text-primary)")}
                className="flex-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
              >
                Use Theme
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectInput({ label, value, options, onChange }: SelectInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// TEXT PROPERTIES EDITOR
// ============================================================================

interface TextPropertiesProps {
  element: TextElement | BulletListElement;
  onChange: (updates: Partial<TextElement | BulletListElement>) => void;
}

function TextProperties({ element, onChange }: TextPropertiesProps) {
  const style = element.style;
  
  const updateStyle = (updates: Partial<TextStyle>) => {
    onChange({ style: { ...style, ...updates } } as Partial<TextElement>);
  };
  
  return (
    <>
      {/* Font controls */}
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Size"
          value={style.fontSize}
          onChange={(v) => updateStyle({ fontSize: v })}
          min={8}
          max={200}
          unit="px"
        />
        <NumberInput
          label="Line Height"
          value={style.lineHeight}
          onChange={(v) => updateStyle({ lineHeight: v })}
          min={0.5}
          max={3}
          step={0.1}
        />
      </div>
      
      {/* Style buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateStyle({ fontWeight: style.fontWeight >= 600 ? 400 : 700 })}
          className={`p-2 rounded ${style.fontWeight >= 600 ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateStyle({ fontStyle: style.fontStyle === "italic" ? "normal" : "italic" })}
          className={`p-2 rounded ${style.fontStyle === "italic" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateStyle({ textDecoration: style.textDecoration === "underline" ? "none" : "underline" })}
          className={`p-2 rounded ${style.textDecoration === "underline" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateStyle({ textDecoration: style.textDecoration === "line-through" ? "none" : "line-through" })}
          className={`p-2 rounded ${style.textDecoration === "line-through" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>
      
      {/* Alignment */}
      <div className="flex items-center gap-1">
        {[
          { value: "left", icon: AlignLeft },
          { value: "center", icon: AlignCenter },
          { value: "right", icon: AlignRight },
          { value: "justify", icon: AlignJustify },
        ].map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateStyle({ textAlign: value as TextStyle["textAlign"] })}
            className={`p-2 rounded ${style.textAlign === value ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      
      {/* Color */}
      <ColorInput
        label="Text Color"
        value={style.color}
        onChange={(v) => updateStyle({ color: v })}
      />
    </>
  );
}

// ============================================================================
// TRANSFORM PROPERTIES
// ============================================================================

interface TransformPropertiesProps {
  element: SlideElement;
  onChange: (updates: Partial<SlideElement>) => void;
}

function TransformProperties({ element, onChange }: TransformPropertiesProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput
        label="X"
        value={Math.round(element.x)}
        onChange={(v) => onChange({ x: v })}
        unit="px"
      />
      <NumberInput
        label="Y"
        value={Math.round(element.y)}
        onChange={(v) => onChange({ y: v })}
        unit="px"
      />
      <NumberInput
        label="Width"
        value={Math.round(element.width)}
        onChange={(v) => onChange({ width: v })}
        min={10}
        unit="px"
      />
      <NumberInput
        label="Height"
        value={Math.round(element.height)}
        onChange={(v) => onChange({ height: v })}
        min={10}
        unit="px"
      />
      <NumberInput
        label="Rotation"
        value={element.rotation}
        onChange={(v) => onChange({ rotation: v })}
        min={-180}
        max={180}
        unit="°"
      />
      <NumberInput
        label="Opacity"
        value={element.opacity * 100}
        onChange={(v) => onChange({ opacity: v / 100 })}
        min={0}
        max={100}
        unit="%"
      />
    </div>
  );
}

// ============================================================================
// AI ACTIONS
// ============================================================================

interface AIActionsProps {
  element: TextElement | BulletListElement;
  onImprove: (action: string) => void;
  isLoading: boolean;
}

function AIActions({ element, onImprove, isLoading }: AIActionsProps) {
  const actions = [
    { id: "punchier", label: "Make Punchier", icon: Sparkles },
    { id: "formal", label: "More Formal", icon: Type },
    { id: "shorter", label: "Shorten", icon: ChevronDown },
    { id: "longer", label: "Expand", icon: ChevronRight },
    { id: "simplify", label: "Simplify", icon: RotateCcw },
  ];
  
  return (
    <div className="space-y-2">
      {actions.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onImprove(id)}
          disabled={isLoading}
          className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
          {label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// SLIDE PROPERTIES (when no element selected)
// ============================================================================

function SlideProperties() {
  const currentSlide = useCurrentSlide();
  const { deck, updateSlide, updateDeck } = useEditorStore();
  
  if (!currentSlide || !deck) return null;
  
  const template = SLIDE_TEMPLATES.find(t => t.slideType === currentSlide.type);
  
  return (
    <>
      {/* Slide info */}
      <CollapsibleSection title="Slide" icon={<Layout className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="text-sm text-white font-medium">
            {template?.displayName || currentSlide.type}
          </div>
          <p className="text-xs text-zinc-400">
            {template?.description}
          </p>
          
          {/* Layout selector */}
          {template && template.layouts.length > 1 && (
            <SelectInput
              label="Layout"
              value={currentSlide.layoutId}
              options={template.layouts.map(l => ({
                value: l.id,
                label: l.name,
              }))}
              onChange={(v) => updateSlide(currentSlide.id, { layoutId: v })}
            />
          )}
        </div>
      </CollapsibleSection>
      
      {/* Guidelines */}
      {template && template.guidelines.length > 0 && (
        <CollapsibleSection title="Guidelines" icon={<Sparkles className="w-4 h-4" />} defaultOpen={false}>
          <ul className="space-y-2">
            {template.guidelines.map((guide, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                <span className="text-blue-400 mt-0.5">•</span>
                {guide}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
      
      {/* Checklist */}
      {template && template.checklist.length > 0 && (
        <CollapsibleSection title="Checklist" icon={<List className="w-4 h-4" />} defaultOpen={false}>
          <ul className="space-y-2">
            {template.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                <input type="checkbox" className="mt-0.5 rounded bg-zinc-700 border-zinc-600" />
                {item}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
      
      {/* Theme */}
      <CollapsibleSection title="Theme" icon={<Palette className="w-4 h-4" />} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateDeck({ themeId: theme.id })}
              className={`p-2 rounded-lg border transition-colors text-left ${
                deck.themeId === theme.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div
                className="w-full h-8 rounded mb-1"
                style={{ background: theme.tokens.background }}
              />
              <div className="text-xs text-zinc-300 truncate">{theme.name}</div>
            </button>
          ))}
        </div>
      </CollapsibleSection>
    </>
  );
}

// ============================================================================
// ELEMENT PROPERTIES (when element selected)
// ============================================================================

function ElementProperties() {
  const selectedElements = useSelectedElements();
  const { updateElement, deleteElements, duplicateElements, bringToFront, sendToBack } = useEditorStore();
  const [isImproving, setIsImproving] = useState(false);
  
  if (selectedElements.length === 0) {
    return <SlideProperties />;
  }
  
  if (selectedElements.length > 1) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-zinc-400">
          {selectedElements.length} elements selected
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => deleteElements(selectedElements.map(e => e.id))}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </button>
        </div>
      </div>
    );
  }
  
  const element = selectedElements[0];
  
  const handleChange = (updates: Partial<SlideElement>) => {
    updateElement(element.id, updates);
  };
  
  const handleImprove = async (action: string) => {
    // This would call the AI API
    setIsImproving(true);
    try {
      const response = await fetch("/api/pitch-deck/studio/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: (element as TextElement).content,
          action,
          slideType: "problem", // Would come from current slide
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        updateElement(element.id, { content: data.improvedText } as Partial<TextElement>);
      }
    } catch (error) {
      console.error("Failed to improve text:", error);
    } finally {
      setIsImproving(false);
    }
  };
  
  const isTextElement = element.type === "text" || element.type === "heading" || element.type === "bullet-list";
  
  return (
    <>
      {/* Element type header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white capitalize">
            {element.type.replace("-", " ")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => bringToFront([element.id])}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
              title="Bring to front"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => sendToBack([element.id])}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
              title="Send to back"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => duplicateElements()}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteElements([element.id])}
              className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Transform */}
      <CollapsibleSection title="Transform" icon={<Move className="w-4 h-4" />}>
        <TransformProperties element={element} onChange={handleChange} />
      </CollapsibleSection>
      
      {/* Text properties */}
      {isTextElement && (
        <CollapsibleSection title="Text" icon={<Type className="w-4 h-4" />}>
          <TextProperties
            element={element as TextElement | BulletListElement}
            onChange={handleChange}
          />
        </CollapsibleSection>
      )}
      
      {/* AI Actions for text */}
      {isTextElement && (
        <CollapsibleSection title="AI Improve" icon={<Wand2 className="w-4 h-4" />}>
          <AIActions
            element={element as TextElement | BulletListElement}
            onImprove={handleImprove}
            isLoading={isImproving}
          />
        </CollapsibleSection>
      )}
      
      {/* Layers */}
      <CollapsibleSection title="Layers" icon={<Layers className="w-4 h-4" />}>
        <NumberInput
          label="Z-Index"
          value={element.zIndex}
          onChange={(v) => handleChange({ zIndex: v })}
        />
        <div className="flex items-center justify-between mt-2">
          <label className="text-xs text-zinc-400">Locked</label>
          <button
            onClick={() => handleChange({ locked: !element.locked })}
            className={`px-3 py-1 text-xs rounded ${
              element.locked ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {element.locked ? "Locked" : "Unlocked"}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <label className="text-xs text-zinc-400">Visible</label>
          <button
            onClick={() => handleChange({ visible: !element.visible })}
            className={`px-3 py-1 text-xs rounded ${
              element.visible ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {element.visible ? "Visible" : "Hidden"}
          </button>
        </div>
      </CollapsibleSection>
    </>
  );
}

// ============================================================================
// MAIN PROPERTIES PANEL
// ============================================================================

export function PropertiesPanel() {
  const { deck } = useEditorStore();
  
  if (!deck) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No deck loaded
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
      <ElementProperties />
    </div>
  );
}

export default PropertiesPanel;
