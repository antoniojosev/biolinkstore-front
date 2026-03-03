'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { Plus, X, Layers, ChevronDown, ChevronUp, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface AttributeField {
  name: string
  type: 'text' | 'color'
  options: string[]
  optionsMeta?: Record<string, { hex?: string; images?: string[] }>
}

interface ProductAttributesBuilderProps {
  attributes: AttributeField[]
  onChange: (attributes: AttributeField[]) => void
  onUploadImages?: (files: File[]) => Promise<string[]>
}

// Mirrors backend VariantGeneratorService logic
function generateCombinations(
  attributes: AttributeField[],
): Record<string, string>[] {
  const validAttrs = attributes.filter((a) => a.name && a.options.length > 0)
  if (validAttrs.length === 0) return []

  const result: Record<string, string>[] = []

  function recurse(index: number, current: Record<string, string>) {
    if (index === validAttrs.length) {
      result.push({ ...current })
      return
    }
    const attr = validAttrs[index]
    for (const option of attr.options) {
      recurse(index + 1, { ...current, [attr.name]: option })
    }
  }

  recurse(0, {})
  return result
}

function TagInput({
  options,
  onChange,
  placeholder,
}: {
  options: string[]
  onChange: (options: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addOption = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !options.includes(trimmed)) {
      onChange([...options, trimmed])
    }
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addOption(input)
    }
    if (e.key === 'Backspace' && input === '' && options.length > 0) {
      onChange(options.slice(0, -1))
    }
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10 focus-within:border-[#33b380]/50 focus-within:ring-1 focus-within:ring-[#33b380]/20 transition-all min-h-[40px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {options.map((opt, i) => (
        <span
          key={`${opt}-${i}`}
          className="inline-flex items-center gap-1 text-xs bg-[#33b380]/15 text-[#6ee490] pl-2.5 pr-1 py-1 rounded-md font-medium animate-in fade-in zoom-in duration-200"
        >
          {opt}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeOption(i)
            }}
            className="w-4 h-4 rounded-sm hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addOption(input)}
        placeholder={options.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
      />
    </div>
  )
}

