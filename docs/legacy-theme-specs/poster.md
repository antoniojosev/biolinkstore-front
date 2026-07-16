# Spec fiel — Tema legacy `poster` (restaurante, PRO)

> Fuentes, en orden de autoridad:
> 1. **HTML aprobado por Antonio** (manda si difiere):
>    `/home/antonio-dev/igstore/landing-videos/poster/index.html` — video
>    demo 1170×2532 (escala **2×**: dividir px del HTML entre 2 para obtener
>    el tamaño móvil real). Trae colores, fuentes, 4 pantallas (grid, detalle,
>    checkout, WhatsApp) y JS GSAP con el comportamiento esperado.
> 2. Legacy React `components/templates/poster/` en rama
>    `rebrand/bylink-domain-swap` (scratchpad
>    `legacy/rebrand_bylink-domain-swap/poster/`: `index.tsx` 307,
>    `product-card.tsx` 208, `product-detail.tsx` 502, `cart-drawer.tsx` 169).
> Objetivo: reconstrucción pixel-perfect en storefront-v2 con carrito y
> detalle PROPIOS.

---

## 1. Identidad visual

### Paleta (variables CSS del HTML — canónicas)

```css
:root {
  --red-deep:  #4a0a0a;  /* fondo base, texto sobre crema/dorado */
  --red-base:  #7a1818;  /* rojo medio (token primary del seed) */
  --red-warm:  #962020;  /* hover del botón add del detail */
  --red-panel: #2e0606;  /* panel info de card, drawer, gradiente sticky */
  --gold:      #f4a23a;  /* precio, pills activas, badges, focos */
  --gold-soft: #ffd07a;  /* kickers Allura, hover botón crema, deltas */
  --cream:     #fff4e0;  /* texto principal, botones claros, cart bar */
}
```

Colores adicionales exactos usados por ambos:
- Radiales del fondo: `#8a1e1e`, `#6a1414`; gradiente base `#4a0a0a → #2c0505`.
- Gradiente card: `#8a1e1e → #5a0f0f` (HTML `160deg`, React `to-br`).
- Gradiente dorado (logo/badges): `#f4a23a → #d97a1c` (135deg).
- Topbar: `linear-gradient(180deg, rgba(30,3,3,.85), rgba(30,3,3,.4))`
  (HTML .9/.4) + `backdrop-blur-xl` + `border-b border-white/5`.
- Verde ingredientes: `#6cbf6a` (chips included), hoja variante b `#7dd47b`,
  tallo `#2f7a3a`.
- Degradado de texto título: `linear-gradient(180deg, #fff 0%, #ffd9a3 100%)`
  + `background-clip: text; color: transparent` +
  `text-shadow: 0 2px 0 rgba(0,0,0,.15)` (solo hero).
- WhatsApp CTA (pantalla checkout HTML): `linear-gradient(135deg, #25d366 0%, #128c7e 100%)`.

### Fondo de página (idéntico en index y detail)

```css
background:
  radial-gradient(1200px 600px at 10% -20%, #8a1e1e 0%, transparent 60%),
  radial-gradient(900px 500px at 110% 30%, #6a1414 0%, transparent 55%),
  linear-gradient(180deg, #4a0a0a 0%, #2c0505 100%);
```
(HTML usa `700px at 10% -10%` y `600px` en el segundo — diferencia de tuning
del formato video; para web usar la versión React de arriba.)

### Fuentes (Google Fonts)
- **Anton** — títulos, nombres de plato, precios, cantidades, totales. Siempre
  `text-transform: uppercase`, tracking `.01em–.06em`, line-height `0.95–1.05`.
- **Allura** (cursiva) — kickers/taglines ("Bienvenido a", categoría del plato,
  "Síguenos", "Personalizar pedido"). Color `--gold-soft`.
- **Inter** 400–800 — cuerpo, chips, botones, descripciones.

HTML: `https://fonts.googleapis.com/css2?family=Allura&family=Anton&family=Inter:wght@400;500;600;700;800&display=swap`.
React legacy: `var(--font-anton)`, `var(--font-allura)`, `var(--font-inter)`.

### Formato de precio
- React: `Intl.NumberFormat('es-VE', { style:'currency', currency, minimumFractionDigits: 0 })`.
- HTML: literal `USD 1.200` (código + miles con punto).
- **Diferencia** — decisión de port: mantener Intl (staging además tiene
  `priceCtx`/rate); el look Anton dorado es lo que importa.

