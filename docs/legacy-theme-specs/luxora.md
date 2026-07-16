# Spec legacy — Tema LUXORA

Fuente de verdad: rama `rebrand/bylink-domain-swap` — `components/templates/luxora/{index,product-card,product-detail,cart-drawer}.tsx` + `components/templates/shared/` + `components/store-page-client.tsx`. Spec suficiente para reconstruir pixel-perfect sin volver al legacy.

> A diferencia de Vitrina (tokens semánticos), Luxora **hardcodea toda su paleta con hex arbitrarios** (`bg-[#FAFAF8]`, `text-[#1A1A1A]`…). La paleta de `template-data.ts` dice `accent #2563EB` (azul) — **falso**: el acento real es el negro `#1A1A1A`. Tema monocromo.

---

## 1. Identidad visual

| Rol | Hex | Uso exacto |
|---|---|---|
| Fondo página | **#FAFAF8** | wrapper, toolbar sticky (`/95` con blur), barra móvil (`/90`) — terminal bg del store-page-client |
| Ink / acento | **#1A1A1A** | texto principal, botones sólidos, pills activas, badge SALE, hover `#333` |
| Texto secundario | **#666** | bio, categorías inactivas, descripción |
| Muted | **#999** | username, placeholders, iconos, compare price, labels de variantes |
| Muted extra | **#BBB** / **#CCC** | labels "CATEGORÍAS", iconos empty state, trash del carrito, opciones agotadas |
| Superficie | **#F0F0EC** | inputs, pills inactivas, hover de iconos, opciones de variante |
| Fondo imagen | **#EFEFEB** | placeholder de imágenes de producto (card y galería) |
| Bordes | **#EAEAE6** (sidebar/topbar) · **#E5E5E0** (cart, steppers, avatar) · **#EBEBEB** (divisores hairline y toolbar móvil) | |
| Cart drawer | **#FFFFFF** (bg) · **#F5F5F0** (chips, img placeholder, empty circle) | el carrito es blanco puro, no #FAFAF8 |
| Wishlist item | **#F4F4F0** | prop `itemBgClass` del WishlistDrawer |
| Success | **#22c55e** | estado "Agregado" del CTA del detalle |
| Rojo wishlist | `red-500` #EF4444 | fill de corazones + badges contador |
| Dots inactivos | **#DDD** (hover **#BBB**) | indicador de galería móvil |

- **Tipografía**: Inter (la del app). Jerarquía por peso: **`font-black` (900)** para nombre de tienda y títulos de producto, `font-bold` precios/totales, `font-semibold` botones/nombres/pills, `font-medium` de apoyo. Tracking: `tracking-tight` en headline móvil, `tracking-wider`/`tracking-widest` en labels uppercase.
- **Radius**: `rounded-xl` (16px con `--radius: 0.75rem`) en inputs/iconos/categorías/steppers/thumbnails; `rounded-2xl` en imágenes de producto, CTAs grandes y barra móvil; `rounded-full` en pills, badges, quick-add, stepper del carrito.
- **Sombras**: `shadow-xl shadow-black/10` (botones negros del index), `shadow-xl shadow-black/5` (CTA detalle), `shadow-md` (quick-add), `shadow-sm` (controles flotantes sobre imagen), `drop-shadow-sm/md` (iconos y título sobre cover).
- **Tono**: minimal editorial monocromo, mucho aire (`gap-y-6` en grid), botones negros de gran radio, feedback táctil `active:scale-[0.99]` / `active:scale-90` / `active:scale-95` / `active:scale-98`.
- Formato precio: `Intl.NumberFormat('es-AR', { style:'currency', currency, minimumFractionDigits: 0 })`.

## 2. Estructura de página (index)

Wrapper: `<div class="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">` → `<div class="lg:flex lg:max-w-7xl lg:mx-auto">`. Breakpoint de layout: **lg**. Móvil centrado `max-w-lg mx-auto`.

