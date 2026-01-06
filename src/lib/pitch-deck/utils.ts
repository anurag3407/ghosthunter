/**
 * ============================================================================
 * PITCH DECK STUDIO - UTILITY FUNCTIONS
 * ============================================================================
 */

import { v4 as uuidv4 } from "uuid";
import type {
  Deck,
  Slide,
  SlideElement,
  SlideType,
  TextElement,
  BulletListElement,
  ShapeElement,
  ImageElement,
  ChartElement,
  TableElement,
  MetricElement,
  TextStyle,
  ShapeStyle,
  DeckStyle,
  ContentTone,
} from "@/types/pitch-deck";
import { getDefaultLayout, SLIDE_WIDTH, SLIDE_HEIGHT } from "./templates";
import { getDefaultTheme } from "./themes";

// ============================================================================
// ELEMENT CREATION
// ============================================================================

function createDefaultTextStyle(): TextStyle {
  return {
    fontSize: 24,
    fontWeight: 400,
    fontStyle: "normal",
    textDecoration: "none",
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: "left",
    verticalAlign: "top",
    color: "var(--deck-text-primary)",
  };
}

function createDefaultShapeStyle(): ShapeStyle {
  return {
    fill: "var(--deck-primary)",
    fillOpacity: 1,
    stroke: "transparent",
    strokeWidth: 0,
    strokeOpacity: 1,
    cornerRadius: 8,
  };
}

export function createTextElement(
  content: string = "",
  overrides: Partial<TextElement> = {}
): TextElement {
  return {
    id: uuidv4(),
    type: "text",
    x: 60,
    y: 100,
    width: 400,
    height: 100,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    content,
    style: createDefaultTextStyle(),
    ...overrides,
  };
}

export function createHeadingElement(
  content: string = "",
  overrides: Partial<TextElement> = {}
): TextElement {
  return {
    id: uuidv4(),
    type: "heading",
    x: 60,
    y: 60,
    width: SLIDE_WIDTH - 120,
    height: 80,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    content,
    style: {
      ...createDefaultTextStyle(),
      fontSize: 48,
      fontWeight: 700,
    },
    ...overrides,
  };
}

export function createBulletListElement(
  items: string[] = [],
  overrides: Partial<BulletListElement> = {}
): BulletListElement {
  return {
    id: uuidv4(),
    type: "bullet-list",
    x: 60,
    y: 200,
    width: 600,
    height: 400,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    items,
    bulletStyle: "disc",
    style: createDefaultTextStyle(),
    itemSpacing: 16,
    ...overrides,
  };
}

export function createShapeElement(
  variant: ShapeElement["variant"] = "rectangle",
  overrides: Partial<ShapeElement> = {}
): ShapeElement {
  return {
    id: uuidv4(),
    type: "shape",
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    variant,
    style: createDefaultShapeStyle(),
    ...overrides,
  };
}

export function createImageElement(
  src: string = "",
  overrides: Partial<ImageElement> = {}
): ImageElement {
  return {
    id: uuidv4(),
    type: "image",
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    src,
    alt: "",
    objectFit: "contain",
    borderRadius: 8,
    ...overrides,
  };
}

export function createChartElement(
  overrides: Partial<ChartElement> = {}
): ChartElement {
  return {
    id: uuidv4(),
    type: "chart",
    x: 60,
    y: 200,
    width: 600,
    height: 400,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    chartType: "bar",
    series: [
      {
        name: "Series 1",
        data: [
          { label: "Jan", value: 100 },
          { label: "Feb", value: 150 },
          { label: "Mar", value: 200 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    showLabels: true,
    ...overrides,
  };
}

export function createTableElement(
  rows: number = 3,
  cols: number = 3,
  overrides: Partial<TableElement> = {}
): TableElement {
  const tableRows = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      content: i === 0 ? `Header ${j + 1}` : `Cell ${i + 1}-${j + 1}`,
    }))
  );

  return {
    id: uuidv4(),
    type: "table",
    x: 60,
    y: 200,
    width: 600,
    height: 300,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    rows: tableRows,
    headerRow: true,
    headerColumn: false,
    borderStyle: "solid",
    borderColor: "var(--deck-border)",
    cellPadding: 12,
    style: createDefaultTextStyle(),
    ...overrides,
  };
}

export function createMetricElement(
  value: string = "0",
  label: string = "Metric",
  overrides: Partial<MetricElement> = {}
): MetricElement {
  return {
    id: uuidv4(),
    type: "metric",
    x: 100,
    y: 200,
    width: 280,
    height: 140,
    rotation: 0,
    zIndex: 0,
    opacity: 1,
    locked: false,
    visible: true,
    value,
    label,
    valueStyle: {
      ...createDefaultTextStyle(),
      fontSize: 56,
      fontWeight: 700,
      textAlign: "center",
    },
    labelStyle: {
      ...createDefaultTextStyle(),
      fontSize: 18,
      textAlign: "center",
      color: "var(--deck-text-secondary)",
    },
    ...overrides,
  };
}

// ============================================================================
// SLIDE CREATION
// ============================================================================