---

## 2. Estructura de página (index)

Root: `min-h-[100dvh] overflow-x-clip text-[#fff4e0]`, fondo radial de arriba,
font Inter. Skip-link accesible `href="#menu"` ("Saltar al menú", pill crema).

1. **Brand bar sticky** — `sticky top-0 z-50 flex items-center justify-between border-b border-white/5 px-5 py-3.5 backdrop-blur-xl`
   + gradiente `rgba(30,3,3,.85)→.4`:
   - Logo `42×42px` (`h-[42px] w-[42px]`) `rounded-xl`, gradiente dorado,
     inicial de la tienda en Anton 20px color `#4a0a0a`
     (o `store.avatar` object-cover), sombra `0_6px_18px_-6px_rgba(244,162,58,.6)`.
     (HTML 2×: 90px, radius 22, font 44.)
   - `h1` Anton 17px uppercase tracking `.04em` + bio
     `text-[11px] uppercase tracking-[.12em] opacity-65 line-clamp-1 max-w-[220px]`.
   - Botón búsqueda `h-10 w-10 rounded-full bg-white/10 hover:bg-white/20`
     con `Search h-[18px]` (decorativo en legacy, sin lógica).

2. **Hero** — `relative px-5 pb-4 pt-9 text-center`:
   - **Hojas SVG decorativas** (solo React, no están en el HTML — conservarlas,
     son parte del template shipping):
     ```tsx
     <svg viewBox="0 0 100 100"> <path d="M50 10 C 80 25 90 60 60 90 C 30 75 20 40 50 10 Z" fill="#6cbf6a|#7dd47b"/> <path d="M50 10 L 60 90" stroke="#2f7a3a" strokeWidth="2"/> </svg>
     ```
     Izquierda: `absolute -left-2 top-[6px] w-[70px] -rotate-[25deg] opacity-55` (variant a).
     Derecha: `absolute -right-3 top-[30px] w-[60px] rotate-[40deg] opacity-55` (variant b).
     `pointer-events-none aria-hidden`.
   - Kicker Allura 36px `text-[#ffd07a] translate-y-2 leading-none`:
     `"Bienvenido a"` (hardcoded).
   - Título: nombre de la tienda, Anton
     `clamp(36px, 10vw, 64px)` (HTML 2×: 118px), `lineHeight .95`,
     uppercase, degradado blanco→`#ffd9a3` con background-clip text.
   - Bio: `mx-auto mt-3 max-w-[320px] text-sm opacity-80` (HTML: 28px/2, max 720/2).

3. **Category strip** — `nav` scrollable horizontal
   `mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-5 pb-4 pt-2 sm:justify-center sm:flex-wrap`
   (scrollbar oculto), `role="tablist"`. Pill "Todo" + una por categoría:
   ```tsx
   className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium uppercase tracking-[.08em] transition-all ${
     active
       ? 'border-[#f4a23a] bg-[#f4a23a] font-bold text-[#4a0a0a] shadow-[0_6px_18px_-6px_rgba(244,162,58,.6)]'
       : 'border-white/5 bg-white/10 text-[#fff4e0] hover:bg-white/15'}`}
   ```
   Filtra client-side (`p.category === activeCategory || p.categories?.includes(...)`).

4. **Grid de posters** — `main#menu`:
   `mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 pb-[130px] sm:grid-cols-2 sm:gap-[18px] sm:px-5 sm:pb-[150px] lg:grid-cols-3 xl:grid-cols-4`.
   Vacío: `"No hay platos en esta categoría."` col-span-full py-16 text-sm opacity-60.
   (HTML: 2 columnas fijas, gap 34, padding 48 — móvil 2×.)

5. **Social footer** (si hay instagramUrl) — `px-5 pb-[110px] pt-8 text-center`:
   "Síguenos" Allura 28px `#ffd07a`; icono IG
   `h-11 w-11 rounded-full bg-white/10 hover:-translate-y-0.5 hover:bg-[#f4a23a] hover:text-[#4a0a0a]`;
   abajo `"Creado con ByLink"` `text-[11px] uppercase tracking-[.1em] opacity-40`.

