"use client"

import { useMemo, useEffect, useRef, useState, useCallback } from "react"
import { Palette, Save, Loader2, Eye, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { StoreHttpRepository } from "@/lib/stores-api/store.http-repository"
import { ProductHttpRepository } from "@/lib/products-api/product.http-repository"
import { CategoryHttpRepository } from "@/lib/categories-api/category.http-repository"
import { Button } from "@/components/ui/button"
import { EditorPanel } from "@/components/dashboard/design-editor/editor-panel"
import { PreviewPanel } from "@/components/dashboard/design-editor/preview-panel"
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "@/components/dashboard/design-editor/demo-products"
import type { DraftStoreState } from "@/components/dashboard/design-editor/editor-panel"
import type { StoreProfile, Product, Category } from "@/lib/types"
import type { UpdateStoreDto } from "@/lib/stores-api/types"
import type { ProductResponse } from "@/lib/products-api/types"
import type { CategoryResponse } from "@/lib/categories-api/types"

type MobileTab = 'editor' | 'preview'

function adaptProduct(p: ProductResponse, catMap: Map<string, string>): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.basePrice,
    comparePrice: p.compareAtPrice ?? undefined,
    images: p.images ?? [],
    image: p.images?.[0],
    category: catMap.get(p.categoryIds?.[0] ?? '') ?? '',
    description: p.description ?? '',
    inStock: p.stock === null || p.stock > 0,
    featured: p.isFeatured,
  }
}

function adaptCategory(c: CategoryResponse): Category {
  return { id: c.id, name: c.name, slug: c.slug, image: c.image ?? undefined }
}

export default function MiTiendaDashboardPage() {
  const { store, isLoading, http, refreshStore } = useAuth()
  const storeRepo = useMemo(() => new StoreHttpRepository(http), [http])
  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])

  // Retry store load once if needed
  const retried = useRef(false)
  const [retrying, setRetrying] = useState(false)
  useEffect(() => {
    if (!isLoading && !store && !retried.current) {
      retried.current = true
      setRetrying(true)
      refreshStore().finally(() => setRetrying(false))
    }
  }, [isLoading, store, refreshStore])

  // Real products & categories from the API
  const [realProducts, setRealProducts] = useState<Product[]>([])
  const [realCategories, setRealCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!store?.id) return
    Promise.all([
      categoryRepo.findAll(store.id),
      productRepo.findAll(store.id, { limit: 100, isVisible: true }),
    ]).then(([catRes, prodRes]) => {
      const cats = catRes.data.map(adaptCategory)
      const catMap = new Map(cats.map((c) => [c.id, c.name]))
      setRealCategories(cats)
      setRealProducts(prodRes.data.map((p) => adaptProduct(p, catMap)))
    }).catch(() => {})
  }, [store?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Draft state
  const [draft, setDraft] = useState<DraftStoreState | null>(null)
  const [saving, setSaving] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')

  useEffect(() => {
    if (!store || draft) return
    setDraft({
      name: store.name ?? '',
      username: store.username ?? '',
      bio: store.bio ?? store.description ?? '',
      primaryColor: store.primaryColor ?? '#2dd4bf',
      avatarUrl: store.logo ?? store.avatar ?? null,
      avatarFile: null,
      bannerUrl: store.banner ?? store.coverImage ?? null,
      bannerFile: null,
      useDemoProducts: false,
    })
  }, [store, draft])

  const handleChange = useCallback((patch: Partial<DraftStoreState>) => {
    setDraft((prev) => prev ? { ...prev, ...patch } : prev)
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!store) throw new Error('No store')
    const formData = new FormData()
    formData.append('files', file)
    const results = await http.postFormData<{ url: string }[]>(
      `/api/stores/${store.id}/uploads`,
      formData,
    )
    return results[0].url
  }, [store, http])

  const handleSave = async () => {
    if (!store || !draft) return
    setSaving(true)
    try {
      let logoUrl: string | undefined = store.logo ?? store.avatar
      let bannerUrl: string | undefined = store.banner ?? store.coverImage

      if (draft.avatarFile) logoUrl = await uploadFile(draft.avatarFile)
      else if (!draft.avatarUrl) logoUrl = undefined

      if (draft.bannerFile) bannerUrl = await uploadFile(draft.bannerFile)
      else if (!draft.bannerUrl) bannerUrl = undefined

      const dto: UpdateStoreDto = {
        name: draft.name.trim() || undefined,
        username: draft.username.trim() || undefined,
        description: draft.bio.trim() || undefined,
        logo: logoUrl ?? undefined,
        banner: bannerUrl ?? undefined,
        primaryColor: draft.primaryColor,
      }

      await storeRepo.update(store.id, dto)
      await refreshStore()
      setDraft((prev) => prev ? { ...prev, avatarFile: null, bannerFile: null } : prev)
      toast.success('Cambios guardados')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading states ──────────────────────────────────────────────────────────

  if (isLoading || retrying) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!store || !draft) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-white/40">No se encontró tu tienda.</p>
      </div>
    )
  }

  // ── Preview data ────────────────────────────────────────────────────────────

  const previewStore: StoreProfile = {
    id: store.id,
    name: draft.name || store.name,
    slug: draft.username || store.slug,
    username: draft.username ? `@${draft.username}` : store.slug,
    avatar: draft.avatarUrl ?? undefined,
    coverImage: draft.bannerUrl ?? undefined,
    bio: draft.bio || undefined,
    whatsappNumbers: store.whatsappNumbers,
    instagramUrl: store.instagramHandle
      ? `https://instagram.com/${store.instagramHandle}`
      : undefined,
    primaryColor: draft.primaryColor,
    currency: store.currency,
    template: store.template,
    plan: store.subscription?.plan ?? 'FREE',
  }

  const previewProducts = draft.useDemoProducts ? DEMO_PRODUCTS : realProducts
  const previewCategories = draft.useDemoProducts ? DEMO_CATEGORIES : realCategories

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#33b380]/15 flex items-center justify-center">
              <Palette className="w-4 h-4 text-[#33b380]" />
            </div>
            <h1 className="text-xl font-bold text-white">Mi tienda</h1>
          </div>
          <p className="text-sm text-white/40 ml-10">
            Personaliza la apariencia de tu catálogo en tiempo real.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#33b380] hover:bg-[#2a9a6d] text-white h-9 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex items-center gap-1 bg-white/5 rounded-lg p-0.5 mb-4 self-start">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mobileTab === 'editor' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mobileTab === 'preview' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 items-start">
        <div
          className={`lg:w-[360px] lg:shrink-0 lg:block ${
            mobileTab === 'editor' ? 'block w-full' : 'hidden'
          }`}
        >
          <div className="bg-[#0d1218] rounded-xl border border-white/5 p-5">
            <EditorPanel draft={draft} onChange={handleChange} currentTemplate={store.template} />
          </div>
        </div>

        <div
          className={`lg:flex-1 lg:min-w-0 lg:block bg-[#0d1218] rounded-xl border border-white/5 overflow-hidden lg:sticky lg:top-4 ${
            mobileTab === 'preview' ? 'block w-full' : 'hidden'
          }`}
          style={{ height: 'calc(100vh - 140px)', minHeight: 520 }}
        >
          <PreviewPanel
            store={previewStore}
            products={previewProducts}
            categories={previewCategories}
          />
        </div>
      </div>
    </div>
  )
}
