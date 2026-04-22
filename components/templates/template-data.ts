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
    id: 'estate',
    name: 'Estate',
    tagline: 'Inmobiliaria clásica',
    description:
      'Listado limpio con specs de propiedad, buscador por categoría y consulta por WhatsApp. Versión clásica para corredores y agencias.',
    plan: 'pro',
    tags: ['Inmuebles', 'Clásico', 'Profesional'],
    preview: '/templates/estate-preview.png',
    colors: {
      bg: '#F8F9FA',
      header: '#1A3A52',
      card: '#FFFFFF',
      accent: '#D4AF37',
      text: '#1A3A52',
    },
  },
  {
    id: 'persona',
    name: 'Persona',
    tagline: 'Perfil tipo Instagram',
    description:
      'Layout tipo perfil social con galería de trabajos y lista de servicios. Contacto directo por WhatsApp. Ideal para freelancers y marca personal.',
    plan: 'pro',
    tags: ['Personal', 'Portfolio', 'Servicios'],
    preview: '/templates/persona-preview.png',
    colors: {
      bg: '#FFFFFF',
      header: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#2D2D2D',
      text: '#111827',
    },
  },
  {
    id: 'poster',
    name: 'Poster',
    tagline: 'Comida americana con carácter',
    description:
      'Rojo profundo, tipografía grande, fotos circulares y panel inferior con precio y CTA. Pensado para hamburguesas, pizzas y comida casera.',
    plan: 'pro',
    tags: ['Restaurante', 'Delivery', 'Bold'],
    preview: '/templates/poster-preview.png',
    colors: {
      bg: '#4a0a0a',
      header: '#2e0606',
      card: '#7a1818',
      accent: '#f4a23a',
      text: '#fff4e0',
    },
  },
  {
    id: 'atelier',
    name: 'Atelier',
    tagline: 'Portafolio profesional',
    description:
      'Formato portafolio minimalista con galería de trabajos, lista de servicios y reservas por WhatsApp. Para manicuristas, reposteras, fotógrafos y estudios pequeños.',
    plan: 'pro',
    tags: ['Portafolio', 'Servicios', 'Minimal'],
    preview: '/templates/atelier-preview.png',
    colors: {
      bg: '#faf7f2',
      header: '#ffffff',
      card: '#ffffff',
      accent: '#8b7355',
      text: '#1a1a1a',
    },
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    tagline: 'Agente inmobiliario premium',
    description:
      'Landing de agente individual: video hero, listados con tabs, sección "sobre mí" y CTA grande. Profesional, personal y orientado a conversión.',
    plan: 'business',
    tags: ['Inmuebles', 'Premium', 'Agente'],
    preview: '/templates/inmuebles-preview.png',
    colors: {
      bg: '#ffffff',
      header: '#0a0a0a',
      card: '#ffffff',
      accent: '#1a3550',
      text: '#0a0a0a',
    },
  },
  {
    id: 'rosier',
    name: 'Rosier',
    tagline: 'Ecommerce moda editorial',
    description:
      'Hero split coral + foto editorial, galería de productos con swatches, favoritos y carrito. Optimizado para marcas de ropa con cápsulas semanales.',
    plan: 'business',
    tags: ['Moda', 'Ecommerce', 'Editorial'],
    preview: '/templates/rosier-preview.png',
    colors: {
      bg: '#fdfaf6',
      header: '#fdfaf6',
      card: '#ffffff',
      accent: '#c8334c',
      text: '#1a1413',
    },
  },
]

export function isTemplateLocked(templatePlan: TemplatePlan, userPlan: TemplatePlan): boolean {
  return PLAN_RANK[templatePlan] > PLAN_RANK[userPlan]
}
