'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, ImagePlus, AlertCircle } from 'lucide-react'

export interface ImageSlot {
  id: string
  file?: File
  previewUrl: string
  remoteUrl?: string
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
}

interface ProductImageUploadProps {
  images: ImageSlot[]
  onChange: (images: ImageSlot[]) => void
  maxImages?: number
}

export function ProductImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOverPage, setDragOverPage] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItem = useRef<number | null>(null)

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = maxImages - images.length
      if (remaining <= 0) return

      const newSlots: ImageSlot[] = fileArray.slice(0, remaining).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const,
      }))

      onChange([...images, ...newSlots])
    },
    [images, maxImages, onChange],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Page-level drag-and-drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setDragOverPage(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set false when leaving the container (not entering a child)
    if (e.currentTarget === e.target) {
      setDragOverPage(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverPage(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeImage = (id: string) => {
    const slot = images.find((s) => s.id === id)
    if (slot?.previewUrl && slot.file) {
      URL.revokeObjectURL(slot.previewUrl)
    }
    onChange(images.filter((img) => img.id !== id))
  }

  // Reorder drag
  const handleReorderDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleReorderDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)

    if (dragItem.current === null || dragItem.current === dropIndex) return

    const reordered = [...images]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dropIndex, 0, moved)
    dragItem.current = null
    onChange(reordered)
  }

  const handleReorderDragEnd = () => {
    dragItem.current = null
    setDragOverIndex(null)
  }

  return (
    <div
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-area drop overlay */}
      {dragOverPage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-[#33b380] bg-[#33b380]/10 backdrop-blur-sm transition-all">
          <div className="text-center">
            <Upload className="w-8 h-8 text-[#6ee490] mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-medium text-[#6ee490]">Suelta tus imagenes aqui</p>
            <p className="text-xs text-white/40 mt-1">
              {maxImages - images.length} {maxImages - images.length === 1 ? 'espacio disponible' : 'espacios disponibles'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => handleReorderDragStart(i)}
            onDragOver={(e) => handleReorderDragOver(e, i)}
            onDrop={(e) => handleReorderDrop(e, i)}
            onDragEnd={handleReorderDragEnd}
            className={`relative group aspect-square rounded-xl overflow-hidden bg-white/5 border transition-all duration-300 cursor-grab active:cursor-grabbing ${
              dragOverIndex === i
                ? 'border-[#33b380] scale-[1.02] ring-2 ring-[#33b380]/30'
                : 'border-white/10 hover:border-white/20'
            } ${img.status === 'uploading' ? 'animate-pulse' : ''}`}
          >
            <img
              src={img.previewUrl}
              alt={`Producto ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Uploading overlay */}
            {img.status === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#33b380] rounded-full animate-spin" />
              </div>
            )}

            {/* Error overlay */}
            {img.status === 'error' && (
              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center z-10">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            )}

            {/* Uploaded checkmark */}
            {img.status === 'uploaded' && (
              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#33b380] flex items-center justify-center z-10 animate-in zoom-in duration-300">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Cover badge */}
            {i === 0 && (
              <span className="absolute top-2 left-2 bg-[#33b380] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md z-10 shadow-lg">
                Portada
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-red-500/80 flex items-center justify-center transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2">
                <GripVertical className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-[#33b380]/50 bg-white/[0.02] hover:bg-[#33b380]/5 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#33b380]/10 flex items-center justify-center transition-all">
              <ImagePlus className="w-5 h-5 text-white/30 group-hover:text-[#33b380] transition-colors" />
            </div>
            <span className="text-[11px] text-white/30 group-hover:text-white/50 font-medium transition-colors">
              Subir foto
            </span>
            <span className="text-[10px] text-white/15">
              {images.length}/{maxImages}
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
