import type { TemplateId } from '@/lib/types'

export interface DashboardStore {
  id: string
  name: string
  slug: string
  template: TemplateId
  primaryColor: string
  currency: string
  whatsappNumbers: string[]
  avatar?: string
  coverImage?: string
  bio?: string
  instagramUrl?: string
}

export interface CreateStoreDto {
  name: string
  whatsappNumbers: string[]
}

export interface UpdateStoreDto {
  name?: string
  bio?: string
  template?: TemplateId
  primaryColor?: string
  currency?: string
  whatsappNumbers?: string[]
  avatar?: string
  coverImage?: string
  instagramUrl?: string
}
