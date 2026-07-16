# Spec fiel — Tema NOIR (legacy → storefront-v2)

> Fuente de verdad: legacy React `components/templates/noir/` (rama `rebrand/bylink-domain-swap`;
> copia en scratchpad `legacy/rebrand_bylink-domain-swap/noir/`). **Noir NO tiene HTML de
> referencia en `landing-videos/`** — el legacy React es la única fuente de diseño.
> Objetivo: reconstruirlo pixel-perfect como renderer custom nivel 2 en
> `components/storefront-v2/themes/noir/`, con detail y cart PROPIOS.

---

## 1. Identidad visual

Boutique editorial nocturna: negro casi absoluto, oro apagado, serifa italiana ligera.
Tono "galería de arte / alta costura": todo en minúscula visual, tracking amplio, hairlines doradas.

### Paleta exacta (hex literales del legacy)

| Rol | Hex | Uso |
|---|---|---|
| Fondo base | `#0A0A0A` | body, headers, overlays |
| Superficie | `#111` | cart drawer, inputs, item thumbs |
| Superficie 2 | `#161616` | (token seed `surface`) |
| Borde principal | `#1A1A1A` | sidebar, toolbar, cart bar |
| Borde grid | `#141414` | divisores entre cards |
| Borde cart | `#222` / `#1E1E1E` | drawer border / headers internos |
| Oro (acento) | `#C9A86C` | precios, CTA, tabs activos, badges |
| Oro hover | `#D4B87A` | hover del CTA dorado |
| Oro hover alt | `#b8966a` | hover botón cart del WishlistDrawer |
| Texto principal | `#F0EDE8` | títulos, nombres |
| Texto secundario | `#888` | bio, iconos hover |
| Muted | `#666` | bio sidebar |
| Muted 2 | `#555` | labels, contadores, iconos |
| Muted 3 | `#444` / `#333` | placeholders, bordes qty, trash |
| Rojo wishlist | Tailwind `red-400` (`#f87171`) | corazón activo (fill) |

### Tipografía

- **Serifa**: `Source Serif 4` — pesos `300, 400, 600`, estilos `normal + italic`. Se usa para:
  nombre de tienda (light italic), títulos de producto (`font-serif`), totales del cart, "∅" empty state.
- **Sans**: `Inter` (el `font-sans` del proyecto) — todo lo demás (labels uppercase, precios, botones).
- Patrón de título: `font-light italic tracking-wide` (ej. h1 tienda: `text-4xl font-light italic text-[#F0EDE8] tracking-wide leading-tight`).
- Labels sistema: `text-[10px] tracking-[0.2em] uppercase text-[#555] font-sans` (variantes 0.12em–0.3em).

### Radius / sombras / detalles

- Botones CTA: `rounded-sm` (2px). Inputs: `rounded-lg`. Badges circulares: `rounded-full`. Cards: **sin radius** (full-bleed).
- Sin box-shadows; la profundidad se hace con gradientes negros multicapa + `backdrop-blur-md` en barras sticky (`bg-[#0A0A0A]/95`).
- Hairline dorada firma: `<div className="h-px bg-gradient-to-r from-transparent via-[#C9A86C]/40 to-transparent" />` (variantes `via-[#C9A86C]/20` y `from-[#C9A86C]/20 via-[#C9A86C]/10 to-transparent`).
- Formato de precio: `Intl.NumberFormat('es-AR', { style:'currency', currency, minimumFractionDigits: 0 })`.
- Vocabulario: los productos son **"piezas"** ("3 piezas", "Buscar piezas...", "Carrito vacío", "Selección").

---

## 2. Estructura de página

Layout dual: **desktop = sidebar fija + feed**, **mobile = header cinemático + toolbar sticky + feed**.
Contenedor: `lg:flex lg:max-w-7xl lg:mx-auto`; el feed móvil se limita a `max-w-lg mx-auto`.

### 2.1 Sidebar desktop (`hidden lg:flex`)

