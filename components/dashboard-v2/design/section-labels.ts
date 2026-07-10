// Nombres/íconos legibles por tipo de sección — el schema del backend no trae
// un label a nivel de sección (solo a nivel de cada prop), así que se mantiene
// acá. Usado por sections-panel.tsx y section-inspector.tsx.
export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  product_grid: "Grid de productos",
  featured_products: "Productos destacados",
  categories: "Categorías",
  about: "Sobre nosotros",
  contact: "Contacto",
  hours: "Horarios",
  socials: "Redes sociales",
  gallery: "Galería",
  text_block: "Bloque de texto",
  cta_banner: "Banner CTA",
  faq: "Preguntas frecuentes",
  stats: "Estadísticas",
  testimonials: "Testimonios",
  map: "Mapa / ubicación",
}

export const SECTION_ICONS: Record<string, string> = {
  hero: "◧",
  product_grid: "▦",
  featured_products: "★",
  categories: "▤",
  about: "◐",
  contact: "☎",
  hours: "🕐",
  socials: "🔗",
  gallery: "▥",
  text_block: "¶",
  cta_banner: "◈",
  faq: "❔",
  stats: "📊",
  testimonials: "💬",
  map: "📍",
}

export function sectionLabel(type: string): string {
  return SECTION_LABELS[type] ?? type
}
