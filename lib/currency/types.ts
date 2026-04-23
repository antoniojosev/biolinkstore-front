export interface Rate {
  code: string
  label: string
  baseCurrency: string
  valueVes: number
  fetchedAt: string
}

export interface StoreVisibleRates {
  rates: Rate[]
  defaultRate?: string
}
