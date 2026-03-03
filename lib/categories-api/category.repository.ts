import type { PaginatedResult } from '@/lib/http/types'
import type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from './types'

export interface ICategoryRepository {
  findAll(storeId: string): Promise<PaginatedResult<CategoryResponse>>
  create(storeId: string, data: CreateCategoryDto): Promise<CategoryResponse>
  update(storeId: string, categoryId: string, data: UpdateCategoryDto): Promise<CategoryResponse>
  remove(storeId: string, categoryId: string): Promise<void>
}