### 2.1 Sidebar desktop (`hidden lg:flex`)
```
aside.lg:flex-col lg:w-72 xl:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen
     lg:overflow-y-auto lg:border-r lg:border-[#EAEAE6] lg:p-7 lg:gap-6
```
1. **Identidad**: con cover → `rounded-2xl overflow-hidden aspect-video` con overlay `bg-gradient-to-t from-black/50 to-transparent` y nombre `text-xl font-black text-white` abajo (`bottom-3 left-3 right-3`); sin cover → fila avatar `w-12 h-12 rounded-full border border-[#E5E5E0]` + nombre `text-xl font-black` + username `text-xs text-[#999]`.
2. Bio `text-sm text-[#666] leading-relaxed -mt-2`.
3. Instagram como **link de texto** (no botón): `flex items-center gap-2 text-sm text-[#999] hover:text-[#1A1A1A] -mt-2` con `Instagram h-4 w-4` + "Instagram".
4. **Search**: `<input>` nativo `w-full h-9 pl-8 pr-3 bg-[#F0F0EC] rounded-xl text-sm placeholder:text-[#999] outline-none`, icono `Search h-3.5 w-3.5 text-[#999]`, botón X al escribir.
5. **Categorías**: label `text-[10px] font-semibold text-[#BBB] uppercase tracking-wider mb-1`; botones `text-left px-3 py-2 rounded-xl text-sm font-semibold`; activa `bg-[#1A1A1A] text-white`; inactiva `text-[#666] hover:text-[#1A1A1A] hover:bg-[#F0F0EC]`; gap `gap-0.5`.
6. **Fondo** (`mt-auto flex flex-col gap-2`): Favoritos `h-10 border border-[#EAEAE6] rounded-xl font-semibold text-sm hover:bg-[#F0F0EC]` + badge rojo; Carrito `h-12 bg-[#1A1A1A] text-white rounded-xl font-semibold text-sm hover:bg-[#333] shadow-xl shadow-black/10` con texto ``totalItems > 0 ? `Ver carrito · ${fmt(totalPrice)}` : 'Carrito vacío'`` + badge blanco (`bg-white text-[#1A1A1A]`).

### 2.2 Header móvil (`lg:hidden`)
- **Con cover**: `h-64 w-full` imagen full-bleed + `bg-gradient-to-t from-black/60 via-black/10 to-transparent`; IG flotante top-right `w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50` con icono blanco; abajo (`bottom-5 left-5 right-5`) nombre `text-3xl font-black text-white tracking-tight drop-shadow-md` + bio `text-white/80 text-sm mt-1 line-clamp-2 drop-shadow-sm`.
- **Sin cover**: `bg-[#FAFAF8] pt-10 px-5 pb-4` — avatar 12×12 + nombre `text-2xl font-black` + username, IG `ml-auto` como icono, bio `text-sm text-[#666] mt-3`.

### 2.3 Toolbar móvil sticky (`lg:hidden`)
`sticky top-0 z-10 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#EBEBEB] px-5 py-3`:
- **Modo normal**: izquierda contador `text-lg font-black` `{filtered.length}` + `<span class="font-medium text-[#999]">productos|{categoría}</span>`; derecha 3 iconos `w-9 h-9 rounded-xl hover:bg-[#F0F0EC]`: wishlist (Heart `text-[#999]`, fill rojo + badge si count>0), **search toggle** (abre input), carrito (ShoppingBag `text-[#1A1A1A]` + badge `bg-[#1A1A1A] text-white` en `-top-0.5 -right-0.5`).
- **Modo búsqueda** (`showSearch`): input autoFocus (mismo estilo que sidebar) + X que cierra Y limpia.
- Debajo siempre: `ScrollArea` de pills `mt-2`: `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold`; activa `bg-[#1A1A1A] text-white`; inactiva `bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A]`.

### 2.4 Top bar desktop
`hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#EAEAE6]` — `<span class="font-bold text-[#1A1A1A]">{filtered.length}</span> productos` en `text-sm text-[#999]`.

### 2.5 Grid
`main.px-5 py-5 lg:px-8 lg:py-6` → `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 pb-28 lg:pb-8`.
**Empty state**: círculo `w-14 h-14 rounded-full bg-[#F0F0EC]` + `Search text-[#BBB]`; "Sin resultados" `font-bold`; "Probá otra búsqueda" `text-sm text-[#999]`.

