"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "./product-card"
import { SearchBar } from "./search-bar"
import { CategoryFilter } from "./category-filter"
import { products, categories } from "@/lib/store-data"
import { Package } from "lucide-react"

export function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-4">
      <div className="space-y-3 px-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground">Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-24">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
