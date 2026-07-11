"use client"

import { useState } from "react"
import type { SectionDef, SectionNode, Template } from "@/lib/page-builder-api"
import { SECTION_ICONS, sectionLabel } from "./section-labels"

interface Props {
  template: Template | null
  sections: SectionNode[]
  selectedKey: string | null
  onSelectSection: (key: string) => void
  onReorder: (sections: SectionNode[]) => void
  onToggleVisible: (key: string) => void
  onAddSection: (def: SectionDef) => void
  onGoToThemes: () => void
}

export function SectionsPanel({ template, sections, selectedKey, onSelectSection, onReorder, onToggleVisible, onAddSection, onGoToThemes }: Props) {
  const [addOpen, setAddOpen] = useState(false)

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    const next = sections.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    onReorder(next)
  }

  const schemaSections = template?.sectionSchema?.sections ?? []
  const presentTypes = new Set(sections.map((s) => s.type))
  const availableDefs = schemaSections.filter((def) => def.removable !== false || !presentTypes.has(def.type))

  return (
    <aside style={S.aside}>
      <div style={S.current}>
        <div style={S.currentLabel}>Editando template</div>
        <div style={S.currentRow}>
          <span style={S.currentName}>{template?.name ?? "—"}</span>
          <button type="button" onClick={onGoToThemes} style={S.currentChange}>
            Cambiar →
          </button>
        </div>
      </div>

      <div style={S.header}>Secciones</div>
      <div style={S.list}>
        {sections.map((s, i) => {
          const isSelected = s.key === selectedKey
          const isHidden = s.visible === false
          return (
            <div
              key={s.key}
              onClick={() => onSelectSection(s.key)}
              style={{ ...S.row, ...(isSelected ? S.rowSelected : null), ...(isHidden ? S.rowHidden : null) }}
            >
              <div style={S.gripCol}>
                <button type="button" onClick={(e) => { e.stopPropagation(); move(i, -1) }} disabled={i === 0} style={S.gripBtn} title="Subir">
                  ↑
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); move(i, 1) }} disabled={i === sections.length - 1} style={S.gripBtn} title="Bajar">
                  ↓
                </button>
              </div>
              <div style={S.icon}>{SECTION_ICONS[s.type] ?? "▢"}</div>
              <div style={S.info}>
                <div style={S.name}>{sectionLabel(s.type)}</div>
                <div style={S.type}>{s.type}</div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleVisible(s.key) }}
                style={S.eye}
                title={isHidden ? "Mostrar sección" : "Ocultar sección"}
              >
                {isHidden ? "🚫" : "👁"}
              </button>
            </div>
          )
        })}

        <div style={{ position: "relative" }}>
          <button type="button" onClick={() => setAddOpen((v) => !v)} style={S.addBtn}>
            + Agregar sección
          </button>
          {addOpen && (
            <>
              <div style={S.backdrop} onClick={() => setAddOpen(false)} />
              <div style={S.addMenu}>
                <div style={S.addMenuHdr}>Agregar sección</div>
                {availableDefs.length === 0 ? (
                  <div style={S.addMenuEmpty}>No hay más secciones disponibles para este template.</div>
                ) : (
                  availableDefs.map((def) => (
                    <div
                      key={def.key}
                      onClick={() => {
                        onAddSection(def)
                        setAddOpen(false)
                      }}
                      style={S.addMenuItem}
                    >
                      <div style={S.addMenuIcon}>{SECTION_ICONS[def.type] ?? "▢"}</div>
                      <div>
                        <div style={S.addMenuName}>{sectionLabel(def.type)}</div>
                        <div style={S.addMenuType}>{def.type}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: 260,
    flexShrink: 0,
    borderRight: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg-elev)",
  },
  current: { padding: "12px 14px", borderBottom: "1px solid var(--line)", flexShrink: 0 },
  currentLabel: { fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 },
  currentRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
  currentName: { fontSize: 13.5, fontWeight: 700, flex: 1 },
  currentChange: { fontSize: 11, color: "var(--brand)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  header: { padding: "12px 14px 6px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 },
  list: { flex: 1, overflowY: "auto", padding: "4px 12px 12px", display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 8px",
    borderWidth: 1, borderStyle: "solid", borderColor: "var(--line)",
    borderRadius: 10, background: "var(--bg)", cursor: "pointer",
  },
  rowSelected: { borderColor: "var(--brand)", background: "rgba(30,58,138,0.05)", boxShadow: "0 0 0 1px var(--brand)" },
  rowHidden: { opacity: 0.5 },
  gripCol: { display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 },
  gripBtn: {
    width: 18, height: 14, border: "none", background: "none", color: "var(--ink-3)",
    fontSize: 10, cursor: "pointer", lineHeight: 1, padding: 0,
  },
  icon: { width: 26, height: 26, borderRadius: 7, background: "var(--bg-2)", color: "var(--ink-2)", display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 12.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  type: { fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--font-mono)" },
  eye: { width: 26, height: 26, borderRadius: 7, background: "none", border: "none", display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 12, flexShrink: 0, cursor: "pointer" },
  addBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10,
    border: "1.5px dashed var(--line-2)", borderRadius: 10, color: "var(--ink-2)", fontSize: 12.5,
    fontWeight: 600, cursor: "pointer", width: "100%", background: "none", fontFamily: "inherit", marginTop: 4,
  },
  backdrop: { position: "fixed", inset: 0, zIndex: 199 },
  addMenu: {
    position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 8,
    background: "#fff", border: "1px solid var(--line)", borderRadius: 14,
    boxShadow: "0 20px 50px -16px rgba(0,0,0,0.25)", padding: 8, zIndex: 200,
    maxHeight: 320, overflowY: "auto",
  },
  addMenuHdr: { fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "8px 10px 4px" },
  addMenuEmpty: { padding: "12px 10px", fontSize: 12, color: "var(--ink-3)" },
  addMenuItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer" },
  addMenuIcon: { width: 30, height: 30, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 13, color: "var(--ink-2)", flexShrink: 0 },
  addMenuName: { fontSize: 12.5, fontWeight: 600 },
  addMenuType: { fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--font-mono)" },
}
