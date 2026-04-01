import type { PaymentProvider, CheckoutPayload, CheckoutResult } from './types'
import { getOrCreateVisitorId, trackEvent } from '@/lib/analytics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class WhatsAppPaymentProvider implements PaymentProvider {
  readonly id = 'whatsapp'
  readonly label = 'WhatsApp'

  constructor(
    private readonly whatsappNumber: string,
    private readonly currency: string = 'ARS',
  ) {}

  async checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
    const visitorId = await getOrCreateVisitorId()

    // Try to create order on backend first
    try {
      const response = await fetch(`${API_URL}/api/public/${payload.storeSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          customerName: payload.customer?.name,
          customerPhone: payload.customer?.phone,
          customerNotes: payload.customer?.notes,
          channel: 'WHATSAPP',
          currency: payload.currency,
          visitorId,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        trackEvent(payload.storeSlug, 'CHECKOUT_COMPLETE')
        if (order.whatsappUrl) {
          window.open(order.whatsappUrl, '_blank')
        } else {
          // Fallback: build URL client-side
          this.openWhatsApp(payload)
        }
        return { success: true, message: 'Cotización creada' }
      }
    } catch {
      // Network error — fallback to client-only
    }

    // Fallback: open WhatsApp without server-side order
    this.openWhatsApp(payload)
    return { success: true, message: 'Redirigido a WhatsApp' }
  }

  private openWhatsApp(payload: CheckoutPayload): void {
    const message = this.buildMessage(payload)
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  private buildMessage(payload: CheckoutPayload): string {
    const fmt = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
    })

    const lines = payload.items.map(
      (item) =>
        `• ${item.name}${item.variant ? ` (${item.variant})` : ''} × ${item.quantity} — ${fmt.format(item.price * item.quantity)}`,
    )

    const parts = [
      '¡Hola! Me gustaría hacer una cotización',
      '',
      ...lines,
      '',
      `*Total: ${fmt.format(payload.total)}*`,
    ]

    if (payload.customer?.name) {
      parts.push('', `Mi nombre: ${payload.customer.name}`)
    }
    if (payload.customer?.phone) {
      parts.push(`Teléfono: ${payload.customer.phone}`)
    }
    if (payload.customer?.notes) {
      parts.push(`Nota: ${payload.customer.notes}`)
    }

    return parts.join('\n').trim()
  }
}
