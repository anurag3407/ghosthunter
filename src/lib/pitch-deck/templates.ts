/**
 * ============================================================================
 * PITCH DECK STUDIO - SLIDE TEMPLATES
 * ============================================================================
 * Predefined templates for each slide type with investor-grade layouts.
 * AI fills content slots, not coordinates - ensuring deterministic rendering.
 */

import type { SlideType, SlideTypeTemplate, SlideLayout, TemplateSlot } from "@/types/pitch-deck";

// ============================================================================
// SLIDE DIMENSIONS (16:9 aspect ratio)
// ============================================================================

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
export const SLIDE_PADDING = 60;

// ============================================================================
// HELPER: Create common slot patterns
// ============================================================================

const createHeadlineSlot = (overrides: Partial<TemplateSlot> = {}): TemplateSlot => ({
  id: "headline",
  type: "heading",
  role: "headline",
  x: SLIDE_PADDING,
  y: 80,
  width: SLIDE_WIDTH - SLIDE_PADDING * 2,
  height: 80,
  defaultStyle: {
    fontSize: 48,
    fontWeight: 700,
    textAlign: "left",
  },
  placeholder: "Slide Title",
  required: true,
  ...overrides,
});

const createSubheadlineSlot = (overrides: Partial<TemplateSlot> = {}): TemplateSlot => ({
  id: "subheadline",
  type: "text",
  role: "subheadline",
  x: SLIDE_PADDING,
  y: 170,
  width: SLIDE_WIDTH - SLIDE_PADDING * 2,
  height: 40,
  defaultStyle: {
    fontSize: 24,
    fontWeight: 400,
    textAlign: "left",
  },
  placeholder: "Supporting subtitle or context",
  ...overrides,
});

const createBulletsSlot = (overrides: Partial<TemplateSlot> = {}): TemplateSlot => ({
  id: "bullets",
  type: "bullet-list",
  role: "bullets",
  x: SLIDE_PADDING,
  y: 240,
  width: SLIDE_WIDTH - SLIDE_PADDING * 2,
  height: 400,
  defaultStyle: {
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.6,
  },
  placeholder: "Key points...",
  ...overrides,
});

// ============================================================================
// TITLE SLIDE TEMPLATES
// ============================================================================

const titleLayouts: SlideLayout[] = [
  {
    id: "title-centered",
    name: "Centered",
    description: "Classic centered title with tagline",
    slots: [
      {
        id: "logo",
        type: "logo",
        role: "logo",
        x: SLIDE_WIDTH / 2 - 60,
        y: 180,
        width: 120,
        height: 120,
        placeholder: "Upload logo",
      },
      {
        id: "title",
        type: "heading",
        role: "headline",
        x: SLIDE_PADDING,
        y: 320,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 100,
        defaultStyle: {
          fontSize: 64,
          fontWeight: 800,
          textAlign: "center",
        },
        placeholder: "Company Name",
        required: true,
      },
      {
        id: "tagline",
        type: "text",
        role: "subheadline",
        x: SLIDE_PADDING,
        y: 440,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 60,
        defaultStyle: {
          fontSize: 28,
          fontWeight: 400,
          textAlign: "center",
        },
        placeholder: "Your compelling tagline",
      },
      {
        id: "date",
        type: "text",
        role: "metadata",
        x: SLIDE_PADDING,
        y: 640,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 30,
        defaultStyle: {
          fontSize: 16,
          fontWeight: 400,
          textAlign: "center",
        },
        placeholder: "Month Year",
      },
    ],
  },
  {
    id: "title-left-aligned",
    name: "Left Aligned",
    description: "Modern left-aligned title with visual area",
    slots: [
      {
        id: "logo",
        type: "logo",
        role: "logo",
        x: SLIDE_PADDING,
        y: SLIDE_PADDING,
        width: 80,
        height: 80,
        placeholder: "Upload logo",
      },
      {
        id: "title",
        type: "heading",
        role: "headline",
        x: SLIDE_PADDING,
        y: 280,
        width: 600,
        height: 120,
        defaultStyle: {
          fontSize: 56,
          fontWeight: 800,
          textAlign: "left",
        },
        placeholder: "Company Name",
        required: true,
      },
      {
        id: "tagline",
        type: "text",
        role: "subheadline",
        x: SLIDE_PADDING,
        y: 420,
        width: 600,
        height: 80,
        defaultStyle: {
          fontSize: 24,
          fontWeight: 400,
          textAlign: "left",
        },
        placeholder: "Your compelling tagline that captures the vision",
      },
      {
        id: "visual",
        type: "image",
        role: "hero-image",
        x: 720,
        y: 120,
        width: 480,
        height: 480,
        placeholder: "Add product image or illustration",
      },
    ],
  },
];

