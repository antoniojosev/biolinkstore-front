"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/http/types"
import {
  PageBuilderHttpRepository,
  type PalettePreset,
  type PatchSectionsPayload,
  type PatchTokensPayload,
  type SectionNode,
  type StoreThemeResponse,
  type Template,
  type ThemeTokens,
} from "@/lib/page-builder-api"

type Status = "idle" | "loading" | "saving" | "saved" | "error"

export interface UseThemeResult {
  theme: StoreThemeResponse | null
  templates: Template[]
  palettes: PalettePreset[]
  status: Status
  error: string | null
  isLoading: boolean

  // Token editing — coalesces updates and autosaves with debounce.
  patchTokens: (partial: ThemeTokens) => void

  // Section editing — also debounced, replaces the full sections array.
  replaceSections: (sections: SectionNode[]) => void

  // Hard operations — fire immediately, no debounce.
  switchTemplate: (templateKey: string) => Promise<void>
  publish: () => Promise<void>
  rollback: () => Promise<void>
  resetDraft: () => Promise<void>
  refresh: () => Promise<void>
}

const SAVE_DEBOUNCE_MS = 700

function deepMergeTokens(a: ThemeTokens | undefined, b: ThemeTokens): ThemeTokens {
  const base = a ?? {}
  return {
    palette: { ...(base.palette ?? {}), ...(b.palette ?? {}) },
    typography: { ...(base.typography ?? {}), ...(b.typography ?? {}) },
    radius: b.radius ?? base.radius,
    spacing: b.spacing ?? base.spacing,
    buttonStyle: b.buttonStyle ?? base.buttonStyle,
  }
}

export function useTheme(): UseThemeResult {
  const { http, store } = useAuth()
  const repo = useMemo(() => new PageBuilderHttpRepository(http), [http])
  const storeId = store?.id ?? null

  const [theme, setTheme] = useState<StoreThemeResponse | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [palettes, setPalettes] = useState<PalettePreset[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Pending edits (coalesced)
  const pendingTokensRef = useRef<ThemeTokens | null>(null)
  const pendingSectionsRef = useRef<SectionNode[] | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef<Promise<void> | null>(null)

  const refresh = useCallback(async () => {
    if (!storeId) return
    setIsLoading(true)
    setError(null)
    try {
      const [t, tpl, pal] = await Promise.all([
        repo.getTheme(storeId),
        repo.listTemplates(),
        repo.listPalettes(),
      ])
      setTheme(t)
      setTemplates(tpl)
      setPalettes(pal)
      setStatus("idle")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el editor")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }, [repo, storeId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // `listTemplates()` returns the lightweight catalog (no sectionSchema/defaultTokens).
  // The editor needs the full detail for whichever template is active, so fetch it
  // separately and merge it into the matching entry once we know the active key.
  const activeTemplateKey = theme?.activeTemplate ?? null
  useEffect(() => {
    if (!activeTemplateKey) return
    let cancelled = false
    repo
      .getTemplate(activeTemplateKey)
      .then((detail) => {
        if (cancelled) return
        setTemplates((prev) => {
          const idx = prev.findIndex((x) => x.key === activeTemplateKey)
          if (idx === -1) return prev
          if (prev[idx].sectionSchema) return prev
          const next = prev.slice()
          next[idx] = { ...next[idx], ...detail }
          return next
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeTemplateKey, repo])

  const flushPending = useCallback(async () => {
    if (!storeId) return
    const tokens = pendingTokensRef.current
    const sections = pendingSectionsRef.current
    if (!tokens && !sections) return

    pendingTokensRef.current = null
    pendingSectionsRef.current = null
    setStatus("saving")
    setError(null)

    try {
      let next: StoreThemeResponse | null = null
      if (tokens) {
        const payload: PatchTokensPayload = { tokens }
        next = await repo.patchTokens(storeId, payload)
      }
      if (sections) {
        const payload: PatchSectionsPayload = { sections }
        next = await repo.patchSections(storeId, payload)
      }
      if (next) setTheme(next)
      setStatus("saved")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar")
      setStatus("error")
    }
  }, [repo, storeId])

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      // chain after any in-flight save to keep order
      const prev = inFlightRef.current ?? Promise.resolve()
      inFlightRef.current = prev.then(() => flushPending()).finally(() => {
        inFlightRef.current = null
      })
    }, SAVE_DEBOUNCE_MS)
  }, [flushPending])

  // Cleanup the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const patchTokens = useCallback(
    (partial: ThemeTokens) => {
      setTheme((t) => {
        if (!t || !t.draft) return t
        const nextTokens = deepMergeTokens(t.draft.tokens, partial)
        return { ...t, draft: { ...t.draft, tokens: nextTokens } }
      })
      pendingTokensRef.current = deepMergeTokens(pendingTokensRef.current ?? undefined, partial)
      setStatus("saving")
      scheduleSave()
    },
    [scheduleSave],
  )

  const replaceSections = useCallback(
    (sections: SectionNode[]) => {
      setTheme((t) => {
        if (!t || !t.draft) return t
        return { ...t, draft: { ...t.draft, tree: { sections } } }
      })
      pendingSectionsRef.current = sections
      setStatus("saving")
      scheduleSave()
    },
    [scheduleSave],
  )

  const hardOp = useCallback(
    async (fn: () => Promise<StoreThemeResponse>) => {
      if (!storeId) return
      // Drain pending edits first so the server sees them in order.
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      await flushPending()
      setStatus("saving")
      setError(null)
      try {
        const next = await fn()
        setTheme(next)
        setStatus("saved")
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Error en la operación")
        setStatus("error")
        throw err
      }
    },
    [flushPending, storeId],
  )

  const switchTemplate = useCallback(
    async (templateKey: string) => {
      if (!storeId) return
      await hardOp(() => repo.switchTemplate(storeId, { templateKey }))
    },
    [hardOp, repo, storeId],
  )

  const publish = useCallback(async () => {
    if (!storeId) return
    await hardOp(() => repo.publish(storeId))
  }, [hardOp, repo, storeId])

  const rollback = useCallback(async () => {
    if (!storeId) return
    await hardOp(() => repo.rollback(storeId))
  }, [hardOp, repo, storeId])

  const resetDraft = useCallback(async () => {
    if (!storeId) return
    await hardOp(() => repo.resetDraft(storeId))
  }, [hardOp, repo, storeId])

  return {
    theme,
    templates,
    palettes,
    status,
    error,
    isLoading,
    patchTokens,
    replaceSections,
    switchTemplate,
    publish,
    rollback,
    resetDraft,
    refresh,
  }
}