6. **Cart bar flotante** (solo si `totalItems > 0`) — el trigger del carrito:
   ```tsx
   <button className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-[480px] items-center justify-between gap-3 rounded-full bg-[#fff4e0] px-5 py-3 pl-6 font-bold text-[#4a0a0a] shadow-[0_18px_40px_-8px_rgba(0,0,0,.5)] transition-transform hover:scale-[1.02]">
     <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
       <span className="rounded-full bg-[#4a0a0a] px-2.5 py-0.5 text-xs text-[#fff4e0]">{totalItems}</span>
       Tu pedido · {fmt(totalPrice)}
     </div>
     <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#4a0a0a] text-[#fff4e0]"><ArrowRight h-3.5 strokeWidth={2.5}/></div>
   </button>
   ```

7. `<PosterCartDrawer />` al final.

---

## 3. Product card (`PosterProductCard`) — el "poster"

```tsx
<article className="poster-card group relative flex flex-col overflow-hidden rounded-[22px] border border-white/5 bg-gradient-to-br from-[#8a1e1e] to-[#5a0f0f] shadow-[0_14px_40px_-12px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-16px_rgba(0,0,0,.7)]">
```
(HTML 2×: radius 44, `border: 2px solid rgba(255,255,255,0.05)`.)

**Zona visual** (`aspectRatio: '1 / 0.78'`, overflow hidden):
- **Word echo** (solo React; el HTML lo reserva para el detail): primera
  palabra >3 letras del nombre, uppercase, cortada a 10 chars. Anton
  `clamp(64px,14vw,110px)`, `letterSpacing -.02em`, `color: transparent`,
  `WebkitTextStroke: '1.5px rgba(255,255,255,.09)'`, centrado absoluto,
  `hidden sm:grid` (oculto en móvil), aria-hidden.
- **Dish circle** (sello del tema): foto del plato en círculo:
  ```tsx
  className="absolute left-1/2 top-1/2 z-[1] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04] group-hover:-rotate-2"
  style={{ backgroundImage: url(image), boxShadow: '0 18px 40px -10px rgba(0,0,0,.65), inset 0 0 0 5px rgba(255,255,255,.08)' }}
  ```
  (HTML 2×: sombra `0 36px 80px -20px`, ring inset 10px.)
- **Badges** (z-[3]):
  - Customizable (izquierda): gradiente dorado, `Star h-3 fill`,
    `Arma tu {primera palabra lowercase}` —
    `rounded-full px-2.5 py-1.5 pl-2 text-[11px] font-extrabold uppercase tracking-wider text-[#4a0a0a] shadow-[0_6px_14px_-4px_rgba(244,162,58,.7)]`.
  - Marketing (derecha, si NO customizable): `topBadge` =
    `featured → 'Top'`, o `comparePrice → '-N%'` calculado
    (`Math.round(((compare-price)/compare)*100)`). HTML muestra literales
    `-20%` y `Top vendido`. Estilo: `bg-[#f4a23a] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4a0a0a] rounded-full`.
  - Agotado: overlay `z-[4] bg-black/55` con pill crema
    `text-[10px] font-bold uppercase tracking-[.12em]` "Agotado".

**Panel info** — `border-t border-white/5 bg-gradient-to-b from-[#2e0606]/95 to-[#2e0606] px-4 pb-4 pt-3.5 text-center`:
- Kicker categoría (HTML usa tagline del plato: "A tu manera", "Doble carne",
  "Picantes", "Clásica" — **preferir `product.tagline ?? category`** como hace
  el detail): Allura 22px `#ffd07a` leading-none.
- Nombre: Anton `clamp(20px,4.5vw,24px)` uppercase `leading-[1.05]` blanco.
- Fila meta `mt-3 flex items-center justify-between gap-2.5`:
  - Precio (izq): Anton 21px `#f4a23a` tracking `.02em`; si customizable,
    encima `desde` en `text-[10px] font-medium uppercase tracking-widest text-[#fff4e0]/70 block mb-[-2px]`;
    compare tachado `ml-1 text-[11px] text-[#fff4e0]/70 line-through` (Inter).
  - Botón (der): pill crema
    `rounded-full bg-[#fff4e0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#4a0a0a] hover:scale-[1.04] hover:bg-[#ffd07a]`.
    - Customizable → span "Personalizar" + `ArrowRight h-3` (navega, no agrega).
    - Normal → botón "Agregar" + `ShoppingCart h-3` (quick-add, mismo patrón
      menu: stopPropagation, added→`Check`+"Listo" 1800 ms, abre drawer,
      disabled sin stock).

