import type { PaymentProvider, CheckoutPayload, CheckoutResult } from './types'

export class WhatsAppPaymentProvider implements PaymentProvider {
  readonly id = 'whatsapp'
  readonly label = 'WhatsApp'

  constructor(
    private readonly whatsappNumber: string,
    private readonly currency: string = 'ARS',
  ) {}

  async checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
    const message = this.buildMessage(payload)
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    return { success: true, message: 'Redirigido a WhatsApp' }
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
      '¡Hola! Me gustaría hacer una cotización 🛍️',
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
