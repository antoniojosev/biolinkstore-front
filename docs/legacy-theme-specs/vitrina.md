# Spec legacy — Tema VITRINA

Fuente de verdad: rama `rebrand/bylink-domain-swap` — `components/templates/vitrina/{index,product-card,product-detail,cart-drawer}.tsx` + `components/templates/shared/` + `app/globals.css` + `components/store-page-client.tsx`. Esta spec basta para reconstruir el tema pixel-perfect sin volver al legacy.

> **OJO**: la paleta de `template-data.ts` (`bg #0d1a2d / accent #2dd4bf`, "diseño oscuro con acentos teal") está **desactualizada**. El Vitrina real renderiza con el theme claro ByLink de `app/globals.css` (no hay clase `.dark` en la ruta de tienda; `store-page-client.tsx` define `TEMPLATE_BG.vitrina = '#FAFAF7'`).

---

## 1. Identidad visual

Vitrina es el único tema que usa **tokens semánticos shadcn** (`bg-background`, `text-primary`, `bg-muted`…). Sus valores reales (`:root` de `app/globals.css` en la rama rebrand):

| Token semántico | Valor CSS | Hex aprox | Uso en el tema |
|---|---|---|---|
| `background` | `oklch(0.985 0.002 90)` | **#FAFAF7** (warm off-white) | fondo de página, overlays `bg-background/70..95` |
| `foreground` | `oklch(0.2 0.02 250)` | ≈ #1B2431 (navy oscuro) | texto principal |
| `card` | `oklch(1 0 0)` | **#FFFFFF** | fondo de card y del cart drawer |
| `primary` | `oklch(0.52 0.11 235)` | **#0F6BA8** (turquesa profundo) | precio, botones, badges de descuento, categoría activa |
| `primary-foreground` | `oklch(1 0 0)` | #FFFFFF | texto sobre primary |
| `secondary` | `oklch(0.96 0.02 230)` | **#E7F2FA** (turquesa muy claro) | badge "Destacado", botones qty (variant secondary) |
| `muted` | `oklch(0.97 0.003 90)` | **#F5F5F2** | inputs de búsqueda, pills, fondos de imagen, empty states |
| `muted-foreground` | `oklch(0.55 0.01 250)` | ≈ #6E7680 | texto secundario, iconos |
| `accent` | `oklch(0.7 0.19 30)` | **#FF6B4A** (coral) | tercer color del glow del avatar |
| `border` | `oklch(0.92 0.004 90)` | ≈ #E8E7E3 (warm gray) | bordes (casi siempre con opacidad: `/30`, `/40`, `/50`) |
| `destructive` | `oklch(0.577 0.245 27.3)` | ≈ #DC3E2B | hover del trash en carrito |
| `--radius` | `0.75rem` | — | `rounded-lg`=12px, `rounded-xl`=16px (`--radius-xl = radius+4px`), `rounded-2xl`=16px, `rounded-md`=10px |

Extras fijos (no tokenizados en el legacy):
- **Rojo wishlist**: `red-500` (`#EF4444`) — fill del corazón y badge contador.
- **Gradiente glow del avatar**: `bg-gradient-to-br from-primary via-secondary to-accent` con `opacity-60 blur-sm` en un div `absolute -inset-1 rounded-full` detrás del avatar.
- **`gradient-background`** (fallback del cover móvil cuando no hay `coverImage`): `linear-gradient(131deg, #33b380, #327be2, #6ee490, #595f73); background-size: 240% 240%; animation: gradient-animation 40s ease infinite` (definido en `main`/`staging_bylink` globals; la rama rebrand lo usa pero perdió la regla — portar la definición).
- **Fuente**: Inter (weights 400/500/700/800) para todo — `--font-sans: "Inter", system-ui, sans-serif`. No hay serif ni display.
- **Sombras**: `shadow-lg shadow-primary/20` en CTAs principales; `hover:shadow-lg hover:shadow-primary/5` en cards; `shadow-sm shadow-primary/30` en pill de categoría activa.
- **Tono**: catálogo moderno y limpio, luminoso, con acento turquesa; micro-detalle "premium" en el glow multicolor del avatar. Formato de precio: `Intl.NumberFormat('es-AR', { style:'currency', currency, minimumFractionDigits: 0 })`.

