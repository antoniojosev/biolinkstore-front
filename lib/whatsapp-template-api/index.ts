import type { HttpClient } from "@/lib/http/client"

export interface WhatsappTemplateResponse {
  template: string
  isDefault: boolean
  canEdit: boolean
  supportedVariables: {
    root: readonly string[]
    item: readonly string[]
  }
}

export interface WhatsappPreviewResponse {
  rendered: string
  errors: string[]
}

export class WhatsappTemplateHttpRepository {
  constructor(private readonly http: HttpClient) {}

  get(storeId: string): Promise<WhatsappTemplateResponse> {
    return this.http.get<WhatsappTemplateResponse>(`/api/stores/${storeId}/whatsapp-template`)
  }

  /** Pass null to reset to default. */
  update(storeId: string, template: string | null): Promise<WhatsappTemplateResponse> {
    return this.http.put<WhatsappTemplateResponse>(
      `/api/stores/${storeId}/whatsapp-template`,
      { template },
    )
  }

  preview(storeId: string, template: string): Promise<WhatsappPreviewResponse> {
    return this.http.post<WhatsappPreviewResponse>(
      `/api/stores/${storeId}/whatsapp-template/preview`,
      { template },
    )
  }
}
