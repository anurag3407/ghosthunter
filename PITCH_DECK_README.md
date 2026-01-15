# 📊 Pitch Deck Studio - Comprehensive Documentation

> **AI-Powered Investor-Grade Pitch Deck Generator**

Transform your GitHub README into professional pitch decks with AI. Pitch Deck Studio analyzes your project documentation and generates compelling, investor-ready presentations in seconds.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [File Structure](#file-structure)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [User Flows](#user-flows)
9. [AI Generation Engine](#ai-generation-engine)
10. [Slide Templates](#slide-templates)
11. [Themes & Styling](#themes--styling)
12. [Visual Editor](#visual-editor)
13. [Export Options](#export-options)
14. [Setup & Configuration](#setup--configuration)
15. [Usage Examples](#usage-examples)
16. [Troubleshooting](#troubleshooting)
17. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

### What is Pitch Deck Studio?

Pitch Deck Studio is an AI-powered tool that automatically generates professional pitch decks from your project's README file. It understands your product, identifies key messaging, and creates investor-grade slides with appropriate structure and content.

### Key Capabilities

- **GitHub Integration**: Import README directly from any repository
- **AI Content Generation**: LangChain + Gemini for intelligent content creation
- **Multiple Deck Styles**: Pre-seed, Seed, Series A, Demo Day templates
- **Visual Editor**: Drag-and-drop canvas for customization
- **Gap Analysis**: Identifies missing slides and content improvements
- **Quality Scoring**: AI rates each slide and overall deck quality
- **Export Options**: PDF and image export capabilities

### Use Cases

1. **First-Time Founders**: Create professional decks without design skills
2. **Rapid Iteration**: Generate multiple deck variations quickly
3. **Pitch Practice**: Prepare for investor meetings efficiently
4. **Demo Days**: Quick turnaround for accelerator presentations
5. **Internal Presentations**: Standardized company overview decks

---

## ✨ Features

### Core Capabilities

✅ **GitHub-to-Deck Conversion**
- Connects to any public/private GitHub repository
- Extracts and analyzes README content
- Pulls metadata (stars, language, description)

✅ **AI-Powered Content Generation**
- Natural language understanding via Gemini 2.0 Flash
- Structured output parsing with Zod schemas
- Context-aware slide content creation

✅ **Multiple Deck Styles**
- Pre-seed (10-12 slides)
- Seed (12-15 slides)
- Series A (15-20 slides)
- Demo Day (8-10 slides)
- Enterprise Sales
- Custom

✅ **Professional Slide Types**
- Title / Cover
- Vision & Mission
- Problem Statement
- Solution Overview
- Product Demo
- Market Size (TAM/SAM/SOM)
- Business Model
- Traction & Metrics
- Go-to-Market Strategy
- Competition Analysis
- Competitive Advantage
- Roadmap
- Team
- The Ask
- Appendix

✅ **Visual Studio Editor**
- Real-time canvas preview
- Drag-and-drop element positioning
- Properties panel for fine-tuning
- Multiple slide layouts per type
- Undo/redo support

✅ **Quality Assurance**
- Per-slide quality scores
- Overall deck rating
- Missing content warnings
- Improvement suggestions
- Placeholder detection

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Deck List    │  │ Quick Deck   │  │ Advanced Studio  │  │
│  │ Dashboard    │  │ Generator    │  │ Editor           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
│  ┌────────────────────────────────────────────────────────┐│
│  │  /api/pitch-deck/                                      ││
│  │  ├── /decks          (CRUD operations)                 ││
│  │  ├── /generate       (AI deck generation)              ││
│  │  ├── /github         (README fetching)                 ││
│  │  ├── /export         (PDF/image export)                ││
│  │  └── /studio         (Editor operations)               ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ AI Generator    │  │ Template Engine │  │ Theme      │  │
│  │ (LangChain +    │  │ (Slide Layouts) │  │ Manager    │  │
│  │  Gemini 2.0)    │  │                 │  │            │  │
│  └─────────────────┘  └─────────────────┘  └────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ GitHub Client   │  │ Export Service  │  │ Validator  │  │
│  │ (Octokit)       │  │ (PDF/Image)     │  │            │  │
│  └─────────────────┘  └─────────────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Firestore                                            │  │
│  │ Collection: pitch-decks                              │  │
│  │ ├── id, userId, projectName, tagline                 │  │
│  │ ├── slides[] (full slide data)                       │  │
│  │ ├── theme, style, status                             │  │
│  │ └── createdAt, updatedAt                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Generation Flow

```
User → Select Repository → Fetch README
                              ↓
                     Extract GitHub Metadata
                              ↓
                     Select Deck Style & Tone
                              ↓
         ┌─────────────────────────────────────┐
         │     AI GENERATION PIPELINE          │
         │                                     │
         │  1. Parse README content            │
         │  2. Identify key concepts           │
         │  3. Determine essential slides      │
         │  4. Generate slide content          │
         │  5. Apply template layouts          │
         │  6. Calculate quality scores        │
         │  7. Identify gaps & warnings        │
         │                                     │
         └─────────────────────────────────────┘
                              ↓
                     Return Generated Deck
                              ↓
                   User Edits in Studio
                              ↓
                   Save to Firestore
                              ↓
                   Export PDF/Images
```

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **UI Components** | Radix UI, Lucide Icons |
| **Canvas Rendering** | React Konva, Konva.js |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **AI Engine** | LangChain, Google Gemini 2.0 Flash |
| **Schema Validation** | Zod |
| **Database** | Firebase Firestore |
| **GitHub API** | Octokit |
| **PDF Export** | jsPDF, html-to-image |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS, Framer Motion |

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/pitch-deck/
│   │   ├── decks/
│   │   │   └── route.ts          # CRUD operations
│   │   ├── generate/
│   │   │   └── route.ts          # AI generation endpoint
│   │   ├── github/
│   │   │   └── route.ts          # README fetching
│   │   ├── export/
│   │   │   └── route.ts          # PDF/image export
│   │   └── studio/
│   │       └── route.ts          # Editor save/load
│   │
│   └── dashboard/pitch-deck/
│       ├── page.tsx              # Deck list page
│       ├── new/
│       │   └── page.tsx          # Quick deck generator
│       ├── [id]/
│       │   └── page.tsx          # Deck detail/view
│       └── studio/
│           ├── new/
│           │   └── page.tsx      # New deck in studio
│           └── [id]/
│               └── page.tsx      # Edit deck in studio
│
├── components/pitch-deck/
│   ├── index.ts                  # Module exports
│   ├── DeckList.tsx              # Deck grid/list view
│   ├── DeleteDeckButton.tsx      # Delete confirmation
│   ├── EditorToolbar.tsx         # Studio toolbar
│   ├── PropertiesPanel.tsx       # Element properties
│   ├── SlideCanvas.tsx           # Konva canvas render
│   └── SlideList.tsx             # Slide navigator
│
├── lib/pitch-deck/
│   ├── index.ts                  # Module exports
│   ├── ai-generator.ts           # LangChain AI logic
│   ├── templates.ts              # Slide templates/layouts
│   ├── themes.ts                 # Color themes
│   └── utils.ts                  # Helper functions
│
└── types/
    └── pitch-deck.ts             # TypeScript definitions
```

---

## 📊 Data Models

### Deck Model

```typescript
interface Deck {
  id: string;
  userId: string;
  projectName: string;
  tagline: string;
  status: "draft" | "completed";
  style: DeckStyle;
  theme: Theme;
  slides: Slide[];
  sourceUrl?: string;          // GitHub URL
  overallScore: number;        // 0-100
  globalSuggestions: string[];
  missingSlides: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Slide Model

```typescript
interface Slide {
  id: string;
  type: SlideType;
  order: number;
  layout: string;              // Layout variant ID
  elements: SlideElement[];
  warnings: SlideWarning[];
  contentScore: number;        // 0-100
}
```

### Slide Types

```typescript
type SlideType =
  | "title"
  | "vision"
  | "problem"
  | "solution"
  | "product"
  | "market"
  | "business-model"
  | "traction"
  | "go-to-market"
  | "competition"
  | "competitive-advantage"
  | "roadmap"
  | "team"
  | "ask"
  | "appendix"
  | "custom";
```

### Deck Styles

```typescript
type DeckStyle =
  | "pre-seed"      // 10-12 slides, vision-focused
  | "seed"          // 12-15 slides, traction emphasis
  | "series-a"      // 15-20 slides, detailed metrics
  | "series-b"      // Comprehensive coverage
  | "enterprise-sales"
  | "demo-day"      // 8-10 slides, concise
  | "custom";
```

### Element Types

```typescript
type ElementType =
  | "text"
  | "heading"
  | "bullet-list"
  | "shape"
  | "image"
  | "video"
  | "chart"
  | "table"
  | "icon"
  | "metric"
  | "quote"
  | "logo";
```

---

## 🔌 API Endpoints

### Generate Deck

```http
POST /api/pitch-deck/generate
Content-Type: application/json

{
  "readme": "# Project Name\n...",
  "profile": {
    "stage": "pre-seed",
    "industry": "fintech",
    "targetAudience": "investors"
  },
  "githubMeta": {
    "owner": "username",
    "repo": "project",
    "stars": 1234,
    "language": "TypeScript"
  },
  "deckStyle": "pre-seed",
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "deck": {
    "projectName": "Project Name",
    "tagline": "Compelling tagline",
    "slides": [...],
    "overallScore": 85,
    "missingSlides": ["traction"],
    "globalSuggestions": [...]
  }
}
```

### Fetch GitHub README

```http
GET /api/pitch-deck/github?owner=username&repo=project
```

**Response:**
```json
{
  "readme": "# Project README content...",
  "metadata": {
    "name": "project",
    "description": "...",
    "stars": 1234,
    "language": "TypeScript",
    "topics": ["ai", "startup"]
  }
}
```

### Save Deck

```http
POST /api/pitch-deck/decks
Content-Type: application/json

{
  "projectName": "My Startup",
  "tagline": "Tagline here",
  "style": "seed",
  "slides": [...],
  "theme": {...}
}
```

### Export Deck

```http
POST /api/pitch-deck/export
Content-Type: application/json

{
  "deckId": "abc123",
  "format": "pdf",  // or "png", "jpg"
  "quality": "high"
}
```

---

## 👤 User Flows

### 1. Quick Deck Generation

```
Dashboard → "Quick Deck" Button
           ↓
     Enter GitHub URL
           ↓
     Fetch & Preview README
           ↓
     Select Deck Style
           ↓
     Click "Generate"
           ↓
     AI Processing (5-15 seconds)
           ↓
     View Generated Deck
           ↓
     Edit or Export
```

### 2. Advanced Studio

```
Dashboard → "Advanced Studio" Button
           ↓
     Connect GitHub Repository
           ↓
     Configure Deck Settings
       - Style (Pre-seed, Seed, etc.)
       - Tone (Professional, Casual)
       - Theme (Colors, Fonts)
           ↓
     Generate Initial Deck
           ↓
     Visual Editor Opens
       - Drag-and-drop elements
       - Adjust text/styling
       - Reorder slides
       - Add/remove slides
           ↓
     Save Progress
           ↓
     Export Final Deck
```

### 3. Edit Existing Deck

```
Dashboard → Click Deck Card
           ↓
     View Deck Details
           ↓
     "Edit in Studio" Button
           ↓
     Studio Opens with Deck
           ↓
     Make Changes
           ↓
     Auto-save or Manual Save
```

---

## 🤖 AI Generation Engine

### Overview

The AI generation engine uses LangChain with Google Gemini 2.0 Flash to transform README content into structured slide data.

### Generation Process

1. **Input Processing**
   - Parse README markdown
   - Extract GitHub metadata
   - Load startup profile (if provided)

2. **Content Analysis**
   - Identify product description
   - Extract features and benefits
   - Detect technical stack
   - Find metrics/numbers
   - Understand target audience

3. **Slide Generation**
   - Determine essential slides for deck style
   - Generate content for each slide type
   - Create headlines, bullets, metrics
   - Score content quality

4. **Gap Analysis**
   - Identify missing required slides
   - Flag content that needs user input
   - Provide improvement suggestions

### Prompt Structure

```typescript
const DECK_GENERATION_PROMPT = `
You are an expert pitch deck creator and startup advisor.

## Source Information
- README: {readme}
- Startup Profile: {profile}
- GitHub Metadata: {githubMeta}

## Configuration
- Deck Style: {deckStyle}
- Content Tone: {tone}
- Essential Slides: {essentialSlides}

## Task
Generate investor-grade content for each slide:
- headline: Main title (max 10 words)
- subheadline: Supporting text (max 25 words)
- bullets: Key points (3-5 items, max 20 words each)
- metrics: Numbers to highlight
- contentScore: Quality rating (0-100)
- warnings: Content issues
- suggestions: Improvements
`;
```

### Output Schema (Zod)

```typescript
const slideContentSchema = z.object({
  type: z.enum([...slideTypes]),
  headline: z.string(),
  subheadline: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  metrics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  })).optional(),
  contentScore: z.number().min(0).max(100),
  warnings: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
});
```

---

## 📐 Slide Templates

### Dimensions

```typescript
const SLIDE_WIDTH = 1280;   // 16:9 aspect ratio
const SLIDE_HEIGHT = 720;
const SLIDE_PADDING = 60;
```

### Template Structure

Each slide type has multiple layout options:

```typescript
interface SlideTypeTemplate {
  type: SlideType;
  name: string;
  description: string;
  essentialFor: DeckStyle[];    // Required for these styles
  optionalFor: DeckStyle[];     // Optional for these styles
  layouts: SlideLayout[];       // Available layouts
}

interface SlideLayout {
  id: string;
  name: string;
  description: string;
  slots: TemplateSlot[];        // Content placeholders
}

interface TemplateSlot {
  id: string;
  type: ElementType;
  role: string;                 // "headline", "bullets", etc.
  x: number;
  y: number;
  width: number;
  height: number;
  defaultStyle: Partial<TextStyle>;
  placeholder: string;
  required?: boolean;
}
```

### Available Layouts

**Title Slide:**
- Centered (logo + title + tagline)
- Left Aligned (title with visual area)

**Content Slides:**
- Full Width (headline + bullets)
- Split (content + visual)
- Metrics Grid (2-4 metric cards)
- Comparison (side-by-side columns)

**Team Slide:**
- Grid (2x2 or 3x3 members)
- Row (horizontal team layout)

---

## 🎨 Themes & Styling

### Theme Structure

```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    slide: number;
    element: number;
  };
}
```

### Built-in Themes

| Theme | Description |
|-------|-------------|
| **Default** | Clean dark theme with blue accents |
| **Minimal** | White background, subtle styling |
| **Bold** | High contrast, vibrant colors |
| **Corporate** | Professional blue/gray palette |
| **Startup** | Modern gradients and effects |

### Text Styling

```typescript
interface TextStyle {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}
```

---

## ✏️ Visual Editor

### Editor Components

1. **Slide List (Left Panel)**
   - Thumbnail previews
   - Drag-and-drop reordering
   - Add/delete slides
   - Slide type badges

2. **Canvas (Center)**
   - Real-time rendering
   - Element selection
   - Drag to move
   - Resize handles
   - Zoom controls

3. **Properties Panel (Right)**
   - Selected element properties
   - Text editing
   - Style controls
   - Position/size inputs

4. **Toolbar (Top)**
   - Undo/Redo
   - Add elements
   - Alignment tools
   - Theme selector
   - Export button

### Canvas Technology

Built with **React Konva** for high-performance 2D rendering:

```tsx
<Stage width={SLIDE_WIDTH} height={SLIDE_HEIGHT}>
  <Layer>
    {/* Background */}
    <Rect fill={theme.colors.background} />
    
    {/* Elements */}
    {slide.elements.map(element => (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={selectedId === element.id}
        onSelect={handleSelect}
        onChange={handleChange}
      />
    ))}
  </Layer>
</Stage>
```

---

## 📤 Export Options

### PDF Export

```typescript
interface PDFExportOptions {
  format: "A4" | "letter" | "16:9";
  orientation: "landscape" | "portrait";
  quality: "draft" | "standard" | "high";
  includeNotes: boolean;
}
```

**Process:**
1. Render each slide to canvas
2. Convert canvas to image
3. Add images to jsPDF
4. Generate and download PDF

### Image Export

```typescript
interface ImageExportOptions {
  format: "png" | "jpg" | "webp";
  scale: 1 | 2 | 3;           // Resolution multiplier
  slides: "all" | "current" | number[];
}
```

---

## ⚙️ Setup & Configuration

### Prerequisites

- Node.js 20+
- Google Cloud API key (for Gemini)
- Firebase project
- GitHub OAuth app (optional, for private repos)

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=AIza...              # Gemini AI

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."

# Optional - For private repos
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Firestore Indexes

Create the following composite index:

```
Collection: pitch-decks
Fields: userId (ASC), createdAt (DESC)
```

---

## 📖 Usage Examples

### Generate from GitHub URL

```typescript
// Frontend
const response = await fetch("/api/pitch-deck/github?owner=vercel&repo=next.js");
const { readme, metadata } = await response.json();

const deckResponse = await fetch("/api/pitch-deck/generate", {
  method: "POST",
  body: JSON.stringify({
    readme,
    githubMeta: metadata,
    deckStyle: "seed",
    tone: "professional"
  })
});

const { deck } = await deckResponse.json();
```

### Custom Slide Addition

```typescript
const newSlide: Slide = {
  id: uuid(),
  type: "custom",
  order: deck.slides.length,
  layout: "full-width",
  elements: [
    {
      id: uuid(),
      type: "heading",
      content: "Custom Slide Title",
      x: 60,
      y: 80,
      width: 1160,
      height: 80,
      style: { fontSize: 48, fontWeight: 700 }
    }
  ],
  warnings: [],
  contentScore: 100
};

deck.slides.push(newSlide);
```

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to fetch README" | Check repository visibility and URL format |
| "AI generation timeout" | README may be too long; try shorter content |
| "Low quality score" | Add more detail to README sections |
| "Export failed" | Check browser canvas support |
| "Slides not saving" | Verify Firestore permissions |

### Performance Tips

- Keep README under 10,000 characters for fastest generation
- Use markdown headings for better AI parsing
- Include clear product descriptions
- Add metrics/numbers where applicable

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **Real-time Collaboration**: Multi-user editing
- [ ] **Version History**: Track deck changes
- [ ] **Custom Templates**: User-created layouts
- [ ] **Animation Support**: Slide transitions
- [ ] **Presenter Mode**: Full-screen presentation
- [ ] **Analytics**: Track deck views/shares
- [ ] **A/B Testing**: Multiple deck versions
- [ ] **Integrations**: Notion, Figma, Google Slides
- [ ] **Voice-over**: AI narration generation
- [ ] **Language Support**: Multi-language decks

### API Improvements

- [ ] Webhook notifications on deck completion
- [ ] Bulk deck generation
- [ ] Rate limiting per user
- [ ] CDN-hosted exports

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Create investor-grade decks in minutes, not days**

[Back to Main README](./README.md)

</div>
