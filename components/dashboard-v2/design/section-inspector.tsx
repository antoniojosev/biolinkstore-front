"use client"

import { useAuth } from "@/contexts/auth-context"
import { UploadButton } from "../upload-button"
import { SocialLinksCard } from "../social-links-card"
import { useStoreSocials } from "@/lib/hooks/use-store-socials"
import type { SectionDef, SectionNode, SectionPropDef } from "@/lib/page-builder-api"
import { sectionLabel } from "./section-labels"

// Temas cuyo HERO tiene un lugar para redes (perfil linktree). En otros temas
// el hero no las dibuja, así que no se ofrece el control ahí.
const HERO_SOCIALS_TEMPLATES = new Set(["vitrina", "luxora"])

interface Props {
  def: SectionDef | null
  node: SectionNode | null
  templateKey?: string
  onPropsChange: (props: Record<string, unknown>) => void
  onToggleVisible: () => void
  onDelete: () => void
}

/**
 * Control de redes por sección: el editor maestro (SocialLinksCard, que edita
 * las URLs reales de la tienda) + checkboxes de "mostrar en esta sección". La
 * selección por sección se guarda como `socialsHidden` (plataformas ocultas
 * acá); vacío = se muestran todas.
 */
function SectionSocialsControl({
  hidden,
  onChange,
}: {
  hidden: string[]
  onChange: (hidden: string[]) => void
}) {
  const { socials } = useStoreSocials()
  const hiddenSet = new Set(hidden)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {socials.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {socials.map((sn) => {
            const shown = !hiddenSet.has(sn.platform)
            return (
              <label
                key={sn.id}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 8, opacity: shown ? 1 : 0.5 }}
              >
                <input
                  type="checkbox"
                  checked={shown}
                  onChange={() => {
                    const next = new Set(hiddenSet)
                    if (shown) next.add(sn.platform)
                    else next.delete(sn.platform)
                    onChange(Array.from(next))
                  }}
                  style={{ accentColor: "var(--brand)" }}
                />
                {sn.platform}
              </label>
            )
          })}
        </div>
      )}
      <SocialLinksCard compact />
    </div>
  )
}

// Nota: el layout/variante visual de una sección (ej. hero split/compact/banner)
// se controla con una prop `layout` normal declarada en el schema del template,
// no con section.variant — ese campo existe en el backend pero el renderer no
// lo lee, así que un selector separado acá sería otro control que no hace nada.
export function SectionInspector({ def, node, templateKey, onPropsChange, onToggleVisible, onDelete }: Props) {
  const { store } = useAuth()

  if (!def || !node) {
    return <div style={S.empty}>Seleccioná una sección del panel izquierdo para editarla.</div>
  }

  const showSocialsControl =
    def.type === "footer" || (def.type === "hero" && !!templateKey && HERO_SOCIALS_TEMPLATES.has(templateKey))

  function setProp(key: string, value: unknown) {
    onPropsChange({ ...node!.props, [key]: value })
  }

  const isHidden = node.visible === false
  const canDelete = def.removable !== false
  // socialsHidden lo maneja el control de redes por sección, no un PropField.
  const propEntries = Object.entries(def.props ?? {}).filter(([k]) => k !== "socialsHidden")

  return (
    <div style={S.wrap}>
      <div style={S.title}>{sectionLabel(def.type)}</div>

      {propEntries.length > 0 && (
        <div style={S.group}>
          <span style={S.groupLbl}>Contenido</span>
          {propEntries.map(([key, propDef]) => (
            <PropField
              key={key}
              label={propDef.label ?? key}
              propDef={propDef}
              value={node.props[key]}
              onChange={(v) => setProp(key, v)}
              storeId={store?.id}
            />
          ))}
        </div>
      )}

      {/* Redes por sección: elegís cuáles mostrar acá (checkboxes) y editás las
          URLs reales de la tienda con el administrador (mismo de Config → Redes,
          compartido entre secciones). */}
      {showSocialsControl && (
        <div style={S.group}>
          <span style={S.groupLbl}>Redes en esta sección</span>
          <p style={S.hint}>Tildá cuáles mostrar acá. Las URLs se editan abajo (valen para toda la tienda).</p>
          <SectionSocialsControl
            hidden={Array.isArray(node.props.socialsHidden) ? (node.props.socialsHidden as string[]) : []}
            onChange={(hidden) => setProp("socialsHidden", hidden)}
          />
        </div>
      )}

      <div style={S.group}>
        <div style={S.toggleRow}>
          <span>Mostrar esta sección</span>
          <button
            type="button"
            onClick={onToggleVisible}
            style={{ ...S.switch, background: isHidden ? "var(--line-2)" : "var(--brand)" }}
            aria-label="Mostrar/ocultar sección"
          >
            <span style={{ ...S.knob, transform: isHidden ? "translateX(0)" : "translateX(15px)" }} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        style={{ ...S.delBtn, opacity: canDelete ? 1 : 0.4, cursor: canDelete ? "pointer" : "not-allowed" }}
        title={canDelete ? undefined : "Esta sección no se puede eliminar"}
      >
        Eliminar sección
      </button>
    </div>
  )
}