## 2. Estructura de página (index)

Wrapper: `<div class="min-h-screen bg-background">` → `<div class="lg:flex lg:max-w-7xl lg:mx-auto">`. Breakpoint único de layout: **lg (1024px)**. En móvil el contenido se centra con `max-w-lg mx-auto`.

### 2.1 Sidebar desktop (`hidden lg:flex`)
```
aside.lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen
     lg:overflow-y-auto lg:border-r lg:border-border/50 lg:p-6 lg:gap-6
```
Orden interno:
1. **Perfil** (centrado): avatar `w-20 h-20 rounded-full border-2 border-background object-cover` con glow gradiente detrás; `h1 text-lg font-bold`; username `text-xs text-muted-foreground mt-0.5`; bio `text-xs text-foreground/60 mt-2 leading-relaxed`; fila con botón Instagram (`Button variant=outline size=sm`, `gap-1.5 bg-transparent h-8 text-xs`, icono `Instagram h-3.5 w-3.5`, texto "Seguir") + pill `{products.length} productos` (`text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full`).
2. **Search**: `Input` shadcn `pl-9 pr-9 bg-muted border-transparent h-9 text-sm`, icono `Search h-4 w-4` absoluto izq., botón `X` para limpiar cuando hay texto.
3. **Categorías verticales**: label `text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1` "Categorías"; cada botón `text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200`; activo `bg-primary/10 text-primary`, inactivo `text-muted-foreground hover:text-foreground hover:bg-muted`.
4. **Botones al fondo** (`mt-auto flex flex-col gap-2`): "Favoritos" (`Button variant=outline w-full gap-2`, badge rojo contador `absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full`) solo si `wishlistEnabled`; botón carrito `Button w-full gap-2 shadow-lg shadow-primary/20` con texto dinámico ``totalItems > 0 ? `Ver carrito · ${fmt(totalPrice)}` : 'Carrito vacío'`` y badge blanco contador (`bg-white text-primary`).

### 2.2 Header móvil (`lg:hidden`)
- Cover `h-32 w-full overflow-hidden` con `coverImage` (object-cover) o fallback `gradient-background opacity-80`; encima `bg-gradient-to-b from-transparent via-transparent to-background` (funde el cover con la página).
- Bloque perfil `px-4 pb-4 -mt-10` centrado: avatar 20×20 con glow (idéntico al sidebar), `h1 text-xl font-bold`, username `text-sm`, bio `text-sm text-foreground/70 max-w-xs mt-2`, fila Instagram + pill contador (idéntico al sidebar pero `mt-3`).

### 2.3 Filtros móviles sticky (`lg:hidden`)
`sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-2 space-y-2`:
- Fila 1: search (igual que sidebar, placeholder "Buscar productos...") + botón wishlist `w-9 h-9 rounded-xl hover:bg-muted` (corazón `fill-red-500` si count>0, `strokeWidth 0`, badge contador).
- Fila 2: `ScrollArea` horizontal de pills: `shrink-0 rounded-full px-3 py-1 text-xs font-medium`; activa `bg-primary text-primary-foreground shadow-sm shadow-primary/30`; inactiva `bg-muted text-muted-foreground hover:text-foreground`. Primera pill = "Todos".

### 2.4 Top bar desktop
`hidden lg:flex items-center justify-between px-8 py-4 border-b border-border/30` — texto `<b>{filtered.length}</b> productos` (o nombre de categoría en minúscula).

### 2.5 Grid de productos
`main.px-4 py-4 lg:px-8 lg:py-6` → `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 pb-28 lg:pb-8` (el `pb-28` móvil deja aire para la barra fija de carrito).
**Empty state**: círculo `w-14 h-14 rounded-full bg-muted` con `Search h-6 w-6`, "Sin resultados" (`font-medium`), "Probá con otra búsqueda o categoría" (`text-sm text-muted-foreground`), todo en `py-16 text-center gap-3`.