```
aside: lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen
       lg:overflow-y-auto lg:border-r lg:border-[#1A1A1A] lg:p-7 lg:gap-6
```
Orden interno:
1. **Cover** (si hay): `rounded-xl aspect-video` + gradiente `from-[#0A0A0A]/70 to-transparent` + nombre superpuesto (xl light italic). Sin cover: avatar `w-16 h-16 rounded-full border border-[#C9A86C]/30` + nombre + username `text-[11px] text-[#C9A86C] tracking-[0.2em] uppercase`.
2. Bio: `text-sm text-[#666] leading-relaxed font-sans font-light`.
3. Link Instagram: icono + texto `text-[#555] hover:text-[#888]`.
4. Stats: `N piezas · M categorías` — números `text-[#F0EDE8] font-light`, labels `text-xs text-[#555]`, separador `w-px h-3 bg-[#333]`.
5. Search: input `h-9 pl-8 bg-[#111] border border-[#1A1A1A] rounded-lg text-sm placeholder:text-[#333]` con lupa 3.5 y botón X.
6. Categorías en lista vertical: label `text-[10px] font-semibold text-[#333] uppercase tracking-[0.2em]`; cada botón `text-left px-3 py-2 text-xs tracking-[0.12em] uppercase border-b border-[#111]`; activo `text-[#C9A86C] border-[#C9A86C]/30`; inactivo `text-[#555] hover:text-[#888]`.
7. `mt-auto`: botón Favoritos (outline, h-10, solo plan PRO/BUSINESS) + **botón carrito dorado**:
   `w-full h-12 bg-[#C9A86C] text-[#0A0A0A] rounded-sm font-semibold text-sm flex items-center justify-between px-5 hover:bg-[#D4B87A] active:scale-[0.99]` — izquierda bag + "N piezas" (o "Carrito vacío"), derecha total + ChevronRight.

### 2.2 Header cinemático mobile (`lg:hidden`)

```
header: relative h-[65vh] w-full overflow-hidden bg-[#111]
```
- Imagen cover `absolute inset-0 object-cover scale-105`; fallback gradiente `linear-gradient(135deg,#0A0A0A 0%,#1A1A1A 40%,#0F0F0F 100%)`.
- Overlays multicapa: `bg-gradient-to-b from-[#0A0A0A]/30 via-transparent to-[#0A0A0A]` + `bg-gradient-to-r from-[#0A0A0A]/50 via-transparent to-transparent`.
- Nav superpuesto (`absolute top-0 px-5 pt-10`): carrito a la IZQUIERDA (con badge dorado `w-4 h-4 rounded-full bg-[#C9A86C] text-[#0A0A0A] text-[9px] font-bold`), derecha wishlist + Instagram, iconos `text-[#F0EDE8]/80`.
- Identidad abajo (`absolute bottom-0 px-5 pb-8`): avatar `w-18 h-18 rounded-full border border-[#C9A86C]/30` → h1 `text-4xl font-light italic` → username dorado uppercase → bio `text-sm text-[#888] max-w-xs` → stats strip (mismo patrón sidebar).

### 2.3 Toolbar sticky (mobile + desktop feed)

```
div: sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]
```
- Fila 1 — tabs de categoría scrolleables horizontal (ScrollArea, scrollbar h-0):
  `shrink-0 px-5 py-3.5 text-xs tracking-[0.15em] uppercase border-b-2`; activo `border-[#C9A86C] text-[#C9A86C]`; inactivo `border-transparent text-[#555] hover:text-[#888]`. Sub-borde fila: `border-b border-[#141414]`.
- Fila 2 — `flex justify-between px-5 py-3`: contador "N piezas" (`text-xs text-[#555] tracking-widest uppercase`) + iconos search/heart 3.5. Al tocar search: input inline transparente `autoFocus` que reemplaza toda la fila, con X para cerrar.

### 2.4 Grid de productos

