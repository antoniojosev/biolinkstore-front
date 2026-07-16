# Referencias legacy de los temas — inventario y plan

> Sesión 2026-07-16. Objetivo: reconstruir en staging los temas TAL CUAL fueron diseñados,
> incluyendo el carrito y el detalle de producto PROPIOS de cada tema (los actuales
> `cart-sheet.tsx` / `preview-product-sheet.tsx` son genéricos, NO los originales),
> y con los productos/fotos de las tiendas demo reales que cargó Antonio.

## Dónde vive cada referencia

### 1. HTML autocontenidos aprobados (fuente primaria de diseño, con comportamiento JS)

- `/home/antonio-dev/igstore/landing-videos/atelier/index.html`
- `/home/antonio-dev/igstore/landing-videos/inmuebles/index.html`
- `/home/antonio-dev/igstore/landing-videos/poster/index.html`
- `/home/antonio-dev/igstore/landing-videos/rosier/index.html`

Cuando el HTML y el React legacy difieren, manda el HTML (son las referencias que dio Antonio).

### 2. Componentes React legacy (Tailwind + shadcn) — por tema, CON cart/detail propios

En ramas git del frontend (`git show <rama>:components/templates/<tema>/<archivo>`):

| Tema | Rama | Archivos |
|---|---|---|
| vitrina, luxora, noir, menu, poster, rosier, inmuebles, estate, persona | `rebrand/bylink-domain-swap` (también `feat/multi-currency-rates`) | `index.tsx`, `product-card.tsx` (inmuebles: `property-card.tsx`), `product-detail.tsx`, `cart-drawer.tsx` (persona además `gallery-item.tsx`) |
| atelier | `rebrand/bylink-domain-swap` | solo `index.tsx` — detail/cart via `product-detail-renderer.tsx` compartido |
| servicios | `staging/bylink` | `index.tsx`, `product-card.tsx`, `product-detail.tsx`, `cart-drawer.tsx`, `gallery-item.tsx` |

Compartidos: `components/templates/shared/` (wishlist-drawer, cart-variant-badge, color-swatch, use-share),
`renderer.tsx` (dispatcher), `product-detail-renderer.tsx`, `template-data.ts` (⚠️ paletas DESACTUALIZADAS — el diseño real está en los componentes).

### 3. Tiendas demo reales (productos que van en cada tema)

Seeds en `igsotre-back/prisma/seeds/` (working tree actual):

| Seed | Tienda demo | Nicho / temas |
|---|---|---|
| `seed-ropa.ts` | Noire Boutique (`demo-noire-boutique`) — productos con variantes Talla/Color | vitrina, luxora, noir, rosier, atelier |
| `seed-restaurant.ts` | restaurante demo | menu, poster |
| `seed-inmuebles.ts` | inmobiliaria demo (propiedades con m²/hab/baños) | inmuebles, estate |
| `seed-servicios.ts` | servicios demo | servicios, persona |

Fotos: `public/demo-assets/{ropa,restaurant,inmuebles,servicios}` (93 archivos) — **restauradas
al working tree de `fase2/front-prod`** desde `feat/multi-currency-rates` en esta sesión.
Los seeds referencian rutas locales `/demo-assets/...` (logo, banner, fotos por producto).

### 4. Otras referencias visuales

- `/home/antonio-dev/igstore/references/templates/` — imágenes/mockups de inspiración.
- `components/dashboard/design-editor/demo-products.ts` (ramas legacy).

## Plan de trabajo (tareas #22–#24)

1. **Specs por tema** (`docs/legacy-theme-specs/<tema>.md`): identidad visual exacta, estructura,
   product card, product detail propio, cart drawer propio, interacciones, demo data real,
   diff vs staging, plan de port. Pendiente: los agentes de análisis se cortaron por límite de uso.
2. **Demo data real**: reescribir los datasets del `page-builder.seed.ts` (demoFashion/Restaurant/
   Services/RealEstate/Portfolio/General) con los productos/fotos/variantes de los seeds verticales
   (adiós Unsplash inventado).
3. **Port nivel 2 por tema**: renderer custom en `components/storefront-v2/themes/<key>/` con su
   `cart-drawer` y `product-detail` PROPIOS (patrón PersonaRenderer), tokens `--bl-*`, container
   queries, contrato `TemplateRendererProps`.
