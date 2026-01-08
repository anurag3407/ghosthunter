"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { testimonials } from "@/lib/testimonials";

export default function AnimatedTestimonialsDemo() {
  return <AnimatedTestimonials testimonials={testimonials} autoplay={true} />;
}
