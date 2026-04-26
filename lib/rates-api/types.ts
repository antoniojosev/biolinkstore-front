export type CustomRateMode = 'MANUAL' | 'FORMULA' | 'API'

export interface OfficialRate {
  code: string
  label: string
  baseCurrency: string
  valueVes: number
  fetchedAt: string
}

export interface CustomRate {
  id: string
  storeId: string
  label: string
  baseCurrency: string
  mode: CustomRateMode
  valueVes: number | null
  formula: string | null
  sourceUrl: string | null
  sourcePath: string | null
  lastValue: number | null
  lastFetchedAt: string | null
  createdAt: string
  updatedAt: string
  /** Computed by backend: current resolved value (null if cannot resolve) */
  resolvedValueVes?: number | null
}

export interface CreateCustomRateDto {
  label: string
  baseCurrency: string
  mode: CustomRateMode
  valueVes?: number
  formula?: string
  sourceUrl?: string
  sourcePath?: string
}

export interface UpdateCustomRateDto {
  label?: string
  baseCurrency?: string
  valueVes?: number
  formula?: string
  sourceUrl?: string
  sourcePath?: string
}

export interface StoreCurrencyConfig {
  visibleRates?: string[]
  defaultRate?: string
  [k: string]: unknown
}
