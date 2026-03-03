'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics'
import type { CartItem } from './types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function getStorageKey(storeSlug?: string) {
  return `igstore-cart${storeSlug ? `-${storeSlug}` : ''}`
}

function loadCart(storeSlug?: string): CartItem[] {
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

function saveCart(items: CartItem[], storeSlug?: string) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(getStorageKey(storeSlug))
    } else {
      localStorage.setItem(getStorageKey(storeSlug), JSON.stringify(items))
    }
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function CartProvider({ children, storeSlug }: { children: ReactNode; storeSlug?: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart(storeSlug))
    setHydrated(true)
  }, [storeSlug])

  // Persist to localStorage on change (skip initial render before hydration)
  useEffect(() => {
    if (!hydrated) return
    saveCart(items, storeSlug)
  }, [items, storeSlug, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    if (storeSlug) {
      trackEvent(storeSlug, 'ADD_TO_CART', item.productId)
    }
  }, [storeSlug])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
    },
    [removeItem],
  )

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
