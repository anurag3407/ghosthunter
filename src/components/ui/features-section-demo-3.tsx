"use client";
import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";


export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Deep Code Analysis",
      description:
        "Automated architectural reviews and security audits provided by the Code Police agent. Get detailed insights into your code quality instantly.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Security & Integrations",
      description:
        "Blockchain-secured equity tokens with immutable records. One-click connect with Google, GitHub, and MetaMask.",
      skeleton: <SkeletonSecurityIntegrations />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "See It In Action",
      description:
        "Watch how our agents collaborate to handle complex startup operations autonomously.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
    },
    {
      title: "24/7 Global Workforce",
      description:
        "Your AI workforce never sleeps. Agents monitor, analyze, and execute tasks across all time zones, ensuring your startup runs smoothly.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Built for the Modern Founder
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          A complete ecosystem of AI agents working around the clock to build, fund, and scale your startup.
          From code audits to equity management, we handle the heavy lifting.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

import { CodeBlock } from "@/components/ui/code-block";

export const SkeletonOne = () => {
  const code = `async function processSecurePayment(userId, amount) {
  // 🚨 CRITICAL VULNERABILITY: Hardcoded API Key
  const STRIPE_SECRET = "sk_live_51M..."; 

  // 🚨 CRITICAL VULNERABILITY: SQL Injection
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  
  const user = await db.query(query);
  
  if (user) {
    console.log("Processing payment for:", user.creditCard);
    
    return stripe.charges.create({
        amount,
        currency: "usd",
        source: user.stripeId
    });
  }
}`;

  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <CodeBlock
            language="javascript"
            filename="payment-processor.js"
            highlights={[
              { line: 3, color: "rgba(239, 68, 68, 0.2)", annotation: "Use process.env" },
              { line: 6, color: "rgba(239, 68, 68, 0.2)", annotation: "Use parameterized query" },
              { line: 11, color: "rgba(239, 68, 68, 0.2)", annotation: "Remove in prod" },
            ]}
            code={code}
          />
        </div>
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <a
      href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
      target="__blank"
      className="relative flex gap-10  h-full group/image"
    >
      <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
          {/* TODO */}
          <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
          <img
            src="https://assets.aceternity.com/fireship.jpg"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>
    </a>
  );
};

// Combined Security & Integrations Skeleton (Stacked Vertically)
export const SkeletonSecurityIntegrations = () => {
  return (
    <div className="relative flex flex-col items-center justify-start p-6 gap-4 h-full overflow-hidden">
      {/* TOP: Blockchain Security */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-20 h-20 -left-2 -top-2"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 bg-emerald-500/80 rounded shadow-md" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2.5 h-2.5 bg-cyan-500/80 rounded shadow-md" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2.5 h-2.5 bg-purple-500/80 rounded shadow-md" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2.5 h-2.5 bg-pink-500/80 rounded shadow-md" />
          </motion.div>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="px-2 py-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Immutable</span>
          <span className="px-2 py-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">Encrypted</span>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

      {/* BOTTOM: Easy Integrations */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.1, y: -3 }} className="w-12 h-12 rounded-xl bg-white/10 border border-neutral-700 flex items-center justify-center shadow-lg cursor-pointer">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1, y: -3 }} className="w-12 h-12 rounded-xl bg-zinc-800 border border-neutral-700 flex items-center justify-center shadow-lg cursor-pointer">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1, y: -3 }} className="w-12 h-12 rounded-xl bg-orange-500/10 border border-neutral-700 flex items-center justify-center shadow-lg cursor-pointer">
            <svg className="w-6 h-6" viewBox="0 0 35 33">
              <path fill="#E2761B" d="M32.958 1l-13.134 9.718 2.442-5.727L32.958 1z" />
              <path fill="#E4761B" d="M2.663 1l13.017 9.809-2.325-5.818L2.663 1zM28.23 23.533l-3.495 5.339 7.483 2.06 2.143-7.282-6.131-.117z" />
              <path fill="#F6851B" d="M32.096 15.765l-6.531-1.903 2.075 3.143-3.18 6.165 4.197-.05h6.13l-2.691-7.355z" />
            </svg>
          </motion.div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-400">One-click connect</span>
        </div>
      </div>
    </div>
  );
};

// Blockchain Security Skeleton
export const SkeletonBlockchain = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 gap-6 h-full overflow-hidden">
      {/* Ethereum-style hexagon network */}
      <div className="relative">
        {/* Central blockchain icon */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Orbiting blocks */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-32 h-32 -left-4 -top-4"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-emerald-500/80 rounded shadow-lg shadow-emerald-500/50" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-4 h-4 bg-cyan-500/80 rounded shadow-lg shadow-cyan-500/50" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-4 bg-purple-500/80 rounded shadow-lg shadow-purple-500/50" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-4 h-4 bg-pink-500/80 rounded shadow-lg shadow-pink-500/50" />
        </motion.div>
      </div>

      {/* Security badges */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="text-xs text-emerald-400">Immutable</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="text-xs text-purple-400">Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-xs text-cyan-400">24/7</span>
        </div>
      </div>
    </div>
  );
};