Algoritmo del feed (ver `index.tsx` L52-76): recorre los productos filtrados en orden y arma filas:
- Producto `featured` → **fila full-width** (card `aspect-[4/3]`), envuelta en `border-b border-[#141414]` y seguida por la hairline dorada `via-[#C9A86C]/20`.
- No-featured → se emparejan de a 2 → `grid grid-cols-2` con `border-r border-[#141414]` en el primero; si queda uno suelto va solo a 1 col. Cards `aspect-[3/4]`.
- Sin gap: las cards se tocan, separadas solo por esos bordes 1px #141414.
- `main`: `pb-32 lg:pb-8` (espacio para la cart bar móvil).
- Empty state: `∅` gigante (`text-5xl text-[#1A1A1A] font-light italic`) + "Sin resultados" serif italic + "INTENTA OTRA BÚSQUEDA" uppercase `text-[#444]`.

### 2.5 Cart bar sticky mobile (solo si `totalItems > 0`)

`fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] lg:hidden` con el mismo botón dorado h-12 del sidebar (bag + "N piezas" | total + chevron).

---

## 3. Product card (`noir/product-card.tsx`)

Card **full-bleed, sin fondo ni borde propio**, info flotada sobre gradiente:

```tsx
<div className="group relative overflow-hidden aspect-[3/4]">   // featured: aspect-[4/3]
  <img className="absolute inset-0 w-full h-full object-cover
                  transition-transform duration-700 group-hover:scale-105" />
  <div className="absolute inset-x-0 bottom-0 h-3/4
                  bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
```

- **Agotado**: overlay `bg-[#0A0A0A]/60 backdrop-blur-[1px]` centrado con `text-[11px] font-light tracking-[0.3em] uppercase text-[#888]` "Agotado".
- **Top-right** (columna, gap-1.5): wishlist y share en círculos `w-7 h-7 rounded-full bg-[#0A0A0A]/60 backdrop-blur-sm`; share solo visible on hover (`opacity-0 group-hover:opacity-100`); check dorado 1.8s al copiar.
- **Top-left**: badge descuento `text-[10px] font-bold tracking-wider bg-[#C9A86C] text-[#0A0A0A] px-2 py-0.5 rounded-sm` con `-{n}%` (calculado de comparePrice); debajo `✦ Destacado` en `text-[10px] tracking-[0.15em] uppercase text-[#C9A86C] font-light` (solo cuando el producto es featured pero se pinta en slot normal).
- **Info bottom** (`absolute inset-x-0 bottom-0 p-3`): nombre `font-serif text-[#F0EDE8] text-sm leading-snug line-clamp-2`; precio `text-[#C9A86C] text-sm font-semibold` con compare `text-[#555] text-[10px] line-through` debajo.
- **Quick-add**: círculo `h-7 w-7 rounded-full border border-[#333] text-[#888]`, oculto (`opacity-0 translate-y-1`) → aparece on hover (`group-hover:opacity-100 group-hover:translate-y-0`); al agregar: `bg-[#C9A86C] border-[#C9A86C] text-[#0A0A0A] scale-110` con Check 1.8s, abre el cart.
- La card completa es `<Link href="/{tienda}/{producto}">` cuando hay slug (preservando `?preview=`).

---

## 4. Product detail PROPIO (`noir/product-detail.tsx`)

**Cómo abre**: navegación a página propia `/{tienda}/{producto}` (no modal). Fondo `#0A0A0A` completo, misma fuente serif.

### Desktop (lg+)

1. **Top bar**: `flex justify-between px-8 py-4 border-b border-[#1A1A1A] max-w-6xl mx-auto` — izquierda `← Volver a la tienda` (`text-sm text-[#555] hover:text-[#F0EDE8]`); derecha wishlist + share + botón carrito dorado `h-9 px-5 bg-[#C9A86C] text-[#0A0A0A] text-sm font-semibold rounded-sm` con contador.
2. **Grid 2 col**: `lg:grid-cols-2 lg:gap-16 lg:max-w-6xl lg:px-8 lg:py-10 items-start`.
   - **Izquierda (galería)**: imagen principal `aspect-[3/4]` con overlay sutil `bg-gradient-to-b from-[#0A0A0A]/20 via-transparent to-[#0A0A0A]/40`; badges arriba-izq (descuento dorado + ✦ Destacado); thumbnails en fila pegada (`flex gap-px`, cada thumb `flex-1 h-20`); seleccionada `border-b-2 border-[#C9A86C]`, resto `opacity-40 hover:opacity-70`.
   - **Derecha (info)**, `space-y-6`, abre con hairline dorada `via-[#C9A86C]/40`:
     - Categoría `text-[10px] tracking-[0.3em] uppercase text-[#C9A86C]` → h1 `text-3xl font-light italic text-[#F0EDE8] tracking-wide` (serif).
     - Precio `text-[#C9A86C] text-xl font-semibold` + compare tachado `text-[#555] text-sm`.
     - Hairline suave → **selectores de variante** (ver abajo) → **Cantidad** → hairline → descripción colapsable → **CTA**.

