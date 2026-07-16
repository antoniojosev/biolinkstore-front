# Spec legacy — Tema `estate` (nicho inmobiliario, PRO)

> Fuentes: React legacy `rebrand/bylink-domain-swap:components/templates/estate/`
> (`index.tsx`, `product-card.tsx`, `product-detail.tsx`, `cart-drawer.tsx`) +
> seed real `igsotre-back/prisma/seeds/seed-inmuebles.ts`.
>
> ⚠️ **No existe HTML aprobado para estate** (`landing-videos/` solo tiene el de
> `inmuebles`, que es otro diseño). Para este tema la fuente de verdad es el React
> legacy. Es el tema inmobiliario "app-like móvil" (max-w-3xl, cards con badges),
> hermano funcional de `inmuebles` pero con estética navy corporativo + dorado.

---

## 1. Identidad visual

### Colores (hex exactos)

| Rol | Valor | Uso |
|---|---|---|
| Navy corporativo | `#1A3A52` | Header del asesor, pills de categoría activas, precios, títulos de specs, barra flotante, contador del drawer, focus ring (`/20`) |
| Dorado | `#D4AF37` | Borde del avatar (`/40`, `/30`), badge "Destacada", botón guardar activo, contador de la barra flotante, precio en drawer, borde de thumb activa, flecha `→` |
| Fondo app | `#F8F9FA` | Fondo de página y del Sheet del drawer |
| Blanco | `#ffffff` | Cards, sticky search bar, sticky navs, footers de drawer |
| Grises Tailwind | `gray-100/200` bordes y chips · `gray-400/500` muted · `gray-600` texto secundario · `gray-900` texto fuerte | Toda la escala neutra es Tailwind estándar |
| Verde disponible | `emerald-500` (`#10b981`) | Badge "DISPONIBLE" |
| Rojo no disponible | `red-500` (`#ef4444`) | Badge "NO DISPONIBLE" |
| Verde WhatsApp | `#25D366`, hover `#20BD5A` | CTA "Consultar por WhatsApp" (detalle y drawer) |
| Overlay foto-count | `black/60` + `backdrop-blur-sm` | Badge "1/N fotos" |

### Tipografía

- El legacy no fija familia (hereda). Tokens staging: `Manrope` heading / `Inter` body —
  válidos como decisión de port.
- Escala compacta app-like: títulos de card `text-sm font-semibold`, precio card
  `text-xl font-bold`, precio detalle `text-3xl font-bold`, H1 detalle `text-xl font-bold`.
- Badges: `text-[10px] font-bold uppercase tracking-wide`.
- Precios: `Intl.NumberFormat('es-VE', { style:'currency', currency, minimumFractionDigits:0, maximumFractionDigits:0 })`
  (⚠️ distinto de `inmuebles`, que usa `en-US`).

---

## 2. Estructura de página (home)

Layout de una sola columna centrada `max-w-3xl` sobre fondo `#F8F9FA`:

1. **Header navy del asesor** — `bg-[#1A3A52] text-white px-4 py-4 sm:px-6`:

```tsx
<img src={avatar} className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/40 shadow-md" />
<h1 className="text-lg font-bold truncate">{store.name}</h1>
<p className="text-sm text-white/70 line-clamp-1 mt-0.5">{store.bio}</p>
```

   Meta-fila `text-xs text-white/50`: `<Building2/> {N} propiedades` ·
   `<MapPin/> Asesor inmobiliario`. A la derecha, botón teléfono circular
   `w-10 h-10 rounded-full bg-white/10 hover:bg-white/20` con `Phone` → `wa.me`.
2. **Sticky search + filtros** — `sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm`:
   - Input shadcn con lupa absoluta:
     `pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-gray-50
     focus-visible:ring-[#1A3A52]/20`, placeholder `Buscar por ubicación, tipo...`,
     botón `X` para limpiar si hay texto.
   - Pills de categoría en `ScrollArea` horizontal (`Todos` + categorías):
     activa `bg-[#1A3A52] text-white shadow-sm`; inactiva
     `text-gray-600 bg-gray-100 border border-gray-200` — `px-4 py-2 rounded-full text-sm`.
