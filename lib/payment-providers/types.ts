export interface CustomerInfo {
  name: string
  phone: string
  notes?: string
}

export interface CartLineItem {
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
}

export interface CheckoutPayload {
  items: CartLineItem[]
  customer: CustomerInfo
  total: number
  currency: string
  storeSlug: string
}

export interface CheckoutResult {
  success: boolean
  message?: string
  redirectUrl?: string
}

export interface PaymentProvider {
  readonly id: string
  readonly label: string
  checkout(payload: CheckoutPayload): Promise<CheckoutResult>
}
