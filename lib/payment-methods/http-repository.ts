import type { HttpClient } from '@/lib/http/client'
import type {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from './types'

export class PaymentMethodsHttpRepository {
  constructor(private readonly http: HttpClient) {}

  list(storeId: string): Promise<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`/api/stores/${storeId}/payment-methods`)
  }

  create(storeId: string, dto: CreatePaymentMethodInput): Promise<PaymentMethod> {
    return this.http.post<PaymentMethod>(`/api/stores/${storeId}/payment-methods`, dto)
  }

  update(
    storeId: string,
    id: string,
    dto: UpdatePaymentMethodInput,
  ): Promise<PaymentMethod> {
    return this.http.patch<PaymentMethod>(
      `/api/stores/${storeId}/payment-methods/${id}`,
      dto,
    )
  }

  remove(storeId: string, id: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/payment-methods/${id}`)
  }
}