### 2.6 Barra de carrito móvil fija (solo si `totalItems > 0`)
`fixed bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden` → `Button w-full h-13 text-base gap-3 shadow-lg shadow-primary/20 max-w-lg mx-auto flex`: icono ShoppingBag + chip contador `bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full` | "Ver carrito" (`flex-1 text-left`) | total `font-bold`.

Debajo de todo se monta `<VitrinaCartDrawer />` y `<WishlistDrawer />` (defaults, sin props de color). Fuera del template, `store-page-client` añade el badge "Creado con ByLink" centrado.

## 3. Product card (`VitrinaProductCard`)

Card completa envuelta en `<Link href={/{storeSlug}/{productSlug}}>` si hay slug (conserva `?preview=`).

```html
<div class="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border/50
            hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
```
- **Imagen**: `relative aspect-square overflow-hidden bg-muted`; `img absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-107` (escala 1.07 — clase custom).
- **Badges top-left** (`absolute top-2 left-2 flex flex-col gap-1`): descuento `Badge bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5` con texto `-{round((compare-price)/compare*100)}%`; `featured` → `Badge variant=secondary text-[10px] px-1.5 py-0.5` "Destacado".
- **Acciones top-right** (`absolute top-2 right-2 flex flex-col gap-1.5`):
  - Wishlist (si plan y slug): `w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground`; `Heart h-3.5 w-3.5`, wishlisted → `fill-red-500 text-red-500 strokeWidth=0`. Al agregar abre el WishlistDrawer.
  - Share (si slug): mismo círculo pero `opacity-0 group-hover:opacity-100`; `Share2 h-3.5 w-3.5` → `Check text-primary strokeWidth=2.5` 2s tras copiar.
- **Agotado**: overlay `absolute inset-0 bg-background/75 backdrop-blur-sm` centrado con `text-xs font-medium text-muted-foreground tracking-wider uppercase` "Agotado".
- **Info** (`flex flex-col gap-2 p-3`): categoría `text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-0.5`; nombre `text-sm font-medium leading-snug line-clamp-2`; fila final `flex items-end justify-between gap-1 mt-auto` → precio `font-bold text-primary leading-none` + compare `text-[11px] text-muted-foreground line-through leading-tight` debajo; botón add `Button size=icon h-8 w-8 rounded-lg` `Plus h-4 w-4 strokeWidth 2.5` → `Check` 1800ms; `disabled={!inStock}`.
- **handleAdd**: `preventDefault/stopPropagation`, `addItem({id, productId, name, price, image})`, abre el cart drawer, `added` 1800ms.

## 4. Product detail PROPIO (`VitrinaProductDetail`)

**Cómo abre: PÁGINA propia** `/{storeSlug}/{productSlug}` (route `app/[slug]/[productSlug]/page.tsx` → `ProductDetailRenderer` → componente por template). No es sheet ni modal. Monta su propio `VitrinaCartDrawer` + `WishlistDrawer`.