interface PropFieldProps {
  label: string
  propDef: SectionPropDef
  value: unknown
  onChange: (v: unknown) => void
  storeId?: string
}

function PropField({ label, propDef, value, onChange, storeId }: PropFieldProps) {
  switch (propDef.type) {
    case "text": {
      const str = typeof value === "string" ? value : ""
      const useTextarea = (propDef.max ?? 0) > 90
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>
            {label}
            {propDef.max ? <span style={S.counter}> · {str.length}/{propDef.max}</span> : null}
          </label>
          {useTextarea ? (
            <textarea value={str} maxLength={propDef.max} onChange={(e) => onChange(e.target.value)} style={S.textarea} />
          ) : (
            <input value={str} maxLength={propDef.max} onChange={(e) => onChange(e.target.value)} style={S.input} />
          )}
        </div>
      )
    }
    case "string": {
      const str = typeof value === "string" ? value : ""
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>{label}</label>
          <input value={str} onChange={(e) => onChange(e.target.value)} style={S.input} />
        </div>
      )
    }
    case "enum": {
      const options = propDef.options ?? []
      const str = typeof value === "string" && options.includes(value) ? value : options[0] ?? ""
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>{label}</label>
          <select value={str} onChange={(e) => onChange(e.target.value)} style={S.select}>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      )
    }
    case "boolean": {
      const bool = value === true
      return (
        <div style={S.toggleRow}>
          <span>{label}</span>
          <button type="button" onClick={() => onChange(!bool)} style={{ ...S.switch, background: bool ? "var(--brand)" : "var(--line-2)" }}>
            <span style={{ ...S.knob, transform: bool ? "translateX(15px)" : "translateX(0)" }} />
          </button>
        </div>
      )
    }
    case "number": {
      const num = typeof value === "number" ? value : propDef.min ?? 0
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>{label}</label>
          <input
            type="number"
            value={num}
            min={propDef.min}
            max={propDef.max}
            onChange={(e) => onChange(e.target.value === "" ? propDef.min ?? 0 : Number(e.target.value))}
            style={S.input}
          />
        </div>
      )
    }
    case "color": {
      const hexOk = typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>{label}</label>
          <div style={S.colorRow}>
            <input type="color" value={hexOk ? (value as string) : "#1E3A8A"} onChange={(e) => onChange(e.target.value)} style={S.colorSwatch} />
            <input
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              style={S.colorText}
              spellCheck={false}
              maxLength={9}
            />
          </div>
        </div>
      )
    }
    case "image": {
      const url = typeof value === "string" ? value : ""
      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>{label}</label>
          <input value={url} onChange={(e) => onChange(e.target.value)} placeholder="https://…" style={S.input} />
          <div style={{ marginTop: 6 }}>
            <UploadButton storeId={storeId} onUploaded={(urls) => urls[0] && onChange(urls[0])} label="Subir imagen" />
          </div>
        </div>
      )
    }
    case "list": {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
      const itemSchema = propDef.itemSchema ?? {}
      const atMax = propDef.max !== undefined && items.length >= propDef.max

      function updateItem(i: number, itemProps: Record<string, unknown>) {
        const next = items.slice()
        next[i] = itemProps
        onChange(next)
      }
      function removeItem(i: number) {
        onChange(items.filter((_, idx) => idx !== i))
      }
      function moveItem(i: number, dir: -1 | 1) {
        const t = i + dir
        if (t < 0 || t >= items.length) return
        const next = items.slice()
        ;[next[i], next[t]] = [next[t], next[i]]
        onChange(next)
      }
      function addItem() {
        onChange([...items, {}])
      }

      return (
        <div style={S.field}>
          <label style={S.fieldLbl}>
            {label}
            {propDef.max ? <span style={S.counter}> · {items.length}/{propDef.max}</span> : null}
          </label>
          <div style={S.listWrap}>
            {items.map((item, i) => (
              <div key={i} style={S.listItem}>
                <div style={S.listItemHead}>
                  <span style={S.listItemNum}>#{i + 1}</span>
                  <div style={S.listItemActions}>
                    <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} style={S.miniBtn}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} style={S.miniBtn}>
                      ↓
                    </button>
                    <button type="button" onClick={() => removeItem(i)} style={S.miniBtnDel}>
                      ✕
                    </button>
                  </div>
                </div>
                {Object.entries(itemSchema).map(([k, d]) => (
                  <PropField
                    key={k}
                    label={d.label ?? k}
                    propDef={d}
                    value={item[k]}
                    onChange={(v) => updateItem(i, { ...item, [k]: v })}
                    storeId={storeId}
                  />
                ))}
              </div>
            ))}
            <button type="button" onClick={addItem} disabled={atMax} style={{ ...S.addItemBtn, opacity: atMax ? 0.5 : 1 }}>
              + Agregar
            </button>
          </div>
        </div>
      )
    }
    default:
      return null
  }
}

