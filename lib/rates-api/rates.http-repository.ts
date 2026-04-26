import type { HttpClient } from '@/lib/http/client'
import type {
  CustomRate,
  CreateCustomRateDto,
  UpdateCustomRateDto,
  OfficialRate,
} from './types'

export class RatesHttpRepository {
  constructor(private readonly http: HttpClient) {}

  /** Public — official rates catalog with current value */
  listOfficial(): Promise<OfficialRate[]> {
    return this.http.get<OfficialRate[]>('/api/public/rates')
  }

  /** Auth — vendor's custom rates */
  listCustom(storeId: string): Promise<CustomRate[]> {
    return this.http.get<CustomRate[]>(`/api/stores/${storeId}/custom-rates`)
  }

  createCustom(storeId: string, dto: CreateCustomRateDto): Promise<CustomRate> {
    return this.http.post<CustomRate>(`/api/stores/${storeId}/custom-rates`, dto)
  }

  updateCustom(
    storeId: string,
    rateId: string,
    dto: UpdateCustomRateDto,
  ): Promise<CustomRate> {
    return this.http.patch<CustomRate>(`/api/stores/${storeId}/custom-rates/${rateId}`, dto)
  }

  deleteCustom(storeId: string, rateId: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/custom-rates/${rateId}`)
  }
}
