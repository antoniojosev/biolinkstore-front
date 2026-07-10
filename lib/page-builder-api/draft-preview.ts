// Authenticated draft-preview accessor, used ONLY by the storefront page when
// the vendor opens "Abrir preview" (?preview=true) from the theme editor.
//
// GET /api/stores/:storeId/theme/preview is vendor-only (JwtAuthGuard +
// StoreOwnerGuard). We reuse the same httpOnly AT cookie the dashboard BFF
// already trusts — read directly here since this runs server-side in the
// storefront page, not through /api/proxy. If there's no cookie, or the
// backend rejects it (expired/not the owner), we just return null and the
// caller falls back to the published storefront — no new public surface.
import { cookies } from "next/headers"
import { AT_COOKIE } from "@/lib/auth/cookie-config"
import type { SectionTree, ThemeTokens } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface DraftPreviewProduct {
  id: string
  name: string
  description?: string | null
  basePrice: number
  compareAtPrice?: number | null
  images?: string[]
  stock?: number | null
  sku?: string | null
  isFeatured?: boolean
  category?: string
  categoryIds?: string[]
  attributes?: {
    id: string
    name: string
    type?: string
    role?: string
    options: string[]
    optionsMeta?: Record<string, { hex?: string }> | null
  }[]
  variants?: {
    id: string
    combination: Record<string, string>
    priceAdjustment?: number
    stock?: number | null
    image?: string | null
    isAvailable?: boolean
  }[]
}

export interface DraftPreviewCategory {
  id: string
  name: string
  slug?: string
}

export interface StorePreviewResponse {
  mode: "live" | "demo-fallback"
  template: string
  templateVersion: number
  store: { address?: string | null; [key: string]: unknown }
  products: DraftPreviewProduct[]
  categories: DraftPreviewCategory[]
  tree: SectionTree
  tokens: ThemeTokens
  isDraft: boolean
  isActiveTemplate: boolean
}

export async function fetchDraftPreview(storeId: string): Promise<StorePreviewResponse | null> {
  try {
    const jar = await cookies()
    const at = jar.get(AT_COOKIE)?.value
    if (!at) return null

    const res = await fetch(`${API_URL}/api/stores/${storeId}/theme/preview`, {
      headers: { Authorization: `Bearer ${at}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as StorePreviewResponse
  } catch {
    return null
  }
}
