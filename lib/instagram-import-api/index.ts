// Contrato real contra el backend de import de Instagram (Apify + Claude Haiku).
// Reemplaza un contrato especulativo anterior (jobs/candidatos con revisión
// previa) por el flujo que se construyó de verdad: el backend clasifica y
// crea los productos directo (ocultos), el vendedor los revisa en el
// catálogo normal — no hay paso de "aprobar candidatos" en el frontend.
import type { HttpClient } from "@/lib/http/client"

export type InstagramImportStatus = "RUNNING" | "PROCESSING" | "DONE" | "FAILED"

export interface InstagramImportProduct {
  id: string
  name: string
  images: string[]
  basePrice: number
}

export interface InstagramImportStatusResponse {
  id: string
  status: InstagramImportStatus
  handle: string
  profileName: string | null
  profileFollowers: number | null
  postsFound: number
  postsProcessed: number
  postsSkipped: number
  productsCreated: number
  products: InstagramImportProduct[]
  error: string | null
  requestedAt: string
  finishedAt: string | null
}

export class InstagramImportHttpRepository {
  constructor(private readonly http: HttpClient) {}

  /** null cuando la tienda todavía no pidió ningún import (404 del backend). */
  async getLatest(storeId: string): Promise<InstagramImportStatusResponse | null> {
    try {
      return await this.http.get<InstagramImportStatusResponse>(
        `/api/stores/${storeId}/instagram-import/latest`,
      )
    } catch (err) {
      const e = err as { status?: number; isNotFound?: boolean }
      if (e?.status === 404 || e?.isNotFound) return null
      throw err
    }
  }
}
