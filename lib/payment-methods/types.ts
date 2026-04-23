export type PaymentMethodType =
  | 'PAGO_MOVIL'
  | 'ZELLE'
  | 'BINANCE'
  | 'TRANSFER'
  | 'CASH'
  | 'OTHER'

export interface PagoMovilDetails {
  phone: string
  idNumber: string
  bank: string
}

export interface ZelleDetails {
  email: string
  holderName: string
}

export interface BinanceDetails {
  binanceId?: string
  email?: string
}

export interface TransferDetails {
  bank: string
  accountNumber: string
  accountType: 'ahorros' | 'corriente'
  idNumber: string
  holderName: string
}

export interface CashDetails {
  currency: 'USD' | 'VES'
}

export interface OtherDetails {
  [key: string]: unknown
}

export type PaymentMethodDetails =
  | PagoMovilDetails
  | ZelleDetails
  | BinanceDetails
  | TransferDetails
  | CashDetails
  | OtherDetails

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string
  details: Record<string, unknown>
  instructions: string | null
  enabled: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType
  label: string
  details: Record<string, unknown>
  instructions?: string
  enabled?: boolean
  displayOrder?: number
}

export type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>
