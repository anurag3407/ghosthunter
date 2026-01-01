import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const LOG_PREFIX = "[PitchDeck:Generator]";

/**
 * Slide Types
 */
export type SlideType =
  | "title"
  | "problem"
  | "solution"
  | "features"
  | "market"
  | "business-model"
  | "traction"
  | "team"
  | "cta";

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string | null;
  bullets?: string[] | null;
  content?: string | null;
  order: number;
}

// Define the output schema for the pitch deck
const slideOutputSchema = z.object({
  type: z.enum([
    "title",
    "problem",
    "solution",
    "features",
    "market",
    "business-model",
    "traction",
    "team",
    "cta",
  ]),
  title: z.string(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  content: z.string().optional(),
});

const pitchDeckOutputSchema = z.object({
  projectName: z.string(),
  tagline: z.string(),
  slides: z.array(slideOutputSchema),
});

type PitchDeckOutput = z.infer<typeof pitchDeckOutputSchema>;

const parser = StructuredOutputParser.fromZodSchema(pitchDeckOutputSchema);

const PITCH_DECK_PROMPT = `You are an expert pitch deck creator. Analyze the following README content and create a compelling pitch deck for investors or stakeholders.

README Content:
{readme}

{additionalInstructions}

Create a pitch deck with the following slides in order:
1. Title Slide - Project name and compelling tagline
2. Problem Slide - What problem does this solve?
3. Solution Slide - How does this project solve the problem?
4. Features Slide - Key features and capabilities (use bullet points)
5. Market Slide - Target market and opportunity
6. Business Model Slide - How it creates or could create value (if applicable, otherwise skip)
7. Traction Slide - Any achievements, stats, or progress (if mentioned, otherwise skip)
8. Team Slide - Team info (if mentioned, otherwise skip)
9. CTA Slide - Call to action (try it, star on GitHub, etc.)

For each slide:
- Title should be concise and impactful (max 10 words)
- Subtitle provides context (max 20 words)
- Bullets should be clear and specific (3-5 bullets, each max 15 words)
- Content is for additional narrative if needed

{format_instructions}

Important: 
- Be specific, avoid generic statements
- Use data from the README when available
- Make it compelling and professional
- Skip slides that don't have enough information (but always include Title, Problem, Solution, Features, and CTA)
`;

const promptTemplate = new PromptTemplate({
  template: PITCH_DECK_PROMPT,
  inputVariables: ["readme", "additionalInstructions"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

/**
 * Generate a pitch deck from README content using AI
 */
export async function generatePitchDeck(
  readme: string,
  additionalInstructions?: string
): Promise<{ projectName: string; tagline: string; slides: Slide[] }> {
  const genId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${genId}] Starting pitch deck generation`);
  console.log(`${LOG_PREFIX} [${genId}] Input README length: ${readme.length} characters`);
  console.log(`${LOG_PREFIX} [${genId}] Additional instructions: ${additionalInstructions ? `"${additionalInstructions.substring(0, 100)}..."` : "none"}`);
  
  // Initialize model
  console.log(`${LOG_PREFIX} [${genId}] Initializing Gemini model...`);
  console.log(`${LOG_PREFIX} [${genId}]   - Model: gemini-2.0-flash`);
  console.log(`${LOG_PREFIX} [${genId}]   - Temperature: 0.7`);
  console.log(`${LOG_PREFIX} [${genId}]   - API Key: ${process.env.GOOGLE_AI_API_KEY ? "configured (hidden)" : "NOT SET"}`);
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_AI_API_KEY,
    temperature: 0.7,
  });
  console.log(`${LOG_PREFIX} [${genId}] ✓ Model initialized`);

  // Format prompt
  console.log(`${LOG_PREFIX} [${genId}] Formatting prompt template...`);
  const promptStartTime = Date.now();
  
  const formattedPrompt = await promptTemplate.format({
    readme,
    additionalInstructions: additionalInstructions
      ? `Additional Instructions: ${additionalInstructions}`
      : "",
  });
  
  const promptDuration = Date.now() - promptStartTime;
  console.log(`${LOG_PREFIX} [${genId}] ✓ Prompt formatted in ${promptDuration}ms`);
  console.log(`${LOG_PREFIX} [${genId}] Total prompt length: ${formattedPrompt.length} characters`);

  // Invoke AI
  console.log(`${LOG_PREFIX} [${genId}] Invoking Gemini AI...`);
  const invokeStartTime = Date.now();
  
  const response = await model.invoke(formattedPrompt);
  
  const invokeDuration = Date.now() - invokeStartTime;
  console.log(`${LOG_PREFIX} [${genId}] ✓ AI response received in ${invokeDuration}ms`);
  
  const content = response.content as string;
  console.log(`${LOG_PREFIX} [${genId}] Response content length: ${content.length} characters`);
  console.log(`${LOG_PREFIX} [${genId}] Response preview: "${content.substring(0, 200)}..."`);

  // Parse response
  let parsedOutput: PitchDeckOutput;
  console.log(`${LOG_PREFIX} [${genId}] Parsing AI response...`);
  const parseStartTime = Date.now();

  try {
    parsedOutput = await parser.parse(content);
    const parseDuration = Date.now() - parseStartTime;
    console.log(`${LOG_PREFIX} [${genId}] ✓ Structured parsing succeeded in ${parseDuration}ms`);
  } catch (parseError) {
    console.warn(`${LOG_PREFIX} [${genId}] ⚠ Structured parsing failed, trying JSON extraction...`);
    console.warn(`${LOG_PREFIX} [${genId}] Parse error:`, parseError instanceof Error ? parseError.message : parseError);
    
    // Try to extract JSON from the response if parsing fails
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log(`${LOG_PREFIX} [${genId}] Found JSON block (${jsonMatch[0].length} chars), parsing...`);
      try {
        parsedOutput = JSON.parse(jsonMatch[0]);
        const parseDuration = Date.now() - parseStartTime;
        console.log(`${LOG_PREFIX} [${genId}] ✓ JSON extraction succeeded in ${parseDuration}ms`);
      } catch (jsonError) {
        console.error(`${LOG_PREFIX} [${genId}] ❌ JSON parsing also failed:`, jsonError);
        throw new Error("Failed to parse AI response as JSON");
      }
    } else {
      console.error(`${LOG_PREFIX} [${genId}] ❌ No JSON block found in response`);
      console.error(`${LOG_PREFIX} [${genId}] Full response: ${content}`);
      throw new Error("Failed to parse AI response - no JSON found");
    }
  }

  // Log parsed output
  console.log(`${LOG_PREFIX} [${genId}] Parsed output:`);
  console.log(`${LOG_PREFIX} [${genId}]   - projectName: "${parsedOutput.projectName}"`);
  console.log(`${LOG_PREFIX} [${genId}]   - tagline: "${parsedOutput.tagline}"`);
  console.log(`${LOG_PREFIX} [${genId}]   - slides: ${parsedOutput.slides.length} slides`);
  
  // Log each slide
  parsedOutput.slides.forEach((slide, index) => {
    console.log(`${LOG_PREFIX} [${genId}]   Slide ${index + 1}:`);
    console.log(`${LOG_PREFIX} [${genId}]     - type: ${slide.type}`);
    console.log(`${LOG_PREFIX} [${genId}]     - title: "${slide.title}"`);
    if (slide.subtitle) console.log(`${LOG_PREFIX} [${genId}]     - subtitle: "${slide.subtitle}"`);
    if (slide.bullets) console.log(`${LOG_PREFIX} [${genId}]     - bullets: ${slide.bullets.length} items`);
    if (slide.content) console.log(`${LOG_PREFIX} [${genId}]     - content: ${slide.content.length} chars`);
  });

  // Transform to our Slide format with IDs and order
  // IMPORTANT: Convert undefined to null for Firestore compatibility
  console.log(`${LOG_PREFIX} [${genId}] Transforming to Slide format with IDs...`);
  console.log(`${LOG_PREFIX} [${genId}] Converting undefined values to null for Firestore...`);
  const slides: Slide[] = parsedOutput.slides.map((slide, index) => ({
    id: uuidv4(),
    type: slide.type as SlideType,
    title: slide.title,
    subtitle: slide.subtitle ?? null,
    bullets: slide.bullets ?? null,
    content: slide.content ?? null,
    order: index,
  }));
  console.log(`${LOG_PREFIX} [${genId}] ✓ Generated ${slides.length} slides with UUIDs`);

  const totalDuration = Date.now() - startTime;
  console.log(`${LOG_PREFIX} [${genId}] ✓ Generation completed in ${totalDuration}ms`);
  console.log(`${LOG_PREFIX} [${genId}] Timing breakdown:`);
  console.log(`${LOG_PREFIX} [${genId}]   - Prompt formatting: ${promptDuration}ms`);
  console.log(`${LOG_PREFIX} [${genId}]   - AI invocation: ${invokeDuration}ms`);
  console.log(`${LOG_PREFIX} [${genId}]   - Parsing: ${Date.now() - parseStartTime}ms`);
  console.log(`${LOG_PREFIX} ----------------------------------------`);

  return {
    projectName: parsedOutput.projectName,
    tagline: parsedOutput.tagline,
    slides,
  };
}

// Slide type display names
export const SLIDE_TYPE_NAMES: Record<SlideType, string> = {
  title: "Title",
  problem: "The Problem",
  solution: "The Solution",
  features: "Key Features",
  market: "Market Opportunity",
  "business-model": "Business Model",
  traction: "Traction",
  team: "Team",
  cta: "Get Started",
};

// Default slide templates for adding new slides
export function createDefaultSlide(type: SlideType, order: number): Slide {
  console.log(`${LOG_PREFIX} Creating default slide: type=${type}, order=${order}`);
  
  const defaults: Record<SlideType, Omit<Slide, "id" | "order">> = {
    title: {
      type: "title",
      title: "Your Project Name",
      subtitle: "A compelling tagline that captures your vision",
    },
    problem: {
      type: "problem",
      title: "The Problem",
      subtitle: "What challenge are you solving?",
      bullets: ["Pain point 1", "Pain point 2", "Pain point 3"],
    },
    solution: {
      type: "solution",
      title: "Our Solution",
      subtitle: "How we solve this problem",
      content: "Describe your solution here...",
    },
    features: {
      type: "features",
      title: "Key Features",
      bullets: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    },
    market: {
      type: "market",
      title: "Market Opportunity",
      subtitle: "The size and potential of your market",
      bullets: ["Market size", "Target audience", "Growth potential"],
    },
    "business-model": {
      type: "business-model",
      title: "Business Model",
      subtitle: "How we create value",
      bullets: ["Revenue stream 1", "Revenue stream 2"],
    },
    traction: {
      type: "traction",
      title: "Traction",
      subtitle: "Our progress so far",
      bullets: ["Metric 1", "Metric 2", "Milestone achieved"],
    },
    team: {
      type: "team",
      title: "Meet the Team",
      bullets: ["Team member 1 - Role", "Team member 2 - Role"],
    },
    cta: {
      type: "cta",
      title: "Get Started Today",
      subtitle: "Join us on this journey",
      content: "Call to action details...",
    },
  };

  const slideId = uuidv4();
  console.log(`${LOG_PREFIX} Created slide with ID: ${slideId}`);

  return {
    id: slideId,
    order,
    ...defaults[type],
  };
}
