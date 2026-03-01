'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'
import { ProductHttpRepository } from '@/lib/products-api/product.http-repository'
import { CategoryHttpRepository } from '@/lib/categories-api/category.http-repository'
import type { ProductResponse } from '@/lib/products-api/types'
import type { CategoryResponse } from '@/lib/categories-api/types'

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const { http, store } = useAuth()
  const productRepo = useMemo(() => new ProductHttpRepository(http), [http])
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])

  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [search])

  // Fetch categories once
  useEffect(() => {
    if (!store?.id) return
    categoryRepo.findAll(store.id).then((r) => setCategories(r.data)).catch(() => {})
  }, [store?.id, categoryRepo])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const result = await productRepo.findAll(store.id, {
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        categoryId: activeCategory || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      setProducts(result.data)
      setTotalPages(result.meta.totalPages)
      setTotal(result.meta.total)
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [store?.id, productRepo, page, debouncedSearch, activeCategory])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Delete product
  const handleDelete = async () => {
    if (!store?.id || !deleteTarget) return
    setDeleting(true)
    try {
      await productRepo.remove(store.id, deleteTarget.id)
      toast.success('Producto eliminado')
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      toast.error('Error al eliminar el producto')
    } finally {
      setDeleting(false)
    }
  }

  // Duplicate product
  const handleDuplicate = async (product: ProductResponse) => {
    if (!store?.id) return
    try {
      await productRepo.duplicate(store.id, product.id)
      toast.success('Producto duplicado')
      fetchProducts()
    } catch {
      toast.error('Error al duplicar el producto')
    }
  }

  const handleCategoryFilter = (catId: string | null) => {
    setActiveCategory(catId)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Productos</h1>
          <p className="text-sm text-white/50">
            {total} {total === 1 ? 'producto' : 'productos'} en tu catalogo
          </p>
        </div>
        <Button
          className="bg-[#33b380] hover:bg-[#2a9a6d] text-white h-9 text-sm"
          asChild
        >
          <Link href="/dashboard/productos/crear">
            <Plus className="w-4 h-4 mr-2" />
            Agregar producto
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === null
                    ? 'bg-[#33b380] text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#33b380] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      {loading ? (
        <Card className="bg-[#0d1218] border-white/5">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 bg-white/5 rounded animate-pulse" />
                    <div className="h-2.5 w-60 bg-white/[0.03] rounded animate-pulse" />
                  </div>
                  <div className="h-3.5 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        /* Empty state */
        <Card className="bg-[#0d1218] border-white/5">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white/15" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {debouncedSearch || activeCategory
                ? 'No se encontraron productos'
                : 'Aun no tienes productos'}
            </h3>
            <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
              {debouncedSearch || activeCategory
                ? 'Intenta con otra busqueda o filtro.'
                : 'Crea tu primer producto y empieza a vender a traves de tu catalogo.'}
            </p>
            {!debouncedSearch && !activeCategory && (
              <Button
                className="bg-[#33b380] hover:bg-[#2a9a6d] text-white"
                asChild
              >
                <Link href="/dashboard/productos/crear">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primer producto
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#0d1218] border-white/5 overflow-hidden">
          <CardHeader className="pb-0 px-6">
            <CardTitle className="text-sm font-medium text-white/60">
              {products.length} de {total}{' '}
              {total === 1 ? 'producto' : 'productos'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider px-6 py-3">
                      Producto
                    </th>
                    <th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="text-right text-[11px] font-medium text-white/40 uppercase tracking-wider px-6 py-3">
                      Precio
                    </th>
                    <th className="text-center text-[11px] font-medium text-white/40 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Estado
                    </th>
                    <th className="text-right text-[11px] font-medium text-white/40 uppercase tracking-wider px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const categoryName = categories.find((c) =>
                      product.categoryIds?.includes(c.id),
                    )?.name

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-white/15" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-white/40 truncate max-w-[200px]">
                                {product.description || 'Sin descripcion'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell">
                          {categoryName ? (
                            <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-md">
                              {categoryName}
                            </span>
                          ) : (
                            <span className="text-xs text-white/25">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div>
                            <span className="text-sm font-medium text-white">
                              ${Number(product.basePrice).toLocaleString()}
                            </span>
                            {product.compareAtPrice != null &&
                              product.compareAtPrice > product.basePrice && (
                                <span className="block text-[10px] text-white/30 line-through">
                                  $
                                  {Number(
                                    product.compareAtPrice,
                                  ).toLocaleString()}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center hidden md:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              product.isVisible
                                ? 'bg-[#33b380]/15 text-[#6ee490]'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {product.isVisible ? (
                              <>
                                <Eye className="w-2.5 h-2.5" /> Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-2.5 h-2.5" /> Oculto
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-white/30 hover:text-white/70 transition-colors p-1">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#151c24] border-white/10 text-white"
                            >
                              <DropdownMenuItem
                                className="text-sm hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                                asChild
                              >
                                <Link href={`/dashboard/productos/${product.id}/editar`}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-sm hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                                onClick={() =>
                                  handleDuplicate(product)
                                }
                              >
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-sm text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                onClick={() => setDeleteTarget(product)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
                <p className="text-xs text-white/40">
                  Pagina {page} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-[#0d1218] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Eliminar producto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              {deleteTarget
                ? `"${deleteTarget.name}" sera eliminado permanentemente. Esta accion no se puede deshacer.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Eliminando...
                </span>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