### Desktop (`hidden lg:*`)
1. **Top bar** `flex items-center justify-between px-8 py-4 border-b border-border/30 max-w-6xl mx-auto`: link "← Volver a la tienda" (`text-sm text-muted-foreground hover:text-foreground`, conserva `?preview=`); derecha: botón wishlist `w-9 h-9 rounded-xl hover:bg-muted` (Heart, fill rojo si wishlisted), botón share (Share2→Check text-primary), botón carrito `h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90` con texto "Carrito" + chip `bg-white/20 text-xs font-bold px-1.5 rounded-full` contador.
2. **Layout 2 columnas** `grid grid-cols-2 gap-16 max-w-6xl mx-auto px-8 py-10 items-start`:
   - **Izquierda — galería**: imagen principal `rounded-2xl overflow-hidden bg-muted aspect-square`, `img object-cover transition-opacity duration-500`; overlay Agotado (`bg-background/75`, texto `text-sm`); badges descuento/Destacado `top-3 left-3` (iguales a card). Thumbnails `flex gap-2 overflow-x-auto pb-1`: botones `w-16 h-16 rounded-lg overflow-hidden`; seleccionado `border-2 border-primary opacity-100`, resto `border-2 border-transparent opacity-60 hover:opacity-100`.
   - **Derecha — info** (`space-y-6 py-2`): categoría `text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1`; `h1 text-3xl font-bold leading-tight`; fila precio `text-2xl font-bold text-primary` + compare `text-base text-muted-foreground line-through`; **selectores de variantes** (ver 4.1); **cantidad** (label `text-xs uppercase tracking-wider text-muted-foreground font-medium`; stepper: `Button variant=secondary size=icon h-9 w-9 rounded-lg` Minus/Plus + `span w-10 text-center text-sm font-medium`); **descripción** colapsable: botón label "Descripción" con ChevronDown/Up `h-3.5 w-3.5`, párrafo `text-sm text-foreground/70 leading-relaxed`, colapsado = `line-clamp-3` (siempre visible parcialmente); **CTA** `Button w-full h-12 text-base gap-3 shadow-lg shadow-primary/20`: normal → `ShoppingBag h-5 w-5` + "Agregar al carrito" (`flex-1 text-left`) + `fmt(finalPrice * quantity)` en `font-bold`; added → `Check` + "Agregado"; `disabled={!canAdd}`.

### Mobile (`lg:hidden max-w-lg mx-auto`)
1. **Nav sticky** `sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/40`: "← Volver" + iconos wishlist/share/carrito `w-9 h-9 rounded-xl` (el del carrito con badge `bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full` en `-top-1 -right-1`).
2. **Galería**: `px-4 pt-2` → `aspect-[4/5] overflow-hidden bg-muted rounded-2xl` (¡ratio 4:5 en móvil, cuadrado en desktop!) con overlay Agotado y badges; thumbnails `w-14 h-14` en `px-4 py-3`.
3. **Info**: `bg-card p-5 pb-36 space-y-5` (mismo contenido que desktop; `h1 text-xl`).
4. **CTA fija**: `fixed bottom-0 inset-x-0 max-w-lg mx-auto p-4 bg-background/80 backdrop-blur-lg border-t border-border z-20` con el mismo Button `h-13`.

### 4.1 Selectores de variantes (compartido desktop/móvil)
Por cada atributo `role === 'variant'` ordenado por `sortOrder`:
- Label: `text-xs uppercase tracking-wider text-muted-foreground font-medium` con el valor elegido appendeado `— {valor}` en `text-foreground normal-case`.
- Tipo `color` → `ColorSwatch` (shared): círculo 32px del hex, seleccionado con doble ring `0 0 0 2px #fff, 0 0 0 4px {hex}`, no disponible `opacity-30` + raya roja diagonal 45°, label `text-[10px]` debajo.
- Tipo texto → botones `px-3 py-1.5 rounded-lg text-sm font-medium`: seleccionado `bg-primary text-primary-foreground shadow-sm`; disponible `bg-muted text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-foreground`; agotado `bg-muted/50 text-muted-foreground/40 line-through cursor-not-allowed`.
- Disponibilidad: `variants.some(v => v.combination[attr] === option && v.isAvailable)`.

### 4.2 Lógica
- `selectedVariant` = variante cuya `combination` matchea todas las `selectedOptions`; `finalPrice = price + priceAdjustment`.
- Elegir un color con `optionsMeta[option].images` **reemplaza la galería completa** (`colorImages`) y resetea a la imagen 0; si la variante matcheada tiene `image` presente en la galería, selecciona ese índice.
- `canAdd = inStock && (sin atributos variant || todos seleccionados)`.
- `addItem` con `id = {productId}-{optionsKey}` (optionsKey = valores ordenados por nombre de atributo unidos con `-`), `variant` = label "Attr: Val, ...", `variantDetails` = [{attribute, value, type, colorHex}].
- ⚠️ **Quirk legacy**: en Vitrina el CTA muestra `finalPrice * quantity` pero `addItem` se llama **una sola vez** (agrega qty=1); Luxora sí hace loop por `quantity`. Decidir en el port: replicar fiel o corregir (recomendado: loop como Luxora).

