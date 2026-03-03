import type { HttpClient } from '@/lib/http/client'
import type { PaginatedResult } from '@/lib/http/types'
import type { IOrdersRepository } from './orders.repository'
import type { OrderResponse, StoreStats, OrderStatus, OrdersFilterParams } from './types'

export class OrdersHttpRepository implements IOrdersRepository {
  constructor(private readonly http: HttpClient) {}

  getStats(storeId: string, from?: string, to?: string): Promise<StoreStats> {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    return this.http.get<StoreStats>(`/api/stores/${storeId}/stats${qs ? `?${qs}` : ''}`)
  }

  getOrders(storeId: string, params: OrdersFilterParams = {}): Promise<PaginatedResult<OrderResponse>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.status) qs.set('status', params.status)
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder)
    const q = qs.toString()
    return this.http.get<PaginatedResult<OrderResponse>>(`/api/stores/${storeId}/orders${q ? `?${q}` : ''}`)
  }

  updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<OrderResponse> {
    return this.http.patch<OrderResponse>(`/api/stores/${storeId}/orders/${orderId}/status`, { status })
  }

  async exportCsv(storeId: string): Promise<string> {
    const res = await fetch(`${this.getBaseUrl()}/api/stores/${storeId}/orders/export`, {
      headers: this.getAuthHeaders(),
    })
    return res.text()
  }

  // These helpers access the underlying http client's base URL and token
  // For CSV we need raw text response so we bypass the JSON-based http client
  private getBaseUrl(): string {
    return (this.http as any).baseUrl
  }

  private getAuthHeaders(): Record<string, string> {
    const token = (this.http as any).tokenStorage?.getAccessToken?.()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