### Selectores de variante (compartidos desktop/mobile)

- Label: `text-[10px] tracking-[0.2em] uppercase text-[#555]` + valor elegido en `text-[#F0EDE8]` normal-case.
- Atributo `color`: `ColorSwatch` compartido (círculo 32px, ring exterior con el hex al seleccionar, diagonal roja si no disponible, label 10px debajo).
- Atributo texto: botones `px-4 py-2 text-sm` — seleccionado `border border-[#C9A86C] text-[#C9A86C] bg-[#C9A86C]/10`; disponible `border-[#333] text-[#888] hover:border-[#555] hover:text-[#F0EDE8]`; agotado `border-[#1A1A1A] text-[#333] line-through cursor-not-allowed`.
- Al elegir color con `optionsMeta[option].images` → la galería cambia a esas imágenes (`colorImages`); si la variante matcheada tiene `image` se selecciona ese índice.

### Cantidad

Stepper cuadrado: botones `w-10 h-10 border border-[#333] text-[#888] hover:text-[#C9A86C] hover:border-[#C9A86C]`, valor `w-12 h-10 border-y border-[#333] text-[#F0EDE8] text-sm`.

### Descripción

Toggle `Ver detalles / Ocultar detalles` (`text-[10px] tracking-[0.2em] uppercase text-[#555] hover:text-[#C9A86C]`); cuerpo `text-sm text-[#888] font-sans font-light leading-relaxed`.

### CTA

```
w-full h-12 font-semibold text-sm flex items-center justify-between px-5 rounded-sm
canAdd  → bg-[#C9A86C] text-[#0A0A0A] hover:bg-[#D4B87A]
disabled→ bg-[#1A1A1A] text-[#555] cursor-not-allowed
```
Izquierda: bag + "Agregar" (→ "Agregado" 1.8s). Derecha: `fmt(finalPrice * qty)` bold + ChevronRight.
`canAdd` = inStock && (sin atributos variant || todos seleccionados). Al agregar inserta `qty` items con id `productId-{opciones-ordenadas}` y abre el cart.

### Mobile (lg-)

- **Hero cinemático `h-[70vh]`** con los mismos overlays del header de tienda; nav superpuesto: back izquierda; wishlist/share/carrito derecha (badge dorado). Badges en `top-20 left-5`.
- Thumbs `w-16 h-16` en fila scrolleable (`gap-px pl-4`), misma marca de selección.
- Cuerpo `px-5 pt-6 pb-32 space-y-6` (hairline → categoría/título 2xl → precio lg → variantes → cantidad → descripción).
- **CTA fijo abajo**: `fixed bottom-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] z-20` con el mismo botón.

---

## 5. Cart drawer PROPIO (`noir/cart-drawer.tsx`)

Sheet lateral derecho (shadcn Sheet): `w-full sm:max-w-md bg-[#111] border-[#222] p-0 text-[#F0EDE8]`.

