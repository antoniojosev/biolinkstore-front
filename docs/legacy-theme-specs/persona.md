# Spec legacy — Tema **persona**

> Fuente de verdad: rama `rebrand/bylink-domain-swap` → `components/templates/persona/`
> (`index.tsx`, `product-card.tsx`, `product-detail.tsx`, `cart-drawer.tsx`, `gallery-item.tsx`).
> Verificado byte-idéntico al de `feat/multi-currency-rates`. Extraído a scratchpad
> `legacy/rebrand_bylink-domain-swap/persona/`.

## 0. Relación con servicios (leer `servicios.md` primero)

`diff` entre persona (rebrand) y servicios (staging/bylink), módulo renombres de componentes,
da **solo 3 strings**:

1. Label de la primera tab: **"Persona"** (servicios: "Servicios"). El valor interno del estado
   sigue siendo `'servicios'`.
2. Label del segundo stat: **"Persona"** (servicios: "Servicios") — casi seguro artefacto de
   find/replace del rename; para el port se recomienda "Servicios" como fallback legible, pero
   el literal legacy es "Persona".
3. Título del cart drawer: **"Persona"** (servicios: "Servicios").

Todo lo demás — identidad visual, hero cover+avatar, stats, tabs, filtro, card, grid IG,
FAB, product detail propio y cart drawer propio — es **idéntico clase por clase** a
`servicios.md` §§1–6. Este doc repite lo esencial y profundiza en el **diff contra el renderer
custom que ya existe en staging** (§8), que es lo accionable de persona.

---

## 1. Identidad visual

Idéntica a servicios (`servicios.md` §1): blanco `#FFFFFF`, accent `store.primaryColor || '#2D2D2D'`,
verde WhatsApp `#25D366` hardcoded, grises Tailwind (`gray-900 #111827`, `gray-500 #6B7280`,
`gray-400 #9CA3AF`, `gray-100 #F3F4F6`, `gray-50 #F9FAFB`, `gray-200 #E5E7EB`), tags
`${accent}10`, radios `rounded-2xl/xl/lg/full`, sombras `shadow-sm→md` y `shadow-lg`, fuente
del app shell (sin fuente propia). Precio: `Intl.NumberFormat('es-VE', { style: 'currency', ... })`
sin decimales.

Tokens actuales del seed persona (ya alineados al legacy): palette `monocromo`
`primary/accent #2d2d2d`, `bg #ffffff`, `surface #f7f7f7`, `text #1a1a1a`, `muted #6b7280`,
`border #e5e7eb`, Manrope/Inter, `radius lg` (16px = rounded-2xl ✓).

## 2. Estructura de página

Igual a `servicios.md` §2, con los labels de §0:

1. Cover `h-36 sm:h-44 bg-gray-100` (fallback accent al 10%) + perfil `max-w-lg mx-auto px-4 -mt-14 pb-4`
   centrado: avatar `w-28 h-28 rounded-full border-4 border-white shadow-lg` **superpuesto -56px**,
   nombre `text-xl font-bold mt-3`, bio `text-sm text-gray-500 mt-1.5 max-w-xs`,
   botones `WhatsApp` (accent, `rounded-full h-9 px-5`, icono `MessageCircle h-4 w-4`) y
   `Seguir` (outline, icono `Instagram h-4 w-4`).
2. Stats `flex gap-6 mt-4`: `{galleryImages.length} TRABAJOS` · divisor `w-px h-8 bg-gray-200` ·
   `{products.length} PERSONA` (ver §0.2). Valor `text-lg font-bold`, label
   `text-[11px] text-gray-400 uppercase tracking-wide`. ⚠️ El primer stat usa las imágenes de
   los productos **filtrados** → reacciona al filtro de categoría.
3. Tabs sticky **"Persona" / "Portfolio"**: `sticky top-0 z-10 bg-white border-b border-gray-200`,
   tab `flex-1 py-3 text-sm font-medium` (activa `text-gray-900`, inactiva
   `text-gray-400 hover:text-gray-600`), indicador `absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full`
   color accent.
