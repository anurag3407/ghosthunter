/**
 * ============================================================================
 * PITCH DECK STUDIO - SLIDE CANVAS
 * ============================================================================
 * Canvas-based slide editor using react-konva for PowerPoint-like editing.
 */

"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Line, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";

import { useEditorStore, useCurrentSlide, useSelectedElements } from "@/lib/pitch-deck/editor-store";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/lib/pitch-deck/templates";
import { getTheme, getSlideBackgroundStyle } from "@/lib/pitch-deck/themes";
import { snapToGrid, getSnapGuides } from "@/lib/pitch-deck/utils";
import type { SlideElement, TextElement, BulletListElement, MetricElement, ShapeElement } from "@/types/pitch-deck";

// ============================================================================
// CONSTANTS
// ============================================================================

const GRID_SIZE = 20;
const GUIDE_COLOR = "#3b82f6";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface TextNodeProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SlideElement>) => void;
}

function TextNode({ element, isSelected, onSelect, onChange }: TextNodeProps) {
  const shapeRef = useRef<Konva.Text>(null);
  
  return (
    <Text
      ref={shapeRef}
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      text={element.content || element.placeholder || ""}
      fontSize={element.style.fontSize}
      fontFamily={element.style.fontFamily || "Inter"}
      fontStyle={element.style.fontStyle === "italic" ? "italic" : "normal"}
      fontVariant={element.style.fontWeight >= 600 ? "bold" : "normal"}
      fill={element.content ? element.style.color : "#94a3b8"}
      opacity={element.opacity}
      align={element.style.textAlign}
      verticalAlign={element.style.verticalAlign}
      lineHeight={element.style.lineHeight}
      draggable={!element.locked}
      visible={element.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        if (!node) return;
        
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        node.scaleX(1);
        node.scaleY(1);
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(50, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

interface BulletListNodeProps {
  element: BulletListElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SlideElement>) => void;
}

function BulletListNode({ element, isSelected, onSelect, onChange }: BulletListNodeProps) {
  const bulletChar = element.bulletStyle === "disc" ? "•" :
                     element.bulletStyle === "circle" ? "○" :
                     element.bulletStyle === "square" ? "■" :
                     element.bulletStyle === "dash" ? "—" :
                     element.bulletStyle === "arrow" ? "→" : "•";
  
  const text = element.items.map((item, i) => 
    element.bulletStyle === "number" ? `${i + 1}. ${item}` :
    element.bulletStyle === "letter" ? `${String.fromCharCode(97 + i)}. ${item}` :
    `${bulletChar} ${item}`
  ).join("\n");
  
  return (
    <Text
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      text={text || "• Item 1\n• Item 2\n• Item 3"}
      fontSize={element.style.fontSize}
      fontFamily={element.style.fontFamily || "Inter"}
      fill={element.items.length ? element.style.color : "#94a3b8"}
      opacity={element.opacity}
      align={element.style.textAlign}
      lineHeight={(element.style.lineHeight || 1.5) + (element.itemSpacing / element.style.fontSize)}
      draggable={!element.locked}
      visible={element.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}

interface MetricNodeProps {
  element: MetricElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SlideElement>) => void;
}

function MetricNode({ element, isSelected, onSelect, onChange }: MetricNodeProps) {
  const valueText = `${element.prefix || ""}${element.value}${element.suffix || ""}`;
  
  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable={!element.locked}
      visible={element.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {/* Background */}
      <Rect
        width={element.width}
        height={element.height}
        fill="transparent"
        cornerRadius={8}
      />
      
      {/* Value */}
      <Text
        y={20}
        width={element.width}
        height={element.height * 0.6}
        text={valueText || "0"}
        fontSize={element.valueStyle.fontSize}
        fontFamily={element.valueStyle.fontFamily || "Inter"}
        fontVariant="bold"
        fill={element.valueStyle.color}
        align="center"
        verticalAlign="middle"
      />
      
      {/* Label */}
      <Text
        y={element.height * 0.65}
        width={element.width}
        height={element.height * 0.35}
        text={element.label || "Label"}
        fontSize={element.labelStyle.fontSize}
        fontFamily={element.labelStyle.fontFamily || "Inter"}
        fill={element.labelStyle.color}
        align="center"
        verticalAlign="top"
      />
    </Group>
  );
}

interface ShapeNodeProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SlideElement>) => void;
}

function ShapeNode({ element, isSelected, onSelect, onChange }: ShapeNodeProps) {
  const shapeRef = useRef<Konva.Rect | Konva.Circle | Konva.Line>(null);
  
  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    fill: element.style.fill,
    opacity: element.opacity * element.style.fillOpacity,
    stroke: element.style.stroke,
    strokeWidth: element.style.strokeWidth,
    draggable: !element.locked,
    visible: element.visible,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: KonvaEventObject<DragEvent>) => {
      onChange({
        x: e.target.x(),
        y: e.target.y(),
      });
    },
  };
  
  switch (element.variant) {
    case "circle":
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
          cornerRadius={Math.min(element.width, element.height) / 2}
        />
      );
    case "rounded-rect":
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
          cornerRadius={element.style.cornerRadius || 16}
        />
      );
    case "line":
      return (
        <Line
          {...commonProps}
          points={[0, 0, element.width, 0]}
          dash={element.style.strokeDash}
        />
      );
    case "arrow":
      return (
        <Line
          {...commonProps}
          points={[0, element.height / 2, element.width, element.height / 2]}
          dash={element.style.strokeDash}
        />
      );
    default:
      return (
        <Rect
          {...commonProps}
          width={element.width}
          height={element.height}
          cornerRadius={element.style.cornerRadius || 0}
        />
      );
  }
}