- **Header**: `px-6 py-5 border-b border-[#1E1E1E]` — título **"Selección"** `font-serif text-lg tracking-wide` + contador derecha `text-xs text-[#555] tracking-widest uppercase` ("N piezas").
- **Empty**: `∅` `text-5xl font-serif text-[#222]` + "Selección vacía" (serif) + "AGREGA PIEZAS PARA COMENZAR" uppercase `text-[#555]`.
- **Items** (`px-6 py-4 divide-y divide-[#1A1A1A]`, cada item `flex gap-4 py-5`):
  - Thumb `h-20 w-16 bg-[#1A1A1A]` (retrato, sin radius).
  - Nombre `font-serif text-sm line-clamp-2`; variante como `CartVariantBadge` (dot de color 2.5 + valores) o texto `text-xs text-[#555]`.
  - Fila inferior: qty minimal SIN bordes — iconos Minus/Plus 3px `text-[#555] hover:text-[#C9A86C]`, valor `text-xs w-4 text-center`; derecha precio `text-[#C9A86C] text-sm font-semibold` + Trash2 `text-[#333] hover:text-[#555]`.
- **Footer** `px-6 py-5 border-t border-[#1E1E1E] space-y-5`:
  - "TOTAL" `text-xs text-[#555] tracking-widest uppercase` vs monto `font-serif text-xl text-[#C9A86C]`.
  - CTA: `w-full h-12 bg-[#C9A86C] text-[#0A0A0A] font-semibold text-sm rounded-sm hover:bg-[#D4B87A]` con MessageCircle — **"Enviar cotización por WhatsApp"** (loading: "Enviando...", `disabled:opacity-40`).
- **Checkout**: `trackEvent(slug,'CHECKOUT_START')` → `paymentProvider.checkout({items,total,currency,storeSlug})` (WhatsApp provider arma el mensaje) → `clearCart()` + cerrar.

---

## 6. Interacciones

- **Filtros**: search (nombre+descripción, case-insensitive) + categoría exclusiva ("Todos" default). Desktop: sidebar; mobile: tabs + search toggle inline.
- **Grid featured/pairs**: recalcula con cada filtro (useMemo).
- **Quick-add** en card: `preventDefault/stopPropagation` sobre el Link, estado `added` 1.8s, abre drawer.
- **Hovers**: imagen `scale-105` 700ms; botones share/add aparecen con fade+translate; `active:scale-[0.99]` en CTAs.
- **Wishlist** (solo PRO/BUSINESS): corazón rojo fill al activar, abre WishlistDrawer themeado con props `accent #C9A86C / bg #0A0A0A / item #111`.
- **Share**: `useShare` (navigator.share con fallback clipboard + check dorado 1.8s).
- Sin marquees ni scroll-effects: el drama lo ponen el header 65vh/70vh y los gradientes.

---

## 7. Demo data real

**Usar la demo store de ropa** (`igsotre-back/prisma/seeds/seed-ropa.ts`, store `noire-boutique`, moneda USD) — encaja 1:1 con el nicho. El grid alterna: 10 productos `featured:true` (fila completa 4/3) intercalados con pares.

