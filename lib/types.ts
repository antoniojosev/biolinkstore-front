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
  /** Primary category (first assigned) — for display */
  category: string
  /** All assigned categories — for filtering */
  categories: string[]
  description: string
  inStock: boolean
  featured?: boolean
  variants?: ProductVariant[]
  /** Spec attributes (role='spec') — name → first option value */
  specs?: Record<string, string>
  /** Tag attributes (role='tag') — flat list of tag values */
  tags?: string[]
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
  variantId?: string
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

export type AttributeRole = 'variant' | 'spec' | 'tag'

export interface ProductAttribute {
  id: string
  name: string
  type: string
  role: AttributeRole
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

export type TemplateId = 'vitrina' | 'luxora' | 'noir' | 'menu' | 'inmuebles' | 'servicios'

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
