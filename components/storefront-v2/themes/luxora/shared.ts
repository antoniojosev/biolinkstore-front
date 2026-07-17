import { mix } from "../shared/catalog-shell/support"

/**
 * Constantes visuales del tema luxora (spec docs/legacy-theme-specs/luxora.md).
 *
 * Tema monocromo editorial: el legacy hardcodeaba toda la paleta; acá cada
 * hex mapea a un token o a un color-mix derivado (spec §9): ink #1A1A1A →
 * primary, #FAFAF8 → bg, #F0F0EC → surface, #666 → secondary, #999 → muted,
 * #EAEAE6 → border, y los grises intermedios (#BBB/#CCC/#E5E5E0/#EBEBEB/
 * #EFEFEB/#DDD) se derivan con color-mix. Literales DOCUMENTADOS:
 * - #FFFFFF del cart drawer ("blanco puro, no #FAFAF8" — spec §5).
 * - #22c55e success del CTA "Agregado" (spec §1).
 * - Overlays rgba negro/blanco sobre fotos (scrims del cover/badges, como
 *   en el legacy `from-black/60`, `bg-white/70` — no son paleta).
 * - Rojo wishlist #EF4444: NO portado (wishlist plan-gated fuera de alcance).
 */
export const L = {
  bg: "var(--bl-background)",
  ink: "var(--bl-primary)",
  /** hover #333 de los botones negros (spec §9). */
  inkHover: "color-mix(in srgb, var(--bl-primary) 85%, #fff)",
  /** #666 texto secundario. */
  text2: "var(--bl-secondary)",
  /** #999 muted. */
  muted: "var(--bl-text-muted)",
  /** #BBB labels/iconos apagados. */
  muted2: mix("var(--bl-text-muted)", 65, "var(--bl-background)"),
  /** #CCC trash del carrito / opciones agotadas. */
  muted3: mix("var(--bl-text-muted)", 50, "var(--bl-background)"),
  /** #F0F0EC inputs/pills/hovers. */
  surface: "var(--bl-surface)",
  /** #EFEFEB placeholder de imágenes. */
  imageBg: mix("var(--bl-surface)", 60, "var(--bl-background)"),
  /** #EAEAE6 sidebar/topbar. */
  border: "var(--bl-border)",
  /** #E5E5E0 cart/steppers/avatar. */
  borderStrong: mix("var(--bl-border)", 88, "var(--bl-text-muted)"),
  /** #EBEBEB divisores hairline. */
  hairline: mix("var(--bl-border)", 70, "var(--bl-background)"),
  /** Carrito blanco puro (literal documentado — spec §5). */
  cartBg: "#FFFFFF",
  /** #F5F5F0 chips e imágenes del carrito. */
  cartChip: mix("var(--bl-surface)", 55, "#fff"),
  /** #22c55e estado "Agregado" (literal documentado — spec §1). */
  success: "#22c55e",
  /** #DDD dots inactivos de la galería móvil. */
  dot: mix("var(--bl-text-muted)", 35, "var(--bl-background)"),
} as const

/** shadow-xl shadow-black/10 de los botones negros (spec §1). */
export const L_BTN_SHADOW = "0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)"
/** shadow-xl shadow-black/5 del CTA del detalle (spec §1). */
export const L_CTA_SHADOW = "0 20px 25px -5px rgba(0,0,0,.05), 0 8px 10px -6px rgba(0,0,0,.05)"

/**
 * Radios sobre el token (seed radius `lg` = 16px): rounded-xl 16 =
 * var(--bl-radius) · rounded-2xl = radius + 4 (spec §1: xl en inputs/iconos,
 * 2xl en imágenes/CTAs grandes, full en pills/steppers).
 */
export const LRX = {
  xl: "var(--bl-radius)",
  xl2: "calc(var(--bl-radius) + 4px)",
} as const

/**
 * CSS del tema: hovers monocromo, feedback táctil active:scale, quick-add
 * hover-reveal, overrides ≥1024 del grid. Container queries, nunca @media.
 */
export const LUXORA_CSS = `
.bl-luxora-root button { font-family: inherit; }
.bl-luxora-photo { transition: transform .5s ease; }
.bl-luxora-card:hover .bl-luxora-photo { transform: scale(1.05); }
.bl-luxora-share { opacity: 0; transition: all .2s ease; }
.bl-luxora-card:hover .bl-luxora-share { opacity: 1; }
.bl-luxora-quickadd {
  opacity: 0; transform: translateY(4px);
  transition: all .3s ease;
}
.bl-luxora-card:hover .bl-luxora-quickadd { opacity: 1; transform: translateY(0); }
.bl-luxora-quickadd[data-added="true"] { opacity: 1; transform: scale(1.1); }
.bl-luxora-catbtn { transition: all .2s ease; }
.bl-luxora-catbtn[data-active="false"]:hover {
  color: ${L.ink} !important;
  background: ${L.surface} !important;
}
.bl-luxora-pill { transition: all .2s ease; }
.bl-luxora-pill[data-active="false"]:hover { color: ${L.ink} !important; }
.bl-luxora-iconbtn { transition: background .2s ease, color .2s ease; }
.bl-luxora-iconbtn:hover { background: ${L.surface}; }
.bl-luxora-inkbtn { transition: background .2s ease, transform .1s ease; }
.bl-luxora-inkbtn:hover:not(:disabled) { background: ${L.inkHover} !important; }
.bl-luxora-inkbtn:active:not(:disabled) { transform: scale(.99); }
.bl-luxora-textlink { transition: color .2s ease; }
.bl-luxora-textlink:hover { color: ${L.ink} !important; }
.bl-luxora-input::placeholder { color: ${L.muted}; }
.bl-luxora-trash { transition: color .2s ease; }
.bl-luxora-trash:hover { color: ${L.muted} !important; }
.bl-luxora-stepbtn { transition: color .2s ease, background .2s ease; }
.bl-luxora-stepbtn:hover { color: ${L.ink} !important; background: ${L.surface}; }
.bl-luxora-roundstepbtn { transition: color .2s ease; }
.bl-luxora-roundstepbtn:hover { color: ${L.ink} !important; }
.bl-luxora-thumb { transition: all .2s ease; }
.bl-luxora-thumb[data-active="false"]:hover { opacity: .8 !important; }
.bl-luxora-textopt { transition: all .2s ease; }
.bl-luxora-textopt[data-state="available"]:hover {
  color: ${L.ink} !important;
  background: ${L.borderStrong} !important;
}
.bl-luxora-dot { transition: all .3s ease; }
.bl-luxora-dot[data-active="false"]:hover { background: ${L.muted2} !important; }
.bl-luxora-navarrow { transition: background .2s ease, transform .1s ease; }
.bl-luxora-navarrow:hover { background: #fff !important; }
.bl-luxora-navarrow:active { transform: translateY(-50%) scale(.95); }
.bl-luxora-scale90:active { transform: scale(.9); }
.bl-luxora-scale98:active:not(:disabled) { transform: scale(.98); }
@container bl-luxora-root (min-width: 1024px) {
  .bl-luxora-gridwrap { padding: 24px 32px !important; }
  .bl-luxora-grid { padding-bottom: 32px !important; }
  .bl-luxora-featured { padding-left: 32px !important; padding-right: 32px !important; }
}
`
