# Spec fiel — Tema ROSIER (legacy + HTML aprobado → storefront-v2)

> Fuentes: **(1) HTML aprobado por Antonio** `landing-videos/rosier/index.html` (fuente de diseño
> PRIMARIA — mockup mobile a escala 3x: 1170×2532 = iPhone 390pt @3x, dividir px ÷3) y
> **(2) legacy React** `components/templates/rosier/` (rama `rebrand/bylink-domain-swap`, copia en
> scratchpad). Donde difieren, **manda el HTML** y la diferencia queda anotada.
> Objetivo: renderer custom nivel 2 en `components/storefront-v2/themes/rosier/` con detail y cart PROPIOS.

---

## 1. Identidad visual

Boutique femenina "rose + cream": editorial cálido, Fraunces italic como voz de marca, todo redondeado
(pills), micro-copy de e-commerce real (reviews, cuotas, envíos). Tono: revista de moda accesible.

### Paleta exacta (`:root` del HTML — idéntica al legacy)

| Token HTML | Hex | Uso |
|---|---|---|
| `--rose` | `#c8334c` | marca, CTAs, badges sale, tabs activos, links |
| `--rose-dark` | `#a52a3e` (HTML) / `#9b2237` (React hovers) | hover CTA (React usa #9b2237 — usar ese en web) |
| `--ink` | `#1a1413` | texto principal, botones negros, footer/marquee bg |
| `--ink-soft` | `#5a4b48` | texto secundario, iconos |
| `--muted` | `#78685f` | metadatos, ratings |
| `--bg` | `#fdfaf6` | fondo página |
| `--bg-soft` | `#f5ece2` | placeholders imagen, cards testimonios, hovers |
| `--line` | `#e8dfd8` | bordes |
| `--line-soft` | `#f0e7de` | bordes suaves |
| extra React | `#ead9c6` | gradiente placeholder / CTA disabled |
| swatch pool | `#9b2237 #1a1413 #d4a857 #c49a6c #f1e4cf #2e4a3c` | dots de color en cards |

### Tipografía

- **Fraunces** (Google, `ital,opsz,wght 9..144, 300..700`): títulos, marca, precios destacados, marquee.
  Marca: *italic 600*; títulos de sección: *500* con `em` *italic 400* en rose; testimonios: *500*.
- **Inter** `400–800`: cuerpo, botones, labels. Labels kicker: `font-bold uppercase tracking-[0.2em]` rose.
- Marca con punto: `Rosa Atelier<span class="dot">.</span>` — nombre en rose italic, punto en ink no-italic (`ml-0.5`).

### Radius / sombras

- Pills everywhere: CTAs y qty `rounded-full (999px)`; imágenes/cards `rounded-[4px]`–`rounded-md` (HTML: 6px÷3=2px en cards, 8px en hero detail — en web usar 4–8px); badges `rounded-[3px]`.
- Sombras puntuales: CTA detail `box-shadow: 0 12px 30px -10px rgba(200,51,76,0.5)` (glow rose);
  drawer menú `shadow-[20px_0_50px_-20px_rgba(0,0,0,0.3)]`; swatches `shadow-[0_1px_4px_rgba(0,0,0,.18)]`.
- Blur firma: navs `bg-[rgba(253,250,246,0.92)] backdrop-blur-[14px] backdrop-saturate-150`.
- Easing firma: `cubic-bezier(.2,.7,.3,1)` en hovers de imagen y drawer.
- Precio: `Intl.NumberFormat('es-AR',{style:'currency',currency,minimumFractionDigits:0})`; en el HTML se muestra "US$ 89".
- Vocabulario: **"bolsa"** (no carrito): "Añadir a la bolsa", "Tu bolsa", "Bolsa" en bottom-nav.

---

## 2. Estructura de página

Orden (HTML + React coinciden): **NAV → HERO (bloque rose + media) → MARQUEE → CATEGORÍAS → PRODUCTOS → SALE BANNER → TESTIMONIOS → FOOTER → BOTTOM-NAV mobile**. Body: `bg-[#fdfaf6] text-[#1a1413] pb-[68px] lg:pb-0`.

### 2.1 Nav sticky

`sticky top-0 z-40 bg-[rgba(253,250,246,0.92)] backdrop-blur-[14px] backdrop-saturate-150 border-b border-[#e8dfd8]`
- Mobile (HTML): hamburguesa izquierda (btn `w-10 h-10 rounded-full hover:bg-[#f5ece2]`), **marca centrada** `text-[22px] Fraunces italic 600 rose` con punto ink, bolsa derecha con badge `min-w-[16px] h-4 rounded-full bg-[#c8334c] text-white text-[10px] font-semibold tabular-nums`.
- Desktop (React): marca a la izquierda + links de 3 categorías (`text-[13.5px] font-medium text-[#5a4b48] hover:text-[#c8334c]`) + `Sale −30%` en rose semibold + iconos wishlist/bolsa a la derecha.

### 2.2 Drawer menú (hamburguesa)

Overlay `bg-[rgba(26,20,19,0.55)] backdrop-blur-sm`; panel `w-[min(380px,88vw)] bg-[#fdfaf6]` desliza desde la izquierda (`duration-[350ms] cubic-bezier(.2,.7,.3,1)`). Header marca + botón X circular con borde. Lista de categorías: `py-3.5 text-[22px] font-medium Fraunces border-b border-[#e8dfd8]` con ArrowRight que aparece/traslada on hover; item final "Sale −30%" italic rose. Footer `mt-auto`: "Atención al cliente" + bio + WhatsApp.

### 2.3 Hero (2 bloques)

Grid: mobile `grid-rows-[minmax(420px,58dvh)_minmax(340px,48dvh)]`; desktop `lg:grid-cols-2 lg:min-h-[82dvh]`.

**Bloque rose** (`bg-[#c8334c] px-5 py-9 lg:px-16 lg:py-24 flex flex-col justify-center isolate`):
- Fondo con radiales: `radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,.08), transparent 55%), radial-gradient(140% 100% at 0% 100%, rgba(26,20,19,.18), transparent 60%)`.
- Kicker: `text-[11.5px] font-bold uppercase tracking-[0.2em] text-white` precedido de barra blanca `w-[22px] h-[1.5px]` — **"Colección · Nueva entrega"**.
- H1 Fraunces 500: `text-[clamp(40px,10.5vw,84px)] leading-[1.02] tracking-[-0.03em] text-white` —
  **"Elegancia que no `<em>`pasa desapercibida.`</em>`"** (em italic 400 opacity-90).
- Desc `text-sm text-white/90 max-w-[420px]`: bio o "Cápsulas semanales en terciopelo, lana y seda. Piezas pensadas para usarse, no para guardarse."
- CTAs pill: primario `bg-white text-[#c8334c] hover:bg-[#1a1413] hover:text-white px-5 py-3.5 rounded-full text-[13.5px] font-semibold` "Ver colección →"; secundario outline `border border-white/60 text-white hover:bg-white/10` "Ver ofertas".
- **Watermark "N°14"**: `absolute right-[-14px] bottom-[-28px] Fraunces italic 500 text-white/[0.09] leading-[0.8] tracking-[-0.04em] text-[clamp(220px,42vw,380px)]` con `<sup>N°</sup>` a `0.32em` no-italic. Decorativo, `pointer-events-none select-none`.

**Bloque media**: imagen cover (`objectPosition: 40% 18%`, fallback `/templates/rosier/hero.jpg` → foto aprobada `landing-videos/rosier/assets/hero-fashion.jpg`) sobre `bg-[#1a1413]`. Encima, **stats pill glass**: `absolute left-5 bottom-5 lg:right-8 flex gap-5 px-4 py-3 bg-[rgba(26,20,19,0.4)] backdrop-blur-[12px] rounded-full text-white` — "2.4k / PEDIDOS /MES" y "4.9★ / 1.2K REVIEWS" (números Fraunces 500 `text-[20px] lg:text-[24px]`, labels `text-[9.5px] uppercase tracking-[0.1em] opacity-75`).

### 2.4 Marquee

`bg-[#1a1413] text-white/60 py-4 overflow-hidden`, contenido duplicado 2× animado
`@keyframes rosier-marquee { to { transform: translateX(-50%) } }` — `28s linear infinite`, pausado con `prefers-reduced-motion`.
Items Fraunces italic `text-lg font-medium` separados por dot `w-[5px] h-[5px] rounded-full bg-[#c8334c]/80` con `gap-11`:
`Envío a toda Venezuela · 3 cuotas sin interés · Cambios en 30 días · Atención por WhatsApp · Pago en USD o Bs. · Stock limitado por drop` (HTML omite el último — opcional).

### 2.5 Categorías

Contenedor secciones: `max-w-[1440px] mx-auto px-5 py-14 lg:px-14 lg:py-[88px]`.
Head patrón (repetido en todas las secciones): kicker `text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#c8334c]` + h2 `text-[clamp(32px,6vw,54px)] Fraunces 500 tracking-[-0.02em]` con em rose italic. Aquí: "EXPLORA" / "Compra por *categoría*", más link "Ver todas →" subrayado (`border-b border-[#1a1413] hover:text-[#c8334c] hover:gap-2.5`).
Cards: scroller mobile (`flex gap-3.5 overflow-x-auto snap-x snap-mandatory`, w-150px) / `lg:grid-cols-6`; cada card `aspect-[3/4] rounded bg-[#f5ece2] hover:-translate-y-1`, imagen `group-hover:scale-[1.06] duration-500`, label abajo sobre gradiente `from-[rgba(26,20,19,0.85)]`: `text-[17px] Fraunces 500 italic`.

### 2.6 Productos ("Recién llegados")

Head: "NUEVO ESTA SEMANA" / "Recién *llegados*". Grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3.5 gap-y-5 md:gap-x-5 md:gap-y-8`. (Legacy muestra 8 en stock; el port debe listar todos + filtro.)

### 2.7 Sale banner

`relative text-white px-6 py-24 min-h-[clamp(380px,50dvh,560px)] flex flex-col items-center justify-center text-center`
fondo `linear-gradient(135deg, rgba(200,51,76,0.92), rgba(155,34,55,0.82)), url(hero) center/cover`.
"Últimas piezas" (Fraunces 500 clamp 20–32px) → **"−30%" gigante** `text-[clamp(72px,24vw,200px)] italic Fraunces 500 leading-[0.9]` con `%` pequeño en Inter (`text-[0.22em] not-italic align-top`) → párrafo → CTA pill blanco→ink "Consultar disponibilidad →" (link `wa.me`).

### 2.8 Testimonios

Head: "RESEÑAS VERIFICADAS" / "Lo que dicen *nuestras clientas*". Scroller mobile (cards `w-[82%] snap-start`) / `lg:grid-cols-3`. Card: `bg-[#f5ece2] rounded-md px-5 py-6` — 5 estrellas rose (13px fill), quote Fraunces `text-[18px] leading-[1.4]` con comilla gigante rose `text-[40px]`, divisor, avatar-inicial `w-9 h-9 rounded-full bg-[#ead9c6]` + nombre 13px + "Ciudad · Compra verificada" 11px muted. Textos legacy: Camila R. (Caracas), Valentina M. (Valencia), Isabela T. (Maracaibo).

### 2.9 Footer

`bg-[#1a1413] text-white/75 px-6 py-16 lg:px-14 lg:pt-20 lg:pb-10`, grid `lg:grid-cols-[1.6fr_1fr_1fr]`:
marca (blanco italic con punto rose) + bio + WhatsApp/Instagram con iconos; columna "COMPRAR" (5 categorías); columna "AYUDA" (Envíos / Devoluciones / Guía de tallas / Contacto → wa.me). Barra final `border-t border-white/10 text-xs text-white/50`: "© {año} {tienda} · Creado con ByLink".

### 2.10 Bottom-nav mobile

`lg:hidden fixed bottom-0 z-40 bg-[rgba(253,250,246,0.95)] backdrop-blur-[14px] border-t border-[#e8dfd8] grid grid-cols-4 h-[64px] text-[10px] text-[#5a4b48]` — **Inicio** (activo rose) / **Tienda** (#categorias) / **Favoritos** o **Contacto** / **Bolsa** (con badge rose). Iconos 18px stroke 1.6.

---

## 3. Product card (`rosier/product-card.tsx` + screen1 HTML)

```tsx
<li className="relative flex flex-col">
  <Link className="block group">
    <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden bg-[#f5ece2] mb-2.5">
      <img className="... transition-transform duration-[600ms]
                      [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-105" />
```

- **Badges** top-left `text-[10px] font-bold px-2 py-1 rounded-[3px] tracking-wide`:
  sale `bg-[#c8334c]` "−{n}%"; nuevo `bg-[#1a1413]` "Nuevo" (featured sin sale); agotado `bg-[#1a1413]/70` "Agotado".
- **Swatches** bottom-left de la imagen: 2–3 dots `w-3.5 h-3.5 rounded-full border-2 border-white/95 shadow` del pool (§1). *(En el port: usar hex reales de `optionsMeta` del atributo Color si están.)*
- **Wishlist** top-right: `w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-[#5a4b48] hover:text-[#c8334c] hover:scale-[1.08]`; activo `bg-white text-[#c8334c]` fill.
- **Nombre**: `text-[13.5px] font-medium text-[#1a1413] line-clamp-1` (Inter, NO serif).
- **Rating**: estrella rose fill 11px + `4.8 (127)` en `text-[11px] text-[#78685f]`. *(Dato decorativo hardcodeado. HTML pinta la estrella en ink y cifras por producto: 4.9 (124), 4.8 (98), 4.7 (76), 4.9 (52) — usar estrella ROSE (React) pero variar la cifra por producto como el HTML.)*
- **Precio** `text-base font-semibold tabular-nums` — rose si sale, ink si no; compare `text-[13px] line-through muted`. *(HTML: precio siempre ink bold 700 — diferencia menor; mantener la regla React rose-en-sale, aprobada también en el video para "-30%".)*
- **CTA full-width**: `self-stretch rounded-full px-3.5 py-2.5 text-[12.5px] font-medium bg-[#1a1413] text-white hover:bg-[#c8334c] active:scale-[0.98]` con Plus 13px — **"Añadir a la bolsa"**; added 1.4s: `bg-[#c8334c]` + Check "Añadido"; disabled 50%.
- Card completa (imagen+nombre) navega a `/{tienda}/{producto}`; el CTA hace quick-add con `stopPropagation` y abre la bolsa.

---

## 4. Product detail PROPIO (screen2 del HTML — manda — + `rosier/product-detail.tsx`)

**Cómo abre**: página propia `/{tienda}/{producto}`. Fondo `#fdfaf6`.

### Top bar sticky

Mismo glass del nav. HTML: back circular ← + **marca centrada italic rose** + bolsa. React: `← Volver a la tienda` + wishlist/share/bolsa con badge. **Port: marca centrada (HTML) con back izquierda y bolsa+share derecha.**

### Layout

Desktop (React): `max-w-[1280px] grid lg:grid-cols-2 gap-8 lg:gap-14`, columna info `lg:sticky lg:top-24`. Mobile: una columna con CTA fijo abajo.

### Galería

- Principal `aspect-[3/4] rounded-md overflow-hidden bg-[#f5ece2]` (HTML radius 8px); badge "Nuevo"/−% top-left; wishlist en círculo blanco top-right (HTML `w-72px/3=24px→ usar w-9 h-9 bg-white/94`).
- Flechas prev/next SOLO mobile: `w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm` a los lados (React).
- Thumbs: `w-16 h-20 lg:w-20 lg:h-24 rounded overflow-hidden`; **seleccionada con borde ROSE** (HTML `border: 3px solid var(--rose)`) — *(React usaba `ring-2 ring-[#1a1413]`; manda HTML: rose)*; resto `opacity-60 hover:opacity-90`.
- Agotado: overlay `bg-[#fdfaf6]/70 backdrop-blur-sm` + "AGOTADO" ink.

### Info

1. **Categoría + SKU** en una fila (HTML): categoría `text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8334c]`; **SKU a la derecha** `text-[11px] text-[#78685f] tracking-[0.06em]` (ej. "SKU RSR-SIE-14"). *(React no muestra SKU; manda HTML — el modelo nuevo ya expone `product.sku`.)*
2. **Título** Fraunces 500 `text-[clamp(28px,4.5vw,44px)] leading-[1.05] tracking-[-0.02em]`; **última palabra en `<em>` italic rose** (HTML: "Vestido *Sienna*"). *(React lo pinta plano; manda HTML.)*
3. **Rating**: `★★★★★` ink + "4.9 · 124 reseñas" muted.
4. **Fila precio** (HTML manda): precio grande `Inter 800 tracking-[-0.015em]` ink (`text-[28px]`+ en web), compare tachado muted, **pill "Ahorras {n}%"** `bg-[#c8334c] text-white rounded-full text-[11px] font-bold px-3 py-1`. Cierra con `border-b border-[#e8dfd8]`. *(React: precio Fraunces rose si sale, sin pill — manda HTML.)*
5. **Talla**: label `uppercase tracking` con sufijo **"· Requerido"** en muted normal-case (HTML). Opciones como **círculos** `w-[31px] h-[31px]`→ en web `min-w-[44px] h-11 rounded-full border-[1.5px] border-[#e8dfd8] grid place-items-center text-sm font-semibold`; activa `bg-[#1a1413] text-white border-[#1a1413]`; agotada línea-through muted (React). Al seleccionar muestra el valor junto al label en Fraunces italic (React).
6. **Color**: círculos `w-[25px] h-[25px]`→ web ~`w-9 h-9 rounded-full border-[3px] border-[#fdfaf6] shadow-[0_0_0_1.5px_#e8dfd8]`; activa `box-shadow: 0 0 0 3px #c8334c` (ring rose, HTML). Con `optionsMeta.images` cambia la galería (React).
7. **Cantidad**: pill `inline-flex border border-[#e8dfd8] rounded-full` con botones circulares `w-10 h-10` (hover rose) y valor `tabular-nums`.
8. **Trust signals** (React): Truck/RefreshCcw/Shield rose 16px — "Envío gratis sobre $50", "30 días para devolver", "Pago en 3 cuotas sin interés".
9. **Acordeones** (React): "Detalles del producto" (default abierto) y "Envíos y devoluciones" — filas `py-4 text-[14px] font-medium` con Chevron, cuerpo `text-[13.5px] text-[#5a4b48] leading-[1.7] whitespace-pre-wrap`.

### CTA sticky (HTML manda el diseño)

Barra fija abajo `bg-[rgba(253,250,246,0.96)] backdrop-blur-[14px] border-t border-[#e8dfd8]` con TRES piezas:
1. **Stack Total**: label "TOTAL" `text-[11px] uppercase tracking-[0.12em] muted` + monto **Fraunces 600** `text-[22px] tracking-[-0.02em]` ink.
2. **Qty pill** (el mismo stepper, vive en la barra).
3. **CTA rose**: `flex-1 rounded-full bg-[#c8334c] text-white font-bold text-sm h-[52px] shadow-[0_12px_30px_-10px_rgba(200,51,76,0.5)]` con icono bolsa — **"Añadir a la bolsa"**.

*(React: CTA ink→rose hover con precio dentro y qty en el cuerpo; sin stack Total. Manda HTML: CTA SIEMPRE rose con glow, qty y total en la barra. Estados: added → Check "Añadido"; sin selección → "Elige opciones" `bg-[#ead9c6] text-[#78685f]`; agotado → "Agotado".)*
En desktop el mismo bloque se rinde inline al final de la columna info (sticky no necesario).

### Checkout WhatsApp (mensaje del video, screen3)

```
¡Hola! 👋

Me interesa el *Vestido Sienna* ❤️
Talla: M · Color: Rojo
Total: US$ 89

¿Tienen stock?
```
Formato para compra directa desde el detail; desde la bolsa se usa el formato multi-item del provider.

---

## 5. Cart drawer PROPIO (`rosier/cart-drawer.tsx`)

Sheet derecho `w-full sm:max-w-md bg-[#fdfaf6] border-[#e8dfd8] p-0 text-[#1a1413]`.

- **Header** `px-6 py-4 border-b border-[#e8dfd8]`: **"Tu bolsa"** Fraunces 500 `text-[22px] tracking-tight` + `({n})` `text-xs muted`.
- **Empty**: círculo `w-16 h-16 rounded-full bg-[#f5ece2]` con ShoppingBag 7 muted + "Tu bolsa está vacía" (Fraunces) + "Explora la nueva colección".
- **Items** (`px-6 py-4`, `gap-[18px]`): thumb `w-[78px] h-[96px] rounded bg-[#f5ece2]`; nombre `text-sm font-medium line-clamp-1` + X para quitar (`text-[#78685f]/60 hover:text-[#c8334c]`); variante `CartVariantBadge` o texto xs muted; fila inferior: **qty pill chica** `border border-[#e8dfd8] rounded-full` botones `w-[26px] h-[26px]` hover rose + precio `text-sm font-semibold tabular-nums`.
- **Footer** `px-6 py-5 border-t space-y-2`:
  - "Subtotal" y "Envío / Gratis" en `text-[13px] text-[#5a4b48]`.
  - "Total" `text-base font-semibold` vs monto **Fraunces `text-[22px] tabular-nums`**.
  - CTA: `w-full h-[50px] bg-[#c8334c] text-white rounded-full text-sm font-semibold hover:bg-[#9b2237]` con MessageCircle — **"Finalizar por WhatsApp"** ("Enviando…" durante checkout).
- Checkout: `trackEvent CHECKOUT_START` → `paymentProvider.checkout(...)` → `clearCart()` + cerrar.

---

## 6. Interacciones (JS del HTML + React)

- **Marquee infinito**: translateX(-50%) 28s linear, items duplicados; pausa con `prefers-reduced-motion`.
- **Drawer menú**: slide-in 350ms `cubic-bezier(.2,.7,.3,1)` + overlay blur; cierra por overlay o X; links cierran y anclan.
- **Scroll anchors**: nav/bottom-nav navegan a `#categorias`, `#destacados`, `#sale`.
- **Hovers**: imágenes `scale-1.05/1.06` 500–600ms con el easing firma; category cards `-translate-y-1`; CTAs ink→rose; "Ver todas" agranda gap.
- **Quick-add**: estado added 1.4s con swap Plus→Check, abre la bolsa.
- **Galería detail**: flechas circulares con wrap-around (mobile), thumbs clickeables, color-swatch cambia fotos.
- **Video de referencia** (para animaciones de entrada opcionales): nav baja (`y:-60`), hero kicker/título/desc/CTAs en cascada (`y:20-40, 0.45-0.55s, power2/3.out`), tap en CTA con `scale 0.99 yoyo`.
- Bottom-nav mobile siempre visible (page `pb-[68px]`).

---

## 7. Demo data real

**La demo store de ropa YA es rosier**: `seed-ropa.ts` crea "Noire Boutique" (`slug noire-boutique`, `template: 'rosier'`, `primaryColor #c8334c`, USD, WhatsApp +584147654321, IG noire.boutique). Usar sus 22 productos / 8 categorías (tabla completa en `noir.md` §7; fotos `/demo-assets/ropa/*.jpg`). Los atributos Color traen `optionsMeta.hex` → swatches reales en cards.

**Demo del HTML aprobado** (difiere — es la maqueta "Rosa Atelier"):
- Store: **Rosa Atelier**, avatar `landing-videos/rosier/assets/rosa-avatar.jpg`, hero `assets/hero-fashion.jpg`.
- Categorías: Vestidos (`assets/cat-vestidos.jpg`), Abrigos (`cat-abrigos.jpg`), Blusas (`cat-blusas.jpg`).
- Productos: **Vestido Sienna** US$ 89 (compare US$ 120, "Nuevo", 4.9 (124), swatches #9b2237/#1a1413/#d4a857, fotos `vestido-sienna.jpg`+`vestido-3.jpg`+`vestido-2.jpg`, tallas XS–XL, SKU RSR-SIE-14) · **Blusa Amélie** US$ 62 (−30%, 4.8 (98), `vestido-2.jpg`) · **Vestido Margaux** US$ 74 (4.7 (76), `vestido-3.jpg`) · **Abrigo Céleste** US$ 128 ("Nuevo", 4.9 (52), `abrigo.jpg`).
- Stats hero: 2.4k pedidos/mes · 4.9★ 1.2k reviews. Marquee de 5 items (§2.4).

**Seed staging actual**: `demoFashion('rosier','Rosier')` — 4 productos Unsplash genéricos. Reemplazar el `demoDataJson` por un subconjunto de seed-ropa (o los 4 de Rosa Atelier) para que el preview luzca swatches/sale/badges.

---

## 8. Diff vs staging actual

- **Tokens seed** (`rosierTemplate`, `page-builder.seed.ts` L2096) ✅ correctos: primary/accent `#c8334c`, secondary/text `#1a1413`, bg `#fdfaf6`, surface `#f5ece2`, muted `#78685f`, border `#e8dfd8`, Fraunces + Inter, radius lg, solid.
- **Renderer** ❌: no registrado en `THEME_RENDERERS` → catálogo genérico. Faltan TODOS los bloques firma:
  hero split rose con radiales + watermark N°14 + stats glass pill; marquee ink; scroller de categorías con labels italic; sale banner −30% gigante; testimonios con comilla Fraunces; footer ink 3 columnas; **bottom-nav mobile**; drawer menú.
- **Card** ❌: la genérica no tiene swatches, rating, badges (−%/Nuevo/Agotado), ni CTA pill "Añadir a la bolsa". El seed ya declara `showSwatches` en `product_grid_main` pero el renderer genérico lo ignora.
- **Detail** ❌: `product-page-client.tsx` genérico. Faltan: marca centrada, SKU, título con em rose, pill "Ahorras %", tallas circulares, swatches con ring rose, trust signals, acordeones, sticky CTA rose con Total-stack+qty y glow.
- **Cart** ❌: `cart-sheet.tsx` genérico (form nombre/teléfono/notas) vs "Tu bolsa" con Subtotal/Envío/Total Fraunces y CTA rose pill "Finalizar por WhatsApp".
- **Secciones seed**: trae `testimonials_main` con quotes propios (María Fernanda/Andreína/Luis D. — distintos del legacy Camila/Valentina/Isabela; cualquiera sirve, elegir uno) y hero `split` — falta poder expresar watermark, stats pill y marquee (props nuevos del renderer custom).
- **Demo data** ⚠️: genérica, sin comparePrice/sale/featured → badges y sale banner no se lucen.

---

## 9. Plan de port

**Nivel 2 — renderer custom** `components/storefront-v2/themes/rosier/index.tsx`, registrado como `rosier:` en `THEME_RENDERERS` (`themes/registry.tsx`). El marquee, watermark, bottom-nav y sale banner no existen en el catálogo base → custom obligatorio.

### Tokens (nunca hex hardcodeados)

`rose → var(--bl-primary)` (=accent) · `ink → var(--bl-secondary)` (y `--bl-text`) · fondo `--bl-background` · crema `--bl-surface` · bordes `--bl-border` · muted `--bl-text-muted` · Fraunces `var(--bl-heading-font)` · Inter `var(--bl-body-font)`. Derivados (`rgba(253,250,246,0.92)` del glass, `white/60`, rose-dark hover) via `color-mix()` sobre los tokens.

### Responsive

`containerName: bl-rosier`; **container queries, nunca @media**: stack del hero, grid 2→4 col de productos, categorías scroller⇄grid-6, bottom-nav visible solo `@container bl-rosier (max-width: 760px)`, testimonios scroller⇄3col. El marquee como `<style>` inline con keyframes prefijados (`bl-rosier-marquee`) + `prefers-reduced-motion`.

### Mapeo de secciones (árbol seed actual)

| Sección | Bloque rosier |
|---|---|
| `hero_main` | Hero split completo: kicker/headline/subheadline/ctaPrimaryLabel/ctaSecondaryLabel de props; image → bloque media; watermark y stats pill como props nuevos del section schema (`watermarkText`, `stats[]`) o hardcode del renderer con defaults. Incluye el marquee como sub-bloque (o sección `text_block` variant `marquee` nueva). |
| `product_grid_main` | Head "Recién llegados" + grid de cards §3; `showSwatches`/`showPrice` respetados; categorías strip §2.5 arriba (usa `categories` del contrato). |
| `featured_main` | Sale banner (o strip destacado); el −30% sale de props (`title`, layout `spotlight`). |
| `testimonials_main` | Cards §2.8 con `items` de props. |
| `socials_bar`, `footer_main` | Footer ink custom (el genérico no da el layout 3-col ink); socials embebidos en el footer — delegar solo si se decide simplificar. |

### Contrato

- Cards: `<a href={productHref(p)}>`, quick-add con `useCart` + `stopPropagation`; fallback `onOpenProduct` en previews.
- Bolsa: icono nav, bottom-nav "Bolsa" y badges usan `cartCount` + `onOpenCart`.
- Editor: `editorWrap` patrón persona (outline + tag) por sección.
- Wishlist: omitir (no existe en v2). Rating: decorativo, derivar cifra estable de `product.id` (hash) como hace el legacy con swatches.
- **Detail + cart propios**: igual que noir — registro `THEME_PRODUCT_PAGES` / `THEME_CART_SHEETS` por `theme.template` con fallback genérico; implementar `themes/rosier/product-page.tsx` (§4, container `bl-rosier-pd`) y `themes/rosier/cart-sheet.tsx` (§5). Reusar `useCart`, `WhatsAppPaymentProvider`, tracking `PRODUCT_VIEW`/`CHECKOUT_START` del genérico.
- Dependencia backend menor: exponer `optionsMeta.hex` (swatches y ring de color del detail) y `comparePrice` en el payload público si aún no están.
- Demo data: migrar `demoDataJson` a productos seed-ropa con sale/featured para badges y banner.
