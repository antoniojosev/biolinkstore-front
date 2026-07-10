// ─── Core domain types ────────────────────────────────────────────────────────

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
  tags?: string[]
  specs?: Record<string, string>
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
  plan: 'FREE' | 'PRO' | 'BUSINESS'
  address?: string
}
