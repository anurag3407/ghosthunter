/**
 * ============================================================================
 * PITCH DECK STUDIO - AI GENERATOR
 * ============================================================================
 * Enhanced AI-powered deck generation using LangChain.
 * Generates investor-grade content with structure detection and gap analysis.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import type {
  Deck,
  Slide,
  SlideElement,
  SlideType,
  SlideWarning,
  DeckStyle,
  ContentTone,
  StartupProfile,
  GenerateDeckRequest,
  GenerateDeckResponse,
  TextElement,
  BulletListElement,
  MetricElement,
  TextStyle,
} from "@/types/pitch-deck";

import { getSlideTemplate, getDefaultLayout, getEssentialSlides, SLIDE_WIDTH, SLIDE_HEIGHT } from "./templates";
import { getDefaultTheme } from "./themes";

const LOG_PREFIX = "[PitchDeck:AIGenerator]";

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

const slideContentSchema = z.object({
  type: z.enum([
    "title", "vision", "problem", "solution", "product", "market",
    "business-model", "traction", "go-to-market", "competition",
    "competitive-advantage", "roadmap", "team", "ask", "appendix", "custom"
  ]),
  headline: z.string().describe("Main title for the slide, max 10 words"),
  subheadline: z.string().optional().describe("Supporting subtitle, max 25 words"),
  bullets: z.array(z.string()).optional().describe("Key points, 3-5 items, each max 20 words"),
  bodyText: z.string().optional().describe("Paragraph content if needed"),
  metrics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  })).optional().describe("Key metrics/numbers to highlight"),
  placeholders: z.array(z.string()).optional().describe("Content that needs user input"),
  warnings: z.array(z.string()).optional().describe("Issues with content quality"),
  suggestions: z.array(z.string()).optional().describe("Improvement recommendations"),
  contentScore: z.number().min(0).max(100).describe("Quality score for this slide"),
});

const deckGenerationSchema = z.object({
  projectName: z.string(),
  tagline: z.string(),
  slides: z.array(slideContentSchema),
  missingSlides: z.array(z.string()).describe("Important slides that couldn't be generated from source"),
  globalSuggestions: z.array(z.string()).describe("Overall deck improvement suggestions"),
  overallScore: z.number().min(0).max(100).describe("Overall deck quality score"),
});

type DeckGenerationOutput = z.infer<typeof deckGenerationSchema>;

const parser = StructuredOutputParser.fromZodSchema(deckGenerationSchema);

// ============================================================================
// PROMPTS
// ============================================================================

const DECK_GENERATION_PROMPT = `You are an expert pitch deck creator and startup advisor. Your task is to create a compelling, investor-grade pitch deck.

## Source Information

### README / Product Description:
{readme}

### Startup Profile (if provided):
{profile}

### GitHub Metadata (if available):
{githubMeta}

## Deck Configuration
- Deck Style: {deckStyle}
- Content Tone: {tone}
- Essential Slides for this style: {essentialSlides}

## Your Task

Create a pitch deck with the following structure. For each slide:
1. Write compelling content that would impress investors
2. Be specific - avoid generic statements
3. Use data from the source when available
4. Flag missing information as placeholders
5. Provide a quality score (0-100)

### Slide Types to Generate (in order):
1. **Title**: Company name and compelling tagline
2. **Problem**: 1-3 specific pain points with quantified impact
3. **Solution**: Clear explanation connecting to the problem
4. **Product** (optional): Key features and capabilities
5. **Market**: TAM/SAM/SOM with credible sizing
6. **Business Model**: Revenue streams and pricing
7. **Traction**: Key metrics, growth, milestones (if available)
8. **Go-To-Market**: Customer acquisition strategy
9. **Competition**: Competitive positioning
10. **Competitive Advantage**: Defensibility and moat
11. **Roadmap**: Key milestones for next 12-18 months
12. **Team**: Founders and key members (if mentioned)
13. **Ask**: Funding amount and use of funds

## Guidelines for {tone} tone:
{toneGuidelines}

## Important Rules:
- Skip slides that have no source information (except essential ones)
- For essential slides with missing info, create placeholders clearly marked with [PLACEHOLDER]
- Be honest in warnings about weak content
- Suggest specific improvements
- Use metrics and data whenever possible
- Keep headlines under 10 words
- Keep bullets under 20 words each
- For {deckStyle} decks, prioritize: {priorities}

{format_instructions}`;

const TONE_GUIDELINES: Record<ContentTone, string> = {
  concise: `
- Use short, punchy statements
- Lead with impact, then explain
- Minimize filler words
- Every word should earn its place`,
  storytelling: `
- Frame problems as relatable stories
- Use narrative arc (situation → complication → resolution)
- Include emotional hooks
- Make the reader feel the problem`,
  technical: `
- Include technical details and architecture
- Mention specific technologies and methodologies
- Provide implementation specifics
- Appeal to technical evaluators`,
  investor: `
- Lead with market opportunity and returns
- Emphasize unit economics
- Focus on scalability and defensibility
- Use investor-friendly metrics (ARR, LTV/CAC, etc.)`,
};

const STYLE_PRIORITIES: Record<DeckStyle, string> = {
  "pre-seed": "Problem clarity, solution vision, team credibility, market potential",
  "seed": "Traction signals, market validation, business model viability, team",
  "series-a": "Proven metrics, scalability, unit economics, clear path to profitability",
  "series-b": "Growth metrics, market leadership, expansion strategy, profitability path",
  "enterprise-sales": "ROI for customers, case studies, security/compliance, implementation",
  "demo-day": "Hook, problem urgency, demo-worthy solution, memorable ask",
  "custom": "Balanced coverage across all key areas",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatProfile(profile?: Partial<StartupProfile>): string {
  if (!profile) return "Not provided";
  
  const sections: string[] = [];
  
  if (profile.companyName) sections.push(`Company: ${profile.companyName}`);
  if (profile.oneLiner) sections.push(`One-liner: ${profile.oneLiner}`);
  if (profile.targetCustomer) sections.push(`Target Customer: ${profile.targetCustomer}`);
  if (profile.problemStatement) sections.push(`Problem: ${profile.problemStatement}`);
  if (profile.solutionDescription) sections.push(`Solution: ${profile.solutionDescription}`);
  
  if (profile.metrics) {
    const m = profile.metrics;
    const metricLines: string[] = [];
    if (m.users) metricLines.push(`Users: ${m.users}`);
    if (m.mrr) metricLines.push(`MRR: $${m.mrr}`);
    if (m.arr) metricLines.push(`ARR: $${m.arr}`);
    if (m.growth) metricLines.push(`Growth: ${m.growth}`);
    if (m.retention) metricLines.push(`Retention: ${m.retention}`);
    if (metricLines.length) sections.push(`Metrics:\n${metricLines.join("\n")}`);
  }
  
  if (profile.marketSize) {
    const ms = profile.marketSize;
    if (ms.tam || ms.sam || ms.som) {
      sections.push(`Market Size: TAM ${ms.tam || "?"}, SAM ${ms.sam || "?"}, SOM ${ms.som || "?"}`);
    }
  }
  
  if (profile.competitors?.length) {
    sections.push(`Competitors: ${profile.competitors.join(", ")}`);
  }
  
  if (profile.competitiveAdvantage) {
    sections.push(`Competitive Advantage: ${profile.competitiveAdvantage}`);
  }
  
  if (profile.team?.length) {
    sections.push(`Team: ${profile.team.map(t => `${t.name} (${t.role})`).join(", ")}`);
  }
  
  if (profile.fundingAsk) {
    sections.push(`Funding Ask: ${profile.fundingAsk.amount} (${profile.fundingAsk.type})`);
    if (profile.fundingAsk.useOfFunds?.length) {
      sections.push(`Use of Funds: ${profile.fundingAsk.useOfFunds.join(", ")}`);
    }
  }
  
  return sections.length ? sections.join("\n\n") : "Not provided";
}

function formatGithubMeta(meta?: { stars?: number; forks?: number; contributors?: number }): string {
  if (!meta) return "Not available";
  
  const lines: string[] = [];
  if (meta.stars) lines.push(`Stars: ${meta.stars}`);
  if (meta.forks) lines.push(`Forks: ${meta.forks}`);
  if (meta.contributors) lines.push(`Contributors: ${meta.contributors}`);
  
  return lines.length ? lines.join(", ") : "Not available";
}

function createDefaultTextStyle(): TextStyle {
  return {
    fontSize: 24,
    fontWeight: 400,
    fontStyle: "normal",
    textDecoration: "none",
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: "left",
    verticalAlign: "top",
    color: "var(--deck-text-primary)",
  };
}

function createSlideFromContent(
  content: z.infer<typeof slideContentSchema>,
  order: number
): Slide {
  const slideId = uuidv4();
  const slideType = content.type as SlideType;
  const layout = getDefaultLayout(slideType);
  const layoutId = layout?.id || `${slideType}-default`;
  
  const elements: SlideElement[] = [];
  let elementOrder = 0;
  
  // Create headline element
  if (content.headline) {
    elements.push({
      id: uuidv4(),
      type: "heading",
      x: 60,
      y: 80,
      width: SLIDE_WIDTH - 120,
      height: 80,
      rotation: 0,
      zIndex: elementOrder++,
      opacity: 1,
      locked: false,
      visible: true,
      content: content.headline,
      style: {
        ...createDefaultTextStyle(),
        fontSize: 48,
        fontWeight: 700,
        textAlign: "left",
      },
    } as TextElement);
  }
  
  // Create subheadline element
  if (content.subheadline) {
    elements.push({
      id: uuidv4(),
      type: "text",
      x: 60,
      y: 170,
      width: SLIDE_WIDTH - 120,
      height: 50,
      rotation: 0,
      zIndex: elementOrder++,
      opacity: 1,
      locked: false,
      visible: true,
      content: content.subheadline,
      style: {
        ...createDefaultTextStyle(),
        fontSize: 24,
        fontWeight: 400,
        color: "var(--deck-text-secondary)",
      },
    } as TextElement);
  }
  
  // Create bullets element
  if (content.bullets?.length) {
    elements.push({
      id: uuidv4(),
      type: "bullet-list",
      x: 60,
      y: 240,
      width: SLIDE_WIDTH - 120,
      height: 380,
      rotation: 0,
      zIndex: elementOrder++,
      opacity: 1,
      locked: false,
      visible: true,
      items: content.bullets,
      bulletStyle: "disc",
      style: {
        ...createDefaultTextStyle(),
        fontSize: 22,
      },
      itemSpacing: 16,
    } as BulletListElement);
  }
  
  // Create body text element
  if (content.bodyText && !content.bullets?.length) {
    elements.push({
      id: uuidv4(),
      type: "text",
      x: 60,
      y: 240,
      width: SLIDE_WIDTH - 120,
      height: 380,
      rotation: 0,
      zIndex: elementOrder++,
      opacity: 1,
      locked: false,
      visible: true,
      content: content.bodyText,
      style: {
        ...createDefaultTextStyle(),
        fontSize: 22,
        lineHeight: 1.6,
      },
    } as TextElement);
  }
  
  // Create metric elements
  if (content.metrics?.length) {
    const metricWidth = Math.min(300, (SLIDE_WIDTH - 120 - (content.metrics.length - 1) * 40) / content.metrics.length);
    content.metrics.forEach((metric, index) => {
      elements.push({
        id: uuidv4(),
        type: "metric",
        x: 60 + index * (metricWidth + 40),
        y: content.bullets?.length ? 500 : 300,
        width: metricWidth,
        height: 140,
        rotation: 0,
        zIndex: elementOrder++,
        opacity: 1,
        locked: false,
        visible: true,
        value: metric.value,
        label: metric.label,
        prefix: metric.prefix,
        suffix: metric.suffix,
        valueStyle: {
          ...createDefaultTextStyle(),
          fontSize: 48,
          fontWeight: 700,
          textAlign: "center",
        },
        labelStyle: {
          ...createDefaultTextStyle(),
          fontSize: 16,
          textAlign: "center",
          color: "var(--deck-text-secondary)",
        },
      } as MetricElement);
    });
  }
  
  // Create warnings
  const warnings: SlideWarning[] = [];
  
  content.warnings?.forEach((warning, index) => {
    warnings.push({
      id: `warn-${slideId}-${index}`,
      type: "weak",
      severity: "warning",
      message: warning,
    });
  });
  
  content.placeholders?.forEach((placeholder, index) => {
    warnings.push({
      id: `placeholder-${slideId}-${index}`,
      type: "missing",
      severity: "info",
      message: placeholder,
      suggestion: "Add this information to strengthen your deck",
    });
  });
  
  const slide: Slide = {
    id: slideId,
    type: slideType,
    layoutId,
    elements,
    order,
    hidden: false,
    aiGenerated: true,
    contentScore: content.contentScore,
    warnings,
  };
  
  // Only add notes if there are suggestions
  if (content.suggestions?.length) {
    slide.notes = {
      content: "",
      aiSuggestions: content.suggestions,
    };
  }
  
  return slide;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export async function generateDeckFromSources(
  request: GenerateDeckRequest
): Promise<GenerateDeckResponse> {
  const genId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${genId}] Starting enhanced deck generation`);
  console.log(`${LOG_PREFIX} [${genId}] Style: ${request.style}, Tone: ${request.tone}`);
  
  // Validate API key
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }
  
  // Initialize model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.7,
  });
  
  // Prepare prompt
  const essentialSlides = getEssentialSlides(request.style);
  
  const promptTemplate = new PromptTemplate({
    template: DECK_GENERATION_PROMPT,
    inputVariables: [
      "readme", "profile", "githubMeta", "deckStyle", 
      "tone", "essentialSlides", "toneGuidelines", "priorities"
    ],
    partialVariables: {
      format_instructions: parser.getFormatInstructions(),
    },
  });
  
  const formattedPrompt = await promptTemplate.format({
    readme: request.readme || "No README provided",
    profile: formatProfile(request.profile),
    githubMeta: formatGithubMeta(request.profile as unknown as { stars?: number; forks?: number; contributors?: number }),
    deckStyle: request.style,
    tone: request.tone,
    essentialSlides: essentialSlides.join(", "),
    toneGuidelines: TONE_GUIDELINES[request.tone],
    priorities: STYLE_PRIORITIES[request.style],
  });
  
  console.log(`${LOG_PREFIX} [${genId}] Prompt prepared, invoking AI...`);
  
  // Invoke AI
  const response = await model.invoke(formattedPrompt);
  const content = response.content as string;
  
  console.log(`${LOG_PREFIX} [${genId}] AI response received, parsing...`);
  
  // Parse response
  let parsedOutput: DeckGenerationOutput;
  
  try {
    parsedOutput = await parser.parse(content);
  } catch {
    console.warn(`${LOG_PREFIX} [${genId}] Structured parsing failed, trying JSON extraction`);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedOutput = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response");
    }
  }
  
  console.log(`${LOG_PREFIX} [${genId}] Parsed ${parsedOutput.slides.length} slides`);
  
  // Build deck
  const deckId = uuidv4();
  const defaultTheme = getDefaultTheme();
  
  const slides: Slide[] = parsedOutput.slides.map((slideContent, index) => 
    createSlideFromContent(slideContent, index)
  );
  
  const deck: Deck = {
    id: deckId,
    userId: "", // Will be set by API route
    projectName: parsedOutput.projectName,
    tagline: parsedOutput.tagline,
    slides,
    themeId: request.themeId || defaultTheme.id,
    style: request.style,
    defaultTone: request.tone,
    sourceData: {
      readme: request.readme,
      profile: request.profile as StartupProfile,
    },
    status: "draft",
    healthScore: parsedOutput.overallScore,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    repoUrl: request.repoUrl,
    repoName: request.repoName,
    repoOwner: request.repoOwner,
  };
  
  // Collect all warnings
  const allWarnings: SlideWarning[] = [];
  slides.forEach(slide => {
    if (slide.warnings) {
      allWarnings.push(...slide.warnings);
    }
  });
  
  // Add missing slides warnings
  parsedOutput.missingSlides.forEach((slideType, index) => {
    allWarnings.push({
      id: `missing-${index}`,
      type: "missing",
      severity: "warning",
      message: `Missing ${slideType} slide`,
      suggestion: `Add a ${slideType} slide to strengthen your pitch`,
    });
  });
  
  const duration = Date.now() - startTime;
  console.log(`${LOG_PREFIX} [${genId}] Generation completed in ${duration}ms`);
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  
  return {
    deck,
    warnings: allWarnings,
    suggestions: parsedOutput.globalSuggestions,
    healthScore: parsedOutput.overallScore,
  };
}

// ============================================================================
// TEXT IMPROVEMENT
// ============================================================================

const TEXT_IMPROVEMENT_PROMPT = `You are an expert copywriter for investor pitch decks.

## Context
- Slide Type: {slideType}
- Deck Context: {deckContext}
- Current Text: {text}
- Action: {action}

## Task
Improve the text based on the action requested:
- "punchier": Make it more impactful and memorable, use strong verbs
- "formal": Make it more professional and business-appropriate
- "shorter": Condense while keeping key points
- "longer": Expand with more detail and context
- "simplify": Use simpler language, remove jargon
- "elaborate": Add supporting details and examples

## Rules
- Keep it appropriate for investors
- Maintain accuracy to the original meaning
- For pitch decks, clarity and impact are key
- Return ONLY the improved text, no explanations`;

export async function improveText(
  text: string,
  slideType: SlideType,
  action: "punchier" | "formal" | "shorter" | "longer" | "simplify" | "elaborate",
  deckContext?: { projectName: string; tagline: string; tone: ContentTone }
): Promise<string> {
  console.log(`${LOG_PREFIX} Improving text: action=${action}, slideType=${slideType}`);
  
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.7,
  });
  
  const promptTemplate = new PromptTemplate({
    template: TEXT_IMPROVEMENT_PROMPT,
    inputVariables: ["slideType", "deckContext", "text", "action"],
  });
  
  const formattedPrompt = await promptTemplate.format({
    slideType,
    deckContext: deckContext 
      ? `Project: ${deckContext.projectName}, Tagline: ${deckContext.tagline}, Tone: ${deckContext.tone}`
      : "General pitch deck",
    text,
    action,
  });
  
  const response = await model.invoke(formattedPrompt);
  const improvedText = (response.content as string).trim();
  
  // Clean up any markdown formatting
  return improvedText
    .replace(/^["']|["']$/g, "")
    .replace(/^\*\*|\*\*$/g, "")
    .trim();
}

// ============================================================================
// DECK HEALTH CHECK
// ============================================================================

const HEALTH_CHECK_PROMPT = `You are an expert pitch deck reviewer with VC experience.

## Deck to Review
Project: {projectName}
Tagline: {tagline}

Slides:
{slidesJson}

## Startup Profile (if available):
{profile}

## Task
Analyze this pitch deck and provide a comprehensive health check.

For each slide, evaluate:
1. Content Quality (is it specific, compelling, well-written?)
2. Completeness (is key information present?)
3. Investor Readiness (would an investor find this convincing?)

For the overall deck:
1. Story Flow (does it build a compelling narrative?)
2. Consistency (are claims aligned throughout?)
3. Missing Elements (what's not there that should be?)

Provide scores and actionable suggestions.

Return a JSON object with:
- overallScore: 0-100
- categoryScores: { completeness, clarity, persuasiveness, consistency, visualBalance }
- slideScores: array of { slideId, slideType, score, warnings, suggestions }
- globalWarnings: array of warning messages
- suggestions: array of improvement recommendations
- missingSlides: array of slide types that should be added
- strongPoints: array of things done well`;

interface HealthCheckResult {
  overallScore: number;
  categoryScores: {
    completeness: number;
    clarity: number;
    persuasiveness: number;
    consistency: number;
    visualBalance: number;
  };
  slideScores: Array<{
    slideId: string;
    slideType: string;
    score: number;
    warnings: string[];
    suggestions: string[];
  }>;
  globalWarnings: string[];
  suggestions: string[];
  missingSlides: string[];
  strongPoints: string[];
}

export async function checkDeckHealth(
  deck: Deck,
  profile?: StartupProfile
): Promise<HealthCheckResult> {
  console.log(`${LOG_PREFIX} Running health check for deck: ${deck.id}`);
  
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.3, // Lower for more consistent analysis
  });
  
  // Prepare slides summary for the AI
  const slidesSummary = deck.slides.map(slide => {
    const textContent = slide.elements
      .filter(el => el.type === "text" || el.type === "heading" || el.type === "bullet-list")
      .map(el => {
        if (el.type === "bullet-list") {
          return (el as BulletListElement).items.join("\n• ");
        }
        return (el as TextElement).content;
      })
      .join("\n");
    
    return {
      id: slide.id,
      type: slide.type,
      content: textContent || "[No text content]",
    };
  });
  
  const promptTemplate = new PromptTemplate({
    template: HEALTH_CHECK_PROMPT,
    inputVariables: ["projectName", "tagline", "slidesJson", "profile"],
  });
  
  const formattedPrompt = await promptTemplate.format({
    projectName: deck.projectName,
    tagline: deck.tagline,
    slidesJson: JSON.stringify(slidesSummary, null, 2),
    profile: formatProfile(profile),
  });
  
  const response = await model.invoke(formattedPrompt);
  const content = response.content as string;
  
  // Parse response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse health check response");
  }
  
  const result: HealthCheckResult = JSON.parse(jsonMatch[0]);
  
  console.log(`${LOG_PREFIX} Health check complete: score=${result.overallScore}`);
  
  return result;
}
