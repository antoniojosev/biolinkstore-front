'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  Loader2,
  Package,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { CategoryHttpRepository } from '@/lib/categories-api/category.http-repository'
import type { CategoryResponse } from '@/lib/categories-api/types'

export default function CategoriesPage() {
  const { http, store } = useAuth()
  const categoryRepo = useMemo(() => new CategoryHttpRepository(http), [http])

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!store?.id) return
    try {
      const result = await categoryRepo.findAll(store.id)
      setCategories(result.data)
    } catch {
      toast.error('Error al cargar categorias')
    } finally {
      setLoading(false)
    }
  }, [store?.id, categoryRepo])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditingCategory(null)
    setFormName('')
    setDialogOpen(true)
  }

  const openEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat)
    setFormName(cat.name)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!store?.id || !formName.trim()) return
    setSaving(true)
    try {
      if (editingCategory) {
        await categoryRepo.update(store.id, editingCategory.id, {
          name: formName.trim(),
        })
        toast.success('Categoria actualizada')
      } else {
        await categoryRepo.create(store.id, {
          name: formName.trim(),
        })
        toast.success('Categoria creada')
      }
      setDialogOpen(false)
      fetchCategories()
    } catch {
      toast.error(editingCategory ? 'Error al actualizar' : 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!store?.id || !deleteTarget) return
    setDeleting(true)
    try {
      await categoryRepo.remove(store.id, deleteTarget.id)
      toast.success('Categoria eliminada')
      setDeleteTarget(null)
      fetchCategories()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
        <div>
          <h1 className="text-xl font-bold text-white">Categorias</h1>
          <p className="text-sm text-white/40">
            Organiza tus productos en categorias
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#33b380] hover:bg-[#2a9a6d] text-white text-xs h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Agregar categoria
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#0d1218] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="bg-[#0d1218] border-white/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Tags className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Crea tu primera categoria
            </h3>
            <p className="text-sm text-white/40 max-w-xs mb-5">
              Las categorias ayudan a tus clientes a encontrar productos mas facilmente.
            </p>
            <Button
              onClick={openCreate}
              className="bg-[#33b380] hover:bg-[#2a9a6d] text-white text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="bg-[#0d1218] border-white/5 hover:border-white/10 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
                    <Tags className="w-4 h-4 text-white/20" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Package className="w-3 h-3 text-white/20" />
                      <span className="text-[11px] text-white/30">
                        {cat.productCount ?? 0} productos
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !saving && setDialogOpen(false)}
          />
          <div className="relative bg-[#0d1218] border border-white/10 rounded-2xl w-full max-w-md mx-4 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingCategory ? 'Editar categoria' : 'Nueva categoria'}
              </h2>
              <button
                onClick={() => !saving && setDialogOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && formName.trim() && handleSave()}
                  placeholder="Ej: Vestidos, Accesorios"
                  autoFocus
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="flex-1 h-10 text-white/50 hover:text-white hover:bg-white/5 text-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formName.trim() || saving}
                className="flex-1 h-10 bg-[#33b380] hover:bg-[#2a9a6d] text-white text-sm disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {editingCategory ? 'Guardar' : 'Crear'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0d1218] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Estas seguro de eliminar &quot;{deleteTarget?.name}&quot;? Los productos no se eliminaran, solo se desvincularan de esta categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
