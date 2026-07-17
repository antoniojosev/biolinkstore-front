import { mix } from "../shared/catalog-shell/support"

/**
 * Constantes visuales del tema vitrina (spec docs/legacy-theme-specs/vitrina.md).
 *
 * Regla de tokens: TODO llega por --bl-* (seed: primary #0F6BA8, secondary
 * #E7F2FA, accent #FF6B4A, bg #FAFAF7, surface #FFFFFF, border #E8E8E4).
 * Los únicos literales son los DOCUMENTADOS en la spec §1:
 * - primary-foreground #fff (texto sobre primary).
 * - destructive #DC3E2B (hover del trash del carrito).
 * - gradiente `gradient-background` (fallback del cover móvil) — la spec pide
 *   portar la regla literal de globals.
 * - Rojo wishlist #EF4444: NO portado (wishlist plan-gated fuera de alcance).
 */
export const V = {
  bg: "var(--bl-background)",
  card: "var(--bl-surface)",
  primary: "var(--bl-primary)",
  primaryFg: "#fff", // primary-foreground (spec §1)
  secondary: "var(--bl-secondary)",
  text: "var(--bl-text)",
  mutedFg: "var(--bl-text-muted)",
  border: "var(--bl-border)",
  // muted #F5F5F2 — apenas más oscuro que el bg: borde mezclado sobre fondo
  muted: mix("var(--bl-border)", 28, "var(--bl-background)"),
  destructive: "#DC3E2B", // literal documentado (spec §1)
  // Glow del avatar: from-primary via-secondary to-accent (spec §1)
  glow: "linear-gradient(135deg, var(--bl-primary), var(--bl-secondary), var(--bl-accent))",
} as const

/** Sombra shadow-lg shadow-primary/20 de los CTAs (spec §1). */
export const V_CTA_SHADOW = `0 10px 15px -3px ${mix(V.primary, 20)}, 0 4px 6px -4px ${mix(V.primary, 20)}`

/**
 * Radios del legacy sobre el token (seed radius `lg` = 16px):
 * rounded-md 10 · rounded-lg 12 · rounded-xl/2xl 16 (spec §1).
 */
export const VRX = {
  md: "calc(var(--bl-radius) - 6px)",
  lg: "calc(var(--bl-radius) - 4px)",
  xl: "var(--bl-radius)",
  xl2: "var(--bl-radius)",
} as const

/**
 * CSS del tema: hovers, gradiente animado del cover (regla literal portada de
 * globals — spec §1), overrides ≥1024 del grid. Container queries, nunca @media.
 */
export const VITRINA_CSS = `
.bl-vitrina-root button { font-family: inherit; }
.bl-vitrina-gradientbg {
  background: linear-gradient(131deg, #33b380, #327be2, #6ee490, #595f73);
  background-size: 240% 240%;
  animation: bl-vitrina-gradient 40s ease infinite;
}
@keyframes bl-vitrina-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.bl-vitrina-card { transition: border-color .3s ease, box-shadow .3s ease; }
.bl-vitrina-card:hover {
  border-color: ${mix(V.primary, 40)} !important;
  box-shadow: 0 10px 15px -3px ${mix(V.primary, 5)}, 0 4px 6px -4px ${mix(V.primary, 5)};
}
.bl-vitrina-photo { transition: transform .5s ease; }
.bl-vitrina-card:hover .bl-vitrina-photo { transform: scale(1.07); }
.bl-vitrina-share { opacity: 0; transition: all .2s ease; }
.bl-vitrina-card:hover .bl-vitrina-share { opacity: 1; }
.bl-vitrina-catbtn { transition: all .2s ease; }
.bl-vitrina-catbtn[data-active="false"]:hover {
  color: var(--bl-text) !important;
  background: ${V.muted} !important;
}
.bl-vitrina-pill { transition: all .2s ease; }
.bl-vitrina-pill[data-active="false"]:hover { color: var(--bl-text) !important; }
.bl-vitrina-iconbtn { transition: background .2s ease, color .2s ease; }
.bl-vitrina-iconbtn:hover { background: ${V.muted}; }
.bl-vitrina-primarybtn { transition: background .2s ease; }
.bl-vitrina-primarybtn:hover:not(:disabled) { background: ${mix(V.primary, 90, V.bg)} !important; }
.bl-vitrina-outlinebtn { transition: background .2s ease; }
.bl-vitrina-outlinebtn:hover { background: ${V.muted}; }
.bl-vitrina-clear { transition: color .2s ease; }
.bl-vitrina-clear:hover { color: var(--bl-text) !important; }
.bl-vitrina-input::placeholder { color: var(--bl-text-muted); }
.bl-vitrina-trash { transition: color .2s ease; }
.bl-vitrina-trash:hover { color: ${V.destructive} !important; }
.bl-vitrina-thumb { transition: all .2s ease; }
.bl-vitrina-thumb[data-active="false"]:hover { opacity: 1 !important; }
.bl-vitrina-textopt { transition: all .2s ease; }
.bl-vitrina-textopt[data-state="available"]:hover {
  border-color: ${mix(V.primary, 40)} !important;
  color: var(--bl-text) !important;
}
.bl-vitrina-desc-toggle { transition: color .2s ease; }
.bl-vitrina-desc-toggle:hover { color: var(--bl-text) !important; }
@container bl-vitrina-root (min-width: 1024px) {
  .bl-vitrina-gridwrap { padding: 24px 32px !important; }
  .bl-vitrina-grid { gap: 20px !important; padding-bottom: 32px !important; }
}
`
