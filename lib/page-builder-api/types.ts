// Backend BE-120 page builder contracts.
// These mirror the DTOs returned by /api/templates, /api/palettes,
// and /api/stores/:storeId/theme.

export type Plan = 'FREE' | 'PRO' | 'BUSINESS'

export type TemplateNiche =
  | 'FASHION'
  | 'RESTAURANT'
  | 'REAL_ESTATE'
  | 'SERVICES'
  | 'GENERAL'

export type Radius = 'sm' | 'md' | 'lg' | 'xl'
export type Spacing = 'compact' | 'normal' | 'comfortable'
export type ButtonStyle = 'solid' | 'outline' | 'ghost'

export const FONT_WHITELIST = [
  'Inter',
  'Playfair Display',
  'Fraunces',
  'Source Serif 4',
  'Manrope',
  'Space Grotesk',
  'Poppins',
  'Lora',
] as const
export type FontName = (typeof FONT_WHITELIST)[number]

export interface PaletteTokens {
  preset?: string
  primary?: string
  secondary?: string
  accent?: string
  bg?: string
  surface?: string
  text?: string
  muted?: string
  border?: string
  [key: string]: string | undefined
}

export interface TypographyTokens {
  headingFont?: FontName | string
  bodyFont?: FontName | string
  monoFont?: FontName | string
}

export interface ThemeTokens {
  palette?: PaletteTokens
  typography?: TypographyTokens
  radius?: Radius
  spacing?: Spacing
  buttonStyle?: ButtonStyle
}

export interface SectionNode {
  type: string
  key: string
  props: Record<string, unknown>
}

export interface SectionTree {
  sections: SectionNode[]
}

export interface DraftTheme {
  templateKey: string
  tokens: ThemeTokens
  tree: SectionTree
  updatedAt: string
}

export interface PublishedTheme {
  templateKey: string
  tokens: ThemeTokens
  tree: SectionTree
  publishedAt: string
}

export interface StoreThemeResponse {
  activeTemplate: string
  publishedTemplate: string | null
  rollbackTemplate: string | null
  version: number
  publishedAt: string | null
  draft: DraftTheme | null
  drafts: DraftTheme[]
  published: PublishedTheme | null
  rollback: PublishedTheme | null
}

export interface Template {
  id: string
  key: string
  name: string
  niche: TemplateNiche
  planRequired: Plan
  previewImage: string | null
  sectionSchema: Record<string, unknown>
  defaultTokens: ThemeTokens
  version: number
  isActive: boolean
  sortOrder: number
}

export interface PalettePreset {
  id: string
  key: string
  name: string
  colors: PaletteTokens
  sortOrder: number
}

export interface SwitchTemplatePayload {
  templateKey: string
}

export interface PatchTokensPayload {
  tokens: ThemeTokens
}

export interface PatchSectionsPayload {
  sections: SectionNode[]
}