// ============================================================================
// PROBLEM SLIDE TEMPLATES
// ============================================================================

const problemLayouts: SlideLayout[] = [
  {
    id: "problem-bullets",
    name: "Key Points",
    description: "Headline with 3 key pain points",
    slots: [
      createHeadlineSlot({ placeholder: "The Problem" }),
      createSubheadlineSlot({ placeholder: "What challenge are we solving?" }),
      createBulletsSlot({ 
        y: 260,
        height: 380,
        placeholder: "Pain point 1\nPain point 2\nPain point 3",
      }),
    ],
  },
  {
    id: "problem-split",
    name: "Split View",
    description: "Text on left, visual/icon on right",
    slots: [
      createHeadlineSlot({ width: 600 }),
      createSubheadlineSlot({ width: 600 }),
      createBulletsSlot({ 
        width: 560,
        height: 340,
      }),
      {
        id: "visual",
        type: "image",
        role: "illustration",
        x: 680,
        y: 180,
        width: 520,
        height: 420,
        placeholder: "Add illustration or icon representing the problem",
      },
    ],
  },
  {
    id: "problem-metrics",
    name: "With Statistics",
    description: "Problem statement with supporting metrics",
    slots: [
      createHeadlineSlot(),
      createSubheadlineSlot(),
      {
        id: "metric1",
        type: "metric",
        role: "statistic",
        x: SLIDE_PADDING,
        y: 280,
        width: 360,
        height: 160,
        placeholder: "$XX Billion lost annually",
      },
      {
        id: "metric2",
        type: "metric",
        role: "statistic",
        x: 460,
        y: 280,
        width: 360,
        height: 160,
        placeholder: "XX% affected",
      },
      {
        id: "metric3",
        type: "metric",
        role: "statistic",
        x: 860,
        y: 280,
        width: 360,
        height: 160,
        placeholder: "XXh wasted weekly",
      },
      {
        id: "description",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 480,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 160,
        defaultStyle: {
          fontSize: 22,
          textAlign: "center",
        },
        placeholder: "Brief description of who experiences this problem",
      },
    ],
  },
];

// ============================================================================
// SOLUTION SLIDE TEMPLATES
// ============================================================================

const solutionLayouts: SlideLayout[] = [
  {
    id: "solution-overview",
    name: "Solution Overview",
    description: "Clear solution statement with key benefits",
    slots: [
      createHeadlineSlot({ placeholder: "Our Solution" }),
      createSubheadlineSlot({ placeholder: "How we solve this problem" }),
      createBulletsSlot({
        placeholder: "Key benefit 1\nKey benefit 2\nKey benefit 3",
      }),
    ],
  },
  {
    id: "solution-product",
    name: "Product Showcase",
    description: "Product screenshot with feature highlights",
    slots: [
      createHeadlineSlot({ width: 500, placeholder: "Our Solution" }),
      {
        id: "product-image",
        type: "image",
        role: "product-screenshot",
        x: 640,
        y: 100,
        width: 580,
        height: 520,
        placeholder: "Add product screenshot",
      },
      createBulletsSlot({
        width: 520,
        y: 200,
        height: 400,
        placeholder: "Feature highlight 1\nFeature highlight 2\nFeature highlight 3",
      }),
    ],
  },
  {
    id: "solution-before-after",
    name: "Before & After",
    description: "Comparison showing transformation",
    slots: [
      createHeadlineSlot({ placeholder: "The Transformation" }),
      {
        id: "before-title",
        type: "heading",
        role: "label",
        x: SLIDE_PADDING,
        y: 160,
        width: 540,
        height: 50,
        defaultStyle: { fontSize: 28, fontWeight: 600, textAlign: "center" },
        placeholder: "Before",
      },
      {
        id: "before-content",
        type: "bullet-list",
        role: "bullets",
        x: SLIDE_PADDING,
        y: 220,
        width: 540,
        height: 400,
        placeholder: "Pain point 1\nPain point 2\nPain point 3",
      },
      {
        id: "arrow",
        type: "icon",
        role: "divider",
        x: 620,
        y: 350,
        width: 60,
        height: 60,
      },
      {
        id: "after-title",
        type: "heading",
        role: "label",
        x: 700,
        y: 160,
        width: 520,
        height: 50,
        defaultStyle: { fontSize: 28, fontWeight: 600, textAlign: "center" },
        placeholder: "After",
      },
      {
        id: "after-content",
        type: "bullet-list",
        role: "bullets",
        x: 700,
        y: 220,
        width: 520,
        height: 400,
        placeholder: "Benefit 1\nBenefit 2\nBenefit 3",
      },
    ],
  },
];

