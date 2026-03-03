import type { HttpClient } from '@/lib/http/client'
import type { PaginatedResult } from '@/lib/http/types'
import type { ICategoryRepository } from './category.repository'
import type { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from './types'

export class CategoryHttpRepository implements ICategoryRepository {
  constructor(private readonly http: HttpClient) {}

  findAll(storeId: string): Promise<PaginatedResult<CategoryResponse>> {
    return this.http.get(`/api/stores/${storeId}/categories?limit=100`)
  }

  create(storeId: string, data: CreateCategoryDto): Promise<CategoryResponse> {
    return this.http.post(`/api/stores/${storeId}/categories`, data)
  }

  update(storeId: string, categoryId: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.http.patch(`/api/stores/${storeId}/categories/${categoryId}`, data)
  }

  remove(storeId: string, categoryId: string): Promise<void> {
    return this.http.delete(`/api/stores/${storeId}/categories/${categoryId}`)
  }
}
