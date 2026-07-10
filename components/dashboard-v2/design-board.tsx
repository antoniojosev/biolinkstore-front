"use client"

import { ThemeEditor } from "./design/theme-editor"

// La vista Diseño ES el editor. Antes había un hub intermedio con dos tarjetas
// ("Editor de páginas" y "Galería de temas") que abrían exactamente lo mismo —
// un click extra que no decidía nada. La promo "Te lo hacemos a medida" que
// vivía ahí se movió al sidebar de templates dentro del editor, donde el
// usuario está comparando estilos.
export function DesignBoard() {
  return <ThemeEditor />
}
