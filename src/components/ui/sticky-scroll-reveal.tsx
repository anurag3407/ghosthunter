"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  // Border glow colors for each card
  const borderColors = [
    "shadow-red-500/20 border-red-500/30",     // Code Police
    "shadow-blue-500/20 border-blue-500/30",   // Pitch Deck  
    "shadow-purple-500/20 border-purple-500/30", // Equity
    "shadow-green-500/20 border-green-500/30", // Database
  ];

  return (
    <div
      className="relative flex h-[32rem] justify-center gap-16 overflow-y-auto rounded-3xl p-10 bg-transparent"
      ref={ref}
    >
      {/* Left - Text Content */}
      <div className="relative flex items-start">
        <div className="max-w-xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20 first:mt-0">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.2,
                  x: activeCard === index ? 0 : -10,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-2xl font-bold text-white"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.15,
                }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                className="text-base mt-6 max-w-md text-zinc-400 leading-relaxed"
              >
                {item.description}
              </motion.p>

              {/* Progress indicator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: activeCard === index ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-0.5 w-12 mt-6 bg-gradient-to-r from-violet-500 to-cyan-500 origin-left rounded-full"
              />
            </div>
          ))}
          <div className="h-48" />
        </div>
      </div>

      {/* Right - Sticky Preview */}
      <div
        className={cn(
          "sticky top-10 hidden lg:block overflow-hidden rounded-2xl",
          "border bg-zinc-950/80 backdrop-blur-sm",
          "transition-all duration-500 ease-out",
          "shadow-2xl",
          borderColors[activeCard % borderColors.length],
          contentClassName,
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            {content[activeCard].content ?? null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side indicator dots */}
      <div className="hidden lg:flex flex-col items-center justify-center gap-3 absolute right-6 top-1/2 -translate-y-1/2">
        {content.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: activeCard === index ? 1.2 : 1,
              opacity: activeCard === index ? 1 : 0.3,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              activeCard === index
                ? ["bg-red-400", "bg-blue-400", "bg-purple-400", "bg-green-400"][index]
                : "bg-zinc-600"
            )}
          />
        ))}
      </div>
    </div>
  );
};
