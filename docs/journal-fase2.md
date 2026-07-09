# Journal — Fase 2 front-prod

Fuente: `docs/plan-fase2-front-prod.md`. Rama `fase2/front-prod` desde `staging/bylink`.

---

## B0 — Base de diseño, tokens y assets (2026-07-09)

- **`public/placeholder.svg`** creado (no existía → imágenes rotas en ~15 lugares: cards de producto, cart-drawers, wishlist, store-header en todos los templates legacy). SVG neutro con la paleta `--bg-2`/`--line`/`--ink-3`.
- **Primitivos `components/bylink/`**: verificado que `.btn` (usado por `Button`) ya cubre `:hover`, `:focus-visible` y `:disabled` en `globals.css:328-360`. No requirió cambios.
- **Contraste AA — 2 casos corregidos:**
  - `components/landing-v2/landing-page.tsx`: número "02" del paso 2 (how-it-works) y checkmarks del plan Pro (pricing) usaban `var(--accent)` (coral #DC4A3D) como texto sobre fondo navy → ~2.51:1, falla AA. Cambiados a `#fff` (ya usado como color base heredado en esas tarjetas, consistente con el resto del texto blanco).
  - `components/dashboard-v2/orders-board.tsx`: id de pedido, resumen de items y teléfono del cliente usaban `var(--ink-3)` (#94A3B8) en 10-12px sobre blanco → ~2.9:1. Cambiados a `var(--ink-2)` (#475569), sigue siendo tono secundario pero pasa AA.
- **Diferido a B7:** contraste del placeholder de búsqueda en el template Noir (legacy, ~1.5:1) — ese template se retira en B7/B8, no vale tocarlo dos veces.
- Tokens navy-coral confirmados vigentes en `app/globals.css` (`--brand`, `--accent`, `--ink-*`, `--bg-*`), sin restos de paleta turquesa/dorada en el sistema base (los restos de marca vieja viven en componentes legacy — se tratan en B2).

**Verificación:** `npx tsc --noEmit` limpio.
