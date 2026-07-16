# Spec legacy — Tema **servicios**

> Fuente de verdad: rama `staging/bylink` → `components/templates/servicios/`
> (`index.tsx`, `product-card.tsx`, `product-detail.tsx`, `cart-drawer.tsx`, `gallery-item.tsx`).
> Extraído a scratchpad `legacy/staging_bylink/servicios/` en la sesión 2026-07-16.
> Nota: **servicios y persona legacy son byte-idénticos** salvo 3 strings (ver `persona.md` §0);
> todo lo estructural de este doc aplica a ambos.

## 0. Resumen del tema

Perfil tipo "link-in-bio de profesional de servicios": cover + avatar circular superpuesto,
bio centrada, botones WhatsApp/Instagram, fila de stats, **tabs sticky Servicios / Portfolio**,
filtro de categorías en chips, lista vertical de cards horizontales de servicio, grid IG 3-col,
FAB de WhatsApp. **No hay carrito real**: cada servicio se "Agenda" con checkout directo de
WhatsApp (1 item, qty 1). El detalle de producto es PROPIO (galería 4:3 + thumbs, descripción
colapsable, card del profesional, CTA sticky verde). Mobile-first, ancho de contenido `max-w-lg`.

---

## 1. Identidad visual

| Token | Valor legacy | Uso |
|---|---|---|
| Fondo página | `#FFFFFF` (`bg-white`) | root, tabs bar, filtro |
| Accent | `store.primaryColor \|\| '#2D2D2D'` | CTA WhatsApp del hero, indicador de tab, chip activo, precio, borde thumb activo, categoría del detalle, tags |
| WhatsApp green | `#25D366` (hardcoded, NUNCA tokenizado) | botón "Agendar" de card, CTA del detalle, FAB |
| Texto fuerte | `text-gray-900` = `#111827` | nombre, títulos, valores de stats, tab activa |
| Texto medio | `text-gray-500` = `#6B7280` | bio, descripciones, "Volver", labels de spec |
| Texto débil | `text-gray-400` = `#9CA3AF` | labels de stats, tab inactiva, empty state |
| Superficie suave | `bg-gray-100` = `#F3F4F6` | cover fallback, thumbs de imagen, chip inactivo |
| Superficie card pro | `bg-gray-50` = `#F9FAFB` | card del profesional en el detalle |
| Bordes | `border-gray-100` = `#F3F4F6` (cards) / `border-gray-200` = `#E5E7EB` (tabs bar, divisor stats) | |
| Tags del detalle | bg `${accent}10` (accent + alpha hex `10` ≈ 6%), texto `accent` | pills de atributos role='tag' |
| Tipografía | La del app shell (no define fuente propia; en legacy era la default del layout — Inter). Sin serif, sin display font | |
| Radios | `rounded-2xl` (16px) cards · `rounded-xl` (12px) thumb card y CTA detalle · `rounded-lg` (8px) thumbs galería · `rounded-full` botones/chips/avatar/FAB | |
| Sombras | `shadow-sm → hover:shadow-md` (cards) · `shadow-lg` (avatar, FAB, CTA hero) | |

Datos de la tienda demo (seed): `primaryColor: '#2D2D2D'`, `secondaryColor: '#D4AF37'` (el
secundario NO se usa en el render legacy).

Formato de precio (en card y detalle):

```ts
new Intl.NumberFormat('es-VE', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
// USD 30 → "US$30" (es-VE). Sin decimales SIEMPRE.
```

---

## 2. Estructura de página (`index.tsx`)

Orden exacto del árbol:

1. **Hero / perfil** (`<header className="relative">`)
   - Cover: `h-36 sm:h-44 bg-gray-100 overflow-hidden` — 144px móvil, **176px ≥sm**.
     Con `store.coverImage` → `img object-cover`; sin cover → `div` full con
     `style={{ backgroundColor: accent }}` + `opacity-10`.
   - Bloque perfil: `relative max-w-lg mx-auto px-4 -mt-14 pb-4` → avatar **superpuesto -56px**
     sobre el cover. Interior `flex flex-col items-center text-center`.
   - Avatar: `w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg` (112px).
   - Nombre: `h1.text-xl font-bold text-gray-900 mt-3`.
   - Bio: `p.text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed` (solo si `store.bio`).
   - Botones acción (`flex items-center gap-2 mt-4`):
     - WhatsApp (si hay número): shadcn `Button` `gap-2 rounded-full text-white text-sm h-9 px-5`
       con `style={{ backgroundColor: accent }}` + icono `MessageCircle h-4 w-4` + texto "WhatsApp".
       Es `<a href="https://wa.me/{digits}" target="_blank">`.
     - Instagram (si `store.instagramUrl`): `Button variant="outline"` `gap-2 rounded-full text-sm h-9 px-5`
       + icono `Instagram h-4 w-4` + texto "Seguir".