// Easy Integrations Skeleton
export const SkeletonIntegrations = () => {
  const integrations = [
    {
      name: "Google",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ),
      bg: "bg-white/10",
    },
    {
      name: "GitHub",
      icon: (
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
      bg: "bg-zinc-800",
    },
    {
      name: "MetaMask",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 35 33">
          <path fill="#E2761B" d="M32.958 1l-13.134 9.718 2.442-5.727L32.958 1z" />
          <path fill="#E4761B" d="M2.663 1l13.017 9.809-2.325-5.818L2.663 1zM28.23 23.533l-3.495 5.339 7.483 2.06 2.143-7.282-6.131-.117zM.622 23.65l2.127 7.282 7.466-2.06-3.478-5.339-6.115.117z" />
          <path fill="#E4761B" d="M9.856 14.578l-2.084 3.143 7.433.334-.25-7.983-5.1 4.506zM25.764 14.578l-5.175-4.598-.167 8.075 7.417-.334-2.075-3.143zM10.215 28.872l4.464-2.176-3.857-3.009-.607 5.185zM20.942 26.696l4.447 2.176-.59-5.185-3.857 3.009z" />
          <path fill="#D7C1B3" d="M25.389 28.872l-4.447-2.176.357 2.903-.042 1.227 4.132-1.954zM10.215 28.872l4.148 1.954-.025-1.227.341-2.903-4.464 2.176z" />
          <path fill="#233447" d="M14.438 21.787l-3.715-1.093 2.624-1.202 1.09 2.295zM21.183 21.787l1.09-2.295 2.64 1.202-3.73 1.093z" />
          <path fill="#CD6116" d="M10.215 28.872l.632-5.339-4.11.117 3.478 5.222zM24.773 23.533l.616 5.339 3.494-5.222-4.11-.117zM27.839 17.72l-7.417.334.69 3.733 1.09-2.295 2.64 1.202 2.997-2.974zM10.723 20.694l2.624-1.202 1.09 2.295.69-3.733-7.433-.334 3.029 2.974z" />
          <path fill="#E4751F" d="M7.694 17.72l3.162 6.165-.108-3.191-3.054-2.974zM24.842 20.694l-.125 3.191 3.18-6.165-3.055 2.974zM15.11 18.054l-.69 3.733.865 4.465.19-5.885-.365-2.313zM20.422 18.054l-.349 2.304.174 5.894.866-4.465-.69-3.733z" />
          <path fill="#F6851B" d="M21.112 21.787l-.866 4.465.624.433 3.857-3.009.125-3.191-3.74 1.302zM10.723 20.694l.108 3.191 3.857 3.009.624-.433-.866-4.465-3.723-1.302z" />
          <path fill="#C0AD9E" d="M21.187 30.826l.042-1.227-.341-.283H14.73l-.324.283.025 1.227-4.148-1.954 1.451 1.186 2.94 2.035h6.09l2.957-2.035 1.434-1.186-4.132 1.954z" />
          <path fill="#161616" d="M20.942 26.696l-.624-.433h-3.616l-.624.433-.341 2.903.324-.283h6.158l.341.283-.618-2.903z" />
          <path fill="#763D16" d="M33.517 11.353l1.109-5.36L32.958 1l-12.016 8.902 4.623 3.91 6.531 1.903 1.442-1.686-.624-.45 1-9.16-1-7.9.824.633z" />
          <path fill="#763D16" d="M.996 6.003l1.125 5.35.715-.533-1-.76 1-9.16-.64.45 1.426 1.686 6.531-1.903 4.623-3.91L2.663 1 .996 6.003z" />
          <path fill="#F6851B" d="M32.096 15.765l-6.531-1.903 2.075 3.143-3.18 6.165 4.197-.05h6.13l-2.691-7.355zM9.856 13.862l-6.531 1.903-2.675 7.355h6.114l4.181.05-3.162-6.165 2.073-3.143zM20.422 18.054l.416-7.192 1.91-5.152h-8.479l1.893 5.152.432 7.192.167 2.323.017 5.877h3.616l.017-5.877.011-2.323z" />
        </svg>
      ),
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-8 gap-8 h-full overflow-hidden">
      {/* Integration cards */}
      <div className="flex items-center justify-center gap-6">
        {integrations.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.1, y: -5 }}
            className={`w-20 h-20 rounded-2xl ${item.bg} border border-neutral-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer`}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Connection lines */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-neutral-600 to-neutral-600" />
        <div className="px-4 py-2 rounded-full bg-zinc-800 border border-zinc-700">
          <span className="text-xs text-zinc-300 font-medium">One-Click Connect</span>
        </div>
        <div className="w-20 h-px bg-gradient-to-l from-transparent via-neutral-600 to-neutral-600" />
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-6">
        {integrations.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
