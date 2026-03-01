import type { PaginatedResult } from '@/lib/http/types'
import type { CategoryResponse } from './types'

export interface ICategoryRepository {
  findAll(storeId: string): Promise<PaginatedResult<CategoryResponse>>
}