Card completa envuelta en `<Link href={/${store.slug}/${slug}}>` con
`rounded-[22px] focus-visible:outline-[#f4a23a]` si hay slug.

---

## 4. Product detail PROPIO (`PosterProductDetail`) — flujo "Arma tu…"

Mismo fondo radial, `pb-[130px] text-[#fff4e0]`.

1. **Topbar sticky** — mismas clases que brand bar; izq botón back circular
   `h-10 w-10 rounded-full bg-white/10` (`ArrowLeft h-[18px]`), centro
   nombre tienda Anton 16px + subtítulo Allura 14px `#ffd07a`
   (`'Personalizar pedido'` si customizable, si no `'Pedido'`), der spacer `h-10 w-10`.

2. **Hero dish** — wrapper `mx-auto max-w-[560px]`; sección
   `relative grid place-items-center overflow-hidden` con
   `height: clamp(260px, 56vw, 360px)` (HTML 2×: 760px):
   - Echo de fondo (aquí SÍ está en el HTML): Anton
     `clamp(76px,20vw,140px)` (HTML 380px), stroke `2px rgba(255,255,255,.09)`
     (HTML 5px), transparent, centrado.
   - Plato: `aspect-square w-[62%] max-w-[280px] rounded-full bg-cover`
     `transform: rotate(-3deg)`,
     `boxShadow: '0 24px 50px -12px rgba(0,0,0,.7), inset 0 0 0 6px rgba(255,255,255,.1)'`
     (HTML 2×: 620px, `0 60px 120px -30px`, ring 14px).
   - Badge "Arma tu {x}" arriba-izquierda si customizable (mismo estilo card,
     `Star h-[13px]`).

3. **Title block** — `px-6 pb-5 pt-2 text-center`:
   - Kicker `product.tagline ?? product.category` Allura 32px `#ffd07a` (HTML 92px: "A tu manera").
   - Título Anton `clamp(30px,7.5vw,48px)` (HTML 140px) degradado texto
     blanco→`#ffd9a3`, `mt-1 lineHeight .95`.
   - Descripción `mx-auto mt-3 max-w-[380px] text-[13.5px] leading-relaxed opacity-75`.