## 5. Cart drawer PROPIO (`VitrinaCartDrawer`)

shadcn `Sheet` (side right por defecto): `SheetContent class="flex flex-col w-full sm:max-w-md bg-card border-border p-0"`.
- **Header**: `px-6 py-4 border-b border-border`; `SheetTitle` con `ShoppingBag h-5 w-5 text-primary` + "Tu carrito".
- **Vacío**: centrado flex-1; círculo `w-16 h-16 rounded-full bg-muted` con `ShoppingBag h-7 w-7 text-muted-foreground`; "Tu carrito está vacío" (`font-medium`) + "Agrega productos para hacer tu cotización" (`text-sm text-muted-foreground mt-1`).
- **Items**: `ScrollArea flex-1 px-6 py-4`, `space-y-4`; cada línea `flex gap-3`:
  - Imagen `h-18 w-18 rounded-lg overflow-hidden bg-muted` (72px).
  - Nombre `text-sm font-medium line-clamp-1`; variantes: `CartVariantBadge` (dot de color 2.5×2.5 + valor; texto `Attr: Val` para no-color) o fallback `text-xs text-muted-foreground`; precio unitario `text-sm font-bold text-primary mt-0.5`.
  - Controles `flex items-center gap-1.5 mt-2`: `Button variant=secondary size=icon h-6 w-6 rounded-md` Minus/Plus (`h-3 w-3`), `span text-sm w-5 text-center` qty, y `Button variant=ghost h-6 w-6 ml-auto text-muted-foreground hover:text-destructive` con `Trash2 h-3.5 w-3.5`.
- **Footer**: `px-6 py-4 border-t border-border space-y-3`; fila `Total` (`text-muted-foreground text-sm`) vs monto `font-bold text-lg`; botón `Button w-full h-12 text-base gap-2` con `MessageCircle h-5 w-5` → **"Enviar cotización por WhatsApp"** / "Enviando..." mientras `loading`.
- **Checkout**: `trackEvent(slug, 'CHECKOUT_START')` → `paymentProvider.checkout({items, total, currency, storeSlug})` (WhatsAppPaymentProvider arma el mensaje) → `clearCart()` + cerrar.

## 6. Interacciones

- **Search**: filtra por `name` y `description` (lowercase includes), en vivo. Botón X limpia.
- **Filtro de categoría**: single-select, "Todos" + `categories.map(c => c.name)`; matchea `p.categories.includes(selectedCategory)`.
- **Wishlist (plan-gated)**: `wishlistEnabled = plan === 'PRO' || plan === 'BUSINESS'`. Toggle desde card/detail; al agregar (no al quitar) abre `WishlistDrawer` (shared, defaults: accent `#33b380`). Drawer: header Heart + contador pill; items en `bg-card rounded-xl p-2.5` con imagen 16×16, X para quitar, precio en accent, botón "Agregar" al carrito.
- **Contadores**: badges `w-4 h-4 rounded-full text-[9px] font-bold` — rojo (`bg-red-500 text-white`) para wishlist, blanco (`bg-white text-primary`) sobre botón primary del carrito, `bg-primary text-primary-foreground` sobre iconos neutros.
- **"FAB"**: no hay FAB flotante circular; el equivalente móvil es la **barra inferior fija** de carrito (§2.6) que solo aparece con items.
- **Animaciones**: `transition-all duration-200/300` generalizado; zoom imagen `duration-500 scale-107`; feedback "added" 1800ms (Plus→Check); share copied 2000ms; fade de imagen del detalle `transition-opacity duration-500`. Sin framer-motion.
- **Share**: `useShare` — `navigator.share({title, url})` con fallback `clipboard.writeText` + estado `copied`.
- **Tracking**: `PAGE_VIEW` al montar la tienda, `CHECKOUT_START` al iniciar checkout.

## 7. Demo data real — tienda de ropa (`prisma/seeds/seed-ropa.ts`)

