export type Plan = 'FREE' | 'PRO' | 'BUSINESS'

export interface MyStoreItem {
  id: string
  slug: string
  name: string
  plan: Plan
  isActive: boolean
  logo: string | null
}

export interface ListMyStoresResponse {
  stores: MyStoreItem[]
  activeStoreId: string | null
}

export interface SwitchStoreDto {
  storeId: string
}

export interface SwitchStoreResponse {
  activeStoreId: string
  store: MyStoreItem
}
