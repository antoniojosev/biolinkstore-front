import type { HttpClient } from '@/lib/http/client'
import type { PaginatedResponse } from '@/lib/http/types'
import type { IStoreRepository } from './store.repository'
import type { DashboardStore, CreateStoreDto, UpdateStoreDto } from './types'

export class StoreHttpRepository implements IStoreRepository {
  constructor(private readonly http: HttpClient) {}

  findAll(): Promise<PaginatedResponse<DashboardStore>> {
    return this.http.get<PaginatedResponse<DashboardStore>>('/api/stores')
  }

  findById(id: string): Promise<DashboardStore> {
    return this.http.get<DashboardStore>(`/api/stores/${id}`)
  }

  create(dto: CreateStoreDto): Promise<DashboardStore> {
    return this.http.post<DashboardStore>('/api/stores', dto)
  }

  update(id: string, dto: UpdateStoreDto): Promise<DashboardStore> {
    return this.http.patch<DashboardStore>(`/api/stores/${id}`, dto)
  }

  remove(id: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${id}`)
  }
}
