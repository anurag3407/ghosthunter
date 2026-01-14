# Gemini Model Usage - Reference Document

All AI model usages in this application have been updated to use **`gemini-2.5-flash-lite`**.

## Files with Model Configuration

| File | Function/Route | Previous Model | Purpose |
|------|----------------|----------------|---------|
| [analyzer.ts](file:///Users/jarvis/ghosthunter/src/lib/agents/code-police/analyzer.ts#L47) | `getGeminiModel()` | gemini-2.5-flash | Code analysis for Code Police |
| [fix-generator.ts](file:///Users/jarvis/ghosthunter/src/lib/agents/code-police/fix-generator.ts#L56) | `getGeminiModel()` | gemini-2.5-flash | AI-powered code fix generation |
| [query-generator.ts](file:///Users/jarvis/ghosthunter/src/lib/agents/database/query-generator.ts#L32) | `getGeminiModel()` | gemini-2.0-flash | Natural language to SQL/NoSQL |
| [agent.ts](file:///Users/jarvis/ghosthunter/src/lib/agents/database/agent.ts#L64) | `getGeminiModel()` | gemini-2.0-flash-exp | Database agent main logic |
| [generator.ts](file:///Users/jarvis/ghosthunter/src/lib/agents/pitch-deck/generator.ts#L125) | `generatePitchDeck()` | gemini-2.0-flash | Quick pitch deck generation |
| [ai-generator.ts](file:///Users/jarvis/ghosthunter/src/lib/pitch-deck/ai-generator.ts#L459) | `generateDeckFromSources()` | gemini-2.0-flash | Advanced deck generation |
| [ai-generator.ts](file:///Users/jarvis/ghosthunter/src/lib/pitch-deck/ai-generator.ts#L616) | `improveText()` | gemini-2.0-flash | Text improvement for slides |
| [ai-generator.ts](file:///Users/jarvis/ghosthunter/src/lib/pitch-deck/ai-generator.ts#L718) | `checkDeckHealth()` | gemini-2.0-flash | Deck health analysis |
| [stream/route.ts](file:///Users/jarvis/ghosthunter/src/app/api/database/chat/stream/route.ts#L268) | `POST` streaming | gemini-2.0-flash-exp | Database chat streaming |

## API Routes Using AI

| Route | File | Purpose |
|-------|------|---------|
| `POST /api/code-police/analyze` | analyzer.ts | Analyze code for issues |
| `POST /api/code-police/issues` | fix-generator.ts | Generate fixes for code issues |
| `POST /api/database/chat` | query-generator.ts | Non-streaming database chat |
| `POST /api/database/chat/stream` | stream/route.ts | Streaming database chat |
| `POST /api/pitch-deck/generate` | generator.ts | Quick pitch deck from README |
| `POST /api/pitch-deck/studio/generate` | ai-generator.ts | Advanced deck generation |
| `POST /api/pitch-deck/studio/improve-text` | ai-generator.ts | Text improvement |
| `POST /api/pitch-deck/studio/health-check` | ai-generator.ts | Deck health check |

## Environment Variables

The following API keys are used for AI:
- `GEMINI_API_KEY` - Primary Gemini API key
- `GOOGLE_API_KEY` - Fallback for Gemini
- `GOOGLE_AI_API_KEY` - Used by pitch deck features
