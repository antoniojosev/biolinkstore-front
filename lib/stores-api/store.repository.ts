import type { PaginatedResponse } from '@/lib/http/types'
import type { DashboardStore, CreateStoreDto, UpdateStoreDto } from './types'

export interface IStoreRepository {
  findAll(): Promise<PaginatedResponse<DashboardStore>>
  findById(id: string): Promise<DashboardStore>
  create(dto: CreateStoreDto): Promise<DashboardStore>
  update(id: string, dto: UpdateStoreDto): Promise<DashboardStore>
  remove(id: string): Promise<void>
}
