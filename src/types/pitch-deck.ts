/**
 * ============================================================================
 * PITCH DECK STUDIO - TYPE DEFINITIONS
 * ============================================================================
 * Comprehensive type system for the investor-grade pitch deck editor.
 * Designed for scalability, maintainability, and future extensibility.
 */

// ============================================================================
// SLIDE TYPES & STRUCTURE
// ============================================================================

/**
 * All available slide types following investor pitch structure
 */
export type SlideType =
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

/**
 * Pitch deck styles for different use cases
 */
export type DeckStyle = 
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "enterprise-sales"
  | "demo-day"
  | "custom";

/**
 * Element types that can be placed on slides
 */
export type ElementType =
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

/**
 * Shape variants for shape elements
 */
export type ShapeVariant =
  | "rectangle"
  | "rounded-rect"
  | "circle"
  | "ellipse"
  | "line"
  | "arrow"
  | "triangle"
  | "star"
  | "hexagon";

/**
 * Chart types supported
 */
export type ChartType =
  | "line"
  | "bar"
  | "column"
  | "pie"
  | "donut"
  | "area"
  | "scatter";

/**
 * Text alignment options
 */
export type TextAlign = "left" | "center" | "right" | "justify";

/**
 * Vertical alignment options
 */
export type VerticalAlign = "top" | "middle" | "bottom";

/**
 * Content tone for AI generation
 */
export type ContentTone =
  | "concise"
  | "storytelling"
  | "technical"
  | "investor";

/**
 * Alias for generation tone (used in forms)
 */
export type GenerationTone = ContentTone;

/**
 * Style priority for funding stage
 */
export type StylePriority = "pre-seed" | "seed" | "series-a" | "series-b";

// ============================================================================
// THEME & STYLING
// ============================================================================

/**
 * Design tokens for consistent theming
 */
export interface ThemeTokens {
  // Colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  
  // Typography
  fontTitle: string;
  fontBody: string;
  fontMono: string;
  
  // Spacing
  spacingUnit: number;
  
  // Borders
  borderRadius: number;
  borderRadiusLarge: number;
  
  // Shadows
  shadowSmall: string;
  shadowMedium: string;
  shadowLarge: string;
}

/**
 * Predefined theme definitions
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  category: "light" | "dark" | "gradient" | "custom";
  tokens: ThemeTokens;
  preview?: string; // Preview image URL
}

/**
 * Custom branding settings
 */
export interface BrandingSettings {
  logoUrl?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  titleFont?: string;
  bodyFont?: string;
  customTokens?: Partial<ThemeTokens>;
}

// ============================================================================
// ELEMENT STYLES
// ============================================================================

/**
 * Text styling options
 */
export interface TextStyle {
  fontSize: number;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  letterSpacing: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  color: string;
  fontFamily?: string;
}

/**
 * Shape styling options
 */
export interface ShapeStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeDash?: number[];
  cornerRadius?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

/**
 * Base style reference (can use tokens or custom)
 */
export interface StyleRef {
  useToken?: string; // Reference to theme token
  custom?: Record<string, unknown>;
  text?: Partial<TextStyle>;
  shape?: Partial<ShapeStyle>;
}

// ============================================================================
// ELEMENTS
// ============================================================================

/**
 * Base element properties shared by all elements
 */
export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name?: string; // User-friendly label
  groupId?: string; // For grouped elements
}

/**
 * Text element
 */
export interface TextElement extends BaseElement {
  type: "text" | "heading";
  content: string;
  style: TextStyle;
  placeholder?: string;
}

/**
 * Bullet list element
 */
export interface BulletListElement extends BaseElement {
  type: "bullet-list";
  items: string[];
  bulletStyle: "disc" | "circle" | "square" | "number" | "letter" | "dash" | "arrow";
  style: TextStyle;
  itemSpacing: number;
}

/**
 * Shape element
 */
export interface ShapeElement extends BaseElement {
  type: "shape";
  variant: ShapeVariant;
  style: ShapeStyle;
  points?: { x: number; y: number }[]; // For custom shapes/lines
}

/**
 * Image element
 */
export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  objectFit: "contain" | "cover" | "fill" | "none";
  borderRadius: number;
  border?: {
    width: number;
    color: string;
  };
}

/**
 * Video element
 */