function ColorOptionInput({
  options,
  optionsMeta,
  onChangeOptions,
  onChangeMeta,
  onUploadImages,
}: {
  options: string[]
  optionsMeta: Record<string, { hex?: string; images?: string[] }>
  onChangeOptions: (options: string[]) => void
  onChangeMeta: (meta: Record<string, { hex?: string; images?: string[] }>) => void
  onUploadImages?: (files: File[]) => Promise<string[]>
}) {
  const [newName, setNewName] = useState('')
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const addColor = () => {
    const trimmed = newName.trim()
    if (trimmed && !options.includes(trimmed)) {
      onChangeOptions([...options, trimmed])
      onChangeMeta({ ...optionsMeta, [trimmed]: { hex: '#888888', images: [] } })
    }
    setNewName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addColor()
    }
  }

  const updateHex = (name: string, hex: string) => {
    onChangeMeta({
      ...optionsMeta,
      [name]: { ...optionsMeta[name], hex },
    })
  }

  const removeColor = (name: string) => {
    onChangeOptions(options.filter((o) => o !== name))
    const newMeta = { ...optionsMeta }
    delete newMeta[name]
    onChangeMeta(newMeta)
  }

  const handleImageUpload = async (colorName: string, files: FileList | null) => {
    if (!files?.length || !onUploadImages) return
    setUploadingFor(colorName)
    try {
      const urls = await onUploadImages(Array.from(files))
      const existing = optionsMeta[colorName]?.images ?? []
      onChangeMeta({
        ...optionsMeta,
        [colorName]: { ...optionsMeta[colorName], images: [...existing, ...urls] },
      })
    } catch {
      // Error handled upstream
    } finally {
      setUploadingFor(null)
    }
  }

  const removeImage = (colorName: string, imgIndex: number) => {
    const images = [...(optionsMeta[colorName]?.images ?? [])]
    images.splice(imgIndex, 1)
    onChangeMeta({
      ...optionsMeta,
      [colorName]: { ...optionsMeta[colorName], images },
    })
  }

  return (
    <div className="space-y-2">
      {/* Existing colors */}
      {options.map((name) => {
        const meta = optionsMeta[name] ?? {}
        return (
          <div
            key={name}
            className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-2"
          >
            <div className="flex items-center gap-2">
              {/* Color swatch + picker */}
              <label className="relative w-8 h-8 rounded-full cursor-pointer shrink-0 border border-white/10 overflow-hidden">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: meta.hex || '#888' }}
                />
                <input
                  type="color"
                  value={meta.hex || '#888888'}
                  onChange={(e) => updateHex(name, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              {/* Name */}
              <span className="text-sm text-white font-medium flex-1">{name}</span>

              {/* Hex display */}
              <span className="text-[10px] text-white/30 font-mono">
                {meta.hex?.toUpperCase() || '#888888'}
              </span>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeColor(name)}
                className="w-6 h-6 rounded-md hover:bg-red-500/15 text-white/25 hover:text-red-400 flex items-center justify-center transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Images for this color */}
            {onUploadImages && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {(meta.images ?? []).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-10 h-10 rounded-md overflow-hidden bg-white/5 group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(name, idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-10 h-10 rounded-md bg-white/5 border border-dashed border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer transition-all">
                  {uploadingFor === name ? (
                    <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5 text-white/20" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(name, e.target.files)}
                    disabled={!!uploadingFor}
                  />
                </label>
              </div>
            )}
          </div>
        )
      })}

      {/* Add new color */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => newName.trim() && addColor()}
          placeholder="Nombre del color (ej: Rojo)"
          className="flex-1 h-8 px-2.5 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#33b380]/50 transition-colors"
        />
        <button
          type="button"
          onClick={addColor}
          disabled={!newName.trim()}
          className="h-8 px-2.5 rounded-md bg-white/5 text-white/40 hover:text-[#6ee490] hover:bg-[#33b380]/10 disabled:opacity-30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ProductAttributesBuilder({
  attributes,
  onChange,
  onUploadImages,
}: ProductAttributesBuilderProps) {
  const [showCombinations, setShowCombinations] = useState(true)

  const addAttribute = () => {
    onChange([...attributes, { name: '', type: 'text', options: [] }])
  }

  const updateAttribute = useCallback(
    (index: number, updates: Partial<AttributeField>) => {
      const updated = [...attributes]
      updated[index] = { ...updated[index], ...updates }
      onChange(updated)
    },
    [attributes, onChange],
  )

  const removeAttribute = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index))
  }

  // Auto-detect "Color" name
  const handleNameChange = (index: number, name: string) => {
    const isColor = name.toLowerCase() === 'color'
    updateAttribute(index, {
      name,
      type: isColor ? 'color' : attributes[index].type,
      optionsMeta: isColor ? (attributes[index].optionsMeta ?? {}) : attributes[index].optionsMeta,
    })
  }

  const combinations = useMemo(
    () => generateCombinations(attributes),
    [attributes],
  )

  const suggestedNames = ['Talla', 'Color', 'Material', 'Estilo']
  const unusedSuggestions = suggestedNames.filter(
    (s) => !attributes.some((a) => a.name.toLowerCase() === s.toLowerCase()),
  )

  const handleSuggestion = (name: string) => {
    const isColor = name.toLowerCase() === 'color'
    onChange([...attributes, {
      name,
      type: isColor ? 'color' : 'text',
      options: [],
      optionsMeta: isColor ? {} : undefined,
    }])
  }

  return (
    <div className="space-y-4">
      {attributes.map((attr, index) => (
        <div
          key={index}
          className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2">
            <Input
              value={attr.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder="Nombre (ej: Talla, Color)"
              className="h-9 flex-1 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
            />

            {/* Type selector */}
            <select
              value={attr.type}
              onChange={(e) => {
                const newType = e.target.value as 'text' | 'color'
                updateAttribute(index, {
                  type: newType,
                  optionsMeta: newType === 'color' ? (attr.optionsMeta ?? {}) : undefined,
                })
              }}
              className={`h-9 px-2 pr-7 rounded-lg text-xs font-medium transition-all appearance-none bg-no-repeat bg-[length:12px] bg-[center_right_6px] cursor-pointer [color-scheme:dark] ${
                attr.type === 'color'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="text" className="bg-[#0d1218] text-white">Texto</option>
              <option value="color" className="bg-[#0d1218] text-white">Color</option>
            </select>

            <button
              type="button"
              onClick={() => removeAttribute(index)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 text-white/30 hover:text-red-400 flex items-center justify-center transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-white/40">
              {attr.type === 'color' ? 'Colores' : 'Opciones'}{' '}
              <span className="text-white/20">
                {attr.type === 'color'
                  ? '(agrega colores con hex e imagenes)'
                  : '(Enter o coma para agregar)'}
              </span>
            </label>

            {attr.type === 'color' ? (
              <ColorOptionInput
                options={attr.options}
                optionsMeta={attr.optionsMeta ?? {}}
                onChangeOptions={(opts) => updateAttribute(index, { options: opts })}
                onChangeMeta={(meta) => updateAttribute(index, { optionsMeta: meta })}
                onUploadImages={onUploadImages}
              />
            ) : (
              <TagInput
                options={attr.options}
                onChange={(opts) => updateAttribute(index, { options: opts })}
                placeholder="Ej: S, M, L, XL"
              />
            )}
          </div>
        </div>
      ))}

      {/* Add attribute button */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={addAttribute}
          className="h-9 text-xs text-[#33b380] hover:text-[#6ee490] hover:bg-[#33b380]/10 border border-dashed border-[#33b380]/30 hover:border-[#33b380]/50 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Agregar atributo
        </Button>

        {/* Quick-add suggestions */}
        {attributes.length === 0 && unusedSuggestions.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <span>Sugeridos:</span>
            {unusedSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSuggestion(name)}
                className="px-2 py-0.5 rounded-md bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Variant combinations preview */}
      {combinations.length > 0 && (
        <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCombinations(!showCombinations)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-white/50 hover:text-white/70 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#327be2]" />
              {combinations.length} {combinations.length === 1 ? 'variante' : 'variantes'}
            </span>
            {showCombinations ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCombinations && (
            <div className="px-3 pb-3 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {combinations.slice(0, 20).map((combo, i) => {
                // Find color attribute to show swatch
                const colorAttr = attributes.find((a) => a.type === 'color')
                const colorValue = colorAttr ? combo[colorAttr.name] : null
                const colorHex = colorValue ? colorAttr?.optionsMeta?.[colorValue]?.hex : null

                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] bg-white/5 border border-white/5 text-white/50 px-2 py-1 rounded-md"
                  >
                    {colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                    )}
                    {Object.values(combo).join(' / ')}
                  </span>
                )
              })}
              {combinations.length > 20 && (
                <span className="text-[11px] text-white/30 px-2 py-1">
                  +{combinations.length - 20} mas
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
