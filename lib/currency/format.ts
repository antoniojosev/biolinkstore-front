import type { Rate } from './types'

/**
 * Formatea un monto (en la moneda base de la tasa) como VES.
 * Ej: convert(10, USD_BCV_rate) -> "Bs 420,50"
 */
export function formatBs(amount: number, rate: Rate): string {
  const bs = amount * rate.valueVes
  return `Bs ${bs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Formatea un monto en su moneda base con simbolo apropiado.
 * USD -> "$10.50", EUR -> "€10.50", VES -> "Bs 10,50", otros -> "10.50 XXX".
 */
export function formatInBase(amount: number, baseCurrency: string): string {
  if (baseCurrency === 'USD') {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  if (baseCurrency === 'EUR') {
    return `€${amount.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  if (baseCurrency === 'VES') {
    return `Bs ${amount.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${baseCurrency}`
}

/**
 * Convierte un monto expresado en la moneda base de `from` a la moneda base de `to`,
 * usando VES como pivote (ambas tasas son valueVes respecto a sus monedas base).
 */
export function convert(amount: number, from: Rate, to: Rate): number {
  if (from.code === to.code) return amount
  const amountInVes = amount * from.valueVes
  return amountInVes / to.valueVes
}

/**
 * Formatea el monto expresado en `from` como texto en la moneda `to`.
 */
export function formatConverted(amount: number, from: Rate, to: Rate): string {
  const converted = convert(amount, from, to)
  return formatInBase(converted, to.baseCurrency)
}

/**
 * Formatea la fecha del fetch de la tasa para mostrar en UI (es-VE, dd/mm/yyyy).
 */
export function formatFetchedDate(rate: Rate): string {
  const d = new Date(rate.fetchedAt)
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