4. Filtro chips (solo si `categories.length > 1`, con opción "Todos"): `ScrollArea` horizontal,
   chip `shrink-0 px-4 py-1.5 rounded-full text-xs font-medium`; activo accent + `text-white shadow-sm`,
   inactivo `bg-gray-100 text-gray-500 hover:text-gray-900`.
5. Main `max-w-lg mx-auto pb-24`: tab 1 = lista `px-4 pt-4 space-y-3` de cards; tab Portfolio =
   **`grid grid-cols-3 gap-0.5`** (gap mínimo 2px, full-bleed dentro de max-w-lg) con TODAS las
   fotos de los productos filtrados (flatMap `p.images`). Vacío tab 1:
   "No hay servicios en esta categoría" (`py-12 text-gray-400 text-sm`).
6. FAB WhatsApp `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] shadow-lg
   hover:scale-105 z-20` con `MessageCircle h-6 w-6`.

Sin navbar, sin footer, sin indicador de carrito.

## 3. Product card

Idéntica a `servicios.md` §3: card horizontal `flex gap-4 bg-white rounded-2xl p-4 border
border-gray-100 shadow-sm hover:shadow-md group`, thumb `w-20 h-20 rounded-xl` con
`group-hover:scale-105`, nombre `text-sm font-semibold line-clamp-1`, descripción `text-xs
text-gray-500 line-clamp-2 mt-0.5`, precio `text-base font-bold` color accent, y botón
**"Agendar"** `bg #25D366 rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90
active:scale-95` con `MessageCircle h-3 w-3` que hace **checkout directo de WhatsApp**
(preventDefault, `trackEvent CHECKOUT_START`, `paymentProvider.checkout` con 1 item qty 1).
La card completa es `Link` a `/{store.slug}/{product.slug}` (preserva `?preview`).

## 4. Product detail PROPIO

Idéntico a `servicios.md` §4: sticky nav "Volver" (`bg-white/95 backdrop-blur-md`), imagen
`aspect-[4/3]`, thumbs `w-14 h-14 rounded-lg border-2` (activa borde accent, inactiva
`opacity-60`), categoría uppercase accent, `h1 text-2xl font-bold` + precio `text-2xl` accent,
specs `role='spec'` en filas justify-between, tags `role='tag'` pills `${accent}10`,
**descripción colapsable** (`line-clamp-4` + toggle "Descripción" con chevrons), **card del
profesional** (`bg-gray-50 rounded-2xl p-4`, avatar `w-11 h-11`, nombre + bio), y CTA sticky
`fixed bottom-0 bg-white/90 backdrop-blur-lg border-t p-4` con botón verde `#25D366 rounded-xl`
**"Agendar por WhatsApp"** → "Abriendo WhatsApp..." (checkout directo). Contenido `pb-36`.
Sin variantes, sin qty, sin stock, sin share. Renderiza `<PersonaCartDrawer />`.

## 5. Cart drawer PROPIO

Idéntico a `servicios.md` §5 pero título **"Persona"**: `Sheet` `w-full sm:max-w-md p-0`,
header `px-6 py-4 border-b border-gray-200` con `MessageCircle h-5 w-5`, cuerpo centrado:
"Usa el botón de WhatsApp en cada servicio para agendar directamente." Sin items ni checkout —
el tema no tiene carrito.

## 6. Interacciones

Tabs con estado local · filtro "Todos" por defecto (afecta lista, portfolio y stat 1) ·
gallery item `aspect-square` con hover `scale-105` + overlay `bg-black/20`, **sin lightbox**
(cada celda linkea a la página del producto) · Agendar = WhatsApp directo · sin share,
sin wishlist, sin toggle de moneda.

---

## 7. Demo data real

Igual que servicios: la tienda demo real de este nicho es **Daniel Mendoza**
(`seed-servicios.ts`) — ver tabla completa en `servicios.md` §7 (11 servicios, 4 categorías,
fotos `/demo-assets/servicios/*.jpg`, WhatsApp `+584149876543`, IG `danielmendozafoto`,
accent `#2D2D2D`).