export function createSlide(
  type: SlideType,
  order: number,
  overrides: Partial<Slide> = {}
): Slide {
  const layout = getDefaultLayout(type);
  
  return {
    id: uuidv4(),
    type,
    layoutId: layout?.id || `${type}-default`,
    elements: [],
    order,
    hidden: false,
    ...overrides,
  };
}

export function createDefaultSlideWithContent(
  type: SlideType,
  order: number
): Slide {
  const slide = createSlide(type, order);
  
  // Add default elements based on type
  const elements: SlideElement[] = [];
  
  switch (type) {
    case "title":
      elements.push(
        createHeadingElement("Your Company Name", {
          x: SLIDE_WIDTH / 2 - 300,
          y: 280,
          width: 600,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 64,
            fontWeight: 800,
            textAlign: "center",
          },
        })
      );
      elements.push(
        createTextElement("A compelling tagline that captures your vision", {
          x: SLIDE_WIDTH / 2 - 300,
          y: 380,
          width: 600,
          height: 60,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            textAlign: "center",
            color: "var(--deck-text-secondary)",
          },
        })
      );
      break;
      
    case "problem":
      elements.push(createHeadingElement("The Problem"));
      elements.push(
        createTextElement("What challenge are you solving?", {
          y: 160,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            color: "var(--deck-text-secondary)",
          },
        })
      );
      elements.push(
        createBulletListElement([
          "Pain point 1 - Describe the challenge",
          "Pain point 2 - Quantify the impact",
          "Pain point 3 - Who experiences this",
        ])
      );
      break;
      
    case "solution":
      elements.push(createHeadingElement("Our Solution"));
      elements.push(
        createTextElement("How we solve this problem", {
          y: 160,
          style: {
            ...createDefaultTextStyle(),
            fontSize: 24,
            color: "var(--deck-text-secondary)",
          },
        })
      );
      elements.push(
        createBulletListElement([
          "Key benefit 1",
          "Key benefit 2", 
          "Key benefit 3",
        ])
      );
      break;
      
    case "market":
      elements.push(createHeadingElement("Market Opportunity"));
      elements.push(
        createMetricElement("$XXB", "TAM", { x: 60, y: 180 })
      );
      elements.push(
        createMetricElement("$XXB", "SAM", { x: 400, y: 180 })
      );
      elements.push(
        createMetricElement("$XXM", "SOM", { x: 740, y: 180 })
      );
      break;
      
    case "traction":
      elements.push(createHeadingElement("Traction"));
      elements.push(
        createMetricElement("$XXK", "MRR", { x: 60, y: 180, width: 200 })
      );
      elements.push(
        createMetricElement("XX%", "Growth", { x: 320, y: 180, width: 200 })
      );
      elements.push(
        createMetricElement("XXK", "Users", { x: 580, y: 180, width: 200 })
      );
      elements.push(
        createBulletListElement([
          "Milestone 1",
          "Milestone 2",
          "Milestone 3",
        ], { y: 380 })
      );
      break;
      
    case "team":
      elements.push(createHeadingElement("The Team"));
      elements.push(
        createTextElement("Add team member info", {
          y: 200,
          width: SLIDE_WIDTH - 120,
          height: 400,
        })
      );
      break;
      
    case "ask":
      elements.push(createHeadingElement("The Ask"));
      elements.push(
        createMetricElement("$XM", "Raising", {
          x: SLIDE_WIDTH / 2 - 150,
          y: 180,
          width: 300,
        })
      );
      elements.push(
        createBulletListElement([
          "40% Product & Engineering",
          "30% Sales & Marketing",
          "20% Operations",
          "10% Reserve",
        ], { x: SLIDE_WIDTH / 2 - 200, y: 360, width: 400 })
      );
      break;
      
    default:
      elements.push(createHeadingElement(`${type.charAt(0).toUpperCase() + type.slice(1)} Slide`));
      elements.push(
        createTextElement("Add your content here", {
          y: 200,
          width: SLIDE_WIDTH - 120,
          height: 400,
        })
      );
  }
  
  // Assign z-indices
  elements.forEach((el, i) => {
    el.zIndex = i;
  });
  
  slide.elements = elements;
  return slide;
}

// ============================================================================
// DECK CREATION
// ============================================================================

