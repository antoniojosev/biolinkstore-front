import { CartProvider } from "@/components/cart-context"
import { StoreHeader } from "@/components/store-header"
import { ProductGrid } from "@/components/product-grid"
import { CartButton } from "@/components/cart-button"
import { CartSheet } from "@/components/cart-sheet"

export default function Home() {
  return (
    <CartProvider>
      <main className="min-h-screen max-w-lg mx-auto">
        <StoreHeader />
        <ProductGrid />
        <CartButton />
        <CartSheet />
      </main>
    </CartProvider>
  )
}