### 2.6 Barra de carrito móvil (solo `totalItems > 0`)
`fixed bottom-0 inset-x-0 px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md lg:hidden` (**sin** border-t, a diferencia de Vitrina) → botón `w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-semibold flex items-center px-5 gap-3 shadow-xl shadow-black/10 hover:bg-[#333] active:scale-[0.99] max-w-lg mx-auto`: chip `bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full` count | "Ver carrito" `flex-1 text-left text-sm` | total `font-bold text-sm`.

Al final: `<LuxoraCartDrawer />` y `<WishlistDrawer accent="#1A1A1A" bgClass="bg-[#FAFAF8]" textClass="text-[#1A1A1A]" mutedClass="text-[#999]" borderClass="border-[#EAEAE6]" itemBgClass="bg-[#F4F4F0]" cartBtnClass="bg-[#1A1A1A] text-white hover:bg-[#333]" />`.

## 3. Product card (`LuxoraProductCard`)

Card **sin borde ni fondo** (`group flex flex-col gap-2`), imagen protagonista. Envuelta en `<Link>` si hay slug.

- **Imagen**: `relative aspect-square rounded-2xl overflow-hidden bg-[#EFEFEB]`; `img object-cover transition-transform duration-500 group-hover:scale-105`.
- **Acciones top-right** (`top-2.5 right-2.5 flex flex-col gap-1.5`) — iconos "desnudos" sobre la foto, sin círculo:
  - Wishlist: `Heart h-5 w-5 drop-shadow-sm text-white/80` (wishlisted → `fill-red-500 text-red-500 strokeWidth 0`); botón `transition-transform active:scale-90`.
  - Share (hover-only, si slug): `Share2 h-4 w-4 drop-shadow-sm text-white/80 strokeWidth 1.5` → copiado: `Check h-4 w-4 text-[#1A1A1A] bg-white rounded-full p-0.5`.
- **Badge SALE** (si compare > price): `absolute top-2.5 left-2.5 bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full` con texto fijo **"SALE"** (sin %).
- **Agotado**: overlay `bg-white/70 backdrop-blur-sm rounded-2xl` + `text-xs font-semibold text-[#1A1A1A] tracking-widest uppercase` "Agotado".
- **Quick-add flotante** (solo inStock): `absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full shadow-md`; reposo `bg-white/90 text-[#1A1A1A] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0`; added → `bg-[#1A1A1A] text-white scale-110`; `Plus/Check h-3.5 w-3.5 strokeWidth 2.5`; `transition-all duration-300`. Abre el cart drawer y `added` 1800ms.
- **Info** (`px-0.5`): nombre `text-sm font-semibold line-clamp-1 leading-snug`; fila `gap-1.5 mt-0.5`: precio `text-sm font-bold text-[#1A1A1A]` + compare `text-xs text-[#999] line-through`. **Sin categoría ni botón visible** — todo minimal.

## 4. Product detail PROPIO (`LuxoraProductDetail`)

**Abre como PÁGINA** `/{storeSlug}/{productSlug}` (via `ProductDetailRenderer`). Monta su `LuxoraCartDrawer` + `WishlistDrawer` themeado.

### Desktop
1. **Top bar** `hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#EAEAE6] max-w-6xl mx-auto`: "← Volver a la tienda" (`text-sm text-[#999] hover:text-[#1A1A1A]`); derecha: wishlist y share `w-9 h-9 rounded-xl hover:bg-[#F0F0EC]`, carrito `h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-[#333]` con chip contador `bg-white/20`.
2. **Dos columnas** `grid grid-cols-2 gap-16 max-w-6xl mx-auto px-8 py-10 items-start`:
   - **Galería**: principal `rounded-2xl overflow-hidden bg-[#EFEFEB] aspect-square`; badge SALE `top-3 left-3 px-2.5 py-1`; overlay Agotado blanco. Thumbnails `w-16 h-16 rounded-xl`; activa `border-2 border-[#1A1A1A] opacity-100`; resto `border-transparent opacity-50 hover:opacity-80`.
   - **Info** (`space-y-6 py-2`): `h1 text-3xl font-black leading-tight`; precio `text-2xl font-bold` + compare `text-base text-[#999] line-through` (`mt-3`); categoría **debajo del precio** `text-xs text-[#999] mt-1`; **divisor hairline** `h-px bg-[#EBEBEB]`; selectores de variantes (§4.1); **cantidad**: stepper unido `inline-flex items-center border border-[#E5E5E0] rounded-xl overflow-hidden` con botones `w-10 h-10 text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC]` y valor `w-10 text-center text-sm font-bold`; divisor; **descripción acordeón**: fila `Descripción` `text-sm font-bold` + Chevron `text-[#999]`, contenido **oculto por completo** hasta abrir (sin line-clamp, a diferencia de Vitrina); **CTA**:
```html
<button class="w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-between px-6
               shadow-xl shadow-black/5 transition-all active:scale-[0.99]
               {added ? 'bg-[#22c55e] text-white' : canAdd ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                : 'bg-[#E5E5E0] text-[#999] cursor-not-allowed'}">
  <span>Agregar al carrito | Agregado</span><span class="font-bold">{fmt(finalPrice * quantity)}</span>
</button>
```

### Mobile (`lg:hidden max-w-lg mx-auto`)
1. **Top bar sticky** `sticky top-0 z-20 px-5 py-3 bg-[#FAFAF8]/95 backdrop-blur-md` (**sin border-b**): back como icono `ArrowLeft h-5 w-5` en botón `w-9 h-9 rounded-xl`; derecha wishlist/share/carrito (carrito con badge negro `-top-1 -right-1`).
2. **Imagen principal** `px-5 pt-1` → `rounded-2xl bg-[#EFEFEB] aspect-square` con: overlay Agotado, SALE pill, **wishlist flotante** `top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-90`, y si hay >1 imagen **flechas prev/next** `left-2|right-2 top-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white active:scale-95` (`ChevronLeft/Right h-4 w-4`, navegación circular).
3. **Dots indicadores** (no thumbnails): `flex justify-center gap-1.5 py-3`; activo `w-5 h-2 bg-[#1A1A1A] rounded-full` (pastilla), inactivo `w-2 h-2 bg-[#DDD] hover:bg-[#BBB]`, `transition-all duration-300`.
4. **Contenido** `px-5 pt-2 pb-36 space-y-5`: `h1 text-2xl font-black`; precio `text-xl font-bold` + compare; categoría; divisores + variantes + cantidad + descripción (igual que desktop).
5. **CTA fija** `fixed bottom-0 inset-x-0 max-w-lg mx-auto px-5 pb-6 pt-3 bg-[#FAFAF8]/90 backdrop-blur-md z-20` con el mismo botón h-14.

### 4.1 Selectores de variantes
Por atributo `role === 'variant'` (orden `sortOrder`), bloque `space-y-2.5`:
- Label `text-xs font-semibold text-[#999] uppercase tracking-wider` + valor elegido `text-[#1A1A1A] ml-1 normal-case font-bold` (sin guión, a diferencia de Vitrina).
- `color` → `ColorSwatch` shared (círculo 32px, ring doble al hex, raya roja si agotado, label 10px).
- Texto → **pills redondas**: `px-4 py-2 rounded-full text-sm font-semibold`; seleccionada `bg-[#1A1A1A] text-white`; disponible `bg-[#F0F0EC] text-[#666] hover:text-[#1A1A1A] hover:bg-[#E5E5E0]`; agotada `bg-[#F0F0EC]/50 text-[#CCC] line-through cursor-not-allowed`.

### 4.2 Lógica
Idéntica a Vitrina (selectedVariant por combination, `finalPrice = price + priceAdjustment`, swap de galería por `optionsMeta[color].images`, `canAdd` requiere todos los ejes elegidos, `id = {productId}-{optionsKey}`, `variantDetails` con colorHex) **con una diferencia clave**: `handleAdd` hace `for (let i = 0; i < quantity; i++) addItem(...)` — **sí agrega la cantidad elegida** (Vitrina no). `isOnSale = comparePrice > finalPrice`. Added 1800ms, abre el drawer.

## 5. Cart drawer PROPIO (`LuxoraCartDrawer`)

