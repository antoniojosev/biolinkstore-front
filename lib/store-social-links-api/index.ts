import type { HttpClient } from "@/lib/http/client"

export type SocialPlatform = "IG" | "TIKTOK" | "FACEBOOK" | "TWITTER" | "YOUTUBE" | "THREADS" | "WHATSAPP"

export interface StoreSocialLinkResponse {
  id: string
  platform: SocialPlatform
  url: string
  label: string | null
  sortOrder: number
  visible: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStoreSocialLinkPayload {
  platform: SocialPlatform
  url: string
  label?: string | null
  sortOrder?: number
  visible?: boolean
}

export type UpdateStoreSocialLinkPayload = Partial<CreateStoreSocialLinkPayload>

export class StoreSocialLinksHttpRepository {
  constructor(private readonly http: HttpClient) {}

  list(storeId: string): Promise<StoreSocialLinkResponse[]> {
    return this.http.get<StoreSocialLinkResponse[]>(`/api/stores/${storeId}/socials`)
  }

  create(storeId: string, payload: CreateStoreSocialLinkPayload): Promise<StoreSocialLinkResponse> {
    return this.http.post<StoreSocialLinkResponse>(`/api/stores/${storeId}/socials`, payload)
  }

  update(storeId: string, socialId: string, payload: UpdateStoreSocialLinkPayload): Promise<StoreSocialLinkResponse> {
    return this.http.patch<StoreSocialLinkResponse>(`/api/stores/${storeId}/socials/${socialId}`, payload)
  }

  remove(storeId: string, socialId: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/socials/${socialId}`)
  }

  reorder(storeId: string, items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    return this.http.post<void>(`/api/stores/${storeId}/socials/reorder`, { items })
  }
}
