"use client"

import Image from "next/image"
import { Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storeProfile } from "@/lib/store-data"

export function StoreHeader() {
  return (
    <header className="flex flex-col items-center gap-4 py-8 px-4 text-center">
      <div className="relative">
        <Image
          src={storeProfile.avatar || "/placeholder.svg"}
          alt={storeProfile.name}
          width={100}
          height={100}
          className="rounded-full border-2 border-primary"
        />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{storeProfile.name}</h1>
        <p className="text-muted-foreground text-sm">{storeProfile.username}</p>
      </div>
      <p className="text-foreground/80 text-sm max-w-xs">{storeProfile.bio}</p>
      <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
        <a href={storeProfile.instagramUrl} target="_blank" rel="noopener noreferrer">
          <Instagram className="h-4 w-4" />
          Seguir en Instagram
        </a>
      </Button>
    </header>
  )
}