// ============================================================================
// MARKET SLIDE TEMPLATES
// ============================================================================

const marketLayouts: SlideLayout[] = [
  {
    id: "market-tam-sam-som",
    name: "TAM SAM SOM",
    description: "Market sizing with concentric circles",
    slots: [
      createHeadlineSlot({ placeholder: "Market Opportunity" }),
      {
        id: "tam",
        type: "metric",
        role: "market-size",
        x: SLIDE_PADDING,
        y: 180,
        width: 360,
        height: 200,
        placeholder: "$XXB TAM\nTotal Addressable Market",
      },
      {
        id: "sam",
        type: "metric",
        role: "market-size",
        x: 460,
        y: 180,
        width: 360,
        height: 200,
        placeholder: "$XXB SAM\nServiceable Addressable Market",
      },
      {
        id: "som",
        type: "metric",
        role: "market-size",
        x: 860,
        y: 180,
        width: 360,
        height: 200,
        placeholder: "$XXM SOM\nServiceable Obtainable Market",
      },
      {
        id: "description",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 420,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 200,
        defaultStyle: { fontSize: 20, lineHeight: 1.5 },
        placeholder: "Market context and growth drivers...",
      },
    ],
  },
  {
    id: "market-growth",
    name: "Market Growth",
    description: "Chart showing market growth trajectory",
    slots: [
      createHeadlineSlot({ placeholder: "Growing Market" }),
      createSubheadlineSlot({ placeholder: "Industry projected to reach $XX by 20XX" }),
      {
        id: "growth-chart",
        type: "chart",
        role: "visualization",
        x: SLIDE_PADDING,
        y: 240,
        width: 700,
        height: 400,
        placeholder: "Market growth chart",
      },
      createBulletsSlot({
        x: 780,
        y: 240,
        width: 440,
        height: 400,
        placeholder: "Growth driver 1\nGrowth driver 2\nGrowth driver 3",
      }),
    ],
  },
];

// ============================================================================
// BUSINESS MODEL SLIDE TEMPLATES
// ============================================================================

const businessModelLayouts: SlideLayout[] = [
  {
    id: "business-model-streams",
    name: "Revenue Streams",
    description: "Multiple revenue stream breakdown",
    slots: [
      createHeadlineSlot({ placeholder: "Business Model" }),
      createSubheadlineSlot({ placeholder: "How we make money" }),
      {
        id: "stream1",
        type: "text",
        role: "revenue-stream",
        x: SLIDE_PADDING,
        y: 260,
        width: 360,
        height: 180,
        defaultStyle: { fontSize: 20 },
        placeholder: "Revenue Stream 1",
      },
      {
        id: "stream2",
        type: "text",
        role: "revenue-stream",
        x: 460,
        y: 260,
        width: 360,
        height: 180,
        placeholder: "Revenue Stream 2",
      },
      {
        id: "stream3",
        type: "text",
        role: "revenue-stream",
        x: 860,
        y: 260,
        width: 360,
        height: 180,
        placeholder: "Revenue Stream 3",
      },
      {
        id: "pricing",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 480,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 160,
        placeholder: "Pricing model details...",
      },
    ],
  },
  {
    id: "business-model-pricing",
    name: "Pricing Table",
    description: "Tiered pricing comparison",
    slots: [
      createHeadlineSlot({ placeholder: "Pricing" }),
      {
        id: "pricing-table",
        type: "table",
        role: "comparison",
        x: SLIDE_PADDING,
        y: 180,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 480,
        placeholder: "Add pricing tiers",
      },
    ],
  },
];

// ============================================================================
// TRACTION SLIDE TEMPLATES
// ============================================================================

