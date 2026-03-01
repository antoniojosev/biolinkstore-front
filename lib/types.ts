// ─── Legacy types (kept for existing demo page) ──────────────────────────────

/** @deprecated Use StoreProfile instead */
export interface LegacyStoreProfile {
  name: string
  username: string
  avatar: string
  bio: string
  whatsappNumber: string
  instagramUrl: string
}

// ─── Core domain types ────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  name: string
  priceAdjustment: number
  inStock: boolean
}

export interface Product {
  id: string
  name: string
  slug?: string
  price: number
  comparePrice?: number
  /** Prefer images[] over image */
  image?: string
  images: string[]
  category: string
  description: string
  inStock: boolean
  featured?: boolean
  variants?: ProductVariant[]
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
}

export interface Category {
  id: string
  name: string
  slug?: string
  image?: string
}

export type TemplateId = 'vitrina' | 'luxora' | 'noir'

export interface StoreProfile {
  id: string
  name: string
  slug: string
  username: string
  avatar?: string
  coverImage?: string
  bio?: string
  whatsappNumbers: string[]
  instagramUrl?: string
  primaryColor: string
  currency: string
  template: TemplateId
}
