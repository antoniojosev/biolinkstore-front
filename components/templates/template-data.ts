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
  {
    id: 'menu',
    name: 'Menú',
    tagline: 'Ideal para restaurantes',
    description:
      'Diseño cálido con categorías por sección. Fotos de comida grandes, pedido directo por WhatsApp. Perfecto para restaurantes, cafés y delivery.',
    plan: 'pro',
    tags: ['Restaurante', 'Delivery', 'Cálido'],
    preview: '/templates/menu-preview.png',
    colors: {
      bg: '#FFF8F0',
      header: '#FFF8F0',
      card: '#FFFFFF',
      accent: '#B45309',
      text: '#111827',
    },
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    tagline: 'Para agentes inmobiliarios',
    description:
      'Diseño premium con fotos grandes, specs de propiedad y consulta directa por WhatsApp. Ideal para agentes inmobiliarios y corredores.',
    plan: 'pro',
    tags: ['Inmuebles', 'Premium', 'Profesional'],
    preview: '/templates/inmuebles-preview.png',
    colors: {
      bg: '#F8F9FA',
      header: '#1A3A52',
      card: '#FFFFFF',
      accent: '#D4AF37',
      text: '#1A3A52',
    },
  },
  {
    id: 'servicios',
    name: 'Servicios',
    tagline: 'Tu marca personal',
    description:
      'Perfil tipo Instagram con galería de trabajos y lista de servicios. Contacto directo por WhatsApp. Ideal para fotógrafos, estilistas, trainers y freelancers.',
    plan: 'pro',
    tags: ['Personal', 'Portfolio', 'Servicios'],
    preview: '/templates/servicios-preview.png',
    colors: {
      bg: '#FFFFFF',
      header: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#2D2D2D',
      text: '#111827',
    },
  },
]

export function isTemplateLocked(templatePlan: TemplatePlan, userPlan: TemplatePlan): boolean {
  return PLAN_RANK[templatePlan] > PLAN_RANK[userPlan]
}
