"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  StoreSocialLinksHttpRepository,
  type StoreSocialLinkResponse,
} from "@/lib/store-social-links-api"

/**
 * Lista de redes de la tienda para los controles del editor (checkboxes de
 * "mostrar en esta sección"). Se refresca en vivo cuando SocialLinksCard las
 * cambia (evento bl:socials-changed).
 */
export function useStoreSocials(): { socials: StoreSocialLinkResponse[]; loading: boolean } {
  const { http, store } = useAuth()
  const repo = useMemo(() => new StoreSocialLinksHttpRepository(http), [http])
  const [socials, setSocials] = useState<StoreSocialLinkResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!store?.id) {
      setLoading(false)
      return
    }
    repo
      .list(store.id)
      .then((list) => setSocials(list.slice().sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setSocials([]))
      .finally(() => setLoading(false))
  }, [repo, store?.id])

  useEffect(() => {
    load()
    window.addEventListener("bl:socials-changed", load)
    return () => window.removeEventListener("bl:socials-changed", load)
  }, [load])

  return { socials, loading }
}
