"use client";

import nextDynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense } from 'react';
import { Header, HeroSection, HeroHighlightSection, StickyScrollRevealDemo } from '@/components/layout';
import { StickyFooter } from "@/components/ui/sticky-footer";

// Loading skeleton for heavy sections
const SectionSkeleton = ({ height = "h-[500px]" }: { height?: string }) => (
  <div className={`${height} w-full flex items-center justify-center bg-black`}>
    <div className="w-8 h-8 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
  </div>
);

// Dynamic imports with loading states for heavy components
const FeaturesSectionDemo = nextDynamic(
  () => import("@/components/ui/features-section-demo-3"),
  {
    loading: () => <SectionSkeleton height="h-[600px]" />,
    ssr: true,
  }
);

const AnimatedTestimonialsDemo = nextDynamic(
  () => import("@/components/ui/animated-testimonials-demo"),
  {
    loading: () => <SectionSkeleton height="h-[400px]" />,
    ssr: false, // Disable SSR for client-only animations
  }
);

const SplineSceneDemo = nextDynamic(
  () => import("@/components/ui/spline-scene-demo").then(mod => ({ default: mod.SplineSceneDemo })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Spline is client-only
  }
);

const TextHoverEffect = nextDynamic(
  () => import("@/components/ui/text-hover-effect").then(mod => ({ default: mod.TextHoverEffect })),
  {
    loading: () => <SectionSkeleton height="h-[20rem]" />,
    ssr: false,
  }
);

const CallToAction = nextDynamic(
  () => import("@/components/ui/cta").then(mod => ({ default: mod.CallToAction })),
  {
    loading: () => <SectionSkeleton height="h-[200px]" />,
    ssr: true,
  }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <Header />

      {/* Hero Section with Infinite Grid + Integrated Dashboard Preview */}
      <HeroSection />

      {/* Text Highlight Section */}
      <HeroHighlightSection
        text="Enough Building, time for"
        highlightedText="redemption."
      />

      {/* Interactive 3D Spline Scene - Lazy loaded */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <Suspense fallback={<SectionSkeleton />}>
          <SplineSceneDemo />
        </Suspense>
      </section>

      {/* Sticky Scroll Features Section */}
      <StickyScrollRevealDemo />

      {/* Features Section - Contains heavy Globe component */}
      <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
        <FeaturesSectionDemo />
      </Suspense>

      {/* GHOSTFOUNDER Text Effect */}
      <section className="py-8 flex flex-col items-center justify-center gap-6">
        <Suspense fallback={<SectionSkeleton height="h-[20rem]" />}>
          <TextHoverEffect
            text="GHOSTFOUNDER"
            containerHeight="20rem"
            viewBox="0 0 500 100"
          />
        </Suspense>
        <Image
          src="/ghostfounder.png"
          alt="GhostFounder Logo"
          width={360}
          height={360}
          className="rounded-2xl shadow-2xl shadow-violet-500/20"
        />
      </section>

      {/* Animated Testimonials Section */}
      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <AnimatedTestimonialsDemo />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <Suspense fallback={<SectionSkeleton height="h-[200px]" />}>
          <CallToAction />
        </Suspense>
      </section>

      {/* Sticky Footer Reveal */}
      <StickyFooter />
    </div>
  );
}