const tractionLayouts: SlideLayout[] = [
  {
    id: "traction-metrics",
    name: "Key Metrics",
    description: "Hero metrics with supporting stats",
    slots: [
      createHeadlineSlot({ placeholder: "Traction" }),
      {
        id: "hero-metric",
        type: "metric",
        role: "primary-metric",
        x: SLIDE_WIDTH / 2 - 200,
        y: 160,
        width: 400,
        height: 160,
        placeholder: "$XXK MRR",
      },
      {
        id: "metric1",
        type: "metric",
        role: "secondary-metric",
        x: SLIDE_PADDING,
        y: 380,
        width: 280,
        height: 140,
        placeholder: "XX Users",
      },
      {
        id: "metric2",
        type: "metric",
        role: "secondary-metric",
        x: 380,
        y: 380,
        width: 280,
        height: 140,
        placeholder: "XX% Growth",
      },
      {
        id: "metric3",
        type: "metric",
        role: "secondary-metric",
        x: 700,
        y: 380,
        width: 280,
        height: 140,
        placeholder: "XX% Retention",
      },
      {
        id: "metric4",
        type: "metric",
        role: "secondary-metric",
        x: 1020,
        y: 380,
        width: 200,
        height: 140,
        placeholder: "X Deals",
      },
      {
        id: "milestones",
        type: "bullet-list",
        role: "bullets",
        x: SLIDE_PADDING,
        y: 540,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 120,
        placeholder: "Recent milestones...",
      },
    ],
  },
  {
    id: "traction-chart",
    name: "Growth Chart",
    description: "Time-series showing growth trajectory",
    slots: [
      createHeadlineSlot({ placeholder: "Growth Trajectory" }),
      createSubheadlineSlot({ placeholder: "Month-over-month progress" }),
      {
        id: "growth-chart",
        type: "chart",
        role: "visualization",
        x: SLIDE_PADDING,
        y: 220,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 420,
        placeholder: "Add growth chart",
      },
    ],
  },
];

// ============================================================================
// GO-TO-MARKET SLIDE TEMPLATES
// ============================================================================

const goToMarketLayouts: SlideLayout[] = [
  {
    id: "gtm-strategy",
    name: "GTM Strategy",
    description: "Go-to-market strategy overview",
    slots: [
      createHeadlineSlot({ placeholder: "Go-To-Market Strategy" }),
      createSubheadlineSlot({ placeholder: "How we acquire and grow customers" }),
      {
        id: "channel1",
        type: "text",
        role: "channel",
        x: SLIDE_PADDING,
        y: 260,
        width: 360,
        height: 340,
        placeholder: "Channel 1",
      },
      {
        id: "channel2",
        type: "text",
        role: "channel",
        x: 460,
        y: 260,
        width: 360,
        height: 340,
        placeholder: "Channel 2",
      },
      {
        id: "channel3",
        type: "text",
        role: "channel",
        x: 860,
        y: 260,
        width: 360,
        height: 340,
        placeholder: "Channel 3",
      },
    ],
  },
  {
    id: "gtm-funnel",
    name: "Acquisition Funnel",
    description: "Customer acquisition funnel visualization",
    slots: [
      createHeadlineSlot({ placeholder: "Customer Acquisition" }),
      {
        id: "funnel-visual",
        type: "shape",
        role: "visualization",
        x: SLIDE_PADDING,
        y: 180,
        width: 600,
        height: 480,
        placeholder: "Acquisition funnel",
      },
      createBulletsSlot({
        x: 700,
        y: 180,
        width: 520,
        height: 480,
        placeholder: "Stage 1: Awareness\nStage 2: Interest\nStage 3: Decision\nStage 4: Action",
      }),
    ],
  },
];

// ============================================================================
// COMPETITION SLIDE TEMPLATES
// ============================================================================

const competitionLayouts: SlideLayout[] = [
  {
    id: "competition-quadrant",
    name: "Competitive Quadrant",
    description: "2x2 positioning matrix",
    slots: [
      createHeadlineSlot({ placeholder: "Competitive Landscape" }),
      {
        id: "quadrant",
        type: "chart",
        role: "positioning",
        x: SLIDE_PADDING,
        y: 160,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 500,
        placeholder: "Add competitive positioning chart",
      },
    ],
  },
  {
    id: "competition-table",
    name: "Feature Comparison",
    description: "Feature matrix comparison with competitors",
    slots: [
      createHeadlineSlot({ placeholder: "Why Choose Us" }),
      {
        id: "comparison-table",
        type: "table",
        role: "comparison",
        x: SLIDE_PADDING,
        y: 160,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 500,
        placeholder: "Feature comparison table",
      },
    ],
  },
];

