# Spec fiel — Tema legacy `menu` (restaurante)

> Fuente: `components/templates/menu/` en rama `rebrand/bylink-domain-swap`
> (extraída a scratchpad `legacy/rebrand_bylink-domain-swap/menu/`:
> `index.tsx` 245 líneas, `product-card.tsx` 111, `product-detail.tsx` 357,
> `cart-drawer.tsx` 149) + `shared/cart-variant-badge.tsx` +
> `product-detail-renderer.tsx`.
> Objetivo: reconstrucción pixel-perfect en storefront-v2 con carrito y
> detalle PROPIOS del tema.

---

## 1. Identidad visual

### Paleta (hex exactos, hardcodeados en el legacy vía `style={{}}`)

| Rol | Hex | Uso |
|---|---|---|
| Fondo página | `#FFF8F0` | body, sticky bars, cart drawer, detail |
| Borde cálido | `#E8DDD3` | borde avatar, borders de sticky bars/drawer |
| Primario (ámbar quemado) | `#B45309` | tab activa, botón +, barra pedido, precios destacados, CTA, badge contador, outline focus |
| Éxito (added) | `#16a34a` | botón + tras agregar (check verde) |
| Fondo sticky bottom | `rgba(255,248,240,0.85)` + `backdrop-blur-lg` | barra de pedido (index y detail) |
| Fondo sticky nav detail | `rgba(255,248,240,0.95)` + `backdrop-blur-md` | topbar del detalle |

