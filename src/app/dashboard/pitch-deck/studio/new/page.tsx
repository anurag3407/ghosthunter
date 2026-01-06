/**
 * ============================================================================
 * PITCH DECK STUDIO - STARTUP PROFILE FORM
 * ============================================================================
 * Multi-step form to gather startup information for AI deck generation.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Building2,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb,
  Check,
  Github,
  FileText,
  Globe,
} from "lucide-react";

import type { StartupProfile, GenerationTone, StylePriority } from "@/types/pitch-deck";
import { THEMES } from "@/lib/pitch-deck/themes";

// ============================================================================
// FORM STEP COMPONENTS
// ============================================================================

interface StepProps {
  profile: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
}

// Step 1: Basic Info
function BasicInfoStep({ profile, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Let&apos;s start with the basics</h2>
        <p className="text-zinc-400">Tell us about your startup</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Startup Name *
          </label>
          <input
            type="text"
            value={profile.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., GhostFounder"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            One-liner Description *
          </label>
          <input
            type="text"
            value={profile.tagline || ""}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g., AI-powered tools for solo founders"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Industry / Vertical
          </label>
          <input
            type="text"
            value={profile.industry || ""}
            onChange={(e) => onChange({ industry: e.target.value })}
            placeholder="e.g., Developer Tools, SaaS, AI/ML"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Website
          </label>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-zinc-500" />
            <input
              type="url"
              value={profile.website || ""}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://yoursite.com"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Problem & Solution
function ProblemSolutionStep({ profile, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">The Problem & Your Solution</h2>
        <p className="text-zinc-400">What pain point are you solving?</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Target className="w-4 h-4 inline mr-2 text-red-400" />
            Problem Statement *
          </label>
          <textarea
            value={profile.problemStatement || ""}
            onChange={(e) => onChange({ problemStatement: e.target.value })}
            placeholder="Describe the problem you're solving. What's the pain point? Who experiences it?"
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Lightbulb className="w-4 h-4 inline mr-2 text-yellow-400" />
            Your Solution *
          </label>
          <textarea
            value={profile.solution || ""}
            onChange={(e) => onChange({ solution: e.target.value })}
            placeholder="How does your product solve this problem? What makes it unique?"
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Key Features / Value Props
          </label>
          <textarea
            value={profile.valueProps?.join("\n") || ""}
            onChange={(e) => onChange({ valueProps: e.target.value.split("\n").filter(Boolean) })}
            placeholder="List your main features or value propositions (one per line)"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Market & Traction
function MarketTractionStep({ profile, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Market & Traction</h2>
        <p className="text-zinc-400">Size of the opportunity and your progress so far</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-2 text-green-400" />
            Total Addressable Market (TAM)
          </label>
          <input
            type="text"
            value={profile.marketSize?.tam || ""}
            onChange={(e) => onChange({ 
              marketSize: { ...profile.marketSize, tam: e.target.value } 
            })}
            placeholder="e.g., $50B global developer tools market"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">SAM</label>
            <input
              type="text"
              value={profile.marketSize?.sam || ""}
              onChange={(e) => onChange({ 
                marketSize: { ...profile.marketSize, sam: e.target.value } 
              })}
              placeholder="e.g., $5B"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">SOM</label>
            <input
              type="text"
              value={profile.marketSize?.som || ""}
              onChange={(e) => onChange({ 
                marketSize: { ...profile.marketSize, som: e.target.value } 
              })}
              placeholder="e.g., $500M"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Traction Metrics
          </label>
          <textarea
            value={profile.traction?.metrics?.map(m => `${m.label}: ${m.value}`).join("\n") || ""}
            onChange={(e) => {
              const metrics = e.target.value.split("\n").filter(Boolean).map(line => {
                const [label, value] = line.split(":").map(s => s.trim());
                return { label: label || "", value: value || "", trend: "up" as const };
              });
              onChange({ traction: { ...profile.traction, metrics } });
            }}
            placeholder="Users: 1,000&#10;MRR: $5,000&#10;Growth: 20% MoM"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Notable Milestones / Achievements
          </label>
          <textarea
            value={profile.traction?.milestones?.join("\n") || ""}
            onChange={(e) => onChange({ 
              traction: { ...profile.traction, milestones: e.target.value.split("\n").filter(Boolean) } 
            })}
            placeholder="e.g., Launched beta, Featured on ProductHunt, First paying customer"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Team & Ask
function TeamAskStep({ profile, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Team & The Ask</h2>
        <p className="text-zinc-400">Who&apos;s building this and what do you need?</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Users className="w-4 h-4 inline mr-2 text-purple-400" />
            Team Members
          </label>
          <textarea
            value={profile.team?.map(m => `${m.name} - ${m.role}`).join("\n") || ""}
            onChange={(e) => {
              const team = e.target.value.split("\n").filter(Boolean).map(line => {
                const [name, role] = line.split("-").map(s => s.trim());
                return { name: name || "", role: role || "", bio: "" };
              });
              onChange({ team });
            }}
            placeholder="John Doe - CEO &amp; Founder&#10;Jane Smith - CTO"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Why This Team?
          </label>
          <textarea
            value={profile.teamWhy || ""}
            onChange={(e) => onChange({ teamWhy: e.target.value })}
            placeholder="What makes your team uniquely qualified to solve this problem?"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2 text-green-400" />
              Funding Ask
            </label>
            <input
              type="text"
              value={profile.fundingAsk?.amount || ""}
              onChange={(e) => onChange({ 
                fundingAsk: { ...profile.fundingAsk, amount: e.target.value } 
              })}
              placeholder="e.g., $500K"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Stage</label>
            <select
              value={profile.fundingAsk?.stage || "pre-seed"}
              onChange={(e) => onChange({ 
                fundingAsk: { ...profile.fundingAsk, stage: e.target.value as StylePriority } 
              })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B+</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Use of Funds
          </label>
          <textarea
            value={profile.fundingAsk?.useOfFunds?.map(u => typeof u === 'string' ? u : `${u.category}: ${u.percentage}%`).join("\n") || ""}
            onChange={(e) => {
              const useOfFunds = e.target.value.split("\n").filter(Boolean).map(line => {
                const [category, pct] = line.split(":").map(s => s.trim());
                return { category: category || "", percentage: parseInt(pct) || 0 };
              });
              onChange({ fundingAsk: { ...profile.fundingAsk, useOfFunds } });
            }}
            placeholder="Engineering: 50%&#10;Marketing: 30%&#10;Operations: 20%"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Data Sources & Style
function SourcesStyleStep({ profile, onChange }: StepProps) {
  const [tone, setTone] = useState<GenerationTone>("concise");
  const [themeId, setThemeId] = useState("minimal-dark");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Sources & Style</h2>
        <p className="text-zinc-400">Add context and choose your deck style</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Github className="w-4 h-4 inline mr-2" />
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={profile.githubUrl || ""}
            onChange={(e) => onChange({ githubUrl: e.target.value })}
            placeholder="https://github.com/you/your-repo"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-zinc-500 mt-1">We&apos;ll use your README to enhance the deck</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Additional Context
          </label>
          <textarea
            value={profile.additionalContext || ""}
            onChange={(e) => onChange({ additionalContext: e.target.value })}
            placeholder="Paste any additional context: investor notes, product specs, market research, etc."
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Presentation Tone
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "concise", label: "Concise", desc: "Short and to the point" },
              { id: "storytelling", label: "Storytelling", desc: "Narrative-driven" },
              { id: "technical", label: "Technical", desc: "Detail-oriented" },
              { id: "investor", label: "Investor", desc: "VC-focused metrics" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as GenerationTone)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  tone === t.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="font-medium text-white">{t.label}</div>
                <div className="text-xs text-zinc-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Theme
          </label>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.slice(0, 8).map((theme) => (
              <button
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  themeId === theme.id
                    ? "border-blue-500"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div
                  className="w-full h-8 rounded mb-2"
                  style={{ background: theme.tokens.background }}
                />
                <div className="text-xs text-zinc-300 truncate">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

const STEPS = [
  { id: "basics", title: "Basics", icon: Building2 },
  { id: "problem", title: "Problem", icon: Target },
  { id: "market", title: "Market", icon: TrendingUp },
  { id: "team", title: "Team", icon: Users },
  { id: "sources", title: "Style", icon: Sparkles },
];

export default function NewDeckPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<Partial<StartupProfile>>({});
  
  const handleChange = (updates: Partial<StartupProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };
  
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.name && profile.tagline;
      case 1:
        return profile.problemStatement && profile.solution;
      default:
        return true;
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/pitch-deck/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.deckId) {
        router.push(`/dashboard/pitch-deck/studio/${data.deckId}`);
      } else {
        const errorMsg = data.details || data.error || "Failed to generate deck";
        console.error("Generation failed:", errorMsg);
        alert(`Generation failed: ${errorMsg}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Generation error:", errorMsg);
      alert(`Generation error: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep profile={profile} onChange={handleChange} />;
      case 1:
        return <ProblemSolutionStep profile={profile} onChange={handleChange} />;
      case 2:
        return <MarketTractionStep profile={profile} onChange={handleChange} />;
      case 3:
        return <TeamAskStep profile={profile} onChange={handleChange} />;
      case 4:
        return <SourcesStyleStep profile={profile} onChange={handleChange} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center px-6">
        <button
          onClick={() => router.push("/dashboard/pitch-deck")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-lg font-semibold text-white">Create New Pitch Deck</h1>
        </div>
        
        <div className="w-20" /> {/* Spacer for symmetry */}
      </header>
      
      {/* Progress Steps */}
      <div className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "text-blue-400"
                      : isComplete
                      ? "text-green-400"
                      : "text-zinc-500"
                  }`}
                  disabled={index > currentStep}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-blue-500/20"
                        : isComplete
                        ? "bg-green-500/20"
                        : "bg-zinc-800"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </button>
                
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? "bg-green-500" : "bg-zinc-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-12 px-6">
          {renderStep()}
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="border-t border-zinc-800 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Deck
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