export function createEmptyDeck(userId: string): Deck {
  const defaultTheme = getDefaultTheme();
  
  return {
    id: uuidv4(),
    userId,
    projectName: "Untitled Deck",
    tagline: "",
    slides: [],
    themeId: defaultTheme.id,
    style: "seed" as DeckStyle,
    defaultTone: "investor" as ContentTone,
    status: "draft",
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultDeck(userId: string, projectName: string = "My Startup"): Deck {
  const deck = createEmptyDeck(userId);
  deck.projectName = projectName;
  
  // Create default slides
  const slideTypes: SlideType[] = [
    "title",
    "problem", 
    "solution",
    "market",
    "traction",
    "team",
    "ask",
  ];
  
  deck.slides = slideTypes.map((type, index) => 
    createDefaultSlideWithContent(type, index)
  );
  
  return deck;
}

// ============================================================================
// ELEMENT MANIPULATION
// ============================================================================

export function duplicateElement(element: SlideElement): SlideElement {
  return {
    ...JSON.parse(JSON.stringify(element)),
    id: uuidv4(),
    x: element.x + 20,
    y: element.y + 20,
  };
}

export function duplicateSlide(slide: Slide, newOrder: number): Slide {
  const newSlide: Slide = {
    ...JSON.parse(JSON.stringify(slide)),
    id: uuidv4(),
    order: newOrder,
    elements: slide.elements.map(el => ({
      ...JSON.parse(JSON.stringify(el)),
      id: uuidv4(),
    })),
  };
  
  return newSlide;
}

// ============================================================================
// ALIGNMENT HELPERS
// ============================================================================

export function alignElements(
  elements: SlideElement[],
  alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
): SlideElement[] {
  if (elements.length === 0) return elements;
  
  const bounds = getElementsBounds(elements);
  
  return elements.map(el => {
    const newEl = { ...el };
    
    switch (alignment) {
      case "left":
        newEl.x = bounds.minX;
        break;
      case "center":
        newEl.x = bounds.minX + (bounds.width - el.width) / 2;
        break;
      case "right":
        newEl.x = bounds.maxX - el.width;
        break;
      case "top":
        newEl.y = bounds.minY;
        break;
      case "middle":
        newEl.y = bounds.minY + (bounds.height - el.height) / 2;
        break;
      case "bottom":
        newEl.y = bounds.maxY - el.height;
        break;
    }
    
    return newEl;
  });
}

export function distributeElements(
  elements: SlideElement[],
  direction: "horizontal" | "vertical"
): SlideElement[] {
  if (elements.length < 3) return elements;
  
  const sorted = [...elements].sort((a, b) => 
    direction === "horizontal" ? a.x - b.x : a.y - b.y
  );
  
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  const totalSize = direction === "horizontal"
    ? (last.x + last.width) - first.x
    : (last.y + last.height) - first.y;
    
  const elementsSize = sorted.reduce(
    (sum, el) => sum + (direction === "horizontal" ? el.width : el.height),
    0
  );
  
  const gap = (totalSize - elementsSize) / (sorted.length - 1);
  
  let currentPos = direction === "horizontal" ? first.x : first.y;
  
  return sorted.map((el, i) => {
    const newEl = { ...el };
    
    if (direction === "horizontal") {
      newEl.x = currentPos;
      currentPos += el.width + gap;
    } else {
      newEl.y = currentPos;
      currentPos += el.height + gap;
    }
    
    return newEl;
  });
}

function getElementsBounds(elements: SlideElement[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  
  const minX = Math.min(...elements.map(el => el.x));
  const minY = Math.min(...elements.map(el => el.y));
  const maxX = Math.max(...elements.map(el => el.x + el.width));
  const maxY = Math.max(...elements.map(el => el.y + el.height));
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// ============================================================================
// SNAPPING
// ============================================================================

export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getSnapGuides(
  movingElement: SlideElement,
  otherElements: SlideElement[],
  threshold: number = 10
): { x: number | null; y: number | null } {
  const guides = { x: null as number | null, y: null as number | null };
  
  const movingCenterX = movingElement.x + movingElement.width / 2;
  const movingCenterY = movingElement.y + movingElement.height / 2;
  
  // Slide center
  const slideCenterX = SLIDE_WIDTH / 2;
  const slideCenterY = SLIDE_HEIGHT / 2;
  
  if (Math.abs(movingCenterX - slideCenterX) < threshold) {
    guides.x = slideCenterX;
  }
  if (Math.abs(movingCenterY - slideCenterY) < threshold) {
    guides.y = slideCenterY;
  }
  
  // Other elements
  for (const el of otherElements) {
    if (el.id === movingElement.id) continue;
    
    const elCenterX = el.x + el.width / 2;
    const elCenterY = el.y + el.height / 2;
    
    // Center alignment
    if (Math.abs(movingCenterX - elCenterX) < threshold) {
      guides.x = elCenterX;
    }
    if (Math.abs(movingCenterY - elCenterY) < threshold) {
      guides.y = elCenterY;
    }
    
    // Edge alignment
    if (Math.abs(movingElement.x - el.x) < threshold) {
      guides.x = el.x;
    }
    if (Math.abs(movingElement.x + movingElement.width - el.x - el.width) < threshold) {
      guides.x = el.x + el.width;
    }
    if (Math.abs(movingElement.y - el.y) < threshold) {
      guides.y = el.y;
    }
    if (Math.abs(movingElement.y + movingElement.height - el.y - el.height) < threshold) {
      guides.y = el.y + el.height;
    }
  }
  
  return guides;
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export function getSlideAspectRatio(): number {
  return SLIDE_WIDTH / SLIDE_HEIGHT;
}

export function scaleDimensions(
  targetWidth: number
): { width: number; height: number } {
  const ratio = getSlideAspectRatio();
  return {
    width: targetWidth,
    height: targetWidth / ratio,
  };
}
