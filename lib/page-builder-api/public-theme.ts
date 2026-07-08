// Public (no-auth) accessor for the storefront renderer.
//
// The /v2/[slug] page is a server component that runs during SSR; it
// fetches the theme directly from the backend (no BFF / cookie). The
// other repositories in this folder go through the authenticated BFF
// proxy and are not usable here.
//
// Response shape returned by GET /api/public/:slug/theme:
//   {
//     template: string,
//     templateVersion: number,
//     publishedAt: string,
//     version: number,
//     tokens: ThemeTokens,
//     tree: { sections: SectionNode[] }
//   }
// Only present when the store has published a theme; the endpoint
// returns 404 otherwise and this helper returns null so callers can
// fall back to the legacy storefront.
import type { SectionTree, ThemeTokens } from "./types"

export interface PublicStoreTheme {
  template: string
  templateVersion: number
  publishedAt: string
  version: number
  tokens: ThemeTokens
  tree: SectionTree
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function fetchPublicTheme(slug: string): Promise<PublicStoreTheme | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/${encodeURIComponent(slug)}/theme`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as PublicStoreTheme
  } catch {
    return null
  }
}