**Tienda**: **Noire Boutique** — slug `noire-boutique` (modo demo: `demo-noire-boutique`, user `isDemo`), login `ropa@example.com` / `password123` (demo: `demo-ropa@example.com`).
- Bio/description: *"Cápsulas editoriales en satín, lana y seda. Piezas pensadas para usarse, no para guardarse. Envíos a todo el país."*
- Logo `/demo-assets/ropa/logo.jpg` · Banner `/demo-assets/ropa/banner.jpg` · IG `noire.boutique` · WhatsApp `+584147654321` · email `hola@noireboutique.com`
- `primaryColor #c8334c`, `secondaryColor #1a1413`, template default del seed: `rosier` (cambiar a vitrina/luxora para probar) · currency `{code USD, symbol $, locale es-VE}` · plan **PRO** activo · `stockEnabled` · `showBranding`.

**Categorías** (con imagen): 1 Mujer (vestidoSatin), 2 Hombre (camisaLino), 3 Accesorios (bolsoCuero), 4 Calzado (botasCuero), 5 Denim (jeansMom), 6 Tejidos (cardiganTejido), 7 Trajes de Baño (bikiniClasico), 8 Joyería (anillosSet).

**Productos (22)** — todas las fotos en `/demo-assets/ropa/`; `compare` ⇒ `isOnSale`; ★ = featured; SKU `NB-001..NB-022` por orden:

| # | Producto | Precio | Compare | Cat | Variantes (attrs) | Fotos | Stock |
|---|---|---|---|---|---|---|---|
| 1 | Vestido Midi Satín ★ | $98 | $130 | Mujer | Talla XS–XL · Color: Negro #1A1413, Champagne #E8D4A8, Borgoña #6B1F2E | vestidoSatin.jpg, vestidoSatinB.jpg | 45 |
| 2 | Blazer Oversize Estructurado ★ | $128 | — | Mujer | Talla XS–L · Color: Negro, Crema #F1E4CF, Camel #C49A6C | blazerMujer.jpg, blazerMujerB.jpg | 28 |
| 3 | Blusa de Seda Cuello V | $72 | — | Mujer | Talla XS–L · Color: Marfil #F1E4CF, Negro, Rosa Seco #C89B9B | blusaSeda.jpg | 52 |
| 4 | Pantalón Palazzo de Crepe ★ | $88 | $110 | Mujer | Talla XS–XL · Color: Negro, Beige #D4C5A9, Chocolate #5B3A29 | pantalonPalazzo.jpg, pantalonPalazzoB.jpg | 40 |
| 5 | Falda Midi Plisada | $68 | — | Mujer | Talla XS–L · Color: Esmeralda #2E4A3C, Negro, Marfil | faldaMidi.jpg | 35 |
| 6 | Top Crop Punto Fino | $48 | — | Mujer | Talla XS–L · Color: Negro, Blanco #FAFAFA, Rojo #9B2237 | topCrop.jpg | 60 |
| 7 | Abrigo Largo de Lana ★ | $220 | $280 | Mujer | Talla S–XL · Color: Camel, Negro, Gris #7A7A7A | abrigoLana.jpg, abrigoLanaB.jpg | 18 |
| 8 | Camisa de Lino Manga Larga ★ | $78 | — | Hombre | Talla S–XXL · Color: Blanco, Azul Claro #A3C4D9, Arena #D4C5A9 | camisaLino.jpg, camisaLinoB.jpg | 55 |
| 9 | Blazer Slim Fit | $195 | — | Hombre | Talla 46–54 · Color: Azul Marino #1E2F4A, Gris #4A4A4A, Negro | blazerHombre.jpg, blazerHombreB.jpg | 22 |
| 10 | Pantalón Chino Slim ★ | $72 | $92 | Hombre | Talla 30–38 · Color: Beige, Azul Marino, Verde Oliva #556B2F, Negro | pantalonChino.jpg | 48 |
| 11 | Camiseta Premium Pima | $38 | — | Hombre | Talla S–XXL · Color: Blanco, Negro, Gris Melange #8A8A8A, Verde Botella #2E4A3C | camisetaBasic.jpg | 80 |
| 12 | Suéter de Lana Cuello Redondo | $98 | — | Hombre | Talla S–XL · Color: Camel, Negro, Azul Marino, Gris | sueterLana.jpg | 32 |
| 13 | Bolso Hobo de Cuero ★ | $165 | $210 | Accesorios | Color: Negro, Camel, Chocolate (sin talla ⇒ **sin variants**) | bolsoCuero.jpg, bolsoCueroB.jpg | 20 |
| 14 | Cinturón de Cuero Trenzado | $54 | — | Accesorios | Talla S–L · Color: Negro, Miel #C8984B, Coñac #8B4513 | cinturonCuero.jpg | 40 |
| 15 | Pañuelo de Seda Estampado ★ | $62 | — | Accesorios | Estampa (text): Clásico Floral, Geométrico, Marino | panueloSeda.jpg | 25 |
| 16 | Sombrero de Fieltro | $89 | — | Accesorios | Talla S–L · Color: Negro, Camel, Gris | sombreroFieltro.jpg | 18 |
| 17 | Lentes de Sol Acetato | $78 | — | Accesorios | Color: Negro Mate #2D2D2D, Carey #8B6914, Transparente #E0E0E0 | lentesSol.jpg | 35 |
| 18 | Botas de Cuero Altas ★ | $185 | $240 | Calzado | Talla 35–40 · Color: Negro, Coñac, Borgoña | botasCuero.jpg | 22 |
| 19 | Jeans Mom Fit Tiro Alto | $72 | — | Denim | Talla 24–32 · Lavado (color): Azul Medio #5A7BA8, Azul Oscuro #1F3355, Negro | jeansMom.jpg | 48 |
| 20 | Cárdigan Oversized ★ | $128 | — | Tejidos | Talla S–L · Color: Crema #F0E6D2, Camel, Verde Musgo #4A5D23 | cardiganTejido.jpg | 30 |
| 21 | Bikini Clásico Triángulo | $68 | — | Trajes de Baño | Talla XS–L · Color: Negro, Marfil #F5EEDC, Rojo #A81E2C | bikiniClasico.jpg | 40 |
| 22 | Set de Anillos Minimalistas | $58 | $78 | Joyería | Talla 6–9 · Acabado (color): Plata #C0C0C0, Oro #D4A84B, Oro Rosa #E8A79A | anillosSet.jpg | 55 |

