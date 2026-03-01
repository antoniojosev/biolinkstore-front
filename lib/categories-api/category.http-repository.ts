import type { HttpClient } from '@/lib/http/client'
import type { PaginatedResult } from '@/lib/http/types'
import type { ICategoryRepository } from './category.repository'
import type { CategoryResponse } from './types'

export class CategoryHttpRepository implements ICategoryRepository {
  constructor(private readonly http: HttpClient) {}

  findAll(storeId: string): Promise<PaginatedResult<CategoryResponse>> {
    return this.http.get(`/api/stores/${storeId}/categories?limit=100`)
  }
}