3. **Contador de resultados**: `{N} propiedad(es)` (N en `font-semibold text-gray-900`)
   `+ en {categoría}` si hay filtro.
4. **Grid de propiedades** — `grid-cols-1 sm:grid-cols-2 gap-4`, `pb-28` para no chocar
   con la barra flotante. Empty state: círculo blanco con lupa, `Sin resultados` /
   `Probá con otra búsqueda o categoría`.
5. **Barra flotante de guardadas** (si `totalItems > 0`) — `fixed bottom-0 p-4
   bg-white/90 backdrop-blur-lg border-t z-20`, botón `max-w-3xl h-13 rounded-2xl
   bg-[#1A3A52] text-base font-semibold hover:opacity-90 active:scale-[0.98]`:
   `[Building2][badge bg-[#D4AF37] text-[#1A3A52]] Ver propiedades guardadas [→ dorado]`.

Sin hero, sin footer, sin sección about en el legacy — es un catálogo directo estilo app.
El filtro es por **categoría** (no por operación como `inmuebles`); búsqueda por
`name | description`.

---

## 3. Property card (specs embebidas)

Card contenida `rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg
transition-all duration-300`, envuelta en `<Link>` al detalle si hay slug.

**Imagen** `aspect-[3/2]` con skeleton: `opacity-0` hasta `onLoad`, debajo
`bg-gray-200 animate-pulse`; hover `group-hover:scale-105` (500ms). Overlays:

```tsx
{/* contador de fotos */}
<div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur-sm">1/{imageCount} fotos</div>
{/* estado */}
<div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Disponible</div>
{/* destacada (debajo del estado, mt-7) */}
<div className="absolute top-2 left-2 mt-7 bg-[#D4AF37] text-[#1A3A52] ...">Destacada</div>
{/* guardar */}
<button className={isSaved ? 'bg-[#D4AF37] text-white shadow-md' : 'bg-white/80 text-gray-600 backdrop-blur-sm hover:bg-white hover:text-[#1A3A52]'}>
  {isSaved ? <Check strokeWidth={2.5}/> : <Bookmark/>}  {/* w-8 h-8 rounded-full top-2 right-2 */}
```

El botón guardar hace `preventDefault/stopPropagation` (no navega) y agrega/quita del
carrito de guardadas.

**Body** (`p-4 gap-2`), orden exacto:
1. **Precio**: `text-xl font-bold text-[#1A3A52]` + `comparePrice` tachado
   `text-sm text-gray-400 line-through` si es mayor.
2. **Fila de specs** — la firma del tema:

```tsx
<div className="flex items-center gap-3 text-sm text-gray-500">
  <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-[#1A3A52]/60"/>{hab}</span>
  <span ...><Bath .../>{bath}</span>
  <span ...><Ruler .../>{m2}m²</span>
</div>
```

   Fuente: `product.specs['Habitaciones']`, `['Baños']`, `['m²']` (attributes
   `role='spec'`). Icono de superficie: **Ruler** (no Square como `inmuebles`).
3. Título `text-sm font-semibold text-gray-900 line-clamp-2`.
4. Tags (máx 3): chips `text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded`.
5. Categoría/ubicación: `<MapPin h-3 w-3/> {category}` en `text-xs text-gray-400`.

---

## 4. Product detail PROPIO

Página completa `bg-[#F8F9FA]`, columna `max-w-3xl`:

1. **Sticky nav** — `sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b`:
   izquierda `<ArrowLeft/> Propiedades` (link a `backHref`, hover navy); derecha botón
   guardar (`w-9 h-9 rounded-xl`; guardado: `bg-[#D4AF37]/10 text-[#D4AF37]` + Check) y,
   si `totalItems > 0`, botón `Building2` con badge dorado
   `absolute -top-1 -right-1 bg-[#D4AF37] text-[#1A3A52] text-[9px] w-4 h-4 rounded-full`.
