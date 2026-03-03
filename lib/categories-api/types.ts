export interface CategoryResponse {
  id: string
  storeId: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isVisible: boolean
  sortOrder: number
  productCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  image?: string
  isVisible?: boolean
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  image?: string
  isVisible?: boolean
}