2. **Stats** (`flex items-center gap-6 mt-4 text-center`, dentro del header)
   - Stat 1: valor = `galleryImages.length` (⚠️ imágenes de los productos **filtrados** por
     categoría — cambia al filtrar), label **"Trabajos"**.
   - Divisor: `w-px h-8 bg-gray-200`.
   - Stat 2: valor = `products.length` (total, sin filtrar), label **"Servicios"**.
   - Valor: `text-lg font-bold text-gray-900`. Label: `text-[11px] text-gray-400 uppercase tracking-wide`.
3. **Tab switcher** — `sticky top-0 z-10 bg-white border-b border-gray-200`, interior
   `max-w-lg mx-auto flex`. Cada tab:
   ```
   flex-1 py-3 text-sm font-medium transition-colors relative
   activa:   text-gray-900
   inactiva: text-gray-400 hover:text-gray-600
   ```
   Indicador de tab activa: `absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full`
   con `backgroundColor: accent` (ocupa el 50% central). Labels: **"Servicios"** / **"Portfolio"**.
4. **Filtro de categorías** — SOLO si `categories.length > 1`. `bg-white px-4 pt-3 pb-0`,
   `ScrollArea` horizontal (`max-w-lg mx-auto`) + `ScrollBar orientation="horizontal"`,
   fila `flex gap-1.5 pb-3`. Chip:
   ```
   shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
   activo:   text-white shadow-sm      + style backgroundColor: accent
   inactivo: text-gray-500 hover:text-gray-900 bg-gray-100
   ```
   Primera opción sintética **"Todos"**. El filtro aplica a la lista Y al portfolio.
5. **Main** — `max-w-lg mx-auto pb-24` (96px de aire para FAB + CTA).
   - Tab "servicios": `px-4 pt-4 space-y-3` con `ServiciosProductCard` por producto filtrado.
     Vacío → `text-center py-12 text-gray-400 text-sm` "No hay servicios en esta categoría".
   - Tab "portfolio": `grid grid-cols-3 gap-0.5` (gap 2px, sin padding lateral — full-bleed
     dentro de max-w-lg) con `ServiciosGalleryItem` por cada imagen. `galleryImages` =
     flatMap de TODAS las imágenes (`p.images` o fallback `[p.image ?? '/placeholder.svg']`)
     de los productos filtrados; key `${product.id}-${idx}`.
6. **FAB WhatsApp** (si hay número):
   ```
   fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] text-white
   flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20
   ```
   Icono `MessageCircle h-6 w-6`, `aria-label="Contactar por WhatsApp"`.

**No hay navbar**, no hay footer, no hay ícono de carrito en el índice.

---

## 3. Product card (`product-card.tsx`) — card horizontal de servicio

```
<div className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
  <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
    <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
  </div>
  <div className="flex-1 min-w-0 flex flex-col justify-between">
    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{name}</h3>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5">{description}</p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-base font-bold" style={{ color: accent }}>{fmt(price)}</span>
      <button className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#25D366' }}>
        <MessageCircle className="h-3 w-3" /> Agendar
      </button>
    </div>
  </div>
</div>
```

Comportamiento:
- La card entera es `<Link href={/{store.slug}/{product.slug}${preview ? `?preview=${preview}` : ''}}>`
  si el producto tiene slug; si no, div inerte.
- El botón **"Agendar" NO navega**: `preventDefault + stopPropagation`, dispara
  `trackEvent(store.slug, 'CHECKOUT_START')` y `paymentProvider.checkout({ items: [{productId, name, price, quantity: 1, image}], total: price, currency, storeSlug })`
  → abre WhatsApp directo con ese único servicio. Si no hay número de WhatsApp, no hace nada.
- Imagen: `product.images?.[0] ?? product.image ?? '/placeholder.svg'`.
- (Los imports `Clock, ChevronRight` del legacy están sin usar — no portar.)

---

