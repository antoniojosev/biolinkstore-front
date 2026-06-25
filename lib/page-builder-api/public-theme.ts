// Public (no-auth) accessor for the storefront renderer.
//
// The /v2/[slug] page is a server component that runs during SSR; it
// fetches the theme directly from the backend (no BFF / cookie). The
// other repositories in this folder go through the authenticated BFF
// proxy and are not usable here.
import type { PublishedTheme, ThemeTokens } from "./types"

export interface PublicStoreTheme {
  activeTemplate: string
  publishedTemplate: string | null
  publishedAt: string | null
  published: PublishedTheme | null
  templateVersion: number
  tokens: ThemeTokens
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
