"use client"

import { ThemeEditor } from "./design/theme-editor"

interface Props {
  /** Navigates to the Temas gallery tab — the template switcher lives there, not here. */
  onGoToThemes?: () => void
}

// La vista Diseño ES el editor. Antes había un hub intermedio con dos tarjetas
// ("Editor de páginas" y "Galería de temas") que abrían exactamente lo mismo —
// un click extra que no decidía nada. La galería de verdad ahora es su propia
// tab de primer nivel ("Temas", ver themes-board.tsx), y el editor mismo ya no
// tiene su propio selector de templates (ver ThemeEditor) — solo muestra cuál
// está activo, con un link para ir a cambiarlo. La promo "Te lo hacemos a
// medida" vive en la galería de Temas (banner + pill flotante).
export function DesignBoard({ onGoToThemes }: Props) {
  return <ThemeEditor onGoToThemes={onGoToThemes} />
}
