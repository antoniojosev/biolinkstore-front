import type { StoreProfile, Product, Category, TemplateId } from './types'

export interface StorePageData {
  store: StoreProfile
  products: Product[]
  categories: Category[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ─── Backend DTO types (match public endpoint responses) ─────────────────────

interface BackendStore {
  id: string
  slug: string
  name: string
  description: string | null
  logo: string | null
  banner: string | null
  primaryColor: string
  template: string
  whatsappNumbers: string[]
  instagramHandle: string | null
  currencyConfig: { code?: string; symbol?: string } | null
  [key: string]: unknown
}

interface BackendProduct {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  compareAtPrice: number | null
  images: string[]
  stock: number | null
  isFeatured: boolean
  isOnSale: boolean
  categories?: { id: string; name: string; slug: string }[]
  [key: string]: unknown
}

interface BackendCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  productCount: number
}

// ─── Adapters: backend DTO → frontend domain types ──────────────────────────

function adaptStore(dto: BackendStore): StoreProfile {
  const validTemplates: TemplateId[] = ['vitrina', 'luxora', 'noir']
  const template: TemplateId = validTemplates.includes(dto.template as TemplateId)
    ? (dto.template as TemplateId)
    : 'vitrina'

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    username: `@${dto.slug}`,
    avatar: dto.logo ?? undefined,
    coverImage: dto.banner ?? undefined,
    bio: dto.description ?? undefined,
    whatsappNumbers: dto.whatsappNumbers ?? [],
    instagramUrl: dto.instagramHandle
      ? `https://instagram.com/${dto.instagramHandle}`
      : undefined,
    primaryColor: dto.primaryColor || '#10b981',
    currency: dto.currencyConfig?.code || 'USD',
    template,
  }
}

function adaptProduct(dto: BackendProduct, categoryMap: Map<string, string>): Product {
  // Resolve category name from the product's embedded categories or the global map
  const categoryName =
    dto.categories?.[0]?.name ||
    (dto.categories?.[0]?.id ? categoryMap.get(dto.categories[0].id) : undefined) ||
    ''

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.basePrice,
    comparePrice: dto.compareAtPrice ?? undefined,
    images: dto.images ?? [],
    category: categoryName,
    description: dto.description || '',
    inStock: dto.stock === null || dto.stock > 0,
    featured: dto.isFeatured,
  }
}

function adaptCategory(dto: BackendCategory): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    image: dto.image ?? undefined,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getStoreBySlug(slug: string): Promise<StorePageData | null> {
  try {
    // 1. Fetch store
    const storeRes = await fetch(`${API_URL}/api/public/${slug}`, {
      next: { revalidate: 30 },
    })
    if (!storeRes.ok) return null
    const storeDto: BackendStore = await storeRes.json()

    // 2. Fetch categories and products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/api/public/${slug}/categories`, {
        next: { revalidate: 30 },
      }),
      fetch(`${API_URL}/api/public/${slug}/products?limit=100`, {
        next: { revalidate: 30 },
      }),
    ])

    const categoriesDto: BackendCategory[] = categoriesRes.ok
      ? await categoriesRes.json()
      : []

    const productsData = productsRes.ok ? await productsRes.json() : { data: [] }
    const productsDto: BackendProduct[] = productsData.data ?? productsData

    // Build category lookup map (id → name)
    const categoryMap = new Map<string, string>()
    categoriesDto.forEach((c) => categoryMap.set(c.id, c.name))

    return {
      store: adaptStore(storeDto),
      products: productsDto.map((p) => adaptProduct(p, categoryMap)),
      categories: categoriesDto.map(adaptCategory),
    }
  } catch {
    return null
  }
}
