import type { HttpClient } from '@/lib/http/client'
import type { PaginatedResult } from '@/lib/http/types'
import type { IProductRepository } from './product.repository'
import type {
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
  UploadResponse,
} from './types'

export class ProductHttpRepository implements IProductRepository {
  constructor(private readonly http: HttpClient) {}

  findAll(
    storeId: string,
    params?: ProductFilterParams,
  ): Promise<PaginatedResult<ProductResponse>> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''
    return this.http.get(`/api/stores/${storeId}/products${query}`)
  }

  findById(storeId: string, productId: string): Promise<ProductResponse> {
    return this.http.get(`/api/stores/${storeId}/products/${productId}`)
  }

  create(storeId: string, dto: CreateProductDto): Promise<ProductResponse> {
    return this.http.post(`/api/stores/${storeId}/products`, dto)
  }

  update(storeId: string, productId: string, dto: UpdateProductDto): Promise<ProductResponse> {
    return this.http.patch(`/api/stores/${storeId}/products/${productId}`, dto)
  }

  remove(storeId: string, productId: string): Promise<void> {
    return this.http.delete(`/api/stores/${storeId}/products/${productId}`)
  }

  duplicate(storeId: string, productId: string): Promise<ProductResponse> {
    return this.http.post(`/api/stores/${storeId}/products/${productId}/duplicate`)
  }

  uploadImages(storeId: string, files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return this.http.postFormData(`/api/stores/${storeId}/uploads`, formData)
  }

  createVariant(storeId: string, productId: string, data: { combination: Record<string, string>; priceAdjustment?: number; sku?: string; stock?: number }): Promise<any> {
    return this.http.post(`/api/stores/${storeId}/products/${productId}/variants`, data)
  }

  updateVariant(storeId: string, productId: string, variantId: string, data: { priceAdjustment?: number; sku?: string; stock?: number }): Promise<any> {
    return this.http.patch(`/api/stores/${storeId}/products/${productId}/variants/${variantId}`, data)
  }

  deleteVariant(storeId: string, productId: string, variantId: string): Promise<void> {
    return this.http.delete(`/api/stores/${storeId}/products/${productId}/variants/${variantId}`)
  }
}
