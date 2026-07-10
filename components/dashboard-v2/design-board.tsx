"use client"

import { ThemeEditor } from "./design/theme-editor"

// La vista Diseño ES el editor. Antes había un hub intermedio con dos tarjetas
// ("Editor de páginas" y "Galería de temas") que abrían exactamente lo mismo —
// un click extra que no decidía nada. La galería de verdad ahora es su propia
// tab de primer nivel ("Temas", ver themes-board.tsx). La promo "Te lo hacemos
// a medida" vive en ambos lugares: compacta en el sidebar de templates de este
// editor, y como tarjeta protagonista al final de la galería de Temas.
export function DesignBoard() {
  return <ThemeEditor />
}
