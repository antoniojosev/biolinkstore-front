"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { MultiStoreHttpRepository, type MyStoreItem } from "@/lib/multi-store-api"
import { toast } from "sonner"

export function StoreSwitcher() {
  const router = useRouter()
  const { store, http, refreshStore } = useAuth()
  const repo = useMemo(() => new MultiStoreHttpRepository(http), [http])

  const [stores, setStores] = useState<MyStoreItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  const loadStores = () => {
    if (!store?.id) return
    setLoading(true)
    repo
      .listMine()
      .then((res) => {
        setStores(res.stores)
        setActiveId(res.activeStoreId)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open && stores.length === 0) loadStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSwitch = async (storeId: string) => {
    if (storeId === activeId) {
      setOpen(false)
      return
    }
    try {
      await repo.switchActive({ storeId })
      await refreshStore()
      router.refresh()
      setOpen(false)
      toast.success("Tienda cambiada")
    } catch (err: any) {
      toast.error("Error al cambiar de tienda", { description: err?.message })
    }
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await repo.createAdditional(name)
      await refreshStore()
      router.refresh()
      setCreateOpen(false)
      setNewName("")
      toast.success(`Tienda "${created.name}" creada`)
    } catch (err: any) {
      const msg = err?.message ?? ""
      if (msg.includes("limit") || msg.includes("permite")) {
        toast.error("Limite de plan alcanzado", { description: msg })
      } else {
        toast.error("Error al crear tienda", { description: msg })
      }
    } finally {
      setCreating(false)
    }
  }

  if (!store) return null

  const initials = store.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <Avatar className="w-7 h-7 shrink-0">
              {store.logo && <AvatarImage src={store.logo} alt={store.name} />}
              <AvatarFallback className="bg-[#33b380]/20 text-[#6ee490] text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-white truncate">{store.name}</p>
              <p className="text-[10px] text-white/40 truncate">/{store.slug}</p>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 bg-[#0d1218] border-white/10 text-white"
        >
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-white/40">
            Mis tiendas
          </DropdownMenuLabel>
          {loading && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-white/40" />
            </div>
          )}
          {!loading &&
            stores.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onSelect={() => handleSwitch(s.id)}
                className="cursor-pointer focus:bg-white/5 focus:text-white"
              >
                <Avatar className="w-6 h-6 mr-2 shrink-0">
                  {s.logo && <AvatarImage src={s.logo} alt={s.name} />}
                  <AvatarFallback className="bg-[#33b380]/20 text-[#6ee490] text-[10px] font-semibold">
                    {s.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{s.name}</p>
                  <p className="text-[10px] text-white/40 truncate">
                    /{s.slug} · {s.plan}
                  </p>
                </div>
                {s.id === activeId && (
                  <Check className="w-3.5 h-3.5 ml-2 text-[#6ee490] shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onSelect={() => {
              setCreateOpen(true)
              setOpen(false)
            }}
            className="cursor-pointer focus:bg-white/5 focus:text-white text-[#6ee490]"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Crear tienda nueva
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#0d1218] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Crear tienda nueva</DialogTitle>
            <DialogDescription className="text-white/50">
              Tu plan determina cuantas tiendas adicionales puedes tener.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Nombre de la tienda</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Mi nueva tienda"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
              maxLength={80}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="border-white/10 text-white/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-[#33b380] hover:bg-[#2a9a6d] text-white"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