const S: Record<string, React.CSSProperties> = {
  empty: { padding: 20, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 },
  wrap: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 8 },
  group: { marginBottom: 18 },
  groupLbl: {
    fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", textTransform: "uppercase",
    letterSpacing: "0.03em", marginBottom: 8, display: "block",
  },
  hint: { fontSize: 11.5, color: "var(--ink-3)", margin: "0 0 10px", lineHeight: 1.5 },
  field: { marginBottom: 10 },
  fieldLbl: { fontSize: 11.5, color: "var(--ink-3)", marginBottom: 4, display: "block" },
  counter: { color: "var(--ink-3)", fontWeight: 400 },
  input: { width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5, fontFamily: "inherit", color: "var(--ink)" },
  textarea: {
    width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5,
    fontFamily: "inherit", color: "var(--ink)", resize: "vertical", minHeight: 60,
  },
  select: { width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5, fontFamily: "inherit", color: "var(--ink)" },
  colorRow: { display: "flex", gap: 8 },
  colorSwatch: { width: 34, height: 34, border: "1px solid var(--line)", borderRadius: 8, padding: 2, flexShrink: 0, cursor: "pointer" },
  colorText: { flex: 1, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5, fontFamily: "var(--font-mono)" },
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" },
  switch: { width: 34, height: 19, borderRadius: 999, position: "relative", border: "none", cursor: "pointer", flexShrink: 0, padding: 0 },
  knob: { position: "absolute", top: 2, left: 2, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "transform .15s ease" },
  delBtn: {
    marginTop: 8, width: "100%", padding: 9, border: "1px solid rgba(220,74,61,0.4)", background: "rgba(220,74,61,0.06)",
    color: "var(--accent)", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit",
  },
  listWrap: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: { border: "1px solid var(--line)", borderRadius: 10, padding: 10, background: "var(--bg)" },
  listItemHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  listItemNum: { fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--ink-3)" },
  listItemActions: { display: "flex", gap: 4 },
  miniBtn: { width: 20, height: 20, border: "1px solid var(--line)", background: "#fff", borderRadius: 5, fontSize: 10, color: "var(--ink-2)", cursor: "pointer", padding: 0 },
  miniBtnDel: { width: 20, height: 20, border: "1px solid rgba(220,74,61,0.3)", background: "rgba(220,74,61,0.06)", borderRadius: 5, fontSize: 10, color: "var(--accent)", cursor: "pointer", padding: 0 },
  addItemBtn: {
    padding: "8px 10px", border: "1.5px dashed var(--line-2)", borderRadius: 8, color: "var(--ink-2)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", background: "none", fontFamily: "inherit",
  },
}
