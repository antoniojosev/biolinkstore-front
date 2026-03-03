'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Layers,
  Eye,
  Package,
  Tag,
  ImagePlus,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { ProductHttpRepository } from '@/lib/products-api/product.http-repository'
import { CategoryHttpRepository } from '@/lib/categories-api/category.http-repository'
import type { CategoryResponse } from '@/lib/categories-api/types'
import type { ProductAttributeDto } from '@/lib/products-api/types'
import {
  createProductSchema,
  type CreateProductFormData,
} from '@/lib/products-api/product-form.schema'
import {
  ProductImageUpload,
  type ImageSlot,
} from '@/components/dashboard/product-image-upload'
import {
  ProductAttributesBuilder,
  type AttributeField,
} from '@/components/dashboard/product-attributes-builder'
import { VariantPricingTable } from '@/components/dashboard/variant-pricing-table'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { http, store } = useAuth()

  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])

  // Loading state for initial fetch
  const [loadingProduct, setLoadingProduct] = useState(true)

  // Categories from API
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Image slots (managed outside form, merged on submit)
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([])

  // Attribute fields (managed outside form, merged on submit)
  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([])

  // Variant pricing adjustments (combo key → adjustment)
  const [variantPricing, setVariantPricing] = useState<Record<string, number>>({})

  // Submit state
  const [submitting, setSubmitting] = useState(false)

  // Upload handler for color attribute images
  const handleAttributeImageUpload = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!store?.id) return []
      const uploads = await productRepo.uploadImages(store.id, files)
      return uploads.map((u) => u.url)
    },
    [store?.id, productRepo],
  )

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: undefined as unknown as number,
      compareAtPrice: null,
      stock: null,
      sku: '',
      isVisible: true,
      isFeatured: false,
      isOnSale: false,
      categoryIds: [],
      attributes: [],
    },
  })

  const { watch, setValue, handleSubmit, reset, formState: { errors } } = form
  const watchName = watch('name')
  const watchPrice = watch('basePrice')
  const watchComparePrice = watch('compareAtPrice')
  const watchCategory = watch('categoryIds')
  const watchVisible = watch('isVisible')
  const watchDescription = watch('description')

  // Fetch categories
  useEffect(() => {
    if (!store?.id) return
    categoryRepo
      .findAll(store.id)
      .then((r) => setCategories(r.data))
      .catch(() => toast.error('Error al cargar categorias'))
      .finally(() => setLoadingCategories(false))
  }, [store?.id, categoryRepo])

  // Fetch existing product
  useEffect(() => {
    if (!store?.id || !productId) return
    setLoadingProduct(true)
    productRepo
      .findById(store.id, productId)
      .then((product) => {
        // Pre-fill form
        reset({
          name: product.name,
          description: product.description || '',
          basePrice: product.basePrice,
          compareAtPrice: product.compareAtPrice ?? null,
          stock: product.stock ?? null,
          sku: product.sku || '',
          isVisible: product.isVisible,
          isFeatured: product.isFeatured,
          isOnSale: product.isOnSale,
          categoryIds: product.categoryIds || [],
          attributes: [],
        })

        // Pre-fill images as already-uploaded slots
        if (product.images?.length > 0) {
          setImageSlots(
            product.images.map((url) => ({
              id: crypto.randomUUID(),
              previewUrl: url,
              remoteUrl: url,
              status: 'uploaded' as const,
            })),
          )
        }

        // Pre-fill attributes
        if (product.attributes?.length > 0) {
          setAttributeFields(
            product.attributes.map((attr) => ({
              name: attr.name,
              type: (attr.type === 'color' ? 'color' : 'text') as 'text' | 'color',
              options: attr.options,
              optionsMeta: attr.optionsMeta ?? undefined,
            })),
          )
        }
      })
      .catch(() => {
        toast.error('Error al cargar el producto')
        router.push('/dashboard/productos')
      })
      .finally(() => setLoadingProduct(false))
  }, [store?.id, productId, productRepo, reset, router])

  // Derived values
  const hasDiscount =
    watchComparePrice != null &&
    watchPrice != null &&
    watchComparePrice > watchPrice
  const discountPercent = hasDiscount
    ? Math.round((1 - watchPrice / watchComparePrice!) * 100)
    : 0

  const variantCombinations = useMemo(() => {
    const validAttrs = attributeFields.filter((a) => a.name && a.options.length > 0)
    if (validAttrs.length === 0) return []
    const result: Record<string, string>[] = []
    function recurse(index: number, current: Record<string, string>) {
      if (index === validAttrs.length) { result.push({ ...current }); return }
      const attr = validAttrs[index]
      for (const option of attr.options) recurse(index + 1, { ...current, [attr.name]: option })
    }
    recurse(0, {})
    return result
  }, [attributeFields])

  const colorMeta = useMemo(() => {
    const colorAttr = attributeFields.find((a) => a.type === 'color')
    if (!colorAttr?.optionsMeta) return undefined
    const meta: Record<string, { hex?: string }> = {}
    for (const [name, data] of Object.entries(colorAttr.optionsMeta)) {
      meta[name] = { hex: data.hex }
    }
    return meta
  }, [attributeFields])

  const selectedCategoryName = categories.find(
    (c) => watchCategory?.[0] === c.id,
  )?.name

  // Submit
  const onSubmit = useCallback(
    async (data: CreateProductFormData) => {
      if (!store?.id) return
      setSubmitting(true)

      try {
        // 1. Upload NEW images (those with a file and not yet uploaded)
        let newImageUrls: string[] = []
        const filesToUpload = imageSlots
          .filter((s) => s.file && s.status !== 'uploaded')
          .map((s) => s.file!)

        if (filesToUpload.length > 0) {
          // Mark as uploading
          setImageSlots((prev) =>
            prev.map((s) =>
              s.file && s.status !== 'uploaded'
                ? { ...s, status: 'uploading' as const }
                : s,
            ),
          )

          try {
            const uploads = await productRepo.uploadImages(
              store.id,
              filesToUpload,
            )
            newImageUrls = uploads.map((u) => u.url)

            // Mark as uploaded
            let urlIndex = 0
            setImageSlots((prev) =>
              prev.map((s) => {
                if (s.status === 'uploading' && urlIndex < newImageUrls.length) {
                  const remoteUrl = newImageUrls[urlIndex++]
                  return { ...s, status: 'uploaded' as const, remoteUrl }
                }
                return s
              }),
            )
          } catch {
            setImageSlots((prev) =>
              prev.map((s) =>
                s.status === 'uploading'
                  ? { ...s, status: 'error' as const }
                  : s,
              ),
            )
            toast.error('Error al subir las imagenes')
            setSubmitting(false)
            return
          }
        }

        // 2. Collect all image URLs in order (existing + newly uploaded)
        // We build from the current imageSlots order, replacing uploading ones with their new URLs
        let newUrlIdx = 0
        const allImageUrls = imageSlots.map((s) => {
          if (s.remoteUrl) return s.remoteUrl
          if (newUrlIdx < newImageUrls.length) return newImageUrls[newUrlIdx++]
          return ''
        }).filter(Boolean)

        // 3. Build attributes
        const validAttributes: ProductAttributeDto[] = attributeFields
          .filter((a) => a.name.trim() && a.options.length > 0)
          .map((a, i) => ({
            name: a.name.trim(),
            type: a.type ?? 'text',
            options: a.options,
            optionsMeta: a.type === 'color' ? a.optionsMeta : undefined,
            sortOrder: i,
          }))

        // 4. Update product via PATCH
        await productRepo.update(store.id, productId, {
          name: data.name,
          basePrice: data.basePrice,
          ...(data.description ? { description: data.description } : { description: '' }),
          ...(data.sku ? { sku: data.sku } : {}),
          ...(data.compareAtPrice != null ? { compareAtPrice: data.compareAtPrice } : {}),
          ...(data.stock != null ? { stock: data.stock } : {}),
          images: allImageUrls,
          ...(data.categoryIds.length > 0 ? { categoryIds: data.categoryIds } : { categoryIds: [] }),
          isVisible: data.isVisible,
          isFeatured: data.isFeatured,
          isOnSale: hasDiscount,
        })

        toast.success('Producto actualizado', {
          description: 'Los cambios se guardaron correctamente.',
          icon: <Check className="w-4 h-4" />,
        })

        router.push('/dashboard/productos')
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al actualizar el producto'
        toast.error(msg)
        setSubmitting(false)
      }
    },
    [store?.id, productId, imageSlots, attributeFields, productRepo, router, hasDiscount],
  )

  // Form is valid enough for submit
  const canSubmit = watchName && watchPrice != null && watchPrice >= 0 && !submitting

  // Loading skeleton
  if (loadingProduct) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-64 bg-white/[0.03] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-[#0d1218] border border-white/5 animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-[#0d1218] border border-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link
          href="/dashboard/productos"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Editar producto</h1>
          <p className="text-sm text-white/40">
            Modifica la informacion de tu producto
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* --- Left Column --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-[#33b380]" />
                Imagenes
              </CardTitle>
              <p className="text-xs text-white/40">
                Arrastra o selecciona hasta 5 fotos. La primera sera la portada.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ProductImageUpload
                images={imageSlots}
                onChange={setImageSlots}
                maxImages={5}
              />
            </CardContent>
          </Card>

          {/* Basic info */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#327be2]" />
                Informacion general
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Nombre del producto <span className="text-red-400">*</span>
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Ej: Vestido Floral Verano"
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 animate-in fade-in duration-200">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Descripcion
                </label>
                <textarea
                  {...form.register('description')}
                  placeholder="Describe tu producto, materiales, tallas disponibles..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 p-3 text-sm focus:border-[#33b380]/50 focus:ring-1 focus:ring-[#33b380]/20 focus:outline-none resize-none transition-colors"
                />
                <p
                  className={`text-[11px] transition-colors duration-300 ${
                    (watchDescription?.length ?? 0) > 450
                      ? (watchDescription?.length ?? 0) > 490
                        ? 'text-red-400'
                        : 'text-yellow-400/70'
                      : 'text-white/30'
                  }`}
                >
                  {watchDescription?.length ?? 0}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#6ee490]" />
                Precio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Precio de venta <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">
                      $
                    </span>
                    <Controller
                      name="basePrice"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="h-10 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                        />
                      )}
                    />
                  </div>
                  {errors.basePrice && (
                    <p className="text-xs text-red-400 animate-in fade-in duration-200">
                      {errors.basePrice.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Precio anterior{' '}
                    <span className="text-white/20">
                      (opcional, para descuento)
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">
                      $
                    </span>
                    <Controller
                      name="compareAtPrice"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value),
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="h-10 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              {hasDiscount && (
                <div className="mt-3 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="bg-[#33b380]/15 text-[#6ee490] px-2 py-1 rounded-md font-semibold">
                    -{discountPercent}% OFF
                  </span>
                  <span className="text-white/40">
                    Los clientes veran el precio anterior tachado
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SKU & Stock */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[350ms]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-white/50" />
                Inventario
                <span className="text-[10px] text-white/25 font-normal ml-1">Opcional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    SKU
                  </label>
                  <Input
                    {...form.register('sku')}
                    placeholder="Ej: VEST-FLOR-001"
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Stock
                  </label>
                  <Controller
                    name="stock"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        placeholder="Ilimitado"
                        min="0"
                        step="1"
                        className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes / Variants */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#327be2]" />
                Variantes
              </CardTitle>
              <p className="text-xs text-white/40">
                Define atributos como talla, color o material. Las combinaciones
                se generan automaticamente.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ProductAttributesBuilder
                attributes={attributeFields}
                onChange={setAttributeFields}
                onUploadImages={handleAttributeImageUpload}
              />
            </CardContent>
          </Card>

          {/* Variant Pricing */}
          {variantCombinations.length > 0 && watchPrice != null && (
            <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[450ms]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#C9A86C]" />
                  Precios por variante
                </CardTitle>
                <p className="text-xs text-white/40">
                  Ajusta el precio de cada combinacion. El ajuste se suma al precio base.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <VariantPricingTable
                  basePrice={watchPrice}
                  combinations={variantCombinations}
                  colorMeta={colorMeta}
                  pricing={variantPricing}
                  onChange={setVariantPricing}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- Right Column --- */}
        <div className="space-y-6">
          {/* Category */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#33b380]" />
                Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingCategories ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">
                  No hay categorias creadas aun.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = watchCategory?.[0] === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setValue(
                            'categoryIds',
                            isSelected ? [] : [cat.id],
                            { shouldValidate: true },
                          )
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          isSelected
                            ? 'bg-[#33b380]/15 text-[#6ee490] border border-[#33b380]/30'
                            : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#327be2]" />
                Visibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <button
                type="button"
                onClick={() => setValue('isVisible', true)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                  watchVisible
                    ? 'bg-[#33b380]/10 border border-[#33b380]/30'
                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    watchVisible ? 'border-[#33b380]' : 'border-white/20'
                  }`}
                >
                  {watchVisible && (
                    <div className="w-2 h-2 rounded-full bg-[#33b380] animate-in zoom-in duration-200" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${watchVisible ? 'text-white' : 'text-white/50'}`}
                  >
                    Disponible
                  </p>
                  <p className="text-[11px] text-white/30">
                    Visible en tu catalogo
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue('isVisible', false)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                  !watchVisible
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    !watchVisible ? 'border-red-400' : 'border-white/20'
                  }`}
                >
                  {!watchVisible && (
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-in zoom-in duration-200" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${!watchVisible ? 'text-white' : 'text-white/50'}`}
                  >
                    Oculto
                  </p>
                  <p className="text-[11px] text-white/30">
                    No aparece en el catalogo
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="bg-[#0d1218] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6ee490]" />
                Vista previa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                {/* Preview image */}
                <div className="aspect-square bg-white/5 relative flex items-center justify-center overflow-hidden">
                  {imageSlots.length > 0 ? (
                    <img
                      src={imageSlots[0].previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="w-8 h-8 text-white/10 mx-auto" />
                      <p className="text-[10px] text-white/20 mt-1">
                        Sin imagen
                      </p>
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-[#33b380] text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-in zoom-in duration-300">
                      -{discountPercent}%
                    </span>
                  )}
                  {/* Image dots indicator */}
                  {imageSlots.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {imageSlots.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === 0
                              ? 'bg-white w-3'
                              : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Preview details */}
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-white truncate transition-all duration-300">
                    {watchName || 'Nombre del producto'}
                  </p>
                  {selectedCategoryName && (
                    <p className="text-[10px] text-white/30 animate-in fade-in duration-200">
                      {selectedCategoryName}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white transition-all duration-300">
                      $
                      {watchPrice != null
                        ? Number(watchPrice).toLocaleString()
                        : '0'}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-white/30 line-through animate-in fade-in duration-200">
                        ${Number(watchComparePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
                      watchVisible
                        ? 'bg-[#33b380]/15 text-[#6ee490]'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {watchVisible ? 'Disponible' : 'Oculto'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms]">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 bg-[#33b380] hover:bg-[#2a9a6d] text-white font-semibold text-sm disabled:opacity-40 relative overflow-hidden group"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Guardar cambios</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#33b380] via-[#6ee490]/20 to-[#33b380] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard/productos')}
              className="w-full h-10 text-white/50 hover:text-white hover:bg-white/5 text-sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
