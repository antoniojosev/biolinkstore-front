import type { StoreProfile, Product, Category } from './types'

export interface StorePageData {
  store: StoreProfile
  products: Product[]
  categories: Category[]
}

/**
 * Fetches public store data by slug.
 *
 * TODO: Replace mock with real API call:
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/${slug}`)
 *   if (!res.ok) return null
 *   return res.json()
 */
export async function getStoreBySlug(slug: string): Promise<StorePageData | null> {
  return getMockStore(slug)
}

// ─── Unsplash photo helper ────────────────────────────────────────────────────

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`

// ─── Shared mock products ─────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vestido Floral Primavera',
    price: 4500,
    comparePrice: 6200,
    images: [u('1515372039744-b8f02a3ae446'), u('1469334031218-e382a71b716b')],
    category: 'Vestidos',
    description: 'Vestido floral con tela ligera, perfecto para el verano. Disponible en tallas S, M y L.',
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Blusa Satén Off-Shoulder',
    price: 2800,
    images: [u('1485462537746-965f33f7f6a7'), u('1434389677669-e08b4cec1105')],
    category: 'Blusas',
    description: 'Blusa de satén con hombros descubiertos. Ideal para salidas nocturnas.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Pantalón Wide Leg Beige',
    price: 3900,
    comparePrice: 4800,
    images: [u('1509631179647-0177331693ae'), u('1594938298603-a3d1d2b8e456')],
    category: 'Pantalones',
    description: 'Pantalón palazzo de tiro alto. Muy cómodo, ideal para oficina y salidas.',
    inStock: true,
  },
  {
    id: '4',
    name: 'Aretes Dorados Minimalistas',
    price: 890,
    images: [u('1535556116002-6281ff3e9f36'), u('1611085583191-a3b181a88401')],
    category: 'Accesorios',
    description: 'Aretes bañados en oro de 18k. Diseño geométrico minimalista.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Mules Destalonadas Nude',
    price: 5200,
    images: [u('1542291026-7eec264c27ff'), u('1543163521-1bf539c55dd2')],
    category: 'Zapatos',
    description: 'Mules de cuero vegano en color nude. Taco de 6 cm.',
    inStock: false,
  },
  {
    id: '6',
    name: 'Vestido Midi Negro Elegante',
    price: 5800,
    images: [u('1469334031218-e382a71b716b'), u('1515372039744-b8f02a3ae446')],
    category: 'Vestidos',
    description: 'Vestido midi con corte en A. Perfecto para eventos formales.',
    inStock: true,
    featured: true,
  },
  {
    id: '7',
    name: 'Collar de Perlas Delicado',
    price: 1200,
    comparePrice: 1800,
    images: [u('1611085583191-a3b181a88401'), u('1535556116002-6281ff3e9f36')],
    category: 'Accesorios',
    description: 'Collar con perlas cultivadas de agua dulce. Cierre de plata 925.',
    inStock: true,
  },
  {
    id: '8',
    name: 'Jean Tiro Alto Mom Fit',
    price: 4200,
    images: [u('1541099649105-f69ad21f3246'), u('1596755094514-f87e34085b2c')],
    category: 'Pantalones',
    description: 'Jean de tiro alto con corte holgado. Telas premium, muy favorecedor.',
    inStock: true,
  },
  {
    id: '9',
    name: 'Stilettos de Charol Negro',
    price: 6500,
    images: [u('1543163521-1bf539c55dd2'), u('1542291026-7eec264c27ff')],
    category: 'Zapatos',
    description: 'Stilettos de charol con punta fina. Taco de 10 cm.',
    inStock: true,
  },
  {
    id: '10',
    name: 'Blusa Crop de Lino',
    price: 2200,
    comparePrice: 2900,
    images: [u('1434389677669-e08b4cec1105'), u('1485462537746-965f33f7f6a7')],
    category: 'Blusas',
    description: 'Blusa crop 100% lino. Fresca, elegante y sustentable.',
    inStock: true,
  },
  {
    id: '11',
    name: 'Bolso Bucket Camel',
    price: 7800,
    images: [u('1548036328-c9fa89d128fa'), u('1584917865442-de89df76afd3')],
    category: 'Accesorios',
    description: 'Bolso bucket de cuero genuino. Incluye bolsillo interior y correa ajustable.',
    inStock: true,
    featured: true,
  },
  {
    id: '12',
    name: 'Vestido Lencero Satén',
    price: 3600,
    images: [u('1583743814966-8d4f4e4b5e4f'), u('1515372039744-b8f02a3ae446')],
    category: 'Vestidos',
    description: 'Vestido lencero con breteles finos. Viene en champagne y negro.',
    inStock: true,
  },
]

const CATEGORIES: Category[] = [
  { id: '1', name: 'Vestidos', slug: 'vestidos' },
  { id: '2', name: 'Blusas', slug: 'blusas' },
  { id: '3', name: 'Pantalones', slug: 'pantalones' },
  { id: '4', name: 'Accesorios', slug: 'accesorios' },
  { id: '5', name: 'Zapatos', slug: 'zapatos' },
]

// ─── Mock store builder ───────────────────────────────────────────────────────

function getMockStore(slug: string): StorePageData {
  const templateMap: Record<string, StoreProfile['template']> = {
    'demo-vitrina': 'vitrina',
    'demo-luxora': 'luxora',
    'demo-noir': 'noir',
    vitrina: 'vitrina',
    luxora: 'luxora',
    noir: 'noir',
  }

  const nameMap: Record<string, string> = {
    'demo-vitrina': 'Moda Latina',
    'demo-luxora': 'Luxora Studio',
    'demo-noir': 'Maison Noir',
    vitrina: 'Moda Latina',
    luxora: 'Luxora Studio',
    noir: 'Maison Noir',
  }

  const template = templateMap[slug] ?? 'vitrina'
  const name = nameMap[slug] ?? 'Mi Tienda'

  return {
    store: {
      id: slug,
      name,
      slug,
      username: `@${slug.replace('demo-', '')}.store`,
      bio: 'Moda femenina seleccionada ✨ | Envíos a todo el país | Nuevas colecciones cada semana',
      coverImage: '/cover.webp',
      avatar: u('1529626455594-4ff0802cfb7e', 120),
      whatsappNumbers: ['5491123456789'],
      instagramUrl: `https://instagram.com/${slug}.store`,
      primaryColor: '#10b981',
      currency: 'ARS',
      template,
    },
    products: PRODUCTS,
    categories: CATEGORIES,
  }
}