2. **Galería hero** — imagen `aspect-[3/2]` (foto `images[selectedImage]`):
   - `!inStock`: overlay `bg-white/75` con `NO DISPONIBLE` centrado.
   - `inStock`: badge `DISPONIBLE` emerald `top-3 left-3 rounded-lg`.
   - Contador `{selectedImage+1}/{N} fotos` bottom-left `bg-black/60 rounded-lg`.
   - **Thumb strip**: fila scrollable `px-4 py-3`, thumbs `w-16 h-12 rounded-lg border-2` —
     activa `border-[#D4AF37]`, inactiva `border-transparent opacity-60 hover:opacity-100`.
3. **Info** (`px-4 py-5 pb-40 space-y-5`):
   - Precio `text-3xl font-bold text-[#1A3A52]` + comparePrice tachado.
   - H1 `text-xl font-bold text-gray-900` + `<MapPin/> {category}`.
   - **Specs grid** `grid-cols-3 gap-3`, una card por spec
     (`bg-white rounded-xl p-3 border border-gray-100`, columna centrada):
     icono `h-5 w-5 text-[#1A3A52]/60` + valor `text-lg font-bold text-[#1A3A52]` +
     label `text-[10px] text-gray-500 uppercase tracking-wide`.
     `Bed→Habitaciones`, `Bath→Baños`, `Ruler→m²`, `Calendar→Año`.
     ⚠️ Lee también `specMap['Estacionamiento']` pero **no lo renderiza** (bug/omisión
     legacy) — al portar, decidir: añadir celda `Car→Estacionamiento` o mantener fiel.
   - **Tags** (attributes `role='tag'`, todas): pills
     `text-xs bg-[#1A3A52]/5 text-[#1A3A52] px-2.5 py-1 rounded-full font-medium`.
   - **Descripción colapsable**: label-botón `DESCRIPCIÓN` uppercase con
     `ChevronDown/ChevronUp`; párrafo `text-sm text-gray-600 whitespace-pre-line`,
     colapsado `line-clamp-4`.
   - **Agent card**: `bg-white rounded-2xl p-4 border border-gray-100 shadow-sm` —
     avatar `w-12 h-12 rounded-full border-2 border-[#D4AF37]/30`, nombre
     `text-sm font-bold text-[#1A3A52]`, sub `Asesor inmobiliario`.
4. **Sticky bottom CTA** — `fixed bottom-0 p-4 bg-white/90 backdrop-blur-lg border-t z-20`,
   fila `max-w-3xl gap-2`:
   - Botón guardar cuadrado `h-13 w-13 rounded-xl border-2` (guardado:
     `bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]` + Bookmark `fill-[#D4AF37]`).
   - Botón principal `flex-1 h-13 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] shadow-lg`:
     `<MessageCircle/> Consultar por WhatsApp` (loading: `Abriendo WhatsApp...`) →
     `trackEvent CHECKOUT_START` + `paymentProvider.checkout` de 1 ítem (quantity 1).

Sin breadcrumb, sin sección de similares, sin drawer de menú (diferencias vs `inmuebles`).

---

## 5. Cart drawer PROPIO — "Propiedades de interés" (guardadas, NO carrito)

Mismo flujo que `inmuebles` (bookmark + consulta agrupada por WhatsApp, sin cantidades
ni total), con estética estate. `Sheet` shadcn `sm:max-w-md p-0 bg-[#F8F9FA]`:

- **Header** (`bg-white border-b`): `<Building2 className="h-5 w-5 text-[#D4AF37]"/>`
  + título `text-[#1A3A52]` `Propiedades de interés` + contador
  `bg-[#1A3A52] text-white text-xs font-bold rounded-full ml-auto`.
- **Empty**: círculo blanco con `Building2` gris, `No tienes propiedades guardadas` /
  `Guarda las propiedades que te interesen para consultar por todas a la vez`.
- **Ítems**: `bg-white rounded-xl p-3 border border-gray-100 shadow-sm` — foto
  `h-20 w-28 rounded-lg`, nombre `text-sm font-semibold text-[#1A3A52] line-clamp-2`,
  precio `text-sm font-bold text-[#D4AF37]`, `Trash2` ghost `hover:text-red-500`.
