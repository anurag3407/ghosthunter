"use client";
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

interface HeroHighlightSectionProps {
  /** Text to display before the highlighted portion */
  text: string;
  /** Text to highlight with gradient effect */
  highlightedText: string;
  /** Optional text to display after the highlighted portion */
  suffixText?: string;
  /** Optional custom class for the container */
  containerClassName?: string;
  /** Optional custom class for the heading */
  headingClassName?: string;
  /** Animation delay in seconds (default: 0) */
  animationDelay?: number;
}

export default function HeroHighlightSection({
  text,
  highlightedText,
  suffixText = "",
  containerClassName,
  headingClassName,
  animationDelay = 0,
}: HeroHighlightSectionProps) {
  return (
    <HeroHighlight
      containerClassName={`h-auto py-20 bg-zinc-50 dark:bg-black ${containerClassName ?? ""}`}
    >
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
          delay: animationDelay,
        }}
        className={`text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-zinc-800 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto ${headingClassName ?? ""}`}
      >
        {text}{" "}
        <Highlight className="text-zinc-900 dark:text-white">
          {highlightedText}
        </Highlight>
        {suffixText}
      </motion.h1>
    </HeroHighlight>
  );
}