## 4. Product detail PROPIO (`product-detail.tsx`)

Página completa (no sheet). `min-h-screen bg-white`, contenido en `max-w-lg mx-auto`.

1. **Sticky nav**: `sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100`.
   Link "Volver" a `/{store.slug}` (preserva `?preview`):
   `flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900` + `ArrowLeft h-4 w-4`.
2. **Imagen principal**: `relative aspect-[4/3] overflow-hidden bg-gray-100`,
   `img object-cover transition-opacity duration-300`. Fallback `/placeholder.svg`.
3. **Thumbnails** (solo si `images.length > 1`): `flex gap-2 px-4 py-3 overflow-x-auto`; cada thumb
   ```
   shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 border-2
   activa:   opacity-100 + style borderColor: accent
   inactiva: border-transparent opacity-60 hover:opacity-100
   ```
4. **Info** — `px-4 py-5 pb-36 space-y-5` (pb-36 = 144px, deja aire al CTA fixed):
   - Categoría (si hay): `text-xs font-semibold uppercase tracking-wider` color accent.
   - Título: `h1.text-2xl font-bold text-gray-900 leading-tight`.
   - Precio: `text-2xl font-bold mt-2` color accent (mismo `fmt` sin decimales).
   - **Specs** (`attributes` con `role === 'spec'`): filas `flex items-center justify-between text-sm`
     → nombre `text-gray-500`, valor (`options[0]`) `font-medium text-gray-900`. Contenedor `space-y-2`.
   - **Tags** (`role === 'tag'`, flatMap de options): `flex flex-wrap gap-1.5`, pill
     `text-xs px-2.5 py-1 rounded-full font-medium` con `style={{ backgroundColor: `${accent}10`, color: accent }}`.
   - **Descripción colapsable**: botón toggle
     `flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 font-medium hover:text-gray-900`
     texto "Descripción" + `ChevronDown/ChevronUp h-3.5 w-3.5`. Párrafo
     `text-sm text-gray-600 leading-relaxed whitespace-pre-line` con `line-clamp-4` cuando está colapsado.
   - **Card del profesional**: `bg-gray-50 rounded-2xl p-4` → `flex items-center gap-3`,
     avatar `w-11 h-11 rounded-full object-cover`, nombre `text-sm font-bold text-gray-900`,
     bio `text-xs text-gray-500 line-clamp-1`.
5. **CTA sticky**: `fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-20`.
   Botón `w-full max-w-lg mx-auto h-13 text-base gap-2 rounded-xl text-white shadow-lg flex`
   con `backgroundColor: '#25D366'`, icono `MessageCircle h-5 w-5`, texto
   **"Agendar por WhatsApp"** → loading **"Abriendo WhatsApp..."** (`disabled` mientras).
   Acción idéntica al "Agendar" de la card (checkout directo 1×). ⚠️ `h-13` no existe en
   Tailwind stock (probable no-op → altura efectiva la del Button, 40px); al portar usar 52px
   como intención de diseño o replicar 40px si se quiere fidelidad literal.
6. Renderiza `<ServiciosCartDrawer />` al final (ver §5).

Sin selector de variantes, sin qty, sin stock, sin share, sin "más productos".

---

## 5. Cart drawer PROPIO (`cart-drawer.tsx`) — informacional, sin items

El tema **no usa carrito**. El drawer existe solo por compatibilidad estructural:

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
    <SheetHeader className="px-6 py-4 border-b border-gray-200">
      <SheetTitle className="text-gray-900 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> Servicios
      </SheetTitle>
    </SheetHeader>
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
      <p className="text-sm text-gray-500">
        Usa el botón de WhatsApp en cada servicio para agendar directamente.
      </p>
    </div>
  </SheetContent>