Grises = escala Tailwind estándar (el legacy usa clases): `text-gray-900`
(#111827), `text-gray-600` (#4B5563), `text-gray-500` (#6B7280),
`text-gray-400` (#9CA3AF), `text-gray-300` (#D1D5DB), `bg-gray-100`
(#F3F4F6), `border-gray-200` (#E5E7EB), superficie de cards `bg-white`
(#FFFFFF), hover destructivo `hover:text-red-500` (#EF4444). Focus del
input de búsqueda: `focus-visible:ring-amber-500/30`.

### Tipografía
- **No define fuente propia**: hereda la del app legacy (Inter / system-ui).
  Pesos usados: `font-medium`, `font-semibold`, `font-bold`.
- Jerarquía: h1 tienda `text-xl font-bold`; h2 categoría `text-lg font-bold`;
  nombre plato card `text-sm font-semibold`; título detail `text-2xl font-bold`.

### Formato de precio
```ts
new Intl.NumberFormat('es-AR', { style: 'currency', currency: store.currency, minimumFractionDigits: 0 }).format(n)
```
Sin decimales, locale `es-AR` (ej. `$ 1.100`). En la barra de pedido vacía
muestra literal `'$0'`.

### Radios y sombras recurrentes
- Cards: `rounded-2xl` + `border border-gray-100` + `shadow-sm hover:shadow-md`.
- Avatar tienda: `rounded-2xl`, imagen `w-16 h-16`, `border-2` color `#E8DDD3`, `shadow-sm`.
- Pills de categoría: `rounded-full`. Inputs/botones: `rounded-xl`. Botón + circular: `rounded-full w-8 h-8 shadow-md`.
- Barra de pedido: `rounded-2xl shadow-lg`.

---

## 2. Estructura de página (index)

Orden vertical exacto:

1. **Header restaurante** — `header.relative.px-4.pt-6.pb-4.sm:px-6`, wrapper
   `max-w-2xl mx-auto`, fila `flex items-center gap-4`:
   - Avatar `img.w-16.h-16.rounded-2xl.object-cover.border-2.shadow-sm`
     (`borderColor:'#E8DDD3'`, fallback `/placeholder.svg`).
   - Columna: `h1.text-xl.font-bold.text-gray-900.truncate` (nombre),
     `p.text-sm.text-gray-500.line-clamp-1.mt-0.5` (bio), y fila de metadatos
     `flex items-center gap-3 mt-1.5 text-xs text-gray-500` con dos spans
     fijos: `<MapPin h-3 w-3/> Delivery disponible` y `<Clock h-3 w-3/> Abierto ahora`
     (textos hardcodeados, iconos lucide).

2. **Sticky search + tabs** — `div.sticky.top-0.z-10.border-b.px-4.pt-3.pb-0.sm:px-6`
   con `backgroundColor:'#FFF8F0'` y `borderColor:'#E8DDD3'`; interior
   `max-w-2xl mx-auto space-y-3`:
   - **Search**: `Input` shadcn `pl-9 pr-9 h-10 text-sm rounded-xl border-gray-200 bg-white focus-visible:ring-amber-500/30`,
     placeholder `"Buscar en el menú..."`, icono `Search h-4 w-4 text-gray-400`
     absoluto a la izquierda, botón `X h-4 w-4` a la derecha solo si hay texto.
   - **Tabs de categoría**: `ScrollArea` horizontal, fila `flex gap-1 pb-3`.
     Cada tab: `shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200`;
     activa → `text-white shadow-sm` + `backgroundColor:'#B45309'`;
     inactiva → `text-gray-600 hover:text-gray-900 bg-white border border-gray-200`.

3. **Main / carta agrupada por categoría** — `main.px-4.sm:px-6.pb-32` +
   `max-w-2xl mx-auto`. Por cada categoría visible:
   ```tsx
   <div ref={...} data-category={cat} className="pt-6" style={{ scrollMarginTop: '140px' }}>
     <h2 className="text-lg font-bold text-gray-900 mb-3">{cat}</h2>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">…cards…</div>
   </div>
   ```
   - Agrupación: itera `categories` en orden; filtra productos por
     `p.category === cat` y por búsqueda (match en `name` o `description`,
     case-insensitive). Categorías sin resultados se ocultan. Productos sin
     categoría (o con categoría desconocida) van a un grupo extra **"Otros"** al final.
   - **Empty state** (búsqueda sin resultados): columna centrada `py-16`,
     círculo `w-14 h-14 rounded-full bg-white` con `Search h-6 w-6 text-gray-400`,
     `"Sin resultados"` (font-medium gray-900) + `"Probá con otra búsqueda"` (text-sm gray-500).

4. **Barra de pedido persistente** (siempre visible, ES el trigger del carrito):
   ```tsx
   <div className="fixed bottom-0 inset-x-0 p-4 border-t backdrop-blur-lg z-20"
        style={{ backgroundColor: 'rgba(255,248,240,0.85)', borderColor: '#E8DDD3' }}>
     <button onClick={() => setIsOpen(true)}
       className="w-full max-w-2xl mx-auto h-13 flex items-center justify-between px-5 rounded-2xl text-white text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
       style={{ backgroundColor: '#B45309' }}>
   ```
   Contenido: izquierda `ShoppingBag h-5 w-5` + (si `totalItems>0`) badge
   `bg-white/20 text-sm font-bold px-2 py-0.5 rounded-full` con el count;
   centro texto `totalItems > 0 ? 'Ver pedido' : 'Tu pedido'`; derecha
   `font-bold` con `totalItems > 0 ? fmt(totalPrice) : '$0'`.
   El `pb-32` del main evita que tape la última fila.

5. `<MenuCartDrawer />` montado al final.

Nota: el tema **no tiene navbar genérica, ni footer, ni secciones hero/about** —
es una carta pura.

---

## 3. Product card (`MenuProductCard`)

Layout horizontal info-izquierda / foto-derecha (estilo Rappi/PedidosYa):

```tsx
<div className="group flex gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
  {/* Info izquierda */}
  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{name}</h3>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">{description}</p>
    <div className="flex items-center gap-2 mt-2">
      <span className="font-bold text-gray-900">{fmt(price)}</span>
    </div>
  </div>
  {/* Foto + botón agregar derecha */}
  <div className="relative shrink-0">
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100">
      <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      {/* overlay agotado */}
    </div>
    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: added ? '#16a34a' : '#B45309' }}>
      {added ? <Check h-4 w-4 strokeWidth={2.5}/> : <Plus h-4 w-4 strokeWidth={2.5}/>}
    </button>
  </div>
</div>
```

Comportamiento:
- **Quick-add**: el botón + agrega directo al carrito (sin variantes, precio
  base, `image = images[0] ?? image ?? '/placeholder.svg'`), hace
  `e.preventDefault(); e.stopPropagation()` para no navegar, abre el drawer
  (`setIsOpen(true)`), muestra check verde 1800 ms. No agrega si `!inStock`.
- **Agotado**: overlay `absolute inset-0 bg-white/75 flex items-center justify-center rounded-xl`
  con `span.text-[10px].font-medium.text-gray-500.uppercase.tracking-wider` "Agotado".
- **Navegación**: si `product.slug` existe, toda la card se envuelve en
  `<Link href={/${store.slug}/${product.slug}} className="block">` (propaga
  `?preview=` si está en la URL). Sin slug → card sin link.
- aria-label del botón: `"Agregar al pedido"`.

---

## 4. Product detail PROPIO (`MenuProductDetail`)

Página completa (no sheet), fondo `#FFF8F0`, `min-h-screen`:

1. **Sticky nav** — `sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md`,
   bg `rgba(255,248,240,0.95)`, borde `#E8DDD3`:
   - Izq: `Link` back con `ArrowLeft h-4 w-4` + texto `"Menú"`
     (`text-sm text-gray-500 hover:text-gray-900`), href `/${store.slug}` (+preview).
   - Der: botón carrito `w-9 h-9 rounded-xl hover:bg-white/80 text-gray-500`
     con `ShoppingBag h-4 w-4` y badge contador
     `absolute -top-1 -right-1 text-white text-[9px] font-bold w-4 h-4 rounded-full`
     bg `#B45309` (solo si `totalItems>0`). Abre el drawer.

2. **Hero image** — wrapper `max-w-2xl mx-auto`; imagen
   `relative aspect-[4/3] overflow-hidden bg-gray-100`, `img.object-cover`.
   Sin stock → overlay `bg-white/75` con "No disponible"
   (`text-sm font-medium text-gray-500 uppercase tracking-wider`).

3. **Thumbnails** (solo si `images.length > 1`) — `flex gap-2 px-4 py-3 overflow-x-auto`,
   `role="tablist"` aria-label "Imágenes del plato". Cada thumb:
   `shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2`; activa
   `opacity-100` + `borderColor:'#B45309'`; inactiva
   `opacity-60 hover:opacity-100 border-transparent`. `role="tab"`,
   `aria-selected`, aria-label "Ver imagen N de M".

4. **Detalles** — `px-4 py-5 pb-36 space-y-5`:
   - Categoría: `text-xs text-gray-400 uppercase tracking-wider mb-1`.
   - Título: `h1.text-2xl.font-bold.text-gray-900.leading-tight`.
   - Precio: `text-2xl font-bold` color `#B45309`, muestra
     `finalPrice = price + (selectedVariant?.priceAdjustment ?? 0)`.
   - **Selectores de variante** (attrs con `role === 'variant'`, ordenados por
     `sortOrder`): label `text-xs uppercase tracking-wider text-gray-500 font-medium`
     con el valor elegido appendeado (`— {valor}` en gray-900). Opciones en
     `flex flex-wrap gap-2`, cada botón
     `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-[#B45309]`:
     seleccionado → `text-white shadow-sm` bg `#B45309`; disponible →
     `bg-white text-gray-600 border border-gray-200 hover:border-[#B45309]/50 hover:text-gray-900`;
     no disponible → `bg-gray-100 text-gray-300 line-through cursor-not-allowed` + disabled.
     Disponibilidad: existe variant con esa opción y `isAvailable`.
     `aria-pressed`, aria-label `"{attr}: {opt}[ — no disponible]"`.
   - **Cantidad**: label idem; stepper `flex items-center gap-1` con Buttons
     shadcn `variant="secondary" size="icon" h-9 w-9 rounded-lg`
     (Minus/Plus `h-3.5 w-3.5`), número `w-10 text-center text-sm font-medium tabular-nums`
     con `aria-live="polite"`. Mínimo 1, botón − disabled en 1.
   - **Descripción colapsable**: botón toggle
     `flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 font-medium hover:text-gray-900`
     "Descripción" + ChevronDown/Up `h-3.5 w-3.5`, `aria-expanded`/`aria-controls`;
     párrafo `text-sm text-gray-600 leading-relaxed transition-all duration-300`,
     colapsado con `line-clamp-3`.

5. **CTA fija inferior** — mismo contenedor que la barra del index
   (`fixed bottom-0 inset-x-0 p-4 border-t backdrop-blur-lg z-20`, bg
   `rgba(255,248,240,0.85)`, borde `#E8DDD3`):
   ```tsx
   <Button className="w-full max-w-2xl mx-auto h-12 text-base gap-3 text-white rounded-xl flex shadow-lg" style={{ backgroundColor: '#B45309' }} disabled={!canAdd}>
   ```
   Estados: agregado → `Check` + "Agregado" (1800 ms); normal →
   `ShoppingBag h-5 w-5` + texto flexible izq
   (`canAdd ? 'Agregar al pedido' : 'Selecciona las opciones'`) + derecha
   `font-bold tabular-nums` con `fmt(finalPrice * quantity)`.
   `canAdd = inStock && (sin attrs variant || todas seleccionadas)`.

Lógica de add (multi-cantidad + variantes):
- id compuesto `${product.id}-${optionsKey}` (opciones ordenadas
  alfabéticamente por attr, valores unidos con `-`); sin opciones → `product.id`.
- `variant` label `"Attr: valor, Attr2: valor2"`; `variantDetails[]` con
  `{attribute, value, type, colorHex?}` (colorHex desde `optionsMeta[opt].hex`
  si `type==='color'`).
- `image = selectedVariant?.image ?? images[0]`.
- Cantidad >1: `addItem` (mete 1) y luego `updateQuantity(id, baseQty + quantity)`
  donde baseQty es la cantidad previa del mismo id en el carrito.
- Al agregar abre el drawer.

6. `<MenuCartDrawer />` montado al final (el detail tiene su carrito accesible).

---

## 5. Cart drawer PROPIO (`MenuCartDrawer`) + barra de pedido

El carrito del tema tiene DOS piezas: la **barra de pedido persistente**
(sección 2.4 — el trigger, siempre visible con total en vivo) y el **drawer**:

Sheet shadcn lateral derecho: `SheetContent.flex.flex-col.w-full.sm:max-w-md.p-0`
con `backgroundColor:'#FFF8F0'`.

- **Header**: `px-6 py-4 border-b` (borde `#E8DDD3`), título
  `flex items-center gap-2` con `ShoppingBag h-5 w-5` color `#B45309` + "Tu pedido".
- **Vacío**: centrado, círculo `w-16 h-16 rounded-full bg-white` con
  `ShoppingBag h-7 w-7 text-gray-400`; "Tu pedido está vacío" (font-medium
  gray-900) + "Agrega platos del menú para hacer tu pedido" (text-sm gray-500).
- **Items** (`ScrollArea.flex-1.px-6.py-4`, lista `space-y-4`), cada item
  `flex gap-3 bg-white rounded-xl p-3`:
  - Imagen `h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-100` (object-cover).
  - Nombre `text-sm font-medium text-gray-900 line-clamp-1`.
  - Variantes: `CartVariantBadge` (chips `text-xs` con swatch circular
    `w-2.5 h-2.5 rounded-full` si `type==='color'`; texto `Attr: valor`) o
    fallback `item.variant` en `text-xs text-gray-500`.
  - Precio `text-sm font-bold mt-0.5` color `#B45309`.
  - Stepper: Buttons shadcn `variant="secondary" size="icon" h-6 w-6 rounded-md`
    (Minus/Plus `h-3 w-3`), qty `text-sm w-5 text-center`; a la derecha
    (`ml-auto`) trash `variant="ghost" h-6 w-6 text-gray-400 hover:text-red-500`
    (`Trash2 h-3.5 w-3.5`).
- **Footer**: `px-6 py-4 border-t space-y-3` (borde `#E8DDD3`); fila Total
  (`text-gray-500 text-sm` / `font-bold text-lg text-gray-900`); CTA:
  ```tsx
  <Button className="w-full h-12 text-base gap-2 text-white rounded-xl" style={{ backgroundColor: '#B45309' }}>
    <MessageCircle className="h-5 w-5" /> {loading ? 'Enviando...' : 'Hacer pedido por WhatsApp'}
  </Button>
  ```
- **Checkout**: `trackEvent(store.slug, 'CHECKOUT_START')` →
  `paymentProvider.checkout({ items: [{productId, variantId, name, price, quantity, image, variant}], total, currency, storeSlug })`
  → `clearCart()` → cierra.

---

## 6. Interacciones

- **Scroll-spy** (el sello del tema): `IntersectionObserver` sobre cada
  sección de categoría con `{ rootMargin: '-120px 0px -60% 0px', threshold: 0 }`;
  al intersectar setea `activeCategory` desde `data-category`. Guard
  `isScrollingTo` (ref) para no pelear con el scroll programático.
- **Click en tab** → `scrollToCategory`: setea activa,
  `el.scrollIntoView({ behavior: 'smooth', block: 'start' })`, flag
  `isScrollingTo = true` con `setTimeout 800ms`. Anclaje visual con
  `scrollMarginTop: '140px'` en cada sección (compensa header sticky).
- **Búsqueda** filtra en vivo (name+description) y recalcula categorías
  visibles; la categoría activa inicial es la primera visible.
- **Feedback "added"**: check verde 1800 ms en card y en CTA del detail.
- Microanimaciones: `hover:shadow-md` card, `group-hover:scale-105` foto
  (300 ms), `hover:scale-110 active:scale-95` botón +, `active:scale-[0.98]`
  barra de pedido, `hover:opacity-90` CTA. Todo `duration-200` salvo imagen.
- Al agregar desde cualquier punto se abre el drawer automáticamente.

---

## 7. Demo data real

Fuente canónica: `igsotre-back/prisma/seeds/seed-restaurant.ts` — tienda
**Brooklyn Burger House** (`brooklyn-burger-house` / demo:
`demo-brooklyn-burger-house`), bio "Hamburguesas smash, BBQ ribs, wings y
milkshakes. American grill hecho en casa. Pedidos por WhatsApp.", logo
`/demo-assets/restaurant/logo.jpg`, banner `/demo-assets/restaurant/banner.jpg`,
WhatsApp `+584121234567`, IG `brooklynburgerhouse`, currency
`{ code: 'USD', symbol: '$', locale: 'es-VE' }`, plan PRO.

Categorías (orden): Starters (1), Burgers (2), Grill (3), Drinks (4), Desserts (5).

21 platos (nombre — precio — categoría — foto `/demo-assets/restaurant/…`):

| Plato | Precio | Compare | Cat | Foto | Extra |
|---|---|---|---|---|---|
| Classic Cheeseburger | 1100 | — | Burgers | classicBurger.jpg | featured, customizable, variant "Punto" |
| Buffalo Wings (8 piezas) | 850 | — | Starters | wings.jpg | featured |
| Onion Rings Crispy | 550 | — | Starters | onionRings.jpg | |
| Loaded Nachos | 750 | — | Starters | nachos.jpg | customizable (nachos included/extras) |
| Double Trouble Burger | 1450 | 1700 | Burgers | doubleBurger.jpg | featured, customizable, variant "Punto" |
| Smokehouse Bacon Burger | 1350 | — | Burgers | baconBurger.jpg | customizable, variant "Punto" |
| Smash Burger | 1200 | — | Burgers | smashBurger.jpg | customizable, variant "Punto" |
| Pulled Pork Sandwich | 1150 | — | Burgers | pulledPork.jpg | customizable |
| Club Sandwich | 950 | — | Burgers | clubSandwich.jpg | customizable |
| BBQ Ribs Rack | 1800 | — | Grill | ribs.jpg | featured, variants Tamaño: Half Rack +0 / Full Rack +1200 |
| BBQ Chicken Plate | 1250 | — | Grill | chickenBBQ.jpg | |
| Papas Fritas Grandes | 400 | — | Grill | fries.jpg | |
| Homemade Lemonade | 250 | — | Drinks | lemonade.jpg | |
| Soft Drink | 200 | — | Drinks | cola.jpg | |
| Craft Beer | 450 | — | Drinks | craftBeer.jpg | |
| Classic Milkshake | 550 | — | Drinks | milkshake.jpg | variant "Sabor": Chocolate/Vainilla/Fresa/Oreo |
| Drip Coffee | 150 | — | Drinks | coffee.jpg | |
| Warm Brownie Sundae | 600 | — | Desserts | brownie.jpg | featured |
| NY Cheesecake | 550 | — | Desserts | cheesecake.jpg | |
| Apple Pie | 500 | — | Desserts | applePie.jpg | |
| Ice Cream Sundae | 500 | — | Desserts | iceCream.jpg | variant "Topping": Caramelo/Chocolate/Frutos rojos |

Atributos con rol:
- `role:'variant'` — Punto (Término medio/Tres cuartos/Bien cocida), Sabor,
  Topping, Tamaño (solo Ribs tiene ProductVariants reales con priceAdjustment).
- `role:'ingredient-included'` "Lleva incluido" y `role:'ingredient-extra'`
  "Súmale extras" con `optionsMeta[name].priceDelta` — los consume el detail
  de **poster**; el detail de menu solo usa los `variant`.
  Presets: BURGER_INCLUDED `['Lechuga','Tomate','Pickles','Cebolla','House sauce']`;
  BURGER_EXTRAS `Queso extra +100, Doble carne +300, Bacon +200, Aguacate +150, Jalapeños +50, Cebolla caramelizada +80, Huevo frito +120, Aros de cebolla +100`
  (ver seed para presets de pulled pork/club/nachos).

Demo data del template gallery actual (`page-builder.seed.ts →
demoRestaurant('menu','Cocina Norte')`): tienda "Cocina Norte Demo"
(`menu-demo`), 4 categorías Entrantes/Principales/Postres/Bebidas y 8
productos Unsplash (Bowl mediterráneo $12, Picada de la casa $14, Pasta al
tartufo $22, Costillas ahumadas $32, Pizza artesanal $18, Torre de pancakes
$9, Sundae de la casa $8, Limonada de menta $5). **Ambos sets valen**: el
seed-restaurant para la tienda demo navegable, demoRestaurant para el preview
del gallery.

---

## 8. Diff vs staging actual

Staging = `TemplateRenderer` genérico + seed `menuTemplate`
(`page-builder.seed.ts:1536`). El key `menu` **no está** en
`THEME_RENDERERS` (registry solo tiene `persona`) → hoy renderiza catálogo base.

| Aspecto | Legacy | Staging hoy |
|---|---|---|
| Layout | Carta pura: header restaurante + sticky search/tabs + secciones por categoría + barra pedido | NavBar genérica + hero + product_grid(groupBy category) + hours + contact + footer + FooterBranding |
| Scroll-spy / tabs sticky | Sí (IntersectionObserver + scrollIntoView) | No existe |
| Búsqueda en la carta | Sí | No existe |
| Card | Horizontal info/foto + quick-add flotante | Card genérica del catálogo (vertical) |
| Barra de pedido persistente | Sí, siempre visible con total | No; carrito solo desde NavBar (cartCount pill) |
| Cart | Drawer propio crema/ámbar, item con stepper, CTA WhatsApp ámbar | `CartSheet` genérico neutro (tokens) con form nombre/teléfono/notas |
| Detail | Página propia themeada, variantes por attrs con roles, desc colapsable, CTA fija | `product-page-client.tsx` genérico (axes desde variants) / `PreviewProductSheet` en previews |
| Colores | Hardcoded `#B45309`/`#FFF8F0`/`#E8DDD3` | Tokens: el seed **ya replica la paleta** (`primary #b45309, bg #FFF8F0, surface #ffffff, border #E8DDD3, text #111827, secondary #16a34a, muted #8a7152`) + preset "menu-nocturno" |
| Fuentes | Heredada (Inter) | Tokens: heading Manrope, body Inter |
| Textos fijos | "Delivery disponible", "Abierto ahora", "Buscar en el menú...", "Tu pedido", "Hacer pedido por WhatsApp" | No existen |

Ventaja: los tokens del seed ya están alineados; el port es 90 % de renderer,
no de seed. Falta decidir si "Delivery disponible/Abierto ahora" se vuelven
props de sección (recomendado: props de `hero` o de una sección `hours`).

---

## 9. Plan de port

**Decisión: renderer custom nivel 2** (registrar `menu` en
`components/storefront-v2/themes/registry.tsx`, patrón `PersonaRenderer`).
Las secciones genéricas no pueden dar scroll-spy + barra persistente + card
horizontal con quick-add.

1. **Crear `components/storefront-v2/themes/menu/index.tsx`** con
   `MenuRenderer(props: TemplateRendererProps)`:
   - Colores SIEMPRE por tokens: `#B45309`→`var(--bl-primary)`,
     `#FFF8F0`→`var(--bl-background)`, blanco cards→`var(--bl-surface)`,
     `#E8DDD3`→`var(--bl-border)`, grises→`var(--bl-text)`/`var(--bl-text-muted)`,
     verde added→`var(--bl-secondary)` (el seed ya trae `#16a34a`).
     Así el preset "menu-nocturno" funciona gratis.
   - Root con `resolved.cssVars`, `containerType:'inline-size'`,
     `containerName:'bl-menu'`; grid 2-col de cards vía
     `@container bl-menu (min-width: 640px)` — **nunca `@media`**.
   - Mapeo del árbol de secciones (respetar orden/visibilidad/props +
     `editorSelectedKey`/`onSectionClick` con el mismo `editorWrap` de persona):
     `hero` → header restaurante (avatar = `store.avatar`, headline/kicker
     desde props); `product_grid` → carta agrupada + sticky search/tabs
     (usar `props.groupBy === 'category'`, `showPrice`, `showImage`);
     `hours`/`contact`/`footer` → **delegar a `SectionRenderer`** (commodity).
   - Navegación: card envuelta en `<a href={productHref?.(p)}>` cuando hay
     href; fallback `onOpenProduct(p)` (editor/preview del gallery). El botón
     + hace `preventDefault/stopPropagation` igual que el legacy.
   - Carrito: la barra de pedido usa `onOpenCart` + `cartCount` del contrato;
     el total en vivo requiere `useCart()` (disponible: el renderer corre bajo
     `CartProvider` en storefront-client). `rate`: aceptarla del contrato;
     precios con `priceCtx` como el base (mejora sobre el legacy) o formato
     simple es-AR si se decide fidelidad estricta.
2. **Cart drawer propio**: hoy `storefront-client.tsx` monta `CartSheet`
   genérico fuera del renderer. Opciones: (a) extender el registry con un
   slot opcional `cart` por tema, o (b) que `MenuRenderer` monte su
   `MenuCartSheet` y storefront-client omita el genérico cuando el tema lo
   declara. Recomendada (a): `THEME_RENDERERS[key] = { Renderer, CartSheet? }`.
   El drawer port usa tokens y conserva el flujo
   `paymentProvider.checkout(...)` + `trackEvent CHECKOUT_START` (agregar el
   form nombre/teléfono/notas del CartSheet actual — es contrato de producto
   vigente, no estaba en el legacy).
3. **Detail propio**: `product-page-client.tsx` es la capa base "hasta Fase E".
   Ampliar el registry con slot `ProductPage?` para `menu` con el port fiel de
   `MenuProductDetail` (sticky nav "Menú", hero 4:3, thumbs, selectores por
   attrs, desc colapsable, CTA fija con precio total). Requiere exponer
   `attributes` (con `role`, `options`, `optionsMeta`, `sortOrder`) en
   `TemplateProduct` — hoy solo hay `variants`; es el único cambio de contrato
   de datos necesario.
4. **Seed**: `menuTemplate` casi no cambia. Añadir props usadas por el
   renderer si se decide editable: `deliveryLabel`/`openLabel` en hero,
   `searchEnabled` en product_grid.
5. **QA pixel-perfect**: comparar contra la rama legacy corriendo
   (`git show rebrand/bylink-domain-swap:components/templates/menu/index.tsx`)
   con la tienda `brooklyn-burger-house` seedeada; verificar scroll-spy
   (rootMargin exacto), scrollMarginTop 140px, alturas h-13/h-12, radios y
   sombras listados arriba.