- **Footer** (`bg-white border-t`): nota `Se enviará una consulta por WhatsApp con
  esta propiedad / estas {N} propiedades` + botón
  `w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5A]` `Consultar por WhatsApp`
  (loading `Enviando...`). Envío: `trackEvent CHECKOUT_START` →
  `paymentProvider.checkout({ items quantity:1, total, currency, storeSlug })` →
  `clearCart()` + cierra.

Diferencias de styling vs el drawer de `inmuebles`: botón verde WhatsApp `#25D366`
rectangular `rounded-xl` (vs pill negra), precio dorado (vs navy), fondo `#F8F9FA`.

---

## 6. Interacciones

- Búsqueda con botón clear (`X`) — filtra `name | description` en vivo.
- Pills de categoría en `ScrollArea` horizontal con `ScrollBar`; filtro AND con búsqueda.
- Contador de resultados reactivo con sufijo `en {categoría}`.
- Guardar/quitar desde 3 lugares: overlay de card (sin navegar), nav del detalle,
  sticky CTA del detalle — todos togglean el mismo cart-context.
- Skeleton de imagen (`animate-pulse` hasta `onLoad`), hover `scale-105`.
- Galería: thumbs cambian `selectedImage`; contador se actualiza.
- Descripción colapsable `line-clamp-4` ↔ completa.
- `?preview=` preservado en links de card y back.
- No hay drawer de menú ni focus-trap custom (el `Sheet` shadcn aporta la a11y del drawer).

---

## 7. Demo data real

Misma tienda demo que `inmuebles` — `seed-inmuebles.ts` (README: seed-inmuebles cubre
ambos temas del nicho): **Andrea Torres Propiedades**
(`demo-andrea-torres-propiedades`), WhatsApp `+584141234567`, USD `es-VE`,
logo/banner `/demo-assets/inmuebles/logo.jpg|banner.jpg`. Los colores del store en el
seed (`#1A3A52` / `#D4AF37`) son exactamente la paleta estate.

12 propiedades en 4 categorías (Casas, Apartamentos, Terrenos, Locales Comerciales) con
attributes `role='spec'` (`Habitaciones`, `Baños`, `m²`, `Año`, `Estacionamiento`) y
`role='tag'` (`Características`). Tabla completa de propiedades/precios/specs/fotos en
`docs/legacy-theme-specs/inmuebles.md` §7 (compartida). Fotos:
`/demo-assets/inmuebles/{casa1..casa4,apto1..apto4,terreno1,terreno2,local1,local2}(.b/.c).jpg`.

Notas para estate en particular:
- La card muestra `1/{N} fotos` — 6 propiedades tienen 2-3 fotos, el resto 1.
- `comparePrice` no existe en el seed → el tachado no aparece con demo data (mantener
  el soporte igualmente).
- Estado: `stockEnabled:false`, `stock:1` → todas "Disponible" (badge emerald).

---

## 8. Diff vs staging actual

Staging renderiza `estate` con el **TemplateRenderer genérico** + cart/product-sheet
genéricos. `estateTemplate` en `page-builder.seed.ts` (líneas 2219+):

