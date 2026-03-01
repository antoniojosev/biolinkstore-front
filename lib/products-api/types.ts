export interface ProductResponse {
  id: string
  storeId: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  compareAtPrice: number | null
  prices: unknown
  images: string[]
  videos: string[]
  stock: number | null
  sku: string | null
  isVisible: boolean
  isFeatured: boolean
  isOnSale: boolean
  sortOrder: number
  attributes: ProductAttributeResponse[]
  variants: ProductVariantResponse[]
  categoryIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductAttributeResponse {
  id: string
  name: string
  options: string[]
  sortOrder: number
}

export interface ProductVariantResponse {
  id: string
  combination: Record<string, string>
  sku: string | null
  priceAdjustment: number
  stock: number | null
  image: string | null
  isAvailable: boolean
}

export interface CreateProductDto {
  name: string
  description?: string
  basePrice: number
  compareAtPrice?: number
  images?: string[]
  videos?: string[]
  stock?: number
  sku?: string
  isVisible?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  attributes?: ProductAttributeDto[]
  categoryIds?: string[]
}

export interface ProductAttributeDto {
  name: string
  options: string[]
  sortOrder?: number
}

export interface UpdateProductDto {
  name?: string
  description?: string
  basePrice?: number
  compareAtPrice?: number
  images?: string[]
  videos?: string[]
  stock?: number
  sku?: string
  isVisible?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  categoryIds?: string[]
}

export interface ProductFilterParams {
  page?: number
  limit?: number
  categoryId?: string
  isVisible?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UploadResponse {
  url: string
  key: string
  mimeType: string
  size: number
}
