import type { TemplateId } from '@/lib/types'

export interface DashboardStore {
  id: string
  name: string
  slug: string
  username?: string
  template: TemplateId
  primaryColor: string
  currency: string
  whatsappNumbers: string[]
  avatar?: string
  coverImage?: string
  bio?: string
  instagramUrl?: string
  showBranding?: boolean
  subscription?: { plan: 'FREE' | 'PRO' | 'BUSINESS' }
  // Extra fields from backend
  logo?: string
  banner?: string
  description?: string
  instagramHandle?: string
  facebookUrl?: string
  tiktokUrl?: string
  email?: string
  address?: string
  customDomain?: string
  domainVerified?: boolean
}

export interface CreateStoreDto {
  name: string
  username: string
  whatsappNumbers: string[]
}

/**
 * Maps to backend UpdateStoreDto.
 * Uses backend field names (logo, banner, description, instagramHandle).
 */
export interface UpdateStoreDto {
  name?: string
  username?: string
  description?: string
  logo?: string
  banner?: string
  template?: TemplateId
  primaryColor?: string
  whatsappNumbers?: string[]
  instagramHandle?: string
  facebookUrl?: string
  tiktokUrl?: string
  email?: string
  address?: string
  showBranding?: boolean
}
