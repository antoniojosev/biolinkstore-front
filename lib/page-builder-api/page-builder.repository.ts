import type {
  PalettePreset,
  PatchSectionsPayload,
  PatchTokensPayload,
  StoreThemeResponse,
  SwitchTemplatePayload,
  Template,
  TemplateNiche,
  Plan,
} from './types'

export interface ListTemplatesParams {
  niche?: TemplateNiche
  plan?: Plan
}

export interface IPageBuilderRepository {
  // Public (no auth) ---
  listTemplates(params?: ListTemplatesParams): Promise<Template[]>
  getTemplate(key: string): Promise<Template>
  listPalettes(): Promise<PalettePreset[]>

  // Authenticated (store-scoped) ---
  getTheme(storeId: string): Promise<StoreThemeResponse>
  patchTokens(storeId: string, payload: PatchTokensPayload): Promise<StoreThemeResponse>
  patchSections(storeId: string, payload: PatchSectionsPayload): Promise<StoreThemeResponse>
  switchTemplate(storeId: string, payload: SwitchTemplatePayload): Promise<StoreThemeResponse>
  resetDraft(storeId: string): Promise<StoreThemeResponse>
  publish(storeId: string): Promise<StoreThemeResponse>
  rollback(storeId: string): Promise<StoreThemeResponse>
}
