import Link from 'next/link';
import { Header, Footer, HeroSection, HeroHighlightSection, StickyScrollRevealDemo } from '@/components/layout';
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import FeaturesSectionDemo from "@/components/ui/features-section-demo-3";
import AnimatedTestimonialsDemo from "@/components/ui/animated-testimonials-demo";

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

      {/* Sticky Scroll Features Section */}
      <StickyScrollRevealDemo />

      {/* Features Section */}
      <FeaturesSectionDemo />

      {/* Animated Testimonials Section */}
      <AnimatedTestimonialsDemo />

      {/* Text Hover Effect Section */}
      <div className="h-[20rem] md:h-[20rem] flex items-center justify-center w-full">
        <TextHoverEffect text="GHOSTFOUNDER" />
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-violet-100 mb-8">
            Join thousands of teams already using GhostHunter to build better products.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-3.5 text-base font-medium text-violet-600 bg-white rounded-xl hover:bg-zinc-100 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 text-base font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