</Sheet>
```

Título literal: **"Servicios"**. Sin lista de items, sin totales, sin checkout.

---

## 6. Interacciones

- **Tabs**: estado local `'servicios' | 'portfolio'`, sin URL sync. Sticky top con indicador accent.
- **Filtro de categorías**: estado local, `"Todos"` por defecto; afecta lista + portfolio + stat "Trabajos".
- **Gallery item** (`gallery-item.tsx`): celda `relative aspect-square overflow-hidden bg-gray-100 group`
  → `img group-hover:scale-105 transition-transform duration-300` + overlay
  `absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300`.
  **No hay lightbox**: cada celda es `<Link>` a la página del producto dueño de la foto
  (preserva `?preview`); sin slug queda inerte.
- **Agendar**: checkout directo WhatsApp (card, detalle). Track `CHECKOUT_START`.
- **No hay share** (el `shared/use-share.ts` no se usa en este tema), no hay wishlist, no hay toggle Bs.
- Hovers: scale-105 en imágenes, shadow-md en cards, opacity-90 + active:scale-95 en Agendar,
  scale-105 en FAB.

---

## 7. Demo data real (`igsotre-back/prisma/seeds/seed-servicios.ts`)

Tienda: **Daniel Mendoza** (`daniel-mendoza-foto` / demo: `demo-daniel-mendoza-foto`)
- Bio: "Fotógrafo profesional. Retratos, eventos, bodas y producto. Tu historia merece buenas fotos."
- Logo/avatar: `/demo-assets/servicios/logo.jpg` · Banner/cover: `/demo-assets/servicios/banner.jpg`
- `primaryColor #2D2D2D` · `secondaryColor #D4AF37` · WhatsApp `+584149876543` ·
  IG `danielmendozafoto` · USD (`es-VE`) · stock deshabilitado.
- Categorías (orden): Retratos, Eventos, Producto, Parejas y Familia.

| # | Servicio | $ | Categoría | Imágenes (`/demo-assets/servicios/`) | Feat. |
|---|---|---|---|---|---|
| 1 | Sesión de Retrato Individual | 30 | Retratos | retrato1, retrato2, retrato3 | ★ |
| 2 | Retrato Profesional / Corporativo | 20 | Retratos | retrato4, retrato5 | |
| 3 | Mini Sesión Express | 15 | Retratos | retrato5, retrato1 | |
| 4 | Cobertura de Evento Completa | 80 | Eventos | evento1..evento4 | ★ |
| 5 | Cobertura de Boda | 150 | Eventos | evento2, evento1 | ★ |
| 6 | Cobertura Media Jornada | 50 | Eventos | evento3, evento4 | |
| 7 | Fotos de Producto (10 unidades) | 25 | Producto | producto1, producto2, producto3 | |
| 8 | Fotos de Producto Pack Completo (30 u.) | 60 | Producto | producto2, producto3, producto1 | ★ |
| 9 | Sesión de Pareja | 40 | Parejas y Familia | pareja1, pareja2, pareja3 | |
| 10 | Sesión Familiar | 35 | Parejas y Familia | familia1, familia2 | |
| 11 | Sesión de Embarazo | 35 | Parejas y Familia | familia2, familia1 | |

Descripciones completas en el seed (copiar literal). Con las 11 fichas el portfolio da
**27 celdas** y los stats derivados serían "27 Trabajos / 11 Servicios".

⚠️ El `serviciosTemplate.demoDataJson` actual (`page-builder.seed.ts` → `demoServices()`) es
**otra tienda inventada** ("Estudio Norte Demo", 6 servicios de agencia, fotos Unsplash) —
reemplazar por los datos de arriba (fotos `/demo-assets/servicios/...`).

---

## 8. Diff vs staging actual

**No existe renderer custom para `servicios`.** `registry.tsx` solo registra `persona`; el key
`servicios` cae al `TemplateRenderer` base → hoy se ve como un sitio genérico por secciones.
Falta TODO lo distintivo:

| # | Legacy | Staging hoy |
|---|---|---|
| 1 | Sin navbar; hero = cover + avatar -mt-14 centrado | NavBar base + hero `split` de catálogo |
| 2 | Stats "Trabajos / Servicios" derivadas | El seed de servicios **ni siquiera incluye** sección `stats` |
| 3 | Tabs sticky Servicios/Portfolio | Secciones apiladas (product_grid y gallery una tras otra) |
| 4 | Filtro chips por categoría (auto si >1) | product_grid del seed servicios no tiene prop `filterByCategory` |
| 5 | Card horizontal 80px + botón Agendar verde con checkout directo | Cards genéricas del catálogo, sin acción directa |
| 6 | Grid IG 3-col gap-0.5 alimentado por fotos de productos | Sección gallery con `items` propios (4 Unsplash), no fotos de productos |
| 7 | FAB WhatsApp #25D366 | No existe |
| 8 | Detail propio (4:3, thumbs, desc colapsable, card profesional, CTA sticky verde) | `ProductPageClient` genérico (variantes/qty/carrito) y `PreviewProductSheet` en previews |
| 9 | Cart drawer informacional propio | `CartSheet` genérico con qty/checkout |
| 10 | Paleta `#2D2D2D` accent sobre blanco/grises | Tokens seed `corporate` azul `#1e3a8a` |
| 11 | Secciones extra | Seed añade about/hours/contact/footer que el legacy no tenía (decidir: mantener como delegadas al final, patrón persona) |

