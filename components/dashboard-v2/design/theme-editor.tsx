"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/lib/hooks/use-theme"
import type { SectionDef, SectionNode } from "@/lib/page-builder-api"
import { EditorCanvas } from "./editor-canvas"
import { SectionsPanel } from "./sections-panel"
import { SectionInspector } from "./section-inspector"
import { TokensEditor } from "./tokens-editor"
import { sectionLabel } from "./section-labels"

interface Props {
  /** Optional — when the editor is the whole Diseño view there's nothing to go back to. */
  onClose?: () => void
  /** Navigates to the Temas gallery tab — the template switcher lives there now. */
  onGoToThemes?: () => void
}

type RightTab = "design" | "section"

export function ThemeEditor({ onClose, onGoToThemes }: Props) {
  const { store } = useAuth()
  const t = useTheme()
  const [confirmingPublish, setConfirmingPublish] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<RightTab>("design")

  const activeTemplate = useMemo(
    () => t.templates.find((x) => x.key === t.theme?.activeTemplate) ?? null,
    [t.templates, t.theme?.activeTemplate],
  )

  const draftTokens = t.theme?.draft?.tokens ?? activeTemplate?.defaultTokens ?? {}
  const sections: SectionNode[] = t.theme?.draft?.tree?.sections ?? []

  const selectedNode = sections.find((s) => s.key === selectedKey) ?? null
  const selectedDef: SectionDef | null =
    (selectedNode && activeTemplate?.sectionSchema?.sections.find((d) => d.type === selectedNode.type)) || null

  const hasUnpublishedChanges =
    t.theme?.draft && t.theme?.published
      ? JSON.stringify(t.theme.draft.tokens) !== JSON.stringify(t.theme.published.tokens) ||
        JSON.stringify(t.theme.draft.tree) !== JSON.stringify(t.theme.published.tree)
      : Boolean(t.theme?.draft)

  function selectSection(key: string) {
    setSelectedKey(key)
    setRightTab("section")
  }

  function handleReorder(next: SectionNode[]) {
    t.replaceSections(next)
  }

  function handleToggleVisible(key: string) {
    t.replaceSections(sections.map((s) => (s.key === key ? { ...s, visible: s.visible === false } : s)))
  }

  function handleAddSection(def: SectionDef) {
    const newKey = `${def.type}_${Date.now()}`
    t.replaceSections([...sections, { type: def.type, key: newKey, props: {}, visible: true }])
    selectSection(newKey)
  }

  function handleDeleteSection(key: string) {
    if (!confirm("Esto elimina la sección del borrador. ¿Continuar?")) return
    t.replaceSections(sections.filter((s) => s.key !== key))
    if (selectedKey === key) setSelectedKey(null)
  }

  function handlePropsChange(key: string, props: Record<string, unknown>) {
    t.replaceSections(sections.map((s) => (s.key === key ? { ...s, props } : s)))
  }

  function handleVariantChange(key: string, variant: string) {
    t.replaceSections(sections.map((s) => (s.key === key ? { ...s, variant } : s)))
  }

  async function handlePublish() {
    setConfirmingPublish(false)
    try {
      await t.publish()
    } catch {
      // status already set to error inside the hook
    }
  }

  async function handleRollback() {
    if (!confirm("Esto restaura la versión previa publicada. ¿Continuar?")) return
    try {
      await t.rollback()
    } catch {
      // noop
    }
  }

  async function handleReset() {
    if (!confirm("Esto descarta los cambios del borrador. ¿Continuar?")) return
    try {
      await t.resetDraft()
    } catch {
      // noop
    }
  }

  function handleOpenPreview() {
    if (!store?.slug) return
    window.open(`/${store.slug}?preview=true`, "_blank", "noopener")
  }

  const statusLabel = {
    idle: "Sin cambios",
    loading: "Cargando…",
    saving: "Guardando…",
    saved: "Guardado",
    error: "Error",
  }[t.status]

  const statusColor =
    t.status === "saving" ? "#ECA200" : t.status === "error" ? "#C53030" : t.status === "saved" ? "#0E6940" : "var(--ink-3)"

  return (
    <div style={S.wrap}>
      <div style={S.toolbar}>
        {onClose && (
          <button type="button" onClick={onClose} style={S.back}>
            ← Volver
          </button>
        )}
        <div style={S.toolTitle}>
          Editor de <em style={S.toolTitleEm}>tu tienda</em>
        </div>
        <div style={S.toolRight}>
          <span style={{ ...S.statusPill, color: statusColor, borderColor: statusColor }}>
            <span style={{ ...S.statusDot, background: statusColor }} />
            {statusLabel}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleOpenPreview} style={S.btnGhost}>
            Abrir preview
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset} style={S.btnGhost}>
            Descartar
          </button>
          {t.theme?.rollbackTemplate && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleRollback} style={S.btnGhost}>
              Revertir
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmingPublish(true)}
            disabled={!hasUnpublishedChanges || t.status === "saving"}
            style={{
              ...S.btnPrimary,
              opacity: !hasUnpublishedChanges || t.status === "saving" ? 0.5 : 1,
              cursor: !hasUnpublishedChanges || t.status === "saving" ? "default" : "pointer",
            }}
          >
            Publicar
          </button>
        </div>
      </div>

      {t.error && (
        <div role="alert" style={S.errorBar}>
          {t.error}
        </div>
      )}

      <div style={S.body}>
        <SectionsPanel
          template={activeTemplate}
          sections={sections}
          selectedKey={selectedKey}
          onSelectSection={selectSection}
          onReorder={handleReorder}
          onToggleVisible={handleToggleVisible}
          onAddSection={handleAddSection}
          onGoToThemes={() => onGoToThemes?.()}
        />

        <main style={S.canvas}>
          {t.isLoading && !t.theme ? (
            <div style={S.canvasMuted}>Cargando editor…</div>
          ) : (
            <EditorCanvas template={activeTemplate} draft={t.theme?.draft ?? null} selectedKey={selectedKey} onSelectSection={selectSection} />
          )}
        </main>

        <aside style={S.inspector}>
          <div style={S.rightTabs}>
            <button
              type="button"
              onClick={() => setRightTab("design")}
              style={{ ...S.rightTab, ...(rightTab === "design" ? S.rightTabActive : null) }}
            >
              Diseño
            </button>
            <button
              type="button"
              onClick={() => setRightTab("section")}
              style={{ ...S.rightTab, ...(rightTab === "section" ? S.rightTabActive : null) }}
            >
              {selectedNode ? sectionLabel(selectedNode.type) : "Sección"}
            </button>
          </div>
          <div style={S.inspectorBody}>
            {rightTab === "design" ? (
              <TokensEditor tokens={draftTokens} palettes={t.palettes} onPatch={t.patchTokens} />
            ) : (
              <SectionInspector
                def={selectedDef}
                node={selectedNode}
                onPropsChange={(props) => selectedNode && handlePropsChange(selectedNode.key, props)}
                onVariantChange={(variant) => selectedNode && handleVariantChange(selectedNode.key, variant)}
                onToggleVisible={() => selectedNode && handleToggleVisible(selectedNode.key)}
                onDelete={() => selectedNode && handleDeleteSection(selectedNode.key)}
              />
            )}
          </div>
        </aside>
      </div>

      {confirmingPublish && (
        <div role="dialog" aria-modal="true" style={S.modalBackdrop} onClick={() => setConfirmingPublish(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Publicar cambios</h3>
            <p style={S.modalBody}>
              Tus visitantes verán el nuevo diseño inmediatamente. Si algo sale mal, puedes <strong>Revertir</strong>{" "}
              al diseño anterior desde esta misma barra.
            </p>
            <div style={S.modalActions}>
              <button type="button" onClick={() => setConfirmingPublish(false)} style={S.btnGhost}>
                Cancelar
              </button>
              <button type="button" onClick={handlePublish} style={S.btnPrimary}>
                Confirmar publicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    height: "calc(100vh - 60px)",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid var(--line)",
    background: "var(--bg-elev)",
    flexShrink: 0,
  },
  back: {
    border: "1px solid var(--line)",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  toolTitle: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" },
  toolTitleEm: {
    fontFamily: "var(--font-serif)",
    fontStyle: "italic",
    color: "var(--brand)",
    fontWeight: 400,
  },
  toolRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    background: "var(--bg)",
  },
  statusDot: { width: 6, height: 6, borderRadius: 999 },
  btnGhost: {
    padding: "7px 12px",
    border: "1px solid var(--line)",
    background: "transparent",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "7px 14px",
    border: "1px solid var(--brand)",
    background: "var(--brand)",
    borderRadius: 8,
    fontSize: 12,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
  },
  errorBar: {
    padding: "10px 16px",
    background: "#FEF2F0",
    color: "#991B1B",
    borderBottom: "1px solid #FECACA",
    fontSize: 13,
  },
  body: { flex: 1, display: "flex", minHeight: 0 },
  canvas: {
    flex: 1,
    background: "var(--bg-2)",
    padding: 20,
    overflowY: "auto",
  },
  canvasMuted: {
    margin: "auto",
    fontSize: 13,
    color: "var(--ink-3)",
  },
  inspector: {
    width: 320,
    flexShrink: 0,
    background: "var(--bg-elev)",
    borderLeft: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column",
  },
  rightTabs: { display: "flex", borderBottom: "1px solid var(--line)", flexShrink: 0 },
  rightTab: {
    flex: 1, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--ink-3)",
    cursor: "pointer", background: "none", fontFamily: "inherit",
    borderTop: "none", borderLeft: "none", borderRight: "none",
    borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: "transparent",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  rightTabActive: { color: "var(--brand)", borderBottomColor: "var(--brand)" },
  inspectorBody: { flex: 1, overflowY: "auto", padding: 16 },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "grid",
    placeItems: "center",
    zIndex: 100,
  },
  modal: {
    width: 420,
    background: "var(--bg-elev)",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 24px 60px -16px rgba(15,23,42,0.4)",
  },
  modalTitle: { margin: "0 0 8px", fontSize: 17, fontWeight: 700 },
  modalBody: { margin: "0 0 18px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 },
  modalActions: { display: "flex", gap: 8, justifyContent: "flex-end" },
}
