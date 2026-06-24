import type { HttpClient } from '@/lib/http/client'
import type {
  IPageBuilderRepository,
  ListTemplatesParams,
} from './page-builder.repository'
import type {
  PalettePreset,
  PatchSectionsPayload,
  PatchTokensPayload,
  StoreThemeResponse,
  SwitchTemplatePayload,
  Template,
} from './types'

export class PageBuilderHttpRepository implements IPageBuilderRepository {
  constructor(private readonly http: HttpClient) {}

  listTemplates(params: ListTemplatesParams = {}): Promise<Template[]> {
    const qs = new URLSearchParams()
    if (params.niche) qs.set('niche', params.niche)
    if (params.plan) qs.set('plan', params.plan)
    const q = qs.toString()
    return this.http.get<Template[]>(`/api/templates${q ? `?${q}` : ''}`)
  }

  getTemplate(key: string): Promise<Template> {
    return this.http.get<Template>(`/api/templates/${encodeURIComponent(key)}`)
  }

  listPalettes(): Promise<PalettePreset[]> {
    return this.http.get<PalettePreset[]>(`/api/palettes`)
  }

  getTheme(storeId: string): Promise<StoreThemeResponse> {
    return this.http.get<StoreThemeResponse>(`/api/stores/${storeId}/theme`)
  }

  patchTokens(storeId: string, payload: PatchTokensPayload): Promise<StoreThemeResponse> {
    return this.http.patch<StoreThemeResponse>(`/api/stores/${storeId}/theme/draft/tokens`, payload)
  }

  patchSections(storeId: string, payload: PatchSectionsPayload): Promise<StoreThemeResponse> {
    return this.http.patch<StoreThemeResponse>(
      `/api/stores/${storeId}/theme/draft/sections`,
      payload,
    )
  }

  switchTemplate(storeId: string, payload: SwitchTemplatePayload): Promise<StoreThemeResponse> {
    return this.http.post<StoreThemeResponse>(
      `/api/stores/${storeId}/theme/switch-template`,
      payload,
    )
  }

  resetDraft(storeId: string): Promise<StoreThemeResponse> {
    return this.http.post<StoreThemeResponse>(`/api/stores/${storeId}/theme/reset-draft`)
  }

  publish(storeId: string): Promise<StoreThemeResponse> {
    return this.http.post<StoreThemeResponse>(`/api/stores/${storeId}/theme/publish`)
  }

  rollback(storeId: string): Promise<StoreThemeResponse> {
    return this.http.post<StoreThemeResponse>(`/api/stores/${storeId}/theme/rollback`)
  }
}