export interface VideoElement extends BaseElement {
  type: "video";
  src: string;
  thumbnailUrl?: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  provider?: "youtube" | "vimeo" | "upload";
  videoId?: string; // For external providers
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Chart data series
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Chart element
 */
export interface ChartElement extends BaseElement {
  type: "chart";
  chartType: ChartType;
  series: ChartSeries[];
  title?: string;
  showLegend: boolean;
  showGrid: boolean;
  showLabels: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

/**
 * Table cell
 */
export interface TableCell {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  style?: Partial<TextStyle>;
  backgroundColor?: string;
}

/**
 * Table element
 */
export interface TableElement extends BaseElement {
  type: "table";
  rows: TableCell[][];
  headerRow: boolean;
  headerColumn: boolean;
  borderStyle: "none" | "solid" | "dashed";
  borderColor: string;
  cellPadding: number;
  style: Partial<TextStyle>;
}

/**
 * Icon element
 */
export interface IconElement extends BaseElement {
  type: "icon";
  iconName: string;
  iconSet: "lucide" | "tabler" | "custom";
  color: string;
  strokeWidth?: number;
}

/**
 * Metric/KPI element
 */
export interface MetricElement extends BaseElement {
  type: "metric";
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  valueStyle: Partial<TextStyle>;
  labelStyle: Partial<TextStyle>;
}

/**
 * Quote element
 */
export interface QuoteElement extends BaseElement {
  type: "quote";
  text: string;
  attribution?: string;
  style: TextStyle;
  quoteStyle: "modern" | "classic" | "minimal";
}

/**
 * Logo element (special image)
 */
export interface LogoElement extends BaseElement {
  type: "logo";
  src: string;
  companyName?: string;
  grayscale: boolean;
}

/**
 * Union type of all elements
 */
export type SlideElement =
  | TextElement
  | BulletListElement
  | ShapeElement
  | ImageElement
  | VideoElement
  | ChartElement
  | TableElement
  | IconElement
  | MetricElement
  | QuoteElement
  | LogoElement;

// ============================================================================
// LAYOUTS & TEMPLATES
// ============================================================================

/**
 * Element slot in a template
 */
export interface TemplateSlot {
  id: string;
  type: ElementType;
  role: string; // "headline" | "subheadline" | "body" | "bullets" | "metric" | "chart" | "image"
  x: number;
  y: number;
  width: number;
  height: number;
  defaultStyle?: Partial<TextStyle | ShapeStyle>;
  placeholder?: string;
  required?: boolean;
}

/**
 * Slide layout template
 */
export interface SlideLayout {
  id: string;
  name: string;
  description: string;
  slots: TemplateSlot[];
  thumbnail?: string;
}

/**
 * Slide type template with multiple layouts
 */
export interface SlideTypeTemplate {
  slideType: SlideType;
  displayName: string;
  description: string;
  icon: string;
  layouts: SlideLayout[];
  defaultLayoutId: string;
  
  // Investor expectations
  guidelines: string[];
  checklist: string[];
  examples?: string[];
}

// ============================================================================
// SLIDES & DECK
// ============================================================================

/**
 * Slide notes (speaker notes)
 */
export interface SlideNotes {
  content: string;
  aiSuggestions?: string[];
}

/**
 * Slide in a deck
 */
export interface Slide {
  id: string;
  type: SlideType;
  layoutId: string;
  title?: string;
  elements: SlideElement[];
  notes?: string | SlideNotes;
  background?: string;
  order: number;
  hidden: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Metadata for AI
  aiGenerated?: boolean;
  lastAiRevision?: string;
  contentScore?: number; // 0-100 quality score
  warnings?: SlideWarning[];
}

/**
 * Slide warning from health check
 */
export interface SlideWarning {
  id: string;
  type: "missing" | "weak" | "suggestion" | "inconsistency";
  severity: "info" | "warning" | "error";
  message: string;
  suggestion?: string;
  elementId?: string;
}

/**
 * Complete pitch deck
 */
export interface Deck {
  id: string;
  userId: string;
  
  // Basic info
  title?: string;
  projectName: string;
  tagline: string;
  description?: string;
  
  // Content
  slides: Slide[];
  
  // Theming
  themeId: string;
  customBranding?: BrandingSettings;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  
  // Deck settings
  style: DeckStyle;
  defaultTone: ContentTone;
  
  // Source data
  sourceData?: DeckSourceData;
  
  // Status
  status: "draft" | "review" | "final" | "archived" | "published";
  healthScore?: number;
  healthCheckedAt?: string;
  version?: number;
  
  // Sharing
  shareableLink?: string;
  sharedWith?: string[];
  isPublic: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // GitHub integration
  repoUrl?: string;
  repoName?: string;
  repoOwner?: string;
  
  // Metadata
  metadata?: {
    slideCount?: number;
    generatedAt?: string;
    lastEditedAt?: string;
    sources?: {
      hasGithub?: boolean;
      hasProfile?: boolean;
    };
  };
}

/**
 * Source data used to generate the deck
 */
export interface DeckSourceData {
  readme?: string;
  profile?: StartupProfile;
  githubMeta?: GitHubMeta;
}

// ============================================================================
// STARTUP PROFILE
// ============================================================================

/**
 * Startup profile form data
 */
export interface StartupProfile {
  // Basic (form-friendly names)
  name?: string;
  tagline?: string;
  companyName: string;
  oneLiner: string;
  foundedDate?: string;
  location?: string;
  website?: string;
  
  // Product
  productDescription: string;
  targetCustomer: string;
  problemStatement: string;
  solutionDescription: string;
  solution?: string;
  valueProps?: string[];
  
