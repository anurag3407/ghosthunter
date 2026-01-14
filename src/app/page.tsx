import { Header, HeroSection, HeroHighlightSection, StickyScrollRevealDemo } from '@/components/layout';

import FeaturesSectionDemo from "@/components/ui/features-section-demo-3";
import AnimatedTestimonialsDemo from "@/components/ui/animated-testimonials-demo";
import { SplineSceneDemo } from "@/components/ui/spline-scene-demo";
import { CallToAction } from "@/components/ui/cta";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

// Force dynamic rendering - Header uses Clerk auth
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <Header />

      {/* Hero Section with Background Ripple Effect */}
      <HeroSection />

      {/* Text Highlight Section */}
      <HeroHighlightSection
        text="Enough Building, time for"
        highlightedText="redemption."
      />

      {/* Interactive 3D Spline Scene */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SplineSceneDemo />
      </section>

      {/* Sticky Scroll Features Section */}
      <StickyScrollRevealDemo />

      {/* Features Section */}
      <FeaturesSectionDemo />

      {/* GHOSTFOUNDER Text Effect */}
      <section className="py-8 flex items-center justify-center">
        <TextHoverEffect
          text="GHOSTFOUNDER"
          containerHeight="20rem"
          viewBox="0 0 500 100"
        />
      </section>

      {/* Animated Testimonials Section */}
      <AnimatedTestimonialsDemo />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <CallToAction />
      </section>

      {/* Sticky Footer Reveal */}
      <StickyFooter />
    </div>
  );
}