| Elemento legacy | Staging hoy | Gap |
|---|---|---|
| Header navy del asesor (avatar dorado, meta propiedades) | `hero` variant `compact` (kicker `Asesor inmobiliario`) + `NavBar` genérica | Falta el header app-like; el hero compact es una aproximación |
| Sticky search + pills de categoría | `categories_strip` + `product_grid.filterByCategory` | Parcial: no es sticky, no hay búsqueda con clear |
| Contador de resultados | No existe | Falta |
| Property card (skeleton, badges estado/destacada/fotos, save overlay, specs Bed/Bath/Ruler, tags, MapPin) | Card genérica de `product_grid` sin specs (TemplateProduct no expone attributes) | Falta contrato de datos + card completa |
| Detalle propio (galería con thumbs dorados, specs grid 3-col, desc colapsable, agent card, sticky CTA verde) | Página de producto genérica / `PreviewProductSheet` (ejes variantes + qty) | Falta por completo |
| Drawer "Propiedades de interés" | `CartSheet` genérico (qty, total, form, "Pedir por WhatsApp") | Semántica equivocada |
| Barra flotante navy/dorada de guardadas | No existe (navbar genérica muestra cartCount) | Falta |
| Tokens | `primary #1A3A52, secondary #4a6076, accent #D4AF37, bg #F8F9FA, surface #ffffff, text #1A3A52, muted #6b7684, border #e5e8ec, radius lg` | ✅ Fieles a la paleta legacy (secondary/muted/border son interpolaciones razonables de los grises Tailwind) |
| Secciones staging extra: `about`, `testimonials`, `map`, `socials`, `footer` | En el schema con defaults Unsplash | No existen en el legacy — decisión: mantenerlas como secciones opcionales delegadas (enriquecen el tema), reescribiendo sus imágenes demo |
| Demo data `demoRealEstate()` | "Norte Inmuebles Demo" con Unsplash y specs narradas en descripción | Reescribir con seed-inmuebles |

---

## 9. Plan de port (renderer custom nivel 2)

Patrón `PersonaRenderer`, registro en `themes/registry.tsx` →
`THEME_RENDERERS['estate']`.

1. **Archivos**: `components/storefront-v2/themes/estate/index.tsx` +
   `product-card.tsx` + `product-detail.tsx` + `cart-drawer.tsx`. Igual que inmuebles:
   detail/cart propios requieren despacho por tema fuera del index (pendiente del
   framework, mismo caso que persona).
2. **Contrato `TemplateRendererProps`**: cards como `<a href={productHref(p)}>` en
   tienda real, `onOpenProduct` en previews; el botón guardar del overlay debe seguir
   con `preventDefault` para no navegar. Barra flotante y badge del nav usan
   `cartCount`/`onOpenCart`. `editorSelectedKey`/`onSectionClick` con `editorWrap`.
3. **Tokens `--bl-*`**: navy → `--bl-primary`; dorado → `--bl-accent`;
   `#F8F9FA` → `--bl-background`; blanco cards → `--bl-surface`; grises →
   `--bl-text-muted`/`--bl-border`; radios `rounded-xl/2xl` desde `--bl-radius`
   (token `lg` ya seteado); fuentes `--bl-heading-font`/`--bl-body-font`.
   Emerald/red de estado y `#25D366` WhatsApp pueden quedar como constantes semánticas
   (no son tema, son estado/marca WhatsApp).
4. **Responsive**: container queries únicamente —
   `@container bl-estate (max-width: 640px)` para grid 2→1 col; el layout ya es
   mobile-first `max-w-3xl` así que el trabajo responsive es mínimo.
5. **Mapping de secciones**: `hero` → header navy del asesor (image=avatar override,
   kicker/subheadline → meta/bio); `categories_strip` → pills sticky + búsqueda;
   `product_grid` → contador + grid de cards (props layout/filterByCategory/showPrice);
   `about`, `testimonials`, `contact`, `map`, `socials`, `footer` → delegar a
   `SectionRenderer` base (mantener el schema actual del seed).
6. **Contrato de datos**: mismo requisito que inmuebles — `TemplateProduct.specs` +
   `tags` (+ `featured?: boolean`, `comparePrice?: number`, `inStock` derivado de
   stock) poblados desde attributes; `demoRealEstate()` reescrito con seed-inmuebles.
7. **Precios**: `priceCtx`/`rate` del contrato (toggle Bs) con
   `maximumFractionDigits: 0`; conservar `comparePrice` tachado.
8. **Carrito**: `EstateCartDrawer` fiel a §5 con tokens; checkout `paymentProvider`
   (mensaje WA agrupado). Recomendado unificar el copy del mensaje con el contrato del
   HTML de inmuebles (incluye Referencia).
9. **Decisiones abiertas**: renderizar o no `Estacionamiento` en el specs grid del
   detalle (omisión del legacy); mantener `es-VE` como locale de formato (difiere del
   `en-US` de inmuebles) — sugerido: unificar vía `priceCtx`.
