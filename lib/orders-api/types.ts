export type OrderStatus = 'PENDING' | 'CONTACTED' | 'ACCEPTED' | 'REJECTED'

export interface OrderItemResponse {
  id: string
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  unitPrice: number
  quantity: number
}

export interface OrderResponse {
  id: string
  storeId: string
  items: OrderItemResponse[]
  subtotal: number
  total: number
  currency: string
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  customerAddress: string | null
  customerNotes: string | null
  status: OrderStatus
  channel: 'WHATSAPP' | 'INSTAGRAM'
  whatsappNumber: string | null
  whatsappUrl: string | null
  createdAt: string
}

export interface StoreStats {
  totalQuotes: number
  uniqueVisitors: number
  productViews: number
  newQuotesCount: number
  viewsByCategory: Array<{ categoryName: string; views: number }>
  visitsByDay: Array<{ date: string; count: number }>
  viewsByProduct: Array<{ productId: string; productName: string; views: number }>
}

export interface OrdersFilterParams {
  page?: number
  limit?: number
  status?: OrderStatus
  sortOrder?: 'asc' | 'desc'
}
