"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * TextHoverEffect Component
 *
 * A visual effect where text is revealed with a hover mask and gradient.
 *
 * @component
 * @example
 * ```tsx
 * <TextHoverEffect
 *   text="HOVER ME"
 *   containerHeight="12rem"
 *   containerWidth="100%"
 *   className="my-4"
 * />
 * ```
 *
 * @param {Object} props - The component props
 * @param {string} props.text - The text to display
 * @param {string} [props.containerHeight="100%"] - Height of the SVG container (e.g., "12rem", "100px")
 * @param {string} [props.containerWidth="100%"] - Width of the SVG container
 * @param {number} [props.duration=0] - Animation duration for the mask reveal
 * @param {boolean} [props.automatic=false] - Whether the effect runs automatically without hover (not fully implemented in orig, keeping prop)
 * @param {string} [props.strokeColor] - Tailwind class for the text stroke color (default: "stroke-neutral-200 dark:stroke-neutral-900")
 * @param {string} [props.strokeWidth="0.3"] - Width of the text stroke
 * @param {string} [props.viewBox="0 0 300 100"] - SVG viewBox definition to control scaling/aspect ratio
 * @param {string} [props.className] - Additional CSS classes for the SVG element
 * @param {{ offset: string; color: string }[]} [props.hoverGradientColors] - Custom colors for the hover gradient
 */
export const TextHoverEffect = ({
  text,
  containerHeight = "100%",
  containerWidth = "100%",
  duration = 0,
  automatic = false,
  strokeColor,
  strokeWidth = "0.3",
  viewBox = "0 0 300 100",
  className,
  hoverGradientColors,
}: {
  text: string;
  containerHeight?: string;
  containerWidth?: string;
  duration?: number;
  automatic?: boolean;
  strokeColor?: string;
  strokeWidth?: string;
  viewBox?: string;
  className?: string;
  hoverGradientColors?: { offset: string; color: string }[];
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  const defaultGradientColors = [
    { offset: "0%", color: "#eab308" },
    { offset: "25%", color: "#ef4444" },
    { offset: "50%", color: "#3b82f6" },
    { offset: "75%", color: "#06b6d4" },
    { offset: "100%", color: "#8b5cf6" },
  ];

  const gradientStops = hoverGradientColors || defaultGradientColors;

  return (
    <svg
      ref={svgRef}
      width={containerWidth}
      height={containerHeight}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={`select-none ${className || ""}`}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              {gradientStops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={strokeWidth}
        className={`fill-transparent font-[helvetica] font-bold ${strokeColor || "stroke-neutral-200 dark:stroke-neutral-900"
          }`}
        style={{ opacity: hovered ? 0.7 : 0 }}
        fontSize={44}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={strokeWidth}
        className={`fill-transparent font-[helvetica] font-bold ${strokeColor || "stroke-neutral-200 dark:stroke-neutral-500"
          }`}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
        fontSize={44}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth={strokeWidth}
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] font-bold"
        fontSize={44}
      >
        {text}
      </text>
    </svg>
  );
};