Cambios de seed requeridos (backend, **no ejecutar**, solo dejar listos): tokens
(`primary #2d2d2d`, `surface #f7f7f7`, radius lg — igual que persona), añadir `stats_main`,
`filterByCategory` en product_grid, `defaultOrder` hero→stats→grid→gallery(→about→footer),
`demoDataJson` con Daniel Mendoza.

---

## 9. Plan de port

1. **Renderer**: `components/storefront-v2/themes/servicios/index.tsx` registrado en
   `THEME_RENDERERS` de `registry.tsx`. Como persona legacy ≡ servicios legacy, **extraer una
   base compartida** (`themes/shared/profile-tabs.tsx` o similar) parametrizada por labels
   (tab 1, stat 2, título drawer) y que `persona` y `servicios` la instancien — un solo port,
   dos temas.
2. **Contrato**: `TemplateRendererProps` completo. Colores SIEMPRE por tokens, nunca
   `store.primaryColor`:
   `accent → var(--bl-primary)` · blanco → `var(--bl-background)` · gray-50/100 → `var(--bl-surface)` ·
   gray-100/200 bordes → `var(--bl-border)` · gray-900 → `var(--bl-text)` · gray-400/500 →
   `var(--bl-text-muted)` · rounded-2xl → `var(--bl-radius)` (seed lg=16px) · fuentes
   `var(--bl-heading-font)` / `var(--bl-body-font)`. `#25D366` queda literal (identidad WhatsApp).
   Tags: `color-mix(in srgb, var(--bl-primary) 6%, transparent)` en vez del hack `${accent}10`.
3. **Responsive**: container queries SIEMPRE (`containerType: inline-size`, name p.ej.
   `bl-servicios`) — el único breakpoint legacy es el cover `h-36 → sm:h-44`
   (`@container bl-servicios (min-width: 640px) { .cover { height: 176px } }`). Nunca `@media`.
4. **Árbol de secciones**: respetar orden/visibilidad/props como hace `PersonaRenderer`:
   hero→perfil, stats→fila métrica (fallback derivado Trabajos/Servicios), product_grid→tab 1
   (título de tab = `props.title || 'Servicios'`), gallery→tab Portfolio (items propios + fotos
   de productos), resto delegado a `SectionRenderer`. `editorWrap` + `editorSelectedKey`/
   `onSectionClick`, y el efecto "seleccionar gallery en el editor cambia a su tab".
5. **Navegación**: cards y celdas de galería usan `productHref(p)` cuando existe (tienda real,
   `<a href>`); fallback `onOpenProduct(p)` (editor/previews). El botón "Agendar" de la card
   mantiene el checkout directo WhatsApp (preventDefault + `WhatsAppPaymentProvider.checkout`
   1 item) — decisión ya validada en legacy; trackear `CHECKOUT_START`.
6. **Detail propio**: hoy `ProductPageClient` es único para todos los temas. Extender el
   registry con un slot de detail por tema (p.ej. `THEME_PRODUCT_DETAILS`) y portar §4 fiel
   (tokens + container query en vez de `max-w-lg`). El sheet de previews puede seguir siendo
   `PreviewProductSheet` o portarse después (prioridad baja).
7. **Cart propio**: portar el drawer informacional §5 (título "Servicios"). Al no haber carrito,
   `onOpenCart`/`cartCount` del contrato se aceptan pero no se muestra pill de carrito
   (el legacy no tenía ninguna). Iconos: usar lucide (`MessageCircle`, `Instagram`, `ArrowLeft`,
   `ChevronDown/Up`) como el legacy — no emojis.
8. **Precios**: usar el `fmt` Intl `es-VE` sin decimales del legacy; aceptar `rate` por contrato
   (persona actual la ignora — mantener criterio, precios en moneda de la tienda).
9. **Seed**: cambios de §8 en `page-builder.seed.ts` + demo data Daniel Mendoza. Dejar archivos
   listos SIN ejecutar migraciones/seeds en dev.
