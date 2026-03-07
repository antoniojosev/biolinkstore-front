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

export interface VariantDetail {
  attribute: string
  value: string
  type: string
  colorHex?: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
  variantDetails?: VariantDetail[]
}

export interface Category {
  id: string
  name: string
  slug?: string
  image?: string
}

// ─── Product detail types ─────────────────────────────────────────────────────

export interface ProductAttribute {
  id: string
  name: string
  type: string
  options: string[]
  optionsMeta?: Record<string, { hex?: string; images?: string[] }>
  sortOrder: number
}

export interface ProductVariantDetail {
  id: string
  combination: Record<string, string>
  sku: string | null
  priceAdjustment: number
  stock: number | null
  image: string | null
  isAvailable: boolean
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  videos: string[]
  category: string
  description: string
  inStock: boolean
  featured?: boolean
  attributes: ProductAttribute[]
  variants: ProductVariantDetail[]
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
  plan: 'FREE' | 'PRO' | 'BUSINESS'
}
