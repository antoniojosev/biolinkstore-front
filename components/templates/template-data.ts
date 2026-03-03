import type { TemplateId } from '@/lib/types'

export type TemplatePlan = 'free' | 'pro' | 'business'

const PLAN_RANK: Record<TemplatePlan, number> = {
  free: 0,
  pro: 1,
  business: 2,
}

export interface TemplateData {
  id: TemplateId
  name: string
  tagline: string
  description: string
  plan: TemplatePlan
  tags: string[]
  preview?: string
  colors: {
    bg: string
    header: string
    card: string
    accent: string
    text: string
  }
}

export const TEMPLATES: TemplateData[] = [
  {
    id: 'vitrina',
    name: 'Vitrina',
    tagline: 'Moderno y vibrante',
    description:
      'Diseño oscuro con acentos teal. Grid de productos destacado, ideal para moda, tecnología y lifestyle.',
    plan: 'free',
    tags: ['Moderno', 'Oscuro', 'Vibrante'],
    preview: '/templates/vitrina-preview.png',
    colors: {
      bg: '#0d1a2d',
      header: '#0a1220',
      card: '#1a2a3a',
      accent: '#2dd4bf',
      text: '#e2e8f0',
    },
  },
  {
    id: 'luxora',
    name: 'Luxora',
    tagline: 'Limpio y elegante',
    description:
      'Estilo minimalista con fondo claro. Lista de productos espaciada y tipografía refinada. Perfecto para artesanías y productos premium.',
    plan: 'free',
    tags: ['Minimalista', 'Claro', 'Elegante'],
    preview: '/templates/luxora-preview.png',
    colors: {
      bg: '#FAFAF8',
      header: '#F0EFEC',
      card: '#FFFFFF',
      accent: '#2563EB',
      text: '#1a1a1a',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    tagline: 'Lujo editorial',
    description:
      'Fondo negro profundo con acentos dorados. Layout editorial de pantalla completa para marcas de lujo y alta moda.',
    plan: 'pro',
    tags: ['Lujo', 'Oscuro', 'Editorial'],
    preview: '/templates/noir-preview.png',
    colors: {
      bg: '#0A0A0A',
      header: '#111111',
      card: '#161616',
      accent: '#C9A86C',
      text: '#F5F0E8',
    },
  },
]

export function isTemplateLocked(templatePlan: TemplatePlan, userPlan: TemplatePlan): boolean {
  return PLAN_RANK[templatePlan] > PLAN_RANK[userPlan]
}
