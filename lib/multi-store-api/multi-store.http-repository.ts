import type { HttpClient } from '@/lib/http/client'
import type {
  ListMyStoresResponse,
  SwitchStoreDto,
  SwitchStoreResponse,
  MyStoreItem,
} from './types'

export class MultiStoreHttpRepository {
  constructor(private readonly http: HttpClient) {}

  listMine(): Promise<ListMyStoresResponse> {
    return this.http.get<ListMyStoresResponse>('/api/users/me/stores')
  }

  switchActive(dto: SwitchStoreDto): Promise<SwitchStoreResponse> {
    return this.http.post<SwitchStoreResponse>('/api/users/me/stores/switch', dto)
  }

  createAdditional(name: string): Promise<MyStoreItem> {
    return this.http.post<MyStoreItem>('/api/users/me/stores', { name })
  }
}