// ============================================================================
// COMPETITIVE ADVANTAGE SLIDE TEMPLATES
// ============================================================================

const competitiveAdvantageLayouts: SlideLayout[] = [
  {
    id: "moat-overview",
    name: "Competitive Moat",
    description: "Key defensibility factors",
    slots: [
      createHeadlineSlot({ placeholder: "Our Competitive Advantage" }),
      createSubheadlineSlot({ placeholder: "What makes us defensible" }),
      createBulletsSlot({
        placeholder: "Moat 1: Proprietary technology\nMoat 2: Network effects\nMoat 3: Switching costs\nMoat 4: Brand and trust",
      }),
    ],
  },
];

// ============================================================================
// ROADMAP SLIDE TEMPLATES
// ============================================================================

const roadmapLayouts: SlideLayout[] = [
  {
    id: "roadmap-timeline",
    name: "Timeline",
    description: "Horizontal timeline with milestones",
    slots: [
      createHeadlineSlot({ placeholder: "Product Roadmap" }),
      {
        id: "q1",
        type: "text",
        role: "milestone",
        x: SLIDE_PADDING,
        y: 200,
        width: 280,
        height: 400,
        placeholder: "Q1 2024\n\n• Milestone 1\n• Milestone 2",
      },
      {
        id: "q2",
        type: "text",
        role: "milestone",
        x: 360,
        y: 200,
        width: 280,
        height: 400,
        placeholder: "Q2 2024\n\n• Milestone 3\n• Milestone 4",
      },
      {
        id: "q3",
        type: "text",
        role: "milestone",
        x: 660,
        y: 200,
        width: 280,
        height: 400,
        placeholder: "Q3 2024\n\n• Milestone 5\n• Milestone 6",
      },
      {
        id: "q4",
        type: "text",
        role: "milestone",
        x: 960,
        y: 200,
        width: 260,
        height: 400,
        placeholder: "Q4 2024\n\n• Milestone 7\n• Milestone 8",
      },
    ],
  },
];

// ============================================================================
// TEAM SLIDE TEMPLATES
// ============================================================================

const teamLayouts: SlideLayout[] = [
  {
    id: "team-grid",
    name: "Team Grid",
    description: "Grid layout for team members",
    slots: [
      createHeadlineSlot({ placeholder: "The Team" }),
      {
        id: "member1",
        type: "image",
        role: "team-photo",
        x: SLIDE_PADDING + 80,
        y: 180,
        width: 200,
        height: 200,
        placeholder: "Photo",
      },
      {
        id: "member1-info",
        type: "text",
        role: "team-info",
        x: SLIDE_PADDING + 30,
        y: 400,
        width: 300,
        height: 200,
        placeholder: "Name\nRole\nCredentials",
      },
      {
        id: "member2",
        type: "image",
        role: "team-photo",
        x: 420,
        y: 180,
        width: 200,
        height: 200,
        placeholder: "Photo",
      },
      {
        id: "member2-info",
        type: "text",
        role: "team-info",
        x: 370,
        y: 400,
        width: 300,
        height: 200,
        placeholder: "Name\nRole\nCredentials",
      },
      {
        id: "member3",
        type: "image",
        role: "team-photo",
        x: 760,
        y: 180,
        width: 200,
        height: 200,
        placeholder: "Photo",
      },
      {
        id: "member3-info",
        type: "text",
        role: "team-info",
        x: 710,
        y: 400,
        width: 300,
        height: 200,
        placeholder: "Name\nRole\nCredentials",
      },
      {
        id: "member4",
        type: "image",
        role: "team-photo",
        x: 1000,
        y: 180,
        width: 200,
        height: 200,
        placeholder: "Photo",
      },
      {
        id: "member4-info",
        type: "text",
        role: "team-info",
        x: 950,
        y: 400,
        width: 300,
        height: 200,
        placeholder: "Name\nRole\nCredentials",
      },
    ],
  },
  {
    id: "team-bios",
    name: "Team Bios",
    description: "Detailed team member bios",
    slots: [
      createHeadlineSlot({ placeholder: "Leadership Team" }),
      {
        id: "bio1-photo",
        type: "image",
        role: "team-photo",
        x: SLIDE_PADDING,
        y: 180,
        width: 160,
        height: 160,
        placeholder: "Photo",
      },
      {
        id: "bio1-text",
        type: "text",
        role: "bio",
        x: 250,
        y: 180,
        width: 340,
        height: 200,
        placeholder: "Name, Role\n\nBio text with relevant experience and credentials.",
      },
      {
        id: "bio2-photo",
        type: "image",
        role: "team-photo",
        x: 680,
        y: 180,
        width: 160,
        height: 160,
        placeholder: "Photo",
      },
      {
        id: "bio2-text",
        type: "text",
        role: "bio",
        x: 870,
        y: 180,
        width: 350,
        height: 200,
        placeholder: "Name, Role\n\nBio text with relevant experience and credentials.",
      },
      {
        id: "advisors",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 480,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 180,
        placeholder: "Advisors: Notable advisor names and affiliations",
      },
    ],
  },
];

