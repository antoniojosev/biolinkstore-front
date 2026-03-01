import type { PaginatedResult } from '@/lib/http/types'
import type {
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterParams,
  UploadResponse,
} from './types'

export interface IProductRepository {
  findAll(storeId: string, params?: ProductFilterParams): Promise<PaginatedResult<ProductResponse>>
  findById(storeId: string, productId: string): Promise<ProductResponse>
  create(storeId: string, dto: CreateProductDto): Promise<ProductResponse>
  update(storeId: string, productId: string, dto: UpdateProductDto): Promise<ProductResponse>
  remove(storeId: string, productId: string): Promise<void>
  duplicate(storeId: string, productId: string): Promise<ProductResponse>
  uploadImages(storeId: string, files: File[]): Promise<UploadResponse[]>
}
