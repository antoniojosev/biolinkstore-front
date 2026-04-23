import type { HttpClient } from '@/lib/http/client'

export type CustomRateMode = 'MANUAL' | 'FORMULA' | 'API'

export interface CustomRate {
  id: string
  label: string
  baseCurrency: string
  mode: CustomRateMode
  valueVes: number | null
  formula: string | null
  sourceUrl: string | null
  sourcePath: string | null
  resolvedValue: number | null
  resolvedAt: string | null
}

export interface CreateCustomRateInput {
  label: string
  baseCurrency: string
  mode: CustomRateMode
  valueVes?: number
  formula?: string
  sourceUrl?: string
  sourcePath?: string
}

export type UpdateCustomRateInput = Partial<CreateCustomRateInput>

export class CustomRatesHttpRepository {
  constructor(private readonly http: HttpClient) {}

  list(storeId: string): Promise<CustomRate[]> {
    return this.http.get<CustomRate[]>(`/api/stores/${storeId}/custom-rates`)
  }

  create(storeId: string, dto: CreateCustomRateInput): Promise<CustomRate> {
    return this.http.post<CustomRate>(`/api/stores/${storeId}/custom-rates`, dto)
  }

  update(storeId: string, id: string, dto: UpdateCustomRateInput): Promise<CustomRate> {
    return this.http.patch<CustomRate>(`/api/stores/${storeId}/custom-rates/${id}`, dto)
  }

  remove(storeId: string, id: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/custom-rates/${id}`)
  }
}