// ============================================================================
// ASK SLIDE TEMPLATES
// ============================================================================

const askLayouts: SlideLayout[] = [
  {
    id: "ask-funding",
    name: "Funding Ask",
    description: "Clear funding request with use of funds",
    slots: [
      createHeadlineSlot({ placeholder: "The Ask" }),
      {
        id: "amount",
        type: "metric",
        role: "primary-metric",
        x: SLIDE_WIDTH / 2 - 200,
        y: 160,
        width: 400,
        height: 140,
        placeholder: "Raising $X",
      },
      {
        id: "round-type",
        type: "text",
        role: "label",
        x: SLIDE_WIDTH / 2 - 200,
        y: 310,
        width: 400,
        height: 40,
        defaultStyle: { fontSize: 24, textAlign: "center" },
        placeholder: "Seed Round",
      },
      {
        id: "use-of-funds",
        type: "bullet-list",
        role: "bullets",
        x: SLIDE_PADDING,
        y: 380,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 260,
        placeholder: "40% Product & Engineering\n30% Sales & Marketing\n20% Operations\n10% Reserve",
      },
    ],
  },
  {
    id: "ask-detailed",
    name: "Detailed Ask",
    description: "Funding with milestones and contact",
    slots: [
      createHeadlineSlot({ placeholder: "Investment Opportunity" }),
      {
        id: "amount",
        type: "metric",
        role: "primary-metric",
        x: SLIDE_PADDING,
        y: 160,
        width: 360,
        height: 180,
        placeholder: "Raising $X",
      },
      {
        id: "milestones",
        type: "bullet-list",
        role: "bullets",
        x: 460,
        y: 160,
        width: 760,
        height: 200,
        placeholder: "With this raise we will:\n• Milestone 1\n• Milestone 2\n• Milestone 3",
      },
      {
        id: "use-chart",
        type: "chart",
        role: "visualization",
        x: SLIDE_PADDING,
        y: 380,
        width: 500,
        height: 280,
        placeholder: "Use of funds pie chart",
      },
      {
        id: "contact",
        type: "text",
        role: "contact",
        x: 580,
        y: 420,
        width: 640,
        height: 200,
        defaultStyle: { fontSize: 20 },
        placeholder: "Contact:\nfounder@company.com\nwww.company.com",
      },
    ],
  },
];

// ============================================================================
// APPENDIX/CUSTOM SLIDE TEMPLATES
// ============================================================================

const appendixLayouts: SlideLayout[] = [
  {
    id: "appendix-general",
    name: "General",
    description: "Flexible layout for additional content",
    slots: [
      createHeadlineSlot({ placeholder: "Appendix" }),
      createSubheadlineSlot(),
      {
        id: "content",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 240,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 420,
        placeholder: "Additional content...",
      },
    ],
  },
];

const customLayouts: SlideLayout[] = [
  {
    id: "custom-blank",
    name: "Blank",
    description: "Empty canvas for custom content",
    slots: [],
  },
  {
    id: "custom-text-only",
    name: "Text Only",
    description: "Simple text layout",
    slots: [
      createHeadlineSlot(),
      {
        id: "body",
        type: "text",
        role: "body",
        x: SLIDE_PADDING,
        y: 180,
        width: SLIDE_WIDTH - SLIDE_PADDING * 2,
        height: 480,
        placeholder: "Your content here...",
      },
    ],
  },
];

// ============================================================================
// COMPLETE TEMPLATE DEFINITIONS
// ============================================================================