  // Market
  marketSize?: {
    tam?: string; // Total Addressable Market
    sam?: string; // Serviceable Addressable Market
    som?: string; // Serviceable Obtainable Market
  };
  industry?: string | string[];
  
  // Traction
  metrics?: {
    users?: number;
    mrr?: number;
    arr?: number;
    growth?: string; // e.g., "20% MoM"
    retention?: string;
    cac?: number;
    ltv?: number;
    runway?: string;
  };
  traction?: {
    metrics?: Array<{ label: string; value: string; trend?: "up" | "down" | "neutral" }>;
    milestones?: string[];
  };
  milestones?: string[];
  
  // Business
  businessModel?: string;
  revenueStreams?: string[];
  pricing?: string;
  
  // Competition
  competitors?: string[];
  competitiveAdvantage?: string;
  moat?: string;
  
  // Team
  team?: TeamMember[];
  teamWhy?: string;
  advisors?: string[];
  
  // Funding
  fundingAsk?: {
    amount?: string;
    type?: "pre-seed" | "seed" | "series-a" | "series-b" | "bridge" | "other";
    stage?: StylePriority;
    useOfFunds?: Array<{ category: string; percentage: number }> | string[];
    previousRounds?: string;
    currentValuation?: string;
  };
  
  // Additional context
  githubUrl?: string;
  additionalContext?: string;
  logo?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * Team member info
 */
export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  photoUrl?: string;
}

/**
 * GitHub metadata for social proof
 */
export interface GitHubMeta {
  stars?: number;
  forks?: number;
  contributors?: number;
  commits?: number;
  openIssues?: number;
  languages?: { name: string; percentage: number }[];
  topics?: string[];
  license?: string;
  lastUpdated?: string;
}

// ============================================================================
// AI & GENERATION
// ============================================================================

/**
 * Deck generation request
 */
export interface GenerateDeckRequest {
  readme?: string;
  profile?: Partial<StartupProfile>;
  style: DeckStyle;
  tone: ContentTone;
  themeId?: string;
  repoUrl?: string;
  repoOwner?: string;
  repoName?: string;
}

/**
 * Deck generation response
 */
export interface GenerateDeckResponse {
  deck: Deck;
  warnings: SlideWarning[];
  suggestions: string[];
  healthScore: number;
}

/**
 * Text improvement request
 */
export interface ImproveTextRequest {
  text: string;
  elementId: string;
  slideType: SlideType;
  slideContext?: string;
  deckContext?: {
    projectName: string;
    tagline: string;
    tone: ContentTone;
  };
  action: "punchier" | "formal" | "shorter" | "longer" | "simplify" | "elaborate";
}

/**
 * Text improvement response
 */
export interface ImproveTextResponse {
  improvedText: string;
  alternatives?: string[];
  explanation?: string;
}

/**
 * Deck health check request
 */
export interface DeckHealthCheckRequest {
  deck: Deck;
  profile?: StartupProfile;
}

/**
 * Deck health check response
 */
export interface DeckHealthCheckResponse {
  overallScore: number; // 0-100
  categoryScores: {
    completeness: number;
    clarity: number;
    persuasiveness: number;
    consistency: number;
    visualBalance: number;
  };
  slideScores: {
    slideId: string;
    score: number;
    warnings: SlideWarning[];
  }[];
  globalWarnings: SlideWarning[];
  suggestions: string[];
  missingSlides: SlideType[];
  strongPoints: string[];
}

/**
 * Simplified health check type for UI
 */
export interface DeckHealthCheck {
  overallScore: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
  slideFeedback: Array<{
    slideId: string;
    slideType: string;
    score: number;
    feedback: string;
  }>;
}

// ============================================================================
// EDITOR STATE
// ============================================================================

/**
 * Editor selection state
 */
export interface EditorSelection {
  selectedElementIds: string[];
  selectedSlideId: string;
}

/**
 * Editor history entry for undo/redo
 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  deck: Deck;
}

/**
 * Editor viewport state
 */
export interface EditorViewport {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Editor tool mode
 */
export type EditorTool =
  | "select"
  | "text"
  | "shape"
  | "image"
  | "chart"
  | "table"
  | "icon"
  | "pan";

/**
 * Complete editor state
 */
export interface EditorState {
  deck: Deck;
  selection: EditorSelection;
  viewport: EditorViewport;
  activeTool: EditorTool;
  showGrid: boolean;
  snapToGrid: boolean;
  showGuides: boolean;
  isPreviewMode: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  isDirty: boolean;
  lastSaved?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = "pdf" | "pptx" | "png" | "json";

export interface ExportOptions {
  format: ExportFormat;
  includeNotes?: boolean;
  quality?: "low" | "medium" | "high";
  slides?: string[]; // Specific slide IDs, or all if empty
}

export interface ExportResult {
  url: string;
  filename: string;
  format: ExportFormat;
  size: number;
  expiresAt?: string;
}
