'use client'

import { useState, useRef, useMemo } from 'react'
import { Plus, X, Layers, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface AttributeField {
  name: string
  options: string[]
}

interface ProductAttributesBuilderProps {
  attributes: AttributeField[]
  onChange: (attributes: AttributeField[]) => void
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

export function ProductAttributesBuilder({
  attributes,
  onChange,
}: ProductAttributesBuilderProps) {
  const [showCombinations, setShowCombinations] = useState(true)

  const addAttribute = () => {
    onChange([...attributes, { name: '', options: [] }])
  }

  const updateAttribute = (index: number, field: keyof AttributeField, value: string | string[]) => {
    const updated = [...attributes]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeAttribute = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index))
  }

  const combinations = useMemo(
    () => generateCombinations(attributes),
    [attributes],
  )

  const suggestedNames = ['Talla', 'Color', 'Material', 'Estilo']
  const unusedSuggestions = suggestedNames.filter(
    (s) => !attributes.some((a) => a.name.toLowerCase() === s.toLowerCase()),
  )

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
              onChange={(e) => updateAttribute(index, 'name', e.target.value)}
              placeholder="Nombre (ej: Talla, Color)"
              className="h-9 flex-1 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/25 focus:border-[#33b380]/50 focus:ring-[#33b380]/20"
            />
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
              Opciones <span className="text-white/20">(Enter o coma para agregar)</span>
            </label>
            <TagInput
              options={attr.options}
              onChange={(opts) => updateAttribute(index, 'options', opts)}
              placeholder="Ej: S, M, L, XL"
            />
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
                onClick={() => onChange([...attributes, { name, options: [] }])}
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
              {combinations.slice(0, 20).map((combo, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-white/5 border border-white/5 text-white/50 px-2 py-1 rounded-md"
                >
                  {Object.values(combo).join(' / ')}
                </span>
              ))}
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