export const SLIDE_TEMPLATES: SlideTypeTemplate[] = [
  {
    slideType: "title",
    displayName: "Title",
    description: "Opening slide with company name and tagline",
    icon: "Presentation",
    layouts: titleLayouts,
    defaultLayoutId: "title-centered",
    guidelines: [
      "Keep the title concise and memorable",
      "Tagline should capture your value proposition in one line",
      "Include your logo for brand recognition",
    ],
    checklist: [
      "Company name is clear and prominent",
      "Tagline is compelling and specific",
      "Contact info or date is included",
    ],
  },
  {
    slideType: "problem",
    displayName: "Problem",
    description: "Define the problem you're solving",
    icon: "AlertCircle",
    layouts: problemLayouts,
    defaultLayoutId: "problem-bullets",
    guidelines: [
      "Limit to 1-3 concise pain points",
      "Be specific about who experiences this problem",
      "Quantify the impact when possible (cost, time, scale)",
      "Make it relatable and emotionally resonant",
    ],
    checklist: [
      "Problem is clearly articulated",
      "Impact is quantified with metrics",
      "Target audience is identified",
      "Pain is compelling and urgent",
    ],
  },
  {
    slideType: "solution",
    displayName: "Solution",
    description: "How your product solves the problem",
    icon: "Lightbulb",
    layouts: solutionLayouts,
    defaultLayoutId: "solution-overview",
    guidelines: [
      "Connect directly to the problems stated",
      "Focus on benefits, not just features",
      "Keep it simple - save details for product slide",
      "Use visuals to demonstrate the solution",
    ],
    checklist: [
      "Solution directly addresses stated problems",
      "Benefits are clear and compelling",
      "Unique approach is evident",
      "Visual representation included",
    ],
  },
  {
    slideType: "market",
    displayName: "Market Opportunity",
    description: "Market size and growth potential",
    icon: "TrendingUp",
    layouts: marketLayouts,
    defaultLayoutId: "market-tam-sam-som",
    guidelines: [
      "Use TAM/SAM/SOM framework",
      "Cite credible sources for market data",
      "Show market growth trajectory",
      "Explain your beachhead market strategy",
    ],
    checklist: [
      "TAM, SAM, SOM are defined",
      "Data sources are credible",
      "Growth rate is mentioned",
      "Entry strategy is clear",
    ],
  },
  {
    slideType: "business-model",
    displayName: "Business Model",
    description: "How you make money",
    icon: "DollarSign",
    layouts: businessModelLayouts,
    defaultLayoutId: "business-model-streams",
    guidelines: [
      "Clearly explain revenue streams",
      "Show unit economics if available",
      "Include pricing model",
      "Demonstrate path to profitability",
    ],
    checklist: [
      "Revenue model is clear",
      "Pricing is explained",
      "Unit economics shown (if available)",
      "Scalability is evident",
    ],
  },
  {
    slideType: "traction",
    displayName: "Traction",
    description: "Proof of progress and momentum",
    icon: "Rocket",
    layouts: tractionLayouts,
    defaultLayoutId: "traction-metrics",
    guidelines: [
      "Lead with your strongest metrics",
      "Show growth over time when possible",
      "Include both quantitative and qualitative proof",
      "Be honest - investors will verify",
    ],
    checklist: [
      "Key metrics are highlighted",
      "Growth trajectory shown",
      "Milestones listed",
      "Numbers are accurate and verifiable",
    ],
  },
  {
    slideType: "go-to-market",
    displayName: "Go-To-Market",
    description: "How you'll acquire customers",
    icon: "Target",
    layouts: goToMarketLayouts,
    defaultLayoutId: "gtm-strategy",
    guidelines: [
      "Define your primary customer acquisition channels",
      "Show CAC if you have data",
      "Explain your sales motion (self-serve, sales-led, etc.)",
      "Include partnership strategy if relevant",
    ],
    checklist: [
      "Channels are identified",
      "Strategy is specific and actionable",
      "CAC considerations mentioned",
      "Timeline or phases outlined",
    ],
  },
  {
    slideType: "competition",
    displayName: "Competition",
    description: "Competitive landscape analysis",
    icon: "Users",
    layouts: competitionLayouts,
    defaultLayoutId: "competition-quadrant",
    guidelines: [
      "Acknowledge competitors honestly",
      "Position yourself favorably but fairly",
      "Focus on differentiation, not criticism",
      "Include indirect competitors and alternatives",
    ],
    checklist: [
      "Key competitors identified",
      "Differentiation is clear",
      "Positioning is credible",
      "Alternatives considered",
    ],
  },
  {
    slideType: "competitive-advantage",
    displayName: "Competitive Advantage",
    description: "Your defensibility and moat",
    icon: "Shield",
    layouts: competitiveAdvantageLayouts,
    defaultLayoutId: "moat-overview",
    guidelines: [
      "Explain what makes you hard to replicate",
      "Identify sources of sustainable advantage",
      "Be realistic about defensibility",
      "Show how advantage compounds over time",
    ],
    checklist: [
      "Moat is clearly defined",
      "Defensibility is credible",
      "Advantage is sustainable",
      "Growth strengthens position",
    ],
  },
  {
    slideType: "roadmap",
    displayName: "Roadmap",
    description: "Product and company milestones",
    icon: "Map",
    layouts: roadmapLayouts,
    defaultLayoutId: "roadmap-timeline",
    guidelines: [
      "Show 12-18 month horizon",
      "Balance ambition with realism",
      "Highlight key product and business milestones",
      "Connect roadmap to funding needs",
    ],
    checklist: [
      "Timeline is realistic",
      "Milestones are specific",
      "Dependencies considered",
      "Connects to funding ask",
    ],
  },
  {
    slideType: "team",
    displayName: "Team",
    description: "Founders and key team members",
    icon: "Users",
    layouts: teamLayouts,
    defaultLayoutId: "team-grid",
    guidelines: [
      "Highlight relevant experience and achievements",
      "Show why this team is uniquely positioned",
      "Include notable advisors",
      "Keep bios concise but impactful",
    ],
    checklist: [
      "Key roles are filled",
      "Experience is relevant",
      "Track record shown",
      "Photos are professional",
    ],
  },
  {
    slideType: "ask",
    displayName: "The Ask",
    description: "Funding request and use of funds",
    icon: "HandCoins",
    layouts: askLayouts,
    defaultLayoutId: "ask-funding",
    guidelines: [
      "State the exact amount you're raising",
      "Specify the round type and terms if known",
      "Break down use of funds clearly",
      "Show what milestones this funding enables",
    ],
    checklist: [
      "Amount is specific",
      "Round type stated",
      "Use of funds clear",
      "Milestones defined",
      "Contact information included",
    ],
  },
  {
    slideType: "appendix",
    displayName: "Appendix",
    description: "Additional supporting content",
    icon: "FileText",
    layouts: appendixLayouts,
    defaultLayoutId: "appendix-general",
    guidelines: [
      "Include detailed data that supports main slides",
      "Technical deep-dives when needed",
      "Additional team member bios",
      "Financial projections and assumptions",
    ],
    checklist: [],
  },
  {
    slideType: "custom",
    displayName: "Custom",
    description: "Blank canvas for custom content",
    icon: "Plus",
    layouts: customLayouts,
    defaultLayoutId: "custom-blank",
    guidelines: ["Use for content that doesn't fit other templates"],
    checklist: [],
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get template for a slide type
 */
export function getSlideTemplate(slideType: SlideType): SlideTypeTemplate | undefined {
  return SLIDE_TEMPLATES.find((t) => t.slideType === slideType);
}

/**
 * Get a specific layout within a slide type
 */
export function getSlideLayout(slideType: SlideType, layoutId: string): SlideLayout | undefined {
  const template = getSlideTemplate(slideType);
  return template?.layouts.find((l) => l.id === layoutId);
}

/**
 * Get default layout for a slide type
 */
export function getDefaultLayout(slideType: SlideType): SlideLayout | undefined {
  const template = getSlideTemplate(slideType);
  if (!template) return undefined;
  return template.layouts.find((l) => l.id === template.defaultLayoutId) || template.layouts[0];
}

/**
 * Get all slide types in recommended order
 */
export function getRecommendedSlideOrder(): SlideType[] {
  return [
    "title",
    "problem",
    "solution",
    "product",
    "market",
    "business-model",
    "traction",
    "go-to-market",
    "competition",
    "competitive-advantage",
    "roadmap",
    "team",
    "ask",
  ];
}

/**
 * Get essential slides for a deck style
 */
export function getEssentialSlides(deckStyle: string): SlideType[] {
  switch (deckStyle) {
    case "pre-seed":
      return ["title", "problem", "solution", "market", "team", "ask"];
    case "seed":
      return [
        "title", "problem", "solution", "market", "business-model", 
        "traction", "team", "ask"
      ];
    case "series-a":
      return [
        "title", "problem", "solution", "market", "business-model",
        "traction", "go-to-market", "competition", "team", "ask"
      ];
    case "demo-day":
      return ["title", "problem", "solution", "traction", "ask"];
    default:
      return getRecommendedSlideOrder();
  }
}