shadcn `Sheet`: `SheetContent class="flex flex-col w-full sm:max-w-md bg-white border-[#E5E5E0] p-0 text-[#1A1A1A]"` — **fondo blanco**, no #FAFAF8.
- **Header** `px-6 py-4 border-b border-[#E5E5E0]`: título **"Mi carrito"** `font-bold` (sin icono) + chip derecha `text-xs text-[#999] bg-[#F5F5F0] px-2 py-1 rounded-full` con `{items.length} artículo(s)` (solo si hay items).
- **Vacío**: círculo `w-16 h-16 rounded-full bg-[#F5F5F0]` + `ShoppingBag h-7 w-7 text-[#999]`; "Tu carrito está vacío" `font-semibold`; "Agrega productos para continuar" `text-sm text-[#999] mt-1`.
- **Items**: `ScrollArea flex-1 px-6 py-4` con `divide-y divide-[#F0F0EC]` (no space-y); línea `flex gap-3 py-4`:
  - Imagen `h-16 w-16 rounded-xl overflow-hidden bg-[#F5F5F0]`.
  - Fila nombre: `text-sm font-semibold line-clamp-1` + **trash arriba a la derecha** `text-[#CCC] hover:text-[#999]` (`Trash2 h-3.5 w-3.5`).
  - Variantes: `CartVariantBadge` en `text-[#999]` o fallback `text-xs text-[#999]`.
  - Fila inferior `flex items-center justify-between mt-2`: **stepper unido redondo** `border border-[#E5E5E0] rounded-full overflow-hidden` con botones `w-7 h-7 text-[#999] hover:text-[#1A1A1A]` (`Minus/Plus h-3 w-3`) y `span w-6 text-center text-xs font-semibold`; derecha **total de línea** `fmt(price * quantity)` en `text-sm font-bold` (Vitrina muestra unitario; Luxora muestra línea).
- **Footer** `px-6 py-5 border-t border-[#E5E5E0] space-y-4`: fila `Total` ambos `text-base font-bold`; botón `w-full h-12 bg-[#1A1A1A] text-white rounded-2xl text-sm font-semibold hover:bg-[#333] disabled:opacity-50 active:scale-98` con `MessageCircle h-4 w-4` → **"Enviar cotización por WhatsApp"** / "Enviando...".
- **Checkout**: `trackEvent('CHECKOUT_START')` → `paymentProvider.checkout(...)` → `clearCart()` + close (idéntico a Vitrina).

## 6. Interacciones

- **Search**: en desktop input permanente en sidebar; en móvil **toggle** — icono lupa expande input con `autoFocus`, X cierra y limpia. Filtra name+description.
- **Filtro categoría**: single-select "Todos" + categorías; el contador del toolbar refleja `filtered.length` y el nombre de la categoría activa.
- **Wishlist plan-gated**: `plan === 'PRO' || 'BUSINESS'`. Al agregar abre el `WishlistDrawer` con las props monocromo (§2.6). Corazones sobre foto sin círculo (card) / con círculo blanco (detalle móvil) / icono en toolbar.
- **Contadores**: badges `w-4 h-4 rounded-full text-[9px] font-bold` — rojo wishlist, `bg-[#1A1A1A] text-white` carrito sobre fondo claro, `bg-white text-[#1A1A1A]` sobre botón negro; chips `bg-white/20` dentro de botones negros.
- **FAB**: no hay FAB circular; equivalentes = quick-add hover de la card + barra inferior fija móvil.
- **Animaciones**: `active:scale-[0.99]/-90/-95/-98` en todo lo presionable; zoom foto `duration-500 scale-105`; quick-add `translate-y-1 → 0` + fade `duration-300`; dots `duration-300`; added 1800ms; share copied 2000ms; **sin** framer-motion.
- **Galería móvil**: flechas circulares + navegación circular + dots (sin swipe gestures en el legacy).

## 7. Demo data real — tienda de ropa (`prisma/seeds/seed-ropa.ts`)

La misma tienda demo para ambos temas. **Noire Boutique** — slug `noire-boutique` (demo: `demo-noire-boutique`), login `ropa@example.com` / `password123`.
- Bio: *"Cápsulas editoriales en satín, lana y seda. Piezas pensadas para usarse, no para guardarse. Envíos a todo el país."*
- Logo `/demo-assets/ropa/logo.jpg` · Banner `/demo-assets/ropa/banner.jpg` · IG `noire.boutique` · WhatsApp `+584147654321` · email `hola@noireboutique.com` · currency USD (`$`, `es-VE`) · plan **PRO** · `stockEnabled` · template default del seed `rosier` (cambiar para probar Luxora).

