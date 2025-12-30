import Link from 'next/link';
import { Header, Footer } from '@/components/layout';

const features = [
  {
    icon: '🚀',
    title: 'Lightning Fast',
    description: 'Built with Next.js 15 for optimal performance and instant page loads.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with authentication and data protection.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description: 'Beautiful experience on any device, from mobile to desktop.',
  },
  {
    icon: '🎨',
    title: 'Modern Design',
    description: 'Clean, intuitive interface with dark mode support built-in.',
  },
  {
    icon: '⚡',
    title: 'Real-time Updates',
    description: 'Stay synced with live updates and instant notifications.',
  },
  {
    icon: '🔧',
    title: 'Easy Integration',
    description: 'Connect with your favorite tools and services seamlessly.',
  },
];

const testimonials = [
  {
    quote: "GhostHunter has transformed how we manage our projects. The interface is intuitive and the performance is incredible.",
    author: "Sarah Chen",
    role: "CTO at TechCorp",
    avatar: "SC",
  },
  {
    quote: "We've seen a 40% increase in team productivity since switching to GhostHunter. Highly recommended!",
    author: "Michael Torres",
    role: "Product Manager at StartupXYZ",
    avatar: "MT",
  },
  {
    quote: "The best project management tool we've ever used. The support team is fantastic too!",
    author: "Emily Johnson",
    role: "CEO at DesignStudio",
    avatar: "EJ",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-white dark:from-violet-950/20 dark:via-zinc-950 dark:to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-400/30 to-indigo-400/30 rounded-full blur-3xl opacity-50 dark:opacity-20" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            New: Version 2.0 is now available
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
            Build something
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> amazing </span>
            with GhostHunter
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            The modern platform for teams to collaborate, manage projects, and ship products faster than ever before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 text-base font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent z-10" />
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-video max-w-5xl mx-auto">
              <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="p-8 flex items-center justify-center">
                <p className="text-zinc-400 dark:text-zinc-500">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Powerful features designed to help your team work smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <p className="text-zinc-700 dark:text-zinc-300 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              href="/auth/signup"
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
