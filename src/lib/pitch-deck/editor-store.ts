/**
 * ============================================================================
 * PITCH DECK STUDIO - EDITOR STORE
 * ============================================================================
 * Zustand store for managing editor state with undo/redo support.
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  Deck,
  Slide,
  SlideElement,
  SlideType,
  EditorTool,
  HistoryEntry,
  SlideWarning,
  DeckHealthCheck,
} from "@/types/pitch-deck";
import {
  createSlide,
  createDefaultSlideWithContent,
  duplicateSlide,
  duplicateElement,
} from "@/lib/pitch-deck/utils";

// ============================================================================
// TYPES
// ============================================================================

interface EditorState {
  // Core data
  deck: Deck | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved: string | null;
  
  // Selection
  selectedSlideId: string | null;
  selectedElementIds: string[];
  
  // Aliases for compatibility
  currentSlideId: string | null;
  
  // Viewport
  zoom: number;
  panX: number;
  panY: number;
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  
  // Tools & UI
  activeTool: EditorTool;
  currentTool: EditorTool;
  showGrid: boolean;
  snapToGrid: boolean;
  showGuides: boolean;
  isPreviewMode: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  
  // History
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Health check
  healthScore: number | null;
  healthCheck: DeckHealthCheck | null;
  warnings: SlideWarning[];
  suggestions: string[];
}

interface EditorActions {
  // Deck operations
  setDeck: (deck: Deck) => void;
  updateDeck: (updates: Partial<Deck>) => void;
  clearDeck: () => void;
  markClean: () => void;
  
  // Slide operations
  selectSlide: (slideId: string) => void;
  addSlide: (type: SlideType, afterSlideId?: string) => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  
  // Element operations
  selectElement: (elementId: string, addToSelection?: boolean) => void;
  selectElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  addElement: (element: SlideElement) => void;
  updateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  updateElements: (updates: Array<{ id: string; changes: Partial<SlideElement> }>) => void;
  deleteElements: (elementIds: string[]) => void;
  duplicateElements: () => void;
  bringToFront: (elementIds: string[]) => void;
  sendToBack: (elementIds: string[]) => void;
  
  // Viewport
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setViewport: (updates: Partial<{ zoom: number; panX: number; panY: number; showGrid: boolean; snapToGrid: boolean }>) => void;
  resetViewport: () => void;
  
  // Tools & UI
  setActiveTool: (tool: EditorTool) => void;
  setTool: (tool: EditorTool) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleGuides: () => void;
  togglePreviewMode: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushHistory: (action: string) => void;
  
  // Health check
  setHealthCheck: (healthCheck: DeckHealthCheck | null) => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
}

type EditorStore = EditorState & EditorActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: EditorState = {
  deck: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  lastSaved: null,
  
  selectedSlideId: null,
  selectedElementIds: [],
  currentSlideId: null,
  
  zoom: 1,
  panX: 0,
  panY: 0,
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: false,
    snapToGrid: true,
  },
  
  activeTool: "select",
  currentTool: "select",
  showGrid: false,
  snapToGrid: true,
  showGuides: true,
  isPreviewMode: false,
  showLeftPanel: true,
  showRightPanel: true,
  
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  healthScore: null,
  healthCheck: null,
  warnings: [],
  suggestions: [],
};

// ============================================================================
// STORE
// ============================================================================

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,
  
  // ============================================================================
  // DECK OPERATIONS
  // ============================================================================
  
  setDeck: (deck) => {
    const firstSlideId = deck.slides[0]?.id || null;
    set({
      deck,
      selectedSlideId: firstSlideId,
      currentSlideId: firstSlideId,
      selectedElementIds: [],
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },
  
  updateDeck: (updates) => {
    const { deck } = get();
    if (!deck) return;
    
    set({
      deck: { ...deck, ...updates, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
    get().pushHistory("Update deck");
  },
  
  clearDeck: () => {
    set(initialState);
  },
  
  markClean: () => {
    set({ isDirty: false, lastSaved: new Date().toISOString() });
  },
  
  // ============================================================================
  // SLIDE OPERATIONS
  // ============================================================================
  
  selectSlide: (slideId) => {
    set({
      selectedSlideId: slideId,
      currentSlideId: slideId,
      selectedElementIds: [],
    });
  },
  
  addSlide: (type, afterSlideId) => {
    const { deck } = get();
    if (!deck) return;
    
    const slides = [...deck.slides];
    const insertIndex = afterSlideId
      ? slides.findIndex(s => s.id === afterSlideId) + 1
      : slides.length;
    
    const newSlide = createDefaultSlideWithContent(type, insertIndex);
    
    slides.splice(insertIndex, 0, newSlide);
    
    // Update order for all slides
    slides.forEach((slide, index) => {
      slide.order = index;
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      selectedSlideId: newSlide.id,
      currentSlideId: newSlide.id,
      selectedElementIds: [],
      isDirty: true,
    });
    get().pushHistory(`Add ${type} slide`);
  },
  
  deleteSlide: (slideId) => {
    const { deck, selectedSlideId } = get();
    if (!deck || deck.slides.length <= 1) return;
    
    const slideIndex = deck.slides.findIndex(s => s.id === slideId);
    const slides = deck.slides.filter(s => s.id !== slideId);
    
    // Update order
    slides.forEach((slide, index) => {
      slide.order = index;
    });
    
    // Select adjacent slide if deleted slide was selected
    let newSelectedId = selectedSlideId;
    if (selectedSlideId === slideId) {
      newSelectedId = slides[Math.min(slideIndex, slides.length - 1)]?.id || null;
    }
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      selectedSlideId: newSelectedId,
      selectedElementIds: [],
      isDirty: true,
    });
    get().pushHistory("Delete slide");
  },
  
  duplicateSlide: (slideId) => {
    const { deck } = get();
    if (!deck) return;
    
    const slideIndex = deck.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    
    const originalSlide = deck.slides[slideIndex];
    const newSlide = duplicateSlide(originalSlide, slideIndex + 1);
    
    const slides = [...deck.slides];
    slides.splice(slideIndex + 1, 0, newSlide);
    
    // Update order
    slides.forEach((slide, index) => {
      slide.order = index;
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      selectedSlideId: newSlide.id,
      selectedElementIds: [],
      isDirty: true,
    });
    get().pushHistory("Duplicate slide");
  },
  
  reorderSlides: (fromIndex, toIndex) => {
    const { deck } = get();
    if (!deck) return;
    
    const slides = [...deck.slides];
    const [removed] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, removed);
    
    // Update order
    slides.forEach((slide, index) => {
      slide.order = index;
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
    get().pushHistory("Reorder slides");
  },
  
  updateSlide: (slideId, updates) => {
    const { deck } = get();
    if (!deck) return;
    
    const slides = deck.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },
  
  // ============================================================================
  // ELEMENT OPERATIONS
  // ============================================================================
  
  selectElement: (elementId, addToSelection = false) => {
    const { selectedElementIds } = get();
    
    if (addToSelection) {
      if (selectedElementIds.includes(elementId)) {
        set({ selectedElementIds: selectedElementIds.filter(id => id !== elementId) });
      } else {
        set({ selectedElementIds: [...selectedElementIds, elementId] });
      }
    } else {
      set({ selectedElementIds: [elementId] });
    }
  },
  
  selectElements: (elementIds) => {
    set({ selectedElementIds: elementIds });
  },
  
  clearSelection: () => {
    set({ selectedElementIds: [] });
  },
  
  addElement: (element) => {
    const { deck, selectedSlideId } = get();
    if (!deck || !selectedSlideId) return;
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      const maxZIndex = Math.max(...slide.elements.map(e => e.zIndex), -1);
      const newElement = { ...element, zIndex: maxZIndex + 1 };
      
      return {
        ...slide,
        elements: [...slide.elements, newElement],
      };
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      selectedElementIds: [element.id],
      isDirty: true,
    });
    get().pushHistory(`Add ${element.type}`);
  },
  
  updateElement: (elementId, updates) => {
    const { deck, selectedSlideId } = get();
    if (!deck || !selectedSlideId) return;
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      return {
        ...slide,
        elements: slide.elements.map(el =>
          el.id === elementId ? { ...el, ...updates } as SlideElement : el
        ),
      };
    }) as Slide[];
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },
  
  updateElements: (updates) => {
    const { deck, selectedSlideId } = get();
    if (!deck || !selectedSlideId) return;
    
    const updateMap = new Map(updates.map(u => [u.id, u.changes]));
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      return {
        ...slide,
        elements: slide.elements.map(el => {
          const changes = updateMap.get(el.id);
          return changes ? { ...el, ...changes } as SlideElement : el;
        }),
      };
    }) as Slide[];
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },
  
  deleteElements: (elementIds) => {
    const { deck, selectedSlideId, selectedElementIds } = get();
    if (!deck || !selectedSlideId) return;
    
    const idsToDelete = new Set(elementIds);
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      return {
        ...slide,
        elements: slide.elements.filter(el => !idsToDelete.has(el.id)),
      };
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      selectedElementIds: selectedElementIds.filter(id => !idsToDelete.has(id)),
      isDirty: true,
    });
    get().pushHistory("Delete elements");
  },
  
  duplicateElements: () => {
    const { deck, selectedSlideId, selectedElementIds } = get();
    if (!deck || !selectedSlideId || selectedElementIds.length === 0) return;
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      const selectedElements = slide.elements.filter(el =>
        selectedElementIds.includes(el.id)
      );
      
      const duplicates = selectedElements.map(el => duplicateElement(el));
      
      return {
        ...slide,
        elements: [...slide.elements, ...duplicates],
      };
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
    get().pushHistory("Duplicate elements");
  },
  
  bringToFront: (elementIds) => {
    const { deck, selectedSlideId } = get();
    if (!deck || !selectedSlideId) return;
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      const maxZIndex = Math.max(...slide.elements.map(e => e.zIndex));
      const idsSet = new Set(elementIds);
      
      return {
        ...slide,
        elements: slide.elements.map((el, i) =>
          idsSet.has(el.id)
            ? { ...el, zIndex: maxZIndex + 1 + elementIds.indexOf(el.id) }
            : el
        ),
      };
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },
  
  sendToBack: (elementIds) => {
    const { deck, selectedSlideId } = get();
    if (!deck || !selectedSlideId) return;
    
    const slides = deck.slides.map(slide => {
      if (slide.id !== selectedSlideId) return slide;
      
      const minZIndex = Math.min(...slide.elements.map(e => e.zIndex));
      const idsSet = new Set(elementIds);
      
      return {
        ...slide,
        elements: slide.elements.map(el =>
          idsSet.has(el.id)
            ? { ...el, zIndex: minZIndex - 1 - elementIds.indexOf(el.id) }
            : el
        ),
      };
    });
    
    set({
      deck: { ...deck, slides, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },
  
  // ============================================================================
  // VIEWPORT
  // ============================================================================
  
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.25, Math.min(2, zoom)) });
  },
  
  setPan: (x, y) => {
    set({ panX: x, panY: y });
  },
  
  setViewport: (updates) => {
    set(state => ({
      zoom: updates.zoom ?? state.zoom,
      panX: updates.panX ?? state.panX,
      panY: updates.panY ?? state.panY,
      showGrid: updates.showGrid ?? state.showGrid,
      snapToGrid: updates.snapToGrid ?? state.snapToGrid,
      viewport: {
        zoom: updates.zoom ?? state.viewport.zoom,
        panX: updates.panX ?? state.viewport.panX,
        panY: updates.panY ?? state.viewport.panY,
        showGrid: updates.showGrid ?? state.viewport.showGrid,
        snapToGrid: updates.snapToGrid ?? state.viewport.snapToGrid,
      },
    }));
  },
  
  resetViewport: () => {
    set({ 
      zoom: 1, 
      panX: 0, 
      panY: 0,
      viewport: { zoom: 1, panX: 0, panY: 0, showGrid: false, snapToGrid: true },
    });
  },
  
  // ============================================================================
  // TOOLS & UI
  // ============================================================================
  
  setActiveTool: (tool) => {
    set({ activeTool: tool, currentTool: tool });
  },
  
  setTool: (tool) => {
    set({ activeTool: tool, currentTool: tool });
  },
  
  toggleGrid: () => {
    set(state => ({ showGrid: !state.showGrid }));
  },
  
  toggleSnapToGrid: () => {
    set(state => ({ snapToGrid: !state.snapToGrid }));
  },
  
  toggleGuides: () => {
    set(state => ({ showGuides: !state.showGuides }));
  },
  
  togglePreviewMode: () => {
    set(state => ({ isPreviewMode: !state.isPreviewMode }));
  },
  
  toggleLeftPanel: () => {
    set(state => ({ showLeftPanel: !state.showLeftPanel }));
  },
  
  toggleRightPanel: () => {
    set(state => ({ showRightPanel: !state.showRightPanel }));
  },
  
  // ============================================================================
  // HISTORY
  // ============================================================================
  
  undo: () => {
    const { history, historyIndex, deck } = get();
    if (historyIndex <= 0 || !deck) return;
    
    const previousState = history[historyIndex - 1];
    
    set({
      deck: previousState.deck,
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    const nextState = history[historyIndex + 1];
    
    set({
      deck: nextState.deck,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },
  
  pushHistory: (action) => {
    const { deck, history, historyIndex, maxHistorySize } = get();
    if (!deck) return;
    
    // Remove any history after current index (discard redo stack)
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add new entry
    newHistory.push({
      id: uuidv4(),
      timestamp: Date.now(),
      action,
      deck: JSON.parse(JSON.stringify(deck)),
    });
    
    // Trim to max size
    while (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  
  setHealthCheck: (healthCheck) => {
    set({
      healthCheck,
      healthScore: healthCheck?.overallScore ?? null,
      warnings: [],
      suggestions: healthCheck?.suggestions ?? [],
    });
  },
  
  // ============================================================================
  // LOADING STATES
  // ============================================================================
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setSaving: (saving) => {
    set({ isSaving: saving });
  },
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const useCurrentSlide = () => {
  const deck = useEditorStore(state => state.deck);
  const selectedSlideId = useEditorStore(state => state.selectedSlideId);
  
  if (!deck || !selectedSlideId) return null;
  return deck.slides.find(s => s.id === selectedSlideId) || null;
};

export const useSelectedElements = () => {
  const deck = useEditorStore(state => state.deck);
  const selectedSlideId = useEditorStore(state => state.selectedSlideId);
  const selectedElementIds = useEditorStore(state => state.selectedElementIds);
  
  if (!deck || !selectedSlideId) return [];
  
  const slide = deck.slides.find(s => s.id === selectedSlideId);
  if (!slide) return [];
  
  return slide.elements.filter(el => selectedElementIds.includes(el.id));
};

export const useCanUndo = () => {
  const historyIndex = useEditorStore(state => state.historyIndex);
  return historyIndex > 0;
};

export const useCanRedo = () => {
  const history = useEditorStore(state => state.history);
  const historyIndex = useEditorStore(state => state.historyIndex);
  return historyIndex < history.length - 1;
};
