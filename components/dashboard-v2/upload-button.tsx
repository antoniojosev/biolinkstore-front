"use client"

import { useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { UploadResponse } from "@/lib/products-api/types"
import { ApiError } from "@/lib/http/types"

interface UploadButtonProps {
  storeId: string | undefined
  onUploaded(url: string): void
  accept?: string
  disabled?: boolean
  label?: string
}

const MAX_BYTES = 5 * 1024 * 1024

export function UploadButton({ storeId, onUploaded, accept = "image/*", disabled, label = "Subir archivo" }: UploadButtonProps) {
  const { http } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!storeId) { setError("Inicia sesión primero"); return }
    if (file.size > MAX_BYTES) { setError(`Máx 5 MB (este pesa ${(file.size / 1024 / 1024).toFixed(1)} MB)`); return }
    setUploading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append("files", file)
      const res = await http.postFormData<UploadResponse[]>(`/api/stores/${storeId}/uploads`, fd)
      const url = res[0]?.url
      if (!url) throw new Error("Respuesta sin URL")
      onUploaded(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el archivo")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} disabled={disabled || uploading} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || uploading || !storeId} className="btn btn-secondary btn-sm">
        {uploading ? "Subiendo…" : `📤 ${label}`}
      </button>
      {error && <span className="body-sm" style={{ color: "var(--danger)" }}>{error}</span>}
    </div>
  )
}
