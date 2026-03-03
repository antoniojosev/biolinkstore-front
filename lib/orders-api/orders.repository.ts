import type { PaginatedResult } from '@/lib/http/types'
import type { OrderResponse, StoreStats, OrderStatus, OrdersFilterParams } from './types'

export interface IOrdersRepository {
  getStats(storeId: string, from?: string, to?: string): Promise<StoreStats>
  getOrders(storeId: string, params?: OrdersFilterParams): Promise<PaginatedResult<OrderResponse>>
  updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<OrderResponse>
  exportCsv(storeId: string): Promise<string>
}