Estado actual: `personaTemplate.demoDataJson = demoPortfolio()` en `page-builder.seed.ts` →
"Valentina Ríos Demo" (6 servicios de fotógrafa/directora de arte, **fotos Unsplash
inventadas**). Reemplazar por los datos reales del seed-servicios (mismo dataset que
serviciosTemplate, cambia solo el template key). La sección `gallery_main` del seed también
trae 6 items Unsplash como defaults — sustituirlos por fotos `/demo-assets/servicios/` o
vaciarlos para que el portfolio salga de las fotos de los productos (comportamiento legacy).

---

## 8. Diff vs staging actual — `components/storefront-v2/themes/persona/index.tsx`

Persona YA tiene renderer custom registrado en `registry.tsx`. El grueso del layout está
portado; esto es lo que **falta o difiere**, ítem por ítem:

### 8.1 Faltantes mayores (funcionales)

| # | Legacy | Renderer actual |
|---|---|---|
| 1 | **Product detail PROPIO** (§4) | No existe: la tienda real usa `ProductPageClient` genérico (variantes, qty, "Agregar al carrito", strip "Más de...") y las previews `preview-product-sheet.tsx` genérico. Nada del diseño legacy: ni 4:3 + thumbs, ni descripción colapsable, ni card del profesional, ni CTA verde "Agendar por WhatsApp" |
| 2 | **Cart drawer PROPIO** (§5, informacional) | `storefront-client.tsx` monta `cart-sheet.tsx` genérico (items, qty, formulario nombre/teléfono/notas, "Pedir por WhatsApp") — flujo de carrito que el tema legacy NO tiene |
| 3 | Botón **"Agendar" con checkout directo** de WhatsApp en cada card (trackEvent `CHECKOUT_START` + `paymentProvider.checkout` 1×) | El botón es un `<span style={S.bookBtn}>💬 Agendar</span>` **decorativo**: clickearlo solo navega a la página del producto. No hay checkout directo en ninguna parte del renderer |
| 4 | Filtro de categorías visible siempre que `categories.length > 1` | Gated por `bool(gridSection, "filterByCategory")` cuyo **default es `false`** y el seed no lo setea → el filtro NUNCA aparece hoy. Fix: default `true` (helper `bool(..., true)`) o default en el seed |
| 5 | Sin indicador de carrito (no hay carrito) | Agrega pill flotante `🛒 {cartCount}` top-right cuando `cartCount > 0`. Con el flujo fiel (sin carrito) sobra; si se mantiene CartSheet como fallback, decidir explícitamente |
| 6 | Primera tab: **"Persona"** · stat 2: **"Persona"** | Fallbacks `"Servicios"` (tab toma `props.title` del grid, que el seed no define; stats fallback `Trabajos/Servicios`). Decidir: fidelidad literal ("Persona") vs corrección del artefacto — y fijarlo vía `props.title` en el seed |
| 7 | Iconos lucide: `MessageCircle` (CTA hero, Agendar, FAB), `Instagram` (Seguir) | Emojis `💬` y botón "Seguir" sin icono |

### 8.2 Diferencias visuales menores (pixel-perfect)

| # | Legacy | Actual |
|---|---|---|
| 8 | Cover responsive `h-36 sm:h-44` (144 → 176px) | Fijo `height: 170`. Portar con container query (`@container bl-persona (min-width: 640px)`) |
| 9 | Card servicio: `bg-white` + `border-gray-100` + `shadow-sm hover:shadow-md`; imagen `group-hover:scale-105` | `background: var(--bl-surface)` (gris), **sin sombra ni hover** de sombra/zoom en la card (solo la celda de portfolio tiene hover zoom) |
| 10 | Portfolio dentro de `max-w-lg` (512px) — mismo ancho que el resto | `portfolioGrid.maxWidth: 720` (más ancho que la lista, 520) |
| 11 | Celda portfolio: hover `scale-105` **+ overlay `bg-black/20`** | Solo scale, sin overlay oscuro |
| 12 | Tab `py-3` (12px), `font-medium` (500), indicador `h-0.5` (2px), hover inactiva `text-gray-600` | `13px 0`, weight 600, indicador 2.5px, sin estado hover |
| 13 | Chip activo con `shadow-sm`; contenedor `ScrollArea` con scrollbar estilizada | Sin shadow; `overflowX: auto` pelado |
| 14 | Precio card `text-base` (16px) | 15px |
| 15 | Botones hero: shadcn `h-9 px-5 text-sm` (36px alto, 14px) | `padding: 9px 20px`, 13.5px |
| 16 | FAB: `shadow-lg` neutro + `hover:scale-105` | Sombra verde custom `rgba(37,211,102,.5)`, sin hover scale |
| 17 | `main` `pb-24` (96px) | 100px |
| 18 | Precio `Intl es-VE currency` sin decimales (`US$30`) | Manual `"$" + toLocaleString("es")` (`$30`) — unificar criterio (el manual es el del framework; anotar decisión) |
| 19 | Avatar fallback `/placeholder.svg` | Tile con inicial del nombre (mejora aceptada, documentada) |