// ============================================================================
// GRID OVERLAY
// ============================================================================

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number;
}

function GridOverlay({ width, height, gridSize }: GridOverlayProps) {
  const lines: React.ReactNode[] = [];
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="#334155"
        strokeWidth={0.5}
        opacity={0.3}
      />
    );
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="#334155"
        strokeWidth={0.5}
        opacity={0.3}
      />
    );
  }
  
  return <>{lines}</>;
}

// ============================================================================
// SNAP GUIDES
// ============================================================================

interface SnapGuidesProps {
  guides: { x: number | null; y: number | null };
  slideWidth: number;
  slideHeight: number;
}

function SnapGuidesOverlay({ guides, slideWidth, slideHeight }: SnapGuidesProps) {
  return (
    <>
      {guides.x !== null && (
        <Line
          points={[guides.x, 0, guides.x, slideHeight]}
          stroke={GUIDE_COLOR}
          strokeWidth={1}
          dash={[4, 4]}
        />
      )}
      {guides.y !== null && (
        <Line
          points={[0, guides.y, slideWidth, guides.y]}
          stroke={GUIDE_COLOR}
          strokeWidth={1}
          dash={[4, 4]}
        />
      )}
    </>
  );
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export interface SlideCanvasProps {
  containerWidth?: number;
  containerHeight?: number;
}

export function SlideCanvas({ containerWidth: propWidth, containerHeight: propHeight }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  // Auto-measure container if dimensions not provided
  const [containerSize, setContainerSize] = useState({ width: propWidth || 800, height: propHeight || 600 });
  
  useEffect(() => {
    if (propWidth && propHeight) {
      setContainerSize({ width: propWidth, height: propHeight });
      return;
    }
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || 800,
          height: containerRef.current.offsetHeight || 600,
        });
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [propWidth, propHeight]);
  
  const containerWidth = containerSize.width;
  const containerHeight = containerSize.height;
  
  const currentSlide = useCurrentSlide();
  const selectedElements = useSelectedElements();
  
  const {
    deck,
    zoom,
    panX,
    panY,
    showGrid,
    snapToGrid: shouldSnap,
    showGuides,
    activeTool,
    selectedElementIds,
    selectElement,
    clearSelection,
    updateElement,
  } = useEditorStore();
  
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  
  // Get theme
  const theme = deck ? getTheme(deck.themeId) : null;
  const bgColor = theme?.tokens.background || "#0f172a";
  
  // Calculate scale to fit slide in container
  const padding = 40;
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  
  const scaleX = availableWidth / SLIDE_WIDTH;
  const scaleY = availableHeight / SLIDE_HEIGHT;
  const baseScale = Math.min(scaleX, scaleY, 1);
  const scale = baseScale * zoom;
  
  const stageWidth = SLIDE_WIDTH * scale;
  const stageHeight = SLIDE_HEIGHT * scale;
  
  const offsetX = (containerWidth - stageWidth) / 2 + panX;
  const offsetY = (containerHeight - stageHeight) / 2 + panY;
  
  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    
    if (!transformer || !stage) return;
    
    const nodes = selectedElementIds
      .map(id => stage.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];
    
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedElementIds]);
  
  // Handle stage click (deselect)
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);
  
  // Handle element drag for snapping
  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (!showGuides || !currentSlide) return;
    
    const movingElement = currentSlide.elements.find(el => el.id === e.target.id());
    if (!movingElement) return;
    
    const updatedElement = {
      ...movingElement,
      x: e.target.x(),
      y: e.target.y(),
    };
    
    const snapGuides = getSnapGuides(updatedElement, currentSlide.elements);
    setGuides(snapGuides);
    
    // Apply snapping
    if (shouldSnap) {
      if (snapGuides.x !== null) {
        e.target.x(snapGuides.x - movingElement.width / 2 + e.target.width() / 2);
      }
      if (snapGuides.y !== null) {
        e.target.y(snapGuides.y - movingElement.height / 2 + e.target.height() / 2);
      }
    }
  }, [showGuides, shouldSnap, currentSlide]);
  
  const handleDragEnd = useCallback(() => {
    setGuides({ x: null, y: null });
  }, []);
  
  // Handle element change
  const handleElementChange = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    if (shouldSnap) {
      if (updates.x !== undefined) {
        updates.x = snapToGrid(updates.x, GRID_SIZE);
      }
      if (updates.y !== undefined) {
        updates.y = snapToGrid(updates.y, GRID_SIZE);
      }
    }
    updateElement(elementId, updates);
  }, [shouldSnap, updateElement]);
  
  // Render element based on type
  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const commonProps = {
      // key property removed from here to avoid spreading it
      isSelected,
      onSelect: () => selectElement(element.id),
      onChange: (updates: Partial<SlideElement>) => handleElementChange(element.id, updates),
    };
    
    switch (element.type) {
      case "text":
      case "heading":
        return <TextNode key={element.id} element={element as TextElement} {...commonProps} />;
      case "bullet-list":
        return <BulletListNode key={element.id} element={element as BulletListElement} {...commonProps} />;
      case "metric":
        return <MetricNode key={element.id} element={element as MetricElement} {...commonProps} />;
      case "shape":
        return <ShapeNode key={element.id} element={element as ShapeElement} {...commonProps} />;
      case "image":
        // Placeholder for images
        return (
          <Group key={element.id} x={element.x} y={element.y}>
            <Rect
              width={element.width}
              height={element.height}
              fill="#1e293b"
              stroke="#334155"
              strokeWidth={2}
              dash={[8, 8]}
              cornerRadius={8}
              onClick={() => selectElement(element.id)}
            />
            <Text
              width={element.width}
              height={element.height}
              text="Click to add image"
              fontSize={16}
              fill="#64748b"
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      case "chart":
        // Placeholder for charts
        return (
          <Group key={element.id} x={element.x} y={element.y}>
            <Rect
              width={element.width}
              height={element.height}
              fill="#1e293b"
              stroke="#334155"
              strokeWidth={2}
              cornerRadius={8}
              onClick={() => selectElement(element.id)}
            />
            <Text
              width={element.width}
              height={element.height}
              text="📊 Chart"
              fontSize={24}
              fill="#64748b"
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      case "table":
        // Placeholder for tables
        return (
          <Group key={element.id} x={element.x} y={element.y}>
            <Rect
              width={element.width}
              height={element.height}
              fill="#1e293b"
              stroke="#334155"
              strokeWidth={2}
              cornerRadius={8}
              onClick={() => selectElement(element.id)}
            />
            <Text
              width={element.width}
              height={element.height}
              text="📋 Table"
              fontSize={24}
              fill="#64748b"
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      default:
        return null;
    }
  };
  
  if (!currentSlide) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full text-zinc-500">
        No slide selected
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden h-full w-full"
    >
      <Stage
        ref={stageRef}
        width={containerWidth}
        height={containerHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Position and scale the slide */}
          <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
            {/* Slide background */}
            <Rect
              width={SLIDE_WIDTH}
              height={SLIDE_HEIGHT}
              fill={bgColor.startsWith("linear") ? "#0f172a" : bgColor}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={20}
              shadowOpacity={0.3}
            />
            
            {/* Grid overlay */}
            {showGrid && (
              <GridOverlay
                width={SLIDE_WIDTH}
                height={SLIDE_HEIGHT}
                gridSize={GRID_SIZE}
              />
            )}
            
            {/* Elements - sorted by z-index */}
            {[...currentSlide.elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(renderElement)}
            
            {/* Snap guides */}
            {showGuides && (
              <SnapGuidesOverlay
                guides={guides}
                slideWidth={SLIDE_WIDTH}
                slideHeight={SLIDE_HEIGHT}
              />
            )}
            
            {/* Transformer for selected elements */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit minimum size
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorSize={8}
              anchorCornerRadius={2}
              borderStroke={GUIDE_COLOR}
              anchorStroke={GUIDE_COLOR}
              anchorFill="#ffffff"
              rotateEnabled={true}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

export default SlideCanvas;