**ProductVariant** generadas solo cuando hay color + atributo "Talla": primeras **2 colores × 3 tallas** por producto, `priceAdjustment 0`, stock aleatorio 3–12, `isAvailable` 90%. Descripciones completas en el seed (usarlas tal cual).

## 8. Diff vs staging actual (`storefront-v2`)

Port actual = `TemplateRenderer` genérico + tokens del seed `page-builder.seed.ts:vitrinaTemplate`. Problemas:

1. **Tokens del seed — casi correctos, con 3 fallas**: palette ✓ (`primary #0F6BA8`, `secondary #E7F2FA`, `accent #FF6B4A`, `bg #FAFAF7`, `surface #ffffff`, `border #e8e8e4`); pero `headingFont: 'Manrope'` (el legacy es **Inter para todo**), `text: '#1f2937'` (legacy ≈ #1B2431, aceptable), `radius: 'md'` → 10px (legacy trabaja a 12–16px: `rounded-xl` en cards; mejor `lg` = 16px). `muted #64748b` ok (≈ #6E7680).
2. **Secciones del seed no reflejan el layout real**: seed = `hero_main + categories_strip + product_grid_main + socials_bar + footer_main`. El legacy **no tiene hero, ni strip de categorías como sección, ni socials bar, ni footer**: tiene sidebar de perfil (desktop) / header con cover (móvil), filtros sticky con search + pills, y grid. El `NavBar` genérico sticky del renderer base tampoco existe en el legacy.
3. **Cart genérico**: `template/cart-sheet.tsx` (overlay + inline styles, formulario nombre/teléfono/notas, botón "Pedir por WhatsApp") ≠ drawer Vitrina (shadcn Sheet `bg-card`, título con icono primary, qty steppers `secondary`, "Enviar cotización por WhatsApp", **sin formulario**).
4. **Detail genérico**: `preview-product-sheet.tsx` es un sheet lateral neutro solo-preview; el Vitrina real es **página** con galería + thumbnails, swatches de color con hex, swap de galería por color, descripción colapsable, CTA con precio total, top bar con wishlist/share/carrito, y barra CTA fija en móvil.
5. **Faltan por completo**: búsqueda, filtro por categoría interactivo, wishlist (plan-gated) + WishlistDrawer, contadores badge, barra inferior móvil de carrito, badges de descuento/Destacado, compare price, overlay Agotado, quick-add en card, glow del avatar, share.

## 9. Plan de port al sistema nuevo

**Nivel 2 — renderer custom** (registrar `vitrina` en `THEME_RENDERERS` de `components/storefront-v2/themes/registry.tsx`, patrón `PersonaRenderer`). El layout sidebar+filtros+grid no es expresable con el catálogo de secciones base.

**Mapeo de secciones** (respetar orden/visibilidad/props del árbol):
- `hero` → header de perfil: `props.image` = cover (móvil h-32 con fade, y opcionalmente cover del sidebar); kicker/headline/subheadline pueden sobreescribir name/bio si están definidos; fallback cover = gradiente animado (portar la regla `gradient-background` con colores derivados de tokens o fija).
- `categories` → alimenta el filtro (sidebar vertical en contenedor ancho, pills horizontales en angosto). Si la sección está oculta, ocultar el filtro.
- `product_grid` → grid 2/3/4 col con la card §3; respetar `props.layout` (`grid-2..4`), `showPrice`, `filterByCategory`.
- `socials`, `footer`, `about`, etc. → **delegar a `SectionRenderer`** base (como hace Persona).

**Tokens** (nada hardcodeado; todo `var(--bl-*)`): `background`→`--bl-background`, `card`→`--bl-surface` (con seed `surface #ffffff` queda blanco como legacy), `primary`→`--bl-primary`, `primary-foreground`→`#fff` fijo o derivado, `muted` (fondos)→mezcla `color-mix(in srgb, var(--bl-surface), var(--bl-background))` o `--bl-surface`, `muted-foreground`→`--bl-text-muted`, `border/50`→`color-mix(in srgb, var(--bl-border) 50%, transparent)`, `foreground`→`--bl-text`, radii→`var(--bl-radius)` (+4px para 2xl), fuente única→`--bl-body-font`. Corregir el seed: `headingFont: 'Inter'`, `radius: 'lg'`.

**Responsive**: container queries sobre `containerName: bl-store` (regla del framework, **nunca `@media`**); breakpoint del sidebar ≈ `@container bl-store (min-width: 1024px)`; el sticky de filtros y la barra inferior funcionan igual dentro del contenedor.

**Contrato** (`TemplateRendererProps`): cards como `<a href={productHref(p)}>` cuando existe, si no `onOpenProduct(p)` (previews); botón carrito del sidebar/barra móvil → `onOpenCart()` + `cartCount` (el sistema no expone `totalPrice` al renderer — o se muestra solo el count, o se extiende el contrato con `cartTotal`); conversión de precio vía `priceCtx`/`rate` como el renderer base.

**Cart/detail propios del tema**: exige extender el registro a tres slots por tema — `renderer`, `cartSheet`, `productDetail`:
- `storefront-client.tsx` monta hoy `CartSheet` genérico → debe consultar `THEME_CART_SHEETS[template]` y montar `VitrinaCartSheet` (port de §5 con vars `--bl-*`, mantener "Enviar cotización por WhatsApp"; decidir si se conserva el formulario nombre/teléfono/notas del sistema nuevo — recomendado conservarlo, estilizado al tema).
- `product-page-client.tsx` → `THEME_PRODUCT_DETAILS[template]` con el port de §4 (misma data `TemplateProduct` + variants; swatches color leyendo `optionsMeta.hex` si el API los expone — verificar que la API pública de producto incluya `attributes/optionsMeta` como el legacy `ProductDetail`).
- Wishlist: plan-gated en el nuevo sistema; portar `WishlistDrawer` tokenizado como shared de storefront-v2 (o diferir y feature-flag).