### 8.3 Añadidos del framework (correctos, mantener)

- Tokens `--bl-*` en vez de `store.primaryColor` y grises fijos; fuentes por tokens + `googleFontsHref`.
- Respeto del árbol de secciones (orden/visibilidad/props), `editorWrap` con outline+tag,
  sincronía tab↔sección seleccionada en el editor, `kicker` y overrides de headline/bio del hero.
- `galleryImages` = items propios de la sección gallery **+** fotos de productos (superset del legacy).
- Stats configurables por items de sección con fallback derivado (el legacy solo derivado).
- Secciones commodity delegadas a `SectionRenderer` (about/socials/footer del seed).
- `productHref`/`onOpenProduct` según contexto; empty state del portfolio; container query base.
- Instagram desde `store.socials` (BE-124) en vez de `store.instagramUrl`.

---

## 9. Plan de port

1. **Unificar con servicios**: extraer la base compartida (`themes/shared/profile-tabs.tsx`)
   parametrizada por labels (tab 1, stat 2, título del drawer) — persona y servicios son el
   mismo diseño (§0). El `PersonaRenderer` actual es el punto de partida; aplicarle §8.1/8.2.
2. **Tokens**: seguir usando `--bl-primary/-background/-surface/-text/-text-muted/-border/-radius`
   y fuentes `--bl-heading-font`/`--bl-body-font`; `#25D366` literal. Card de servicio en
   `--bl-background` con borde `--bl-border` + sombras (no `--bl-surface`), overlay de portfolio
   `rgba(0,0,0,0.2)`.
3. **Container queries** (nunca `@media`): añadir el step del cover 144→176px y mover los
   hovers/sombras a la hoja `PERSONA_STYLES` existente.
4. **Contrato `TemplateRendererProps`**: sin cambios — ya se cumple. Mantener
   `productHref` (tienda real) / `onOpenProduct` (previews) en cards y celdas; `rate` aceptada
   e ignorada (precios en moneda de la tienda).
5. **Checkout directo**: reintroducir "Agendar" real en la card (necesita `paymentProvider` —
   inyectarlo desde `storefront-client`/context o instanciar `WhatsAppPaymentProvider` con
   `store.whatsappNumber`) + `trackEvent CHECKOUT_START`.
6. **Detail propio**: extender `registry.tsx` con slot de detail por tema
   (`THEME_PRODUCT_DETAILS`) consumido por `product-page-client.tsx`; portar §4 con tokens y
   container queries. Preview sheet genérico puede quedarse (baja prioridad).
7. **Cart propio**: `themes/persona/cart-drawer.tsx` informacional (§5); `storefront-client`
   debe poder montar el drawer del tema en vez del `CartSheet` genérico (mismo mecanismo de
   registry). Quitar (o condicionar) el pill `🛒`.
8. **Seed** (dejar listo, NO ejecutar): `filterByCategory: true` por defecto en el grid,
   `title: 'Persona'` si se decide fidelidad literal, gallery `items` con
   `/demo-assets/servicios/` o vacíos, `demoDataJson` → Daniel Mendoza (`servicios.md` §7).
