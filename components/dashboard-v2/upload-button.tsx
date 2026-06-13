"use client"

import { useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { UploadResponse } from "@/lib/products-api/types"
import { ApiError } from "@/lib/http/types"

interface UploadButtonProps {
  storeId: string | undefined
  onUploaded(urls: string[]): void
  accept?: string
  disabled?: boolean
  label?: string
  multiple?: boolean
}

const MAX_BYTES = 5 * 1024 * 1024

export function UploadButton({ storeId, onUploaded, accept = "image/*", disabled, label = "Subir archivo", multiple = false }: UploadButtonProps) {
  const { http } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: File[]) {
    if (!storeId) { setError("Inicia sesión primero"); return }
    const oversized = files.find((f) => f.size > MAX_BYTES)
    if (oversized) { setError(`Máx 5 MB · "${oversized.name}" pesa ${(oversized.size / 1024 / 1024).toFixed(1)} MB`); return }
    setUploading(true); setError(null)
    try {
      const fd = new FormData()
      for (const f of files) fd.append("files", f)
      const res = await http.postFormData<UploadResponse[]>(`/api/stores/${storeId}/uploads`, fd)
      const urls = res.map((r) => r.url).filter(Boolean)
      if (urls.length === 0) throw new Error("Respuesta sin URLs")
      onUploaded(urls)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el archivo")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: "none" }} onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length > 0) handleFiles(fs) }} disabled={disabled || uploading} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || uploading || !storeId} className="btn btn-secondary btn-sm">
        {uploading ? "Subiendo…" : `📤 ${label}`}
      </button>
      {error && <span className="body-sm" style={{ color: "var(--danger)" }}>{error}</span>}
    </div>
  )
}
