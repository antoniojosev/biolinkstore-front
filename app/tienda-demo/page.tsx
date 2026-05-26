import { StorefrontDemo } from "@/components/storefront-v2/storefront-demo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rosa Atelier — bylink",
  description: "Demo de tienda bylink con checkout por WhatsApp.",
}

export default function TiendaDemoPage() {
  return <StorefrontDemo />
}
