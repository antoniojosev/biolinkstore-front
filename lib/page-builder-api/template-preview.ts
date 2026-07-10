// Public (no-auth) template catalog preview — used by the "Vista previa" modal
// in the Temas gallery to render a template with its seeded demo data before
// applying it to the store. Client-safe (no next/headers), unlike draft-preview.ts.
import type { SectionTree, ThemeTokens, TemplateNiche } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface DemoStoreData {
  name: string
  slug: string
  logo?: string
  banner?: string
  phone?: string
  address?: string
  email?: string
  aboutShort?: string
}

export interface DemoProductData {
  id: string
  name: string
  description?: string
  basePrice: number
  images?: string[]
  category?: string
  sku?: string
}

export interface DemoCategoryData {
  id: string
  name: string
  slug?: string
}

export interface TemplatePreviewData {
  template: string
  templateVersion: number
  name: string
  niche: TemplateNiche
  demoData: {
    store: DemoStoreData
    products: DemoProductData[]
    categories: DemoCategoryData[]
  }
  tree: SectionTree
  tokens: ThemeTokens
}

export async function fetchTemplatePreview(key: string): Promise<TemplatePreviewData | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/templates/${encodeURIComponent(key)}/preview`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as TemplatePreviewData
  } catch {
    return null
  }
}