4. **Secciones de configuración** — helper `Section` común:
   `mx-auto max-w-[540px] px-5 pt-6`; head `mb-3.5 flex items-baseline justify-between`
   con `h3` Anton 20px uppercase tracking `.04em` (HTML 42px) + hint
   `text-[11px] uppercase tracking-[.1em] opacity-55` (HTML 22px, tracking .14em).

   **Tamaño** (`sizeAttr` = primer attr `role='variant'` cuyo nombre incluye
   "tama", fallback primer variant attr). Hint `"Elegí 1"`. `role="radiogroup"`,
   chips full-width apilados (`flex flex-col gap-2 sm:flex-row`):
   ```tsx
   className={`flex w-full items-center justify-between rounded-full border-[1.5px] px-[18px] py-3 text-sm ${selected
     ? 'border-[#fff4e0] bg-[#fff4e0] text-[#4a0a0a]'
     : 'border-white/10 bg-white/[.06] text-[#fff4e0] hover:bg-white/10'}`}
   ```
   Izq nombre `font-semibold`; der precio absoluto `fmt(price + delta)` en
   Anton 16px, `#ffd07a` (o `#4a0a0a/85` seleccionado). Delta viene del
   ProductVariant cuyo `combination[sizeAttr.name] === opt`.
   Default: primera opción preseleccionada. (HTML 2×: border 3px, padding
   30/40, nombre 32px, precio 34px. Ejemplo HTML: Mediana 1.200 / Familiar
   1.700 / XL 2.100.)

   **Lleva incluido** (`role='ingredient-included'`). Hint `"Toca para quitar"`.
   Chips verdes toggle (estado = set `removedIncluded`):
   ```tsx
   className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2.5 text-sm font-medium ${removed
     ? 'border-white/15 bg-transparent text-[#fff4e0]/50 line-through'
     : 'border-[#6cbf6a]/50 bg-[#6cbf6a]/15 text-[#fff4e0]'}`}
   ```
   Círculo check `h-[18px] w-[18px] rounded-full` `bg-[#6cbf6a] text-[#4a0a0a]`
   con `Check h-3 strokeWidth={3}` (removido: `bg-white/15` sin check).
   `aria-pressed={!removed}`. (HTML 2×: border 3, padding 22/32, font 28.)

   **Súmale extras** (`role='ingredient-extra'`). Hint `"Cuantos quieras"`.
   Chips dorados toggle con delta de `optionsMeta[opt].priceDelta`:
   ```tsx
   className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2.5 text-sm ${selected
     ? 'border-[#f4a23a] bg-[#f4a23a] font-bold text-[#4a0a0a] shadow-[0_6px_14px_-4px_rgba(244,162,58,.6)]'
     : 'border-[#f4a23a]/30 bg-[#f4a23a]/10 text-[#fff4e0] font-medium hover:bg-[#f4a23a]/20'}`}
   ```
   Pill delta `rounded-md px-1.5 py-0.5 text-[11px]`:
   activo `bg-[#4a0a0a]/15 text-[#4a0a0a]`, inactivo `bg-[#f4a23a]/25 text-[#ffd07a]`;
   texto `+{fmt(delta)}`.

   **Cantidad**: grupo pill `inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.06] p-1`;
   botones `h-10 w-10 rounded-full hover:bg-white/10 disabled:opacity-40`
   (Minus/Plus `h-4`); número Anton 22px `min-w-[24px] tabular-nums aria-live`.
   (HTML 2×: botones 80px, número 48px.)

5. **Sticky bottom total** —
   `fixed inset-x-0 bottom-0 z-[60] px-4 pb-5 pt-6` con
   `background: linear-gradient(180deg, rgba(30,3,3,0) 0%, #2e0606 30%)`
   (HTML: `transparent 0% → rgba(30,3,3,.92) 45%`). Total card:
   ```tsx
   <div className="mx-auto flex max-w-[540px] items-center justify-between gap-3 rounded-[24px] bg-[#fff4e0] py-3 pl-5 pr-3 text-[#4a0a0a] shadow-[0_18px_40px_-8px_rgba(0,0,0,.6)]">
   ```
   Izq: label `text-[11px] uppercase tracking-[.08em] opacity-65` "Total" +
   monto Anton 26px (HTML 2×: radius 48, monto 56px). Der: botón
   `rounded-full bg-[#4a0a0a] px-5 py-3 text-[13px] font-bold uppercase tracking-wider text-[#fff4e0] hover:scale-[1.03] hover:bg-[#962020]`
   con `ShoppingCart h-[18px]` + `"Agregar"` (+" al carrito" en ≥sm);
   added → `Check` + "Agregado" 1800 ms.
   Total en vivo: `(price + sizeDelta + Σ extrasDelta) * quantity`.

Lógica de add:
- `variantDetails`: `{Tamaño: sel}` + `{Sin: "a, b"}` (removidos) +
  `{Extras: "x, y"}`; label unido con `' · '`.
- id firma `${product.id}-${size|removidos,|extras,}` (sets ordenados) —
  configuraciones distintas = líneas de carrito distintas.
- `variantId` del ProductVariant matcheado por tamaño; imagen = hero.
- Cantidad >1 vía `updateQuantity(id, baseQty + quantity)`.
- Abre el drawer al agregar. En el HTML el add muestra además un
  `#cart-toast` (pill `#4a0a0a` con check dorado) — el React lo resuelve
  abriendo el drawer; conservar comportamiento React.

6. `<PosterCartDrawer />` al final.

---

## 5. Cart drawer PROPIO (`PosterCartDrawer`)

Sheet lateral derecho `flex w-full flex-col border-white/10 p-0 text-[#fff4e0] sm:max-w-md`
con `background: linear-gradient(180deg, #2e0606 0%, #1f0404 100%)`.

- **Header**: `border-b border-white/10 px-6 py-4`; título
  `ShoppingBag h-5 w-5 text-[#f4a23a]` + "Tu pedido".
- **Vacío**: círculo `h-16 w-16 rounded-full bg-white/5` +
  `ShoppingBag h-7 text-[#fff4e0]/40`; "Tu pedido está vacío" +
  "Agrega platos del menú para hacer tu pedido" (`text-[#fff4e0]/60`).
- **Items** (`ScrollArea flex-1 px-6 py-4`, `space-y-3`), item
  `flex gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3`:
  - Imagen `h-16 w-16 rounded-lg bg-black/30` object-cover.
  - Nombre `text-sm font-medium line-clamp-1`; variantes con
    `CartVariantBadge` (en `text-[#fff4e0]/70`) o `item.variant` fallback.
  - Precio `text-sm font-bold text-[#f4a23a]` **en Anton**.
  - Stepper: botones ghost `h-6 w-6 rounded-md border border-white/10 bg-white/5 hover:bg-white/10`;
    trash `ml-auto text-[#fff4e0]/50 hover:text-red-400`. aria-labels
    "Quitar uno"/"Agregar uno"/"Quitar del pedido".
- **Footer** `space-y-3 border-t border-white/10 px-6 py-4`: fila Total
  (`text-sm text-[#fff4e0]/70` / monto **Anton 2xl `#f4a23a`**); CTA:
  ```tsx
  <Button className="h-12 w-full gap-2 rounded-xl bg-[#fff4e0] text-base font-bold uppercase tracking-wider text-[#4a0a0a] hover:bg-[#ffd07a]">
    <MessageCircle h-5/> {loading ? 'Enviando...' : 'Pedir por WhatsApp'}
  </Button>
  ```
- Checkout idéntico a menu: `trackEvent CHECKOUT_START` +
  `paymentProvider.checkout({items, total, currency, storeSlug})` + clear + close.

### Diferencia grande vs HTML (pantalla 3 "checkout")
El HTML aprobado muestra un **checkout de página completa**, no drawer:
header "Tu pedido" + back; cart-item card `bg-white/[.06] border-white/[.08] rounded-[26px]`
con foto 90px radius 11, título Anton, variantes `"Familiar · Pepperoni, Bacon"`,
precio Anton dorado, stepper pill; bloque totales `bg-black/[.22] rounded-[26px]`
con filas Subtotal / **Delivery (USD 120)** / Total grande Anton dorado; bloque
datos de cliente (Cliente / Entregar en) `bg-black/[.18]`; CTA verde WhatsApp
gradiente `#25d366→#128c7e` Anton 19px con sombra verde. La pantalla 4 muestra
el **mensaje WhatsApp** resultante:
```
¡Hola! Quiero hacer un pedido 👋

🍕 Pizza Custom
Tamaño: Familiar
Extras: Pepperoni, Bacon

Total: USD 2.000 (con delivery)
```
**Decisión de port**: el drawer React es el comportamiento shipping (delivery
fee y datos de cliente no existen en el modelo actual); el checkout-page del
HTML queda como referencia aspiracional para estilizar el drawer: item cards,
totales y CTA WhatsApp verde gradiente SÍ se pueden adoptar dentro del drawer.
El form nombre/teléfono/notas del `CartSheet` genérico actual cubre el bloque
"Cliente" del HTML → conservarlo en el drawer propio.

---

## 6. Interacciones

Del React:
- Filtro por categoría client-side (pills, sin scroll-spy — a diferencia de menu).
- Quick-add en cards no customizables; customizables navegan a su página.
- Hover card: `-translate-y-1` + sombra más profunda (300 ms); dish:
  `scale-[1.04] -rotate-2` (500 ms).
- Cart bar solo aparece con items; `hover:scale-[1.02]`.
- Added feedback 1800 ms (card "Listo", detail "Agregado"); drawer se abre al agregar.
- Focus rings dorados `focus-visible:outline-[#f4a23a]` en todo; skip-link.

Del JS del HTML (comportamiento aprobado que el port debe reproducir):
- Seleccionar tamaño **recalcula el total en vivo** (1.200→1.700 al pasar de
  Mediana a Familiar); cada extra suma su delta (+80 Pepperoni → 1.780,
  +100 Bacon → 1.880) — ya cubierto por la lógica React.
- Pulso visual del total al cambiar (GSAP `scale 1.08 yoyo`) — nice-to-have:
  animación CSS breve en el monto cuando cambia.
- Toast "agregado al carrito" (ver §4/§5).
- El flujo completo demo: grid → tap card customizable → configurar →
  agregar → checkout → WhatsApp con mensaje formateado.

---

## 7. Demo data real

### Seed canónico (`seed-restaurant.ts` — misma tienda que menu)
**Brooklyn Burger House**, `template: 'poster'` en el seed. Ver tabla completa
en `menu.md §7` (21 platos, fotos `/demo-assets/restaurant/*.jpg`). Claves
específicas de poster:
- Customizables con badge "Arma tu…": Classic Cheeseburger, Loaded Nachos,
  Double Trouble, Smokehouse Bacon, Smash Burger, Pulled Pork, Club Sandwich
  (taglines: "Como te gusta" / "A tu manera").
- `topBadge`: featured → "Top" (Wings, Ribs, Brownie…); Double Trouble
  además tiene compare 1700 (pero es customizable → gana el badge build).
- Tamaño con variants reales: BBQ Ribs Rack (Half/Full Rack +1200).
- Extras con priceDelta: ver presets en `menu.md §7`.

### Datos del HTML (difieren — listar ambos como pide el flujo)
Tienda **"Brooklyn Slice"** — "Pizza & Burgers · NYC", bio "Pizzas a la piedra
y burgers al estilo NY. Armá la tuya y te la mandamos calientica."
Categorías: Todo, Pizzas, Burgers, Alitas, Bebidas.

| Plato | Kicker | Precio | Badge | Foto (landing-videos/poster/assets/) |
|---|---|---|---|---|
| Pizza Custom | A tu manera | desde USD 1.200 | Arma tu pizza (build) | pizza.jpg |
| La Bestia | Doble carne | USD 1.200 (antes 1.500) | -20% | burger.jpg |
| Alitas BBQ | Picantes | USD 950 | Top vendido | wings.jpg |
| Pepperoni | Clásica | USD 1.400 | — | pepperoni.jpg |

Detail HTML (Pizza Custom): tamaños Mediana 1.200 / Familiar 1.700 / XL 2.100;
incluidos Mozzarella, Salsa de tomate, Albahaca fresca, Aceite de oliva,
Orégano; extras Pepperoni +80, Bacon +100, Champiñones +60, Cebolla caram.
+70, Jamón +90, Doble queso +120, Aceitunas +50, Pimientos +60. Checkout:
Subtotal 1.880 + Delivery 120 = 2.000; cliente "María Pérez · 0414-123 4567",
"Av. Libertador, Edif. La Roca, Apt 4B".

### Demo del gallery actual (`demoRestaurant('poster','Poster Cocina')`)
"Poster Cocina Demo" (`poster-demo`), mismas 4 categorías y 8 productos
Unsplash que menu-demo — **sin taglines, sin customizable, sin compare**: el
preview del gallery hoy no puede lucir badges ni "Arma tu…". Mejorar el demo
data del seed de poster con esos campos es parte del port.

---

## 8. Diff vs staging actual

Staging = `TemplateRenderer` genérico + seed `posterTemplate`
(`page-builder.seed.ts:1843`, PRO, sortOrder 21). `poster` NO está en
`THEME_RENDERERS` → hoy renderiza catálogo base.

| Aspecto | Legacy/HTML | Staging hoy |
|---|---|---|
| Fondo | Radiales rojos + gradiente | `--bl-background` plano `#4a0a0a` |
| Secciones | brand bar, hero poster, pills, grid posters, social footer, cart bar | NavBar + hero/gallery/product_grid/about/contact/cta_banner/footer genéricos |
| Card | Poster: dish circle, echo, badges, panel Anton/Allura | Card genérica |
| Allura | Kickers en 6 lugares | No existe (tokens solo heading/body/mono) |
| Detail | "Arma tu…": tamaños, included, extras con deltas | `product-page-client` genérico (solo axes de variants — **no lee attributes con roles ni optionsMeta**) |
| Cart | Drawer rojo oscuro Anton/dorado + cart bar flotante | `CartSheet` genérico + pill de NavBar |
| Tokens seed | — | preset `atardecer`: primary `#7a1818`, secondary `#f4a23a`, accent `#ffd07a`, bg `#4a0a0a`, surface `#2e0606`, text `#fff4e0`, muted `#a08070`, border `#5a1a1a`; heading Anton, radius lg, spacing comfortable |
| Demo data | Brooklyn (taglines/badges/custom) | 8 platos genéricos sin nada de eso |

El mapeo de tokens del seed ya es correcto: `--bl-secondary` = gold,
`--bl-accent` = gold-soft, `--bl-surface` = red-panel, `--bl-text` = cream.
Faltan en tokens: red-warm `#962020` (hover) y verde `#6cbf6a` — derivarlos o
fijarlos como constantes del tema (recomendado: constantes, son identidad).

---

## 9. Plan de port

**Decisión: renderer custom nivel 2** — registrar `poster` en
`themes/registry.tsx` (patrón persona). Imposible con secciones genéricas
(dish circles, echo, Allura, cart bar, flujo Arma-tu).

1. **`themes/poster/index.tsx` — `PosterRenderer(TemplateRendererProps)`**:
   - Tokens: usar `resolveTokens(theme.tokens)`; mapear
     cream→`var(--bl-text)`, red-deep→`var(--bl-background)`,
     red-panel→`var(--bl-surface)`, gold→`var(--bl-secondary)`,
     gold-soft→`var(--bl-accent)`, red-base→`var(--bl-primary)`.
     Radiales del fondo: derivar de bg (o constante del tema — los radiales
     `#8a1e1e/#6a1414` son identidad; aceptable hardcodear con fallback si
     el usuario cambia la paleta, documentarlo).
   - **Allura**: cargarla siempre vía `googleFontsHref([...fonts, 'Allura'])` —
     es sello del tema, no token editable. Anton llega por
     `--bl-heading-font` (ya en seed).
   - Responsive **solo container queries** (`containerName: 'bl-poster'`):
     grid 1→2 (`min-width: 640px` del contenedor) →3 (`1024`) →4 (`1280`),
     echo oculto bajo 640, size-chips columna→fila. Nunca `@media`.
   - Mapeo del árbol (respetar orden/visibilidad + `editorWrap`):
     `hero` → brand bar + hero poster (kicker de `props.kicker`, default
     "Bienvenido a"; headline `props.headline ?? store.name`); `product_grid`
     → pills + grid de posters (props `groupBy`, `showPrice`);
     `gallery`/`about`/`contact`/`cta_banner`/`footer` → delegar a
     `SectionRenderer` (o darles skin poster mínimo en iteración 2).
   - Navegación: card → `productHref?.(p)` con fallback `onOpenProduct`;
     quick-add con stopPropagation. Cart bar → `onOpenCart` (el total en vivo
     sale de `useCart()`); respetar `cartCount` para el estado inicial.
   - `rate`/`priceCtx`: aplicar conversión como el renderer base (mejora
     compatible; el look Anton dorado se mantiene).
2. **Datos**: `TemplateProduct` necesita `tagline?`, `comparePrice?`,
   `featured?`, y `attributes?: {name, type, role, options, optionsMeta, sortOrder}[]`
   — hoy el contrato solo trae `variants`. Es el MISMO gap que menu (§9.3 de
   menu.md); resolverlo una vez en el fetch público + tipo compartido.
3. **Cart drawer propio**: slot `CartSheet` por tema en el registry (misma
   mecánica propuesta en menu.md §9.2). Port del PosterCartDrawer con estilo
   HTML-checkout (item cards, CTA WhatsApp verde gradiente `#25d366→#128c7e`)
   + form cliente del CartSheet actual.
4. **Detail propio**: slot `ProductPage` por tema → port fiel de
   `PosterProductDetail` (Arma tu…) consumiendo `attributes` con roles
   `variant`/`ingredient-included`/`ingredient-extra` y `optionsMeta.priceDelta`.
   El `product-page-client` genérico queda de fallback para los demás temas.
5. **Seed**: enriquecer `demoRestaurant('poster', …)` con taglines, un
   customizable con included/extras, un compare y un featured para que el
   preview del gallery muestre badges y "Arma tu…". Dejar archivo listo, NO
   ejecutar (regla vigente de migrations/seeds).
6. **QA pixel-perfect**: comparar contra el HTML a escala ÷2 (medidas §§2–5)
   y contra la rama legacy con `brooklyn-burger-house`; checklist: radiales,
   degradado de texto del título, stroke del echo, ring inset del dish,
   sombras doradas, rotación -3deg del dish del detail, cart bar pill,
   mensaje WhatsApp final con formato de la pantalla 4.