**Categorías**: Mujer, Hombre, Accesorios, Calzado, Denim, Tejidos, Trajes de Baño, Joyería (orden 1–8, cada una con imagen de su producto insignia).

**Productos (22)** — fotos en `/demo-assets/ropa/`; ★ featured; compare ⇒ SALE:

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
| 13 | Bolso Hobo de Cuero ★ | $165 | $210 | Accesorios | Color: Negro, Camel, Chocolate (solo color ⇒ sin ProductVariant) | bolsoCuero.jpg, bolsoCueroB.jpg | 20 |
| 14 | Cinturón de Cuero Trenzado | $54 | — | Accesorios | Talla S–L · Color: Negro, Miel #C8984B, Coñac #8B4513 | cinturonCuero.jpg | 40 |
| 15 | Pañuelo de Seda Estampado ★ | $62 | — | Accesorios | Estampa (text): Clásico Floral, Geométrico, Marino | panueloSeda.jpg | 25 |
| 16 | Sombrero de Fieltro | $89 | — | Accesorios | Talla S–L · Color: Negro, Camel, Gris | sombreroFieltro.jpg | 18 |
| 17 | Lentes de Sol Acetato | $78 | — | Accesorios | Color: Negro Mate #2D2D2D, Carey #8B6914, Transparente #E0E0E0 | lentesSol.jpg | 35 |
| 18 | Botas de Cuero Altas ★ | $185 | $240 | Calzado | Talla 35–40 · Color: Negro, Coñac, Borgoña | botasCuero.jpg | 22 |
| 19 | Jeans Mom Fit Tiro Alto | $72 | — | Denim | Talla 24–32 · Lavado (color): Azul Medio #5A7BA8, Azul Oscuro #1F3355, Negro | jeansMom.jpg | 48 |
| 20 | Cárdigan Oversized ★ | $128 | — | Tejidos | Talla S–L · Color: Crema #F0E6D2, Camel, Verde Musgo #4A5D23 | cardiganTejido.jpg | 30 |
| 21 | Bikini Clásico Triángulo | $68 | — | Trajes de Baño | Talla XS–L · Color: Negro, Marfil #F5EEDC, Rojo #A81E2C | bikiniClasico.jpg | 40 |
| 22 | Set de Anillos Minimalistas | $58 | $78 | Joyería | Talla 6–9 · Acabado (color): Plata #C0C0C0, Oro #D4A84B, Oro Rosa #E8A79A | anillosSet.jpg | 55 |

Variantes reales solo con color+Talla: 2 primeros colores × 3 primeras tallas, `priceAdjustment 0`, stock 3–12, `isAvailable` 90%.

## 8. Diff vs staging actual (`storefront-v2`)

Port actual = `TemplateRenderer` base + `page-builder.seed.ts:luxoraTemplate` (`planRequired PRO`, niche FASHION). Fallas:

1. **Tokens del seed**: `primary/accent #1A1A1A` ✓, `bg #fafaf8` ✓, `surface #F0F0EC` ✓, `border #EAEAE6` ✓; **mal**: `secondary #4a4a4a` (legacy usa #666 texto secundario), `muted #737373` (legacy es **#999**), `headingFont 'Manrope'` (legacy = Inter, jerarquía por peso 900), `radius: 'sm'` → 6px (legacy vive en 12–16px+full: debería ser `lg`), `buttonStyle: 'outline'` (los CTAs del legacy son **sólidos negros**; debería ser `solid`).
2. **Secciones**: seed = `hero + featured_products + product_grid + socials + footer`. El legacy **no tiene hero de marketing ni featured ni socials-bar ni footer**: es perfil (cover aspect-video en sidebar / cover h-64 móvil), toolbar con contador+search toggle, y un único grid. El NavBar genérico del renderer base no existe en el legacy.
3. **Cart genérico** (`cart-sheet.tsx`): overlay inline-styles con formulario y "Pedir por WhatsApp" ≠ drawer Luxora blanco con chip "N artículos", divide-y, stepper redondo unido, total por línea y "Enviar cotización por WhatsApp".
4. **Detail genérico** (`preview-product-sheet.tsx`): sheet neutro sin galería multi-imagen, sin dots/flechas, sin swatches de color con hex, sin acordeón de descripción, sin CTA negro justify-between con precio, sin estado verde "Agregado".
5. **Faltan**: search y toggle móvil, filtro por categoría, wishlist + drawer themeado monocromo, quick-add hover, badge SALE, compare price, overlay Agotado, barra inferior móvil, contador editorial "N productos", active:scale feedback.

## 9. Plan de port al sistema nuevo

**Nivel 2 — renderer custom**: registrar `luxora` en `THEME_RENDERERS` (`components/storefront-v2/themes/registry.tsx`), patrón `PersonaRenderer` (`themes/persona/index.tsx`).

**Mapeo de secciones** (orden/visibilidad/props del árbol del editor):
- `hero` → identidad: `props.image` = cover (aspect-video del sidebar en contenedor ancho; h-64 full-bleed en angosto); headline/kicker opcionales sobreescriben nombre/bio. `overlay` boolean del seed = gradiente negro.
- `featured_products` → si está visible, franja "destacados" arriba del grid (cards §3 filtradas por `productIds`/featured) — el legacy no la tenía, pero el seed la incluye: renderizarla con el mismo lenguaje de card.
- `product_grid` → grid 2/3/4 + toolbar (contador, search, pills) con card §3; respetar `layout` y `showPrice`.
- `categories` (si se añade al schema) → alimenta pills/lista; `socials`/`footer`/resto → delegar a `SectionRenderer` base.

**Tokens — todo `var(--bl-*)`, cero hex**: `#1A1A1A`→`--bl-primary` (=`--bl-text` en el preset monocromo), `#FAFAF8`→`--bl-background`, `#F0F0EC`→`--bl-surface`, `#EFEFEB`→`color-mix(in srgb, var(--bl-surface) 60%, var(--bl-background))` (o `--bl-surface` directo), `#666`→`--bl-secondary`, `#999`→`--bl-text-muted`, `#EAEAE6/#E5E5E0/#EBEBEB`→`--bl-border` (variar con `color-mix` para el hairline), carrito blanco→`--bl-surface`-elevado o blanco derivado, hover `#333`→`color-mix(in srgb, var(--bl-primary) 85%, white)`, success #22c55e→fijo o `--bl-accent`. Radii sobre `var(--bl-radius)` (xl=radius, 2xl=radius+4, pills=999). **Corregir el seed**: `secondary #666`, `muted #999`, `headingFont Inter`, `radius lg`, `buttonStyle solid`.

**Responsive**: container queries sobre `bl-store` (**nunca `@media`**); sidebar a partir de ≈1024px de ancho del contenedor; toolbar sticky y barra inferior operan dentro del contenedor.

**Contrato `TemplateRendererProps`**: cards `<a href={productHref(p)}>` (fallback `onOpenProduct`); botones de carrito → `onOpenCart()` + `cartCount` (para "Ver carrito · $total" hace falta `cartTotal` en el contrato o mostrar solo count); precios via `priceCtx`/`rate`; editor: `editorSelectedKey`/`onSectionClick` con el `editorWrap` de Persona.

**Cart/detail propios**: mismos slots nuevos que Vitrina (`THEME_CART_SHEETS` / `THEME_PRODUCT_DETAILS` consumidos por `storefront-client.tsx` y `product-page-client.tsx`):
- `LuxoraCartSheet`: port §5 tokenizado; conservar el formulario nombre/teléfono/notas del sistema nuevo estilizado en monocromo (inputs `--bl-surface`, rounded-xl).
- `LuxoraProductDetail`: port §4 completo (galería con dots+flechas en angosto / thumbnails en ancho, swatches por `optionsMeta.hex`, acordeón, CTA negro justify-between, add en loop por qty). Verificar que la API pública de producto exponga `attributes` + `optionsMeta` (hex/images) como el legacy `ProductDetail`.
- Wishlist plan-gated: portar `WishlistDrawer` como shared tokenizado (las props de color del legacy se vuelven innecesarias: lee `--bl-*`).
