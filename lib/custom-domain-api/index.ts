import type { HttpClient } from "@/lib/http/client"

export type StoreDomainStatus = "PENDING" | "VERIFIED" | "FAILED"

export interface StoreDomainResponse {
  id: string
  domain: string
  status: StoreDomainStatus
  verificationToken: string
  verificationHost: string
  verifiedAt: string | null
  lastCheckedAt: string | null
  createdAt: string
  updatedAt: string
}

export class CustomDomainHttpRepository {
  constructor(private readonly http: HttpClient) {}

  /** Returns null on 404 (no domain configured yet) to keep callers simple. */
  async get(storeId: string): Promise<StoreDomainResponse | null> {
    try {
      return await this.http.get<StoreDomainResponse>(`/api/stores/${storeId}/domain`)
    } catch (err) {
      const e = err as { status?: number; isNotFound?: boolean }
      if (e?.status === 404 || e?.isNotFound) return null
      throw err
    }
  }

  register(storeId: string, domain: string): Promise<StoreDomainResponse> {
    return this.http.post<StoreDomainResponse>(`/api/stores/${storeId}/domain`, { domain })
  }

  verify(storeId: string): Promise<StoreDomainResponse> {
    return this.http.post<StoreDomainResponse>(`/api/stores/${storeId}/domain/verify`)
  }

  remove(storeId: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/domain`)
  }
}