| Producto | Precio | Compare | Cat | Featured | Fotos |
|---|---|---|---|---|---|
| Vestido Midi Satín | 98 | 130 | Mujer | ✦ | `/demo-assets/ropa/vestidoSatin.jpg`, `vestidoSatinB.jpg` |
| Blazer Oversize Estructurado | 128 | — | Mujer | ✦ | `blazerMujer.jpg`, `blazerMujerB.jpg` |
| Blusa de Seda Cuello V | 72 | — | Mujer | | `blusaSeda.jpg` |
| Pantalón Palazzo de Crepe | 88 | 110 | Mujer | ✦ | `pantalonPalazzo.jpg`, `pantalonPalazzoB.jpg` |
| Falda Midi Plisada | 68 | — | Mujer | | `faldaMidi.jpg` |
| Top Crop Punto Fino | 48 | — | Mujer | | `topCrop.jpg` |
| Abrigo Largo de Lana | 220 | 280 | Mujer | ✦ | `abrigoLana.jpg`, `abrigoLanaB.jpg` |
| Camisa de Lino Manga Larga | 78 | — | Hombre | ✦ | `camisaLino.jpg`, `camisaLinoB.jpg` |
| Blazer Slim Fit | 195 | — | Hombre | | `blazerHombre.jpg`, `blazerHombreB.jpg` |
| Pantalón Chino Slim | 72 | 92 | Hombre | ✦ | `pantalonChino.jpg` |
| Camiseta Premium Pima | 38 | — | Hombre | | `camisetaBasic.jpg` |
| Suéter de Lana Cuello Redondo | 98 | — | Hombre | | `sueterLana.jpg` |
| Bolso Hobo de Cuero | 165 | 210 | Accesorios | ✦ | `bolsoCuero.jpg`, `bolsoCueroB.jpg` |
| Cinturón de Cuero Trenzado | 54 | — | Accesorios | | `cinturonCuero.jpg` |
| Pañuelo de Seda Estampado | 62 | — | Accesorios | ✦ | `panueloSeda.jpg` |
| Sombrero de Fieltro | 89 | — | Accesorios | | `sombreroFieltro.jpg` |
| Lentes de Sol Acetato | 78 | — | Accesorios | | `lentesSol.jpg` |
| Botas de Cuero Altas | 185 | 240 | Calzado | ✦ | `botasCuero.jpg` |
| Jeans Mom Fit Tiro Alto | 72 | — | Denim | | `jeansMom.jpg` |
| Cárdigan Oversized | 128 | — | Tejidos | ✦ | `cardiganTejido.jpg` |
| Bikini Clásico Triángulo | 68 | — | Trajes de Baño | | `bikiniClasico.jpg` |
| Set de Anillos Minimalistas | 58 | 78 | Joyería | | `anillosSet.jpg` |

Categorías (8, con imagen): Mujer, Hombre, Accesorios, Calzado, Denim, Tejidos, Trajes de Baño, Joyería.
Todos con atributos Talla (text) + Color (color con `optionsMeta.hex`) y variantes generadas (2 colores × 3 tallas).

**Seed actual (`demoFashion('noir','Noir')`)**: usa 4 productos genéricos de Unsplash (Vestido Lino Sahara $89, Top Origami $64, Jean Wide Leg $72, +1) y cats Vestidos/Tops/Pantalones/Accesorios — sirve de placeholder pero conviene migrar el `demoDataJson` de noir a un subconjunto de seed-ropa (con `/demo-assets/ropa/*`) para que el preview muestre el grid featured/pares como el legacy.

---

## 8. Diff vs staging actual

Estado hoy (`page-builder.seed.ts` L1362 `noirTemplate` + renderer genérico):

