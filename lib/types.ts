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
  /** Product has at least one ingredient-based attribute — show "Arma tu …" flow */
  customizable?: boolean
  /** Optional short script-line (e.g. "Crispy", "Doble carne") */
  tagline?: string
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

export type AttributeRole =
  | 'variant'
  | 'spec'
  | 'tag'
  | 'ingredient-included'
  | 'ingredient-extra'

export interface ProductAttribute {
  id: string
  name: string
  type: string
  role: AttributeRole
  options: string[]
  optionsMeta?: Record<
    string,
    { hex?: string; images?: string[]; priceDelta?: number; default?: boolean }
  >
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
  tagline?: string
  inStock: boolean
  featured?: boolean
  attributes: ProductAttribute[]
  variants: ProductVariantDetail[]
}

export type TemplateId =
  | 'vitrina'
  | 'luxora'
  | 'noir'
  | 'menu'
  | 'estate'      // classic real-estate (was: inmuebles)
  | 'persona'     // classic instagram-style profile (was: servicios)
  | 'poster'      // new: restaurant
  | 'atelier'     // new: services portfolio
  | 'inmuebles'   // new: realtor landing
  | 'rosier'      // new: fashion ecommerce

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
