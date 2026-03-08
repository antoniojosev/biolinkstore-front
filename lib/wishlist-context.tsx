'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Product } from './types'

interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  slug: string
}

interface WishlistContextValue {
  items: WishlistItem[]
  addItem: (product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'slug'>) => void
  removeItem: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  toggle: (product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'slug'>) => void
  totalItems: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function getStorageKey(storeSlug?: string) {
  return `igstore-wishlist${storeSlug ? `-${storeSlug}` : ''}`
}

function loadWishlist(storeSlug?: string): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(storeSlug))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveWishlist(items: WishlistItem[], storeSlug?: string) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(getStorageKey(storeSlug))
    } else {
      localStorage.setItem(getStorageKey(storeSlug), JSON.stringify(items))
    }
  } catch {}
}

export function WishlistProvider({ children, storeSlug }: { children: ReactNode; storeSlug?: string }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadWishlist(storeSlug))
    setHydrated(true)
  }, [storeSlug])

  useEffect(() => {
    if (hydrated) saveWishlist(items, storeSlug)
  }, [items, storeSlug, hydrated])

  const addItem = useCallback((product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'slug'>) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev
      return [...prev, {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? '/placeholder.svg',
        slug: product.slug ?? '',
      }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const isWishlisted = useCallback((productId: string) => {
    return items.some((i) => i.productId === productId)
  }, [items])

  const toggle = useCallback((product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'slug'>) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        return prev.filter((i) => i.productId !== product.id)
      }
      return [...prev, {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? '/placeholder.svg',
        slug: product.slug ?? '',
      }]
    })
  }, [])

  return (
    <WishlistContext.Provider value={{
      items,
      addItem,
      removeItem,
      isWishlisted,
      toggle,
      totalItems: items.length,
      isOpen,
      setIsOpen,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