- **Tokens seed** ✅ cercanos: `bg #0A0A0A, surface #161616, secondary/accent #C9A86C, text #F0EDE8, border #1A1A1A, muted #7a7268`, `headingFont 'Source Serif 4'`, radius sm, buttonStyle outline. OK como base (muted legacy real es la escala #888/#666/#555).
- **Renderer** ❌: noir NO está en `THEME_RENDERERS` (solo persona) → lo dibuja el catálogo genérico `TemplateRenderer` con NavBar estándar, hero banner, featured grid, product_grid uniforme, stats, socials, footer. Se pierde TODO lo distintivo:
  - Header cinemático 65vh con overlays multicapa y identidad flotada.
  - Sidebar desktop sticky con categorías verticales y botón carrito dorado.
  - Toolbar sticky con tabs uppercase + search inline + contador "piezas".
  - Grid editorial featured full-width (4/3) / pares (3/4) sin gap con bordes #141414 y hairlines doradas.
  - Card full-bleed con gradiente, quick-add circular on-hover, badge -% dorado, ✦ Destacado.
  - Cart bar sticky mobile con total.
- **Detail** ❌: la página de producto usa el genérico `product-page-client.tsx` (grid 1.1fr/1fr, imagen 1:1, botones de opción genéricos, "Más de {tienda}") — nada que ver con el detail noir (imagen 3/4 con overlay, thumbs con border-b dorado, hero 70vh mobile, CTA con total a la derecha, selectores dorados, ColorSwatch).
- **Cart** ❌: `cart-sheet.tsx` genérico (overlay + form nombre/teléfono/notas + "Pedir por WhatsApp") en vez del drawer "Selección" serif con qty minimal y "Enviar cotización por WhatsApp".
- **Demo data** ⚠️: `demoFashion('noir')` genérico Unsplash; sin flags featured → el grid alternado no se luce.
- Stats/section seed ("+120 Piezas exclusivas / 8 Colecciones / 4.9★") no existe en el legacy — decisión nueva del seed; mantenerla como sección opcional debajo del grid.

---

## 9. Plan de port

**Nivel 2 — renderer custom** (patrón `themes/persona/`): crear `components/storefront-v2/themes/noir/index.tsx` y registrar `noir: NoirRenderer` en `themes/registry.tsx`. El sistema de secciones no puede expresar el grid editorial ni el layout sidebar/cinemático → custom obligatorio.

### Contrato

- Recibe `TemplateRendererProps` completo. Colores SIEMPRE desde tokens: oro = `var(--bl-accent)` (=`--bl-secondary`), fondo = `var(--bl-background)`, texto = `var(--bl-text)`, bordes = `var(--bl-border)`, surface = `var(--bl-surface)`, muted = `var(--bl-text-muted)`. Los grises intermedios (#555/#888/#333) se derivan con `color-mix(in srgb, var(--bl-text) X%, var(--bl-background))` — así los presets `noir-calido` / `noir-contraste` siguen funcionando.
- Serif desde `var(--bl-heading-font)` (el seed ya trae Source Serif 4); cargar con `googleFontsHref` como hace persona.
- **Container queries, nunca @media**: `containerName: bl-noir`; breakpoint sidebar⇄cinemático en `@container bl-noir (min-width: 1024px)` (y stack del detail en 760px).
- Cards: `<a href={productHref(p)}>` cuando existe; fallback `onOpenProduct(p)` como botón (previews/editor). Quick-add usa `useCart` directo (mismo provider global).
- Carrito: el botón dorado del sidebar, el icono del header y la cart bar mobile llaman `onOpenCart` y pintan `cartCount`; NO abrir sheets propios desde el renderer de página.
- Editor: envolver cada bloque con el patrón `editorWrap` de persona (`data-section-key`, outline `var(--brand)`, tag uppercase).

### Mapeo de secciones (respetar orden/visibilidad del árbol)

| Sección seed | Bloque noir |
|---|---|
| `hero_main` | Header cinemático (mobile) / cover+identidad del sidebar (desktop). `props.image` → cover; kicker/headline/subheadline sobre el hero. |
| `featured_main` | Define qué productos van full-width en el grid (además del flag featured). |
| `product_grid_main` | Toolbar sticky (tabs categorías + search + contador) + grid featured/pares. `showPrice` respetado. |
| `stats_main` | Strip de stats bajo la identidad (números `--bl-text`, labels muted, separadores 1px). |
| `socials_bar`, `footer_main` | **Delegar a `SectionRenderer`** (commodity, como hace persona). |

### Detail y cart propios

- El detail vive en `product-page-client.tsx` (único, genérico, comentario en L38-41 anticipa "un tema custom podrá traer la suya"). Extender ese punto: registro paralelo `THEME_PRODUCT_PAGES` / `THEME_CART_SHEETS` keyed por `theme.template` en `themes/registry.tsx`, con fallback al genérico. Implementar `themes/noir/product-page.tsx` (sección 4, tokens + container `bl-noir-pd`) y `themes/noir/cart-sheet.tsx` (sección 5) reutilizando `useCart` + `paymentProvider.checkout` idéntico al genérico. `PreviewProductSheet` puede quedar genérico (solo previews), pero idealmente skinnearlo con los mismos tokens.
- Variantes: el modelo nuevo expone `variants[].combination` (sin `attributes[].optionsMeta`); el ColorSwatch se reconstruye detectando eje "Color" y mapeando hex conocidos, o se agrega optionsMeta al payload público (cambio backend menor — anotar como dependencia).
- Wishlist: NO portar (no existe en storefront-v2); omitir corazones hasta que exista la feature.
- Demo data: actualizar `demoDataJson` de noir a productos seed-ropa con `featured` flags para que el preview muestre el grid alternado.
