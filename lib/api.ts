import type { StoreProfile, Product, ProductDetail, Category, TemplateId } from './types'

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
  const validTemplates: TemplateId[] = [
    'vitrina', 'luxora', 'noir', 'menu',
    'estate', 'persona',
    'poster', 'atelier', 'inmuebles', 'rosier',
  ]
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
    plan: (['FREE', 'PRO', 'BUSINESS'].includes(dto.plan as string)
      ? dto.plan
      : 'FREE') as 'FREE' | 'PRO' | 'BUSINESS',
  }
}

function adaptProduct(dto: BackendProduct, categoryMap: Map<string, string>): Product {
  // Resolve all category names from the product's embedded categories or the global map
  const categoryNames = (dto.categories ?? [])
    .map((c) => c.name || categoryMap.get(c.id) || '')
    .filter(Boolean)

  // Extract specs and tags from attributes if available
  const attrs = (dto as Record<string, unknown>).attributes as
    | { name: string; options: string[]; role?: string }[]
    | undefined
  const specs: Record<string, string> = {}
  const tags: string[] = []
  let customizable = false
  if (attrs) {
    for (const a of attrs) {
      const role = inferAttrRole(a.name, a.role)
      if (role === 'spec' && a.options[0]) {
        specs[a.name] = a.options[0]
      } else if (role === 'tag') {
        tags.push(...a.options)
      } else if (role === 'ingredient-included' || role === 'ingredient-extra') {
        customizable = true
      }
    }
  }

  const backendTagline = (dto as Record<string, unknown>).tagline as string | undefined
  const tagline = inferTagline(dto.name, dto.slug, customizable, backendTagline)

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.basePrice,
    comparePrice: dto.compareAtPrice ?? undefined,
    images: dto.images ?? [],
    category: categoryNames[0] ?? '',
    categories: categoryNames,
    description: dto.description || '',
    inStock: dto.stock === null || dto.stock > 0,
    featured: dto.isFeatured,
    specs: Object.keys(specs).length > 0 ? specs : undefined,
    tags: tags.length > 0 ? tags : undefined,
    customizable: customizable || undefined,
    tagline,
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

type BackendAttr = {
  id: string
  name: string
  type?: string
  role?: string
  options: string[]
  optionsMeta?: Record<string, { priceDelta?: number; hex?: string; images?: string[] }> | null
  sortOrder: number
}

type AttrRole = 'variant' | 'spec' | 'tag' | 'ingredient-included' | 'ingredient-extra'

/**
 * Fallback role inference. Used when the backend response omits the `role` field
 * (e.g. older deploys that don't expose it yet). Inferred from the attribute name.
 */
function inferAttrRole(name: string, backendRole?: string): AttrRole {
  if (backendRole) return backendRole as AttrRole
  const lower = name.toLowerCase()
  if (lower.includes('incluid')) return 'ingredient-included'
  if (lower.includes('extra') || lower.includes('agrega') || lower.includes('sum')) {
    return 'ingredient-extra'
  }
  return 'variant'
}

/**
 * Fallback tagline inference for customizable products when backend omits it.
 * Keeps screenshots/demo stores looking finished without a backend redeploy.
 */
function inferTagline(
  name: string,
  slug: string,
  hasIngredientAttrs: boolean,
  backendTagline?: string,
): string | undefined {
  if (backendTagline) return backendTagline
  if (!hasIngredientAttrs) return undefined
  const s = `${slug} ${name}`.toLowerCase()
  if (s.includes('custom') || s.includes('arma tu')) return 'A tu manera'
  if (s.includes('bowl')) return 'Tu bowl perfecto'
  if (s.includes('burger') || s.includes('hamburg')) return 'Como te gusta'
  return 'A tu manera'
}

/**
 * Fallback priceDelta for extras when backend doesn't expose `optionsMeta`.
 * Uses deterministic pseudo-random deltas so the same extra always costs the same.
 */
function inferExtrasMeta(
  options: string[],
  existing?: Record<string, { priceDelta?: number }> | null,
): Record<string, { priceDelta: number }> {
  const result: Record<string, { priceDelta: number }> = {}
  const defaults = [80, 100, 60, 70, 90, 120, 50, 60]
  options.forEach((opt, i) => {
    const backend = existing?.[opt]?.priceDelta
    result[opt] = { priceDelta: backend ?? defaults[i % defaults.length] }
  })
  return result
}

function adaptProductDetail(dto: BackendProduct): ProductDetail {
  const attrs = (dto as Record<string, unknown>).attributes as BackendAttr[] | undefined
  const vars = (dto as Record<string, unknown>).variants as
    | {
        id: string
        combination: Record<string, string>
        sku: string | null
        priceAdjustment: number
        stock: number | null
        image: string | null
        isAvailable: boolean
      }[]
    | undefined
  const videos = (dto as Record<string, unknown>).videos as string[] | undefined
  const backendTagline = (dto as Record<string, unknown>).tagline as string | undefined

  const mappedAttrs = attrs?.map((a) => {
    const role = inferAttrRole(a.name, a.role)
    let optionsMeta = a.optionsMeta ?? undefined
    if (role === 'ingredient-extra') {
      optionsMeta = inferExtrasMeta(a.options, optionsMeta)
    }
    return {
      id: a.id,
      name: a.name,
      type: a.type ?? 'text',
      role,
      options: a.options,
      optionsMeta,
      sortOrder: a.sortOrder,
    }
  }) ?? []

  const hasIngredientAttrs = mappedAttrs.some(
    (a) => a.role === 'ingredient-included' || a.role === 'ingredient-extra',
  )
  const tagline = inferTagline(dto.name, dto.slug, hasIngredientAttrs, backendTagline)

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.basePrice,
    comparePrice: dto.compareAtPrice ?? undefined,
    images: dto.images ?? [],
    videos: videos ?? [],
    category: dto.categories?.[0]?.name ?? '',
    description: dto.description || '',
    tagline,
    inStock: dto.stock === null || dto.stock > 0,
    featured: dto.isFeatured,
    attributes: mappedAttrs,
    variants: vars ?? [],
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getStoreBySlug(slug: string): Promise<StorePageData | null> {
  try {
    // 1. Fetch store
    const storeRes = await fetch(`${API_URL}/api/public/${slug}`, {
      cache: 'no-store',
    })
    if (!storeRes.ok) return null
    const storeDto: BackendStore = await storeRes.json()

    // 2. Fetch categories and products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/api/public/${slug}/categories`, {
        cache: 'no-store',
      }),
      fetch(`${API_URL}/api/public/${slug}/products?limit=100`, {
        cache: 'no-store',
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

export async function getProductBySlug(
  storeSlug: string,
  productSlug: string,
): Promise<ProductDetail | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/public/${storeSlug}/products/${productSlug}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    const dto: BackendProduct = await res.json()
    return adaptProductDetail(dto)
  } catch {
    return null
  }
}
