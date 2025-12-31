"use client";
import Link from "next/link";
import { GridBackground } from "@/components/ui/grid-background";
import { Cover } from "@/components/ui/cover";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-black dark:bg-black">
      {/* Grid Background */}
      <GridBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-40 px-4 text-center">
        {/* Badge */}
        <div className="mb-8">
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-300 text-sm font-medium hover:bg-neutral-800/80 hover:border-neutral-600 transition-all backdrop-blur-sm"
          >
            <span>Integrating Agents into Start-Ups</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto text-center relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 via-white to-white">
          Build Start-Ups at the
          <br />
          <Cover>Warp Speed </Cover>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 mx-auto mt-4 max-w-2xl text-center text-neutral-400 text-lg md:text-xl leading-relaxed">
         Building a startup in college is hard. Your roommate sucks at coding, and equity splits are awkward. GhostFounder is the AI-powered partner that manages your code, your cap table, and your sanity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as={Link}
            href="/auth/signup"
            className="bg-black text-white flex items-center space-x-2 px-6 py-2"
          >
            <span>Get started</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </HoverBorderGradient>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Contact us
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
