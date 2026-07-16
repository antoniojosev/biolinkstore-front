# Spec fiel — Tema ATELIER (legacy + HTML aprobado → storefront-v2)

> Fuentes: **(1) HTML aprobado** `landing-videos/atelier/index.html` (fuente de diseño PRIMARIA —
> mockup mobile 1170×2532 = 390pt @3x, dividir px ÷3) y **(2) legacy React**
> `components/templates/atelier/index.tsx`. **El legacy atelier SOLO tiene `index.tsx`**:
> en `renderer.tsx` la página usa `AtelierTemplate`, pero en `product-detail-renderer.tsx`
> el detail hace **fallback a `VitrinaProductDetail`** (`atelier: VitrinaProductDetail`, comentario
> "Fallback a Vitrina hasta que se implemente: atelier") y el index **no monta ningún cart drawer**
> (no importa `useCart`). El detail PROPIO de atelier existe únicamente en el HTML aprobado
> (screen2) — esa es la spec a implementar. Es un tema de SERVICIOS (fotógrafo/estudio creativo),
> checkout = reserva directa por WhatsApp.

---

## 1. Identidad visual

Estudio creativo editorial: beige cálido con textura de radiales, Fraunces regular a lo grande,
mayúsculas espaciadas, una sección "filosofía" en verde bosque oscuro, y un detail tipo "ficha de
reserva" en tarjeta crema con acento azul petróleo. Tono: portfolio de autor, "cada proyecto es un ritual".

### Paleta exacta (`:root` del HTML + legacy)

| Token | Hex | Uso |
|---|---|---|
| `--beige-50` | `#fbf8f2` | pill CTA servicio, tarjeta destacada, texto sobre ink |
| `--beige-100` | `#f2ede2` | glass del nav (`rgba(242,237,226,.72)`) |
| `--beige-200` | `#e7e0d0` | (token seed border) |
| `--beige-300` | `#d8d0c0` | placeholders de imagen |
| fondo legacy | gradiente `#ece6dd → #e2dccf` + radiales `#f0e9dd` / `#d8d0c0` | body |
| `--ink` | `#1f1b18` | texto, botones, monograma |
| `--ink-soft` | `#4a423b` | texto secundario, em de títulos |
| `--muted` | `rgba(31,27,24,0.55)` | kickers, metadatos |
| `--line` | `rgba(31,27,24,0.12)` | TODOS los bordes (alpha, no sólido) |
| `--forest` | `#1f3330` | sección Filosofía (bg) y fondo del detail |
| `--forest-soft` | `#2a413d` | apoyo forest |
| crema forest | `#ece6d7` | texto sobre forest (em `rgba(236,230,215,.72)`) |
| `--sepia` | `#8a4f2a` | acento cálido: precio "Cotizar", hover CTA footer, highlight |
| `--pd-blue` | `#1b6a8a` | DETAIL: precio, CTA reservar, thumb activa |
| `--pd-blue-dark` | `#155973` | apoyo azul |
| `--pd-bg` | `#faf6ef` | tarjeta del detail |
| `--pd-chip` | `#e4eef3` | chips qty del detail |

### Tipografía

- **Fraunces** (`ital,opsz,wght 9..144 300..700`): títulos ENORMES en peso **400** (no bold),
  `letter-spacing -0.02em`, con `em` italic en `--ink-soft`; monograma italic 500; precios de servicio *italic*.
- **Inter** 400–700: cuerpo, labels. Label firma: `text-[11px] uppercase tracking-[.14em]`–`[.28em]` font-medium.
- Body fondo legacy exacto:
  ```css
  background:
    radial-gradient(1100px 700px at 100% 0%, #f0e9dd 0%, transparent 60%),
    radial-gradient(800px 500px at 0% 100%, #d8d0c0 0%, transparent 60%),
    linear-gradient(180deg, #ece6dd 0%, #e2dccf 100%);
  ```

### Radius / sombras

- Página: casi sin radius — imágenes `rounded-[2px]`–`rounded-[4px]`–`rounded-[6px]`; pills `rounded-full`.
- Detail (HTML): tarjeta `border-radius 22px`(3x)→ **~8px web** (o mantener 16–22px como tarjeta flotante), imagen 18px→**~6–8px**, thumbs 16px→**~6px**, CTA 16px→**~6px**, chips qty 22px→**~8px**.
- Sombras: tarjeta destacada hero `shadow-[0_14px_30px_-12px_rgba(0,0,0,.2)]`; foto filosofía
  `box-shadow: 0 32px 70px -24px rgba(0,0,0,0.6)`; tarjeta detail `0 40px 80px -30px rgba(0,0,0,.5)`;
  CTA detail `0 18px 36px -12px rgba(21,89,115,0.5)` (glow azul).
- Precio: `Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:0})`; label "desde $30"; precio 0 → **"Cotizar"** en `--sepia` italic.

---

## 2. Estructura de página

Orden legacy: **NAV fija → HERO full-viewport (blur) → MANIFESTO/Filosofía → SERVICIOS → PORTAFOLIO (grid 12-col) → FOOTER/Contacto**. El HTML aprobado reordena para el video (hero → filosofía → servicios) y convierte la filosofía a **forest oscuro** — manda HTML en el diseño de filosofía; el resto conserva el orden legacy.

### 2.1 Nav fija (glass)

```
nav: fixed top-0 inset-x-0 z-50 flex items-center justify-between
     border-b border-[rgba(31,27,24,.12)] bg-[rgba(236,230,221,.55)]
     backdrop-blur-[18px] [backdrop-filter:saturate(120%)_blur(18px)]
     px-5 sm:px-8 py-4 sm:py-5
```
*(HTML: `rgba(242,237,226,0.72)` + `saturate(130%)` — equivalente.)*
- **Brand**: monograma circular `w-[34px] h-[34px] border border-[#1f1b18] rounded-full` con iniciales
  Fraunces italic 500 (`monogramFromName`: 2 iniciales del nombre) + stack: nombre `text-[15px] Fraunces 500`
  y tagline `text-[9px] uppercase tracking-[.24em] muted` (= primera frase de la bio, `bio.split(/[.·\n]/)[0]`).
- Links desktop (`hidden md:flex gap-8 text-[13px] text-[#4a423b]`): Servicios / Filosofía / Portafolio / Contacto.
- CTA derecha: **"Conversemos"** `text-[11px] uppercase tracking-[.14em] border-b border-[#1f1b18] pb-0.5`.

### 2.2 Hero (viewport completo, cover difuminado)

```
header: relative isolate overflow-hidden min-h-[100dvh]
```
Tres capas de fondo:
1. Cover blureado: `absolute -inset-8 -z-[2] bg-cover bg-center` con
   `backgroundPosition: 'center 25%'; filter: blur(14px) saturate(.85); transform: scale(1.1)` (HTML: blur 16px, scale 1.08).
2. Velo radial: `radial-gradient(900px 600px at 30% 40%, rgba(236,230,221,.4) 0%, rgba(236,230,221,.62) 60%, rgba(236,230,221,.7) 100%)`.
3. Degradado vertical: `linear-gradient(180deg, rgba(236,230,221,.65) 0%, transparent 18%, transparent 70%, rgba(236,230,221,.9) 100%)`.

Contenido (`max-w-[1400px] px-5 sm:px-8 pt-28 pb-[180px] flex flex-col justify-center min-h-[100dvh]`):
- **H1**: `text-[clamp(44px,8.5vw,112px)] Fraunces 400 leading-[1] -tracking-[.02em] text-balance`
  con `textShadow: 0 1px 0 rgba(255,255,255,.15)` — copy dinámico: "Tu {2 primeras palabras de la bio}"
  + `<br/><em class="italic text-[#4a423b]">es un ritual</em>` (HTML: "Tu fotógrafo profesional / *es un ritual*").
- **Pilares**: `grid grid-cols-2 sm:grid-cols-4 gap-3.5 border-t border-[rgba(31,27,24,.12)] pt-5 mt-10` —
  hasta 4 categorías únicas de los productos, `text-[11px] sm:text-xs uppercase tracking-[.14em] text-[#4a423b] font-medium`
  (HTML: Retratos / Eventos / Producto / Parejas y Familia).
- **Aside inferior-izquierda** (absolute, `max-w-[220px] sm:max-w-[280px]`): h3 Fraunces italic
  `text-[21px] sm:text-[26px]` — **"La cámara / como pausa"** — + bio `text-xs sm:text-[13px] text-[#4a423b]`.
- **Tarjeta destacada** inferior-derecha (`hidden md:flex`): `bg-[#fbf8f2] pl-2 pr-4 py-2 rounded-[4px] shadow` con thumb 56px + nombre Fraunces + "TRABAJO DESTACADO" `text-[10px] uppercase tracking-[.1em] muted` (usa el primer producto featured).

### 2.3 Filosofía / Manifesto — **HTML manda: FOREST oscuro**

*(Legacy React: sección beige 2-col imagen 4/5 + texto. HTML aprobado: bloque oscuro dramático — usar HTML.)*

```
section#manifesto: bg-[#1f3330] text-[#ece6d7]  (padding generoso ~py-24/py-[140px] px-5/px-8)
```
1. **Foto** centrada: `max-w-[900px] mx-auto aspect-[3/4] rounded-[4px] bg-cover`
   `backgroundPosition: center 18%` + `box-shadow: 0 32px 70px -24px rgba(0,0,0,0.6)` (avatar del store o 1ª foto de galería).
2. Kicker: `mt-14 text-[11px] uppercase tracking-[.28em] text-[rgba(236,230,215,.6)]` — "Filosofía · {nombre}".
3. Título: `text-[clamp(32px,4.5vw,56px)] Fraunces 400 leading-[1.02] -tracking-[.02em]` —
   **"El instante `<em class="italic" style="color:rgba(236,230,215,.72)">`es la obra.`</em>`"**
4. Cuerpo: `text-[15px] leading-[1.55] text-[rgba(236,230,215,.78)] max-w-[860px]` — bio o
   "Doce años detrás de la cámara. Retratos, bodas y productos. Cada sesión es una conversación — sin plantillas, sin prisas, sin cliché." (2º párrafo legacy: "Proceso pequeño, cuidado, con tiempo…").

### 2.4 Servicios

Head patrón de sección (legacy + HTML):
```
flex items-baseline justify-between border-b border-[rgba(31,27,24,.12)] pb-6 mb-12 sm:mb-[60px]
  h2: text-[clamp(32px,5vw,52px)] Fraunces 400 leading-none  — "Servicios"
  meta: text-xs uppercase tracking-[.14em] muted tabular-nums — "{NN} · disponibles" (padStart 2, ej "11 · disponibles")
```
Cards — mobile HTML: **stack 1 col, imagen CUADRADA 1:1** con gap grande (`gap-24`);
desktop legacy: `md:grid-cols-2 gap-x-10 gap-y-[60px]` con imagen `aspect-[5/4]`. Card:

```tsx
<a href={detailHref(slug)} className="block group">
  <div className="aspect-square md:aspect-[5/4] overflow-hidden rounded-[6px] bg-[#d8d0c0] mb-5">
    <img className="w-full h-full object-cover transition-transform duration-[600ms]
                    [transition-timing-function:cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.03]" />
  </div>
  <div className="flex items-baseline justify-between gap-4 mb-3">
    <h3 className="text-[22px] sm:text-[26px] Fraunces 400 leading-[1.1]">Sesión de Retrato Individual</h3>
    <span className="text-sm italic Fraunces text-[#4a423b] whitespace-nowrap">desde $30</span>
    <!-- precio 0 → "Cotizar" en text-[#8a4f2a] -->
  </div>
  <p className="text-sm text-[#4a423b] leading-[1.65] max-w-[460px] line-clamp-3">…</p>
```
**CTA de card — HTML manda**: pill `inline-flex items-center gap-3 rounded-full bg-[#fbf8f2]
border-[1.5px] border-[rgba(31,27,24,.12)] px-5 py-3` con icono de cámara + label **"Reservar"**
`text-[11px] uppercase tracking-[.2em] font-medium` + flecha →.
*(Legacy React: link subrayado "Ver servicio →" con flecha que se traslada on hover `group-hover:[&_svg]:translate-x-1.5` — conservar esa micro-animación en la flecha del pill.)*
Servicio sin slug → ancla `#contacto` con label "Solicitar info".

### 2.5 Portafolio (grid editorial 12-col)

Head: "Trabajos recientes" / meta "PORTAFOLIO". Imágenes: todas las fotos únicas de los productos
(máx 7, `gatherGalleryImages`). Grid `md:grid-cols-12 gap-2 md:gap-3.5 px-2 md:px-3.5` con layout fijo:

```ts
GALLERY_LAYOUT = [
  { colSpan: 7, aspect: '7/5' }, { colSpan: 5, aspect: '5/5' },
  { colSpan: 4, aspect: '4/5' }, { colSpan: 4, aspect: '4/5' }, { colSpan: 4, aspect: '4/5' },
  { colSpan: 8, aspect: '8/5' }, { colSpan: 4, aspect: '4/5' },
]
```
Mobile (≤768 container): todo `span 1` a `aspect-4/5` en 2 columnas. Hover `scale-[1.02]` 500ms easing firma.

### 2.6 Footer / Contacto (`#contacto`)

- Centro: kicker "HABLEMOS" → h2 `text-[clamp(40px,7vw,84px)] Fraunces 400` —
  **"Capturemos algo / *juntos.*"** → CTA pill oscuro:
  `bg-[#1f1b18] text-[#fbf8f2] rounded-full px-7 py-4 text-sm uppercase tracking-[.14em]
   hover:bg-[#8a4f2a] hover:-translate-y-[1px]` — **"Escribir por WhatsApp"** + MessageCircle
  (link `wa.me` con "Hola {tienda}, me gustaría conversar sobre un proyecto.").
- Barra final `border-t border-[rgba(31,27,24,.12)] pt-10 text-xs muted`: © año + iconos circulares
  IG/WhatsApp/Mail `w-9 h-9 rounded-full border` con hover invertido (`hover:bg-[#1f1b18] hover:text-[#fbf8f2] hover:-translate-y-0.5`) + "Creado con ByLink".
- Skip-link accesible al inicio ("Saltar al contenido").

---

## 3. Product card

La card de atelier ES la card de servicio de §2.4 (no hay grid de tienda clásico): imagen grande,
nombre Fraunces, precio italic "desde $X"/"Cotizar" sepia, descripción line-clamp-3 y pill "Reservar".
Sin badges de stock/sale, sin quick-add, sin rating: el tema vende sesiones, no inventario.

---

## 4. Product detail PROPIO (screen2 del HTML — única fuente; legacy caía a Vitrina)

**Cómo abre**: navegación a `/{tienda}/{servicio}`. **Diseño "ficha de reserva"**: página con fondo
**forest `#1f3330`** y una **tarjeta crema flotante** que contiene todo.

### Contenedor

```
page:  min-h-100dvh bg-[#1f3330] p-4 sm:p-6 flex            (HTML: padding 60px/48px ÷3 ≈ 20/16px)
card:  flex-1 max-w-[520px] mx-auto bg-[#faf6ef] rounded-[16px] overflow-hidden
       flex flex-col shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] relative
```
(En desktop ancho, la tarjeta puede crecer a 2 columnas internas o mantenerse como ficha centrada — el HTML es mobile-only; recomendación: ficha centrada max-w ~560px, fiel al aprobado.)

### Topbar (dentro de la tarjeta)

`flex justify-between px-5 pt-4 pb-2` — izquierda **"← Volver"** `text-sm font-medium text-[#1f1b18]`
(flecha 20px stroke-2); derecha iconos Share2 y ShoppingCart `w-6 h-6 text-[#1f1b18]` (stroke 1.8).

### Imagen + badge

- Imagen: `mx-3 rounded-[8px] overflow-hidden aspect-square bg-cover` (`backgroundPosition: center 20%`).
- Badge: `absolute top-2.5 left-2.5 px-3 py-1.5 rounded-full bg-[rgba(250,246,239,0.96)]
  text-[12px] font-medium text-[#1f1b18]` — **"Destacado"**.

### Thumbs

`flex gap-2 px-3 pt-3` — cuadradas `w-11 h-11 rounded-[6px] bg-cover border-[1.5px] border-transparent`;
**seleccionada azul**: `border-[#1b6a8a]` + doble ring `box-shadow: 0 0 0 2px #faf6ef, 0 0 0 4px #1b6a8a`.

### Cuerpo (`px-5 py-4 border-t border-[rgba(31,27,24,.12)] mt-2`)

1. **Título**: `Inter 700 text-[18px] tracking-[-0.015em] leading-[1.1]` (¡Inter bold, NO Fraunces — el detail cambia de voz a "ficha funcional"!). Ej: "Sesión de Retrato Individual".
2. **Precio**: `Inter 700 text-[22px] text-[#1b6a8a] mt-2` — "US$ 30".
3. Label **"CANTIDAD"**: `text-[11px] font-semibold uppercase tracking-[.18em] text-[rgba(31,27,24,.55)] mt-4`.
4. **Qty chips**: botones `w-10 h-10 rounded-[8px] bg-[#e4eef3] text-[#1f1b18] grid place-items-center`
   (Minus/Plus 18px stroke-2) + valor `text-[15px] font-semibold min-w-[28px] text-center`.
5. Label **"DESCRIPCION"** con chevron ˅ (colapsable) + cuerpo `text-[13px] leading-[1.55] text-[#4a423b]`.

### CTA sticky (dentro de la tarjeta, flotante abajo)

```
absolute left-5 right-5 bottom-4 bg-[#1b6a8a] text-white rounded-[8px]
px-4 py-3 flex items-center gap-3
shadow-[0_18px_36px_-12px_rgba(21,89,115,0.5)]
  label: flex-1 text-[15px] font-semibold  — "Reservar sesión"
  price: text-[15px] font-bold             — "US$ 30" (se multiplica por qty en vivo)
```
Animación aprobada del video: halo `scale 1.03` + tap `scale 0.97 yoyo`.

### Checkout WhatsApp (mensaje del video, screen3)

```
¡Hola Daniel! 👋

Me interesa una *Sesión de Retrato Individual* 📷
Cantidad: 1
Total: US$ 30

¿Coordinamos fecha?
```
El CTA "Reservar sesión" va **directo a WhatsApp** con este formato (nombre del dueño si existe, si no el de la tienda; cierre "¿Coordinamos fecha?"). No pasa por carrito.

---

## 5. Cart drawer PROPIO

**Atelier NO tiene carrito en ninguna fuente**: el legacy `index.tsx` no importa `useCart` ni monta
drawer; el HTML aprobado tampoco tiene pantalla de bolsa — el flujo es card → detail → **reserva
directa por WhatsApp**. Especificación para el sistema nuevo:

- **Flujo primario**: sin carrito. `Reservar sesión` = checkout inmediato de 1 item
  (`paymentProvider.checkout` con un solo item, qty del stepper) + `trackEvent CHECKOUT_START`.
- **Si el sistema exige cart global** (icono de la topbar del detail existe en el HTML): usar el
  `CartSheet` genérico **skinneado por tokens** del tema (fondo `#faf6ef` vía `--bl-surface`,
  CTA `--bl-primary`), con copy adaptado: título "Tu reserva", CTA **"Coordinar por WhatsApp"**.
  No construir un drawer custom: no hay diseño aprobado y el tema no lo pide.

---

## 6. Interacciones (JS del HTML + legacy)

- **Nav fija** con blur; anclas suaves a #servicios/#manifesto/#portafolio/#contacto (`scroll-mt-20` en secciones).
- **Hero**: fondo blureado estático (no parallax); entrada del video: nav `y:-60`, título `y:40 power3.out`,
  pilares en stagger 0.06s, aside `y:20` — opcionales como animaciones de entrada.
- **Hovers**: imágenes de servicio `scale-[1.03]` 600ms easing `cubic-bezier(.2,.7,.3,1)`; galería `scale-[1.02]`;
  flecha del CTA `translate-x-1.5`; iconos footer invierten color y suben 2px; CTA WhatsApp `-translate-y-[1px]` + sepia.
- **Detail**: qty +/- actualiza el precio del CTA en vivo; descripción colapsable (chevron); thumbs cambian imagen; halo/tap del CTA.
- **Highlight del video** (referencia de foco): outline `4px solid #8a4f2a` con `outline-offset 12px` sobre la card activa.
- Sin marquee, sin filtros, sin search: la página es narrativa, no catálogo.

---

## 7. Demo data real

**seed-ropa NO aplica** (es moda; atelier es servicios/portfolio). Demo canónica = la del HTML aprobado:

**Store**: **Daniel Mendoza** — monograma "DM", tagline "Fotógrafo profesional en Lechería",
bio "Fotógrafo profesional en Lechería. Bodas, eventos, retratos y producto. Tu historia merece buenas fotos.",
avatar `landing-videos/atelier/assets/daniel-avatar.jpg`, cover `assets/hero-camera.jpg`.
Filosofía: foto `assets/portrait-man.jpg` + texto "Doce años detrás de la cámara…". Meta servicios: "11 · disponibles".

**Servicios** (los 2 maquetados + fotos disponibles para completar):

| Servicio | Precio | Descripción | Fotos |
|---|---|---|---|
| Sesión de Retrato Individual ✦ | desde $30 | "Sesión de 1 hora en locación o estudio. Incluye 15 fotos editadas en alta resolución. Ideal para redes sociales, LinkedIn o marca personal." | `assets/portrait-hero.jpg` (+ detail thumbs: `portrait-2.jpg`, `portrait-man.jpg`) |
| Retrato Corporativo | desde $80 | "Para equipos y directivos. Iluminación profesional, retoque incluido, entregado en 48 h." | `assets/portrait-man.jpg` |
| (ampliar con) Bodas / Eventos / Producto / Parejas y Familia | — | — | `assets/wedding.jpg`, `assets/event.jpg`, `assets/product.jpg`, `assets/couple.jpg`, `assets/family.jpg`, `assets/portrait-1.jpg` |

Pilares hero: **Retratos · Eventos · Producto · Parejas y Familia**. Detail demo: Sesión de Retrato
Individual, badge "Destacado", qty 1, total US$ 30, mensaje WhatsApp §4.
*(Las fotos hay que copiarlas a `frontend/public/demo-assets/atelier/` o equivalente — hoy viven solo en landing-videos.)*

**Seed staging actual**: `demoFashion('atelier','Atelier')` — productos de ROPA Unsplash. **Nicho equivocado**
respecto al diseño aprobado (el seed lo clasifica `TemplateNiche.FASHION`; el legacy/HTML es
servicios creativos). Decidir: (a) recrear el demo Daniel Mendoza (recomendado, fiel al aprobado) y
mover niche a SERVICES/PORTFOLIO, o (b) mantener fashion y re-textear hero/filosofía — pero entonces
el detail-ficha con "Reservar sesión" pierde sentido. Anotado como decisión de producto pendiente.

---

## 8. Diff vs staging actual

- **Tokens seed** (`atelierTemplate`, `page-builder.seed.ts` L1947) ⚠️ parciales: `bg #e9e2d3,
  surface #fbf8f2, text/primary #1f1b18, secondary #4a423b, accent #8a4f2a, border #e7e0d0`,
  Fraunces+Inter ✅. **Faltan sin token**: forest `#1f3330` (+crema `#ece6d7`) de Filosofía y el
  azul `#1b6a8a` / chips `#e4eef3` del detail — no entran en la paleta de 8; derivarlos como
  constantes del renderer custom o proponer tokens extra.
- **Renderer** ❌: no registrado; el catálogo genérico pinta hero banner + featured + text_block +
  grid + about + gallery + footer. Se pierde: nav glass con monograma+tagline, hero 100dvh con cover
  blureado + velo radial + pilares + aside + tarjeta destacada, **filosofía forest oscura**, head de
  sección con meta "NN · disponibles", cards de servicio con precio italic/Cotizar y pill Reservar,
  **galería 12-col con GALLERY_LAYOUT**, footer "Capturemos algo juntos" con CTA sepia-hover.
- **Sección `editorial_block`** del seed ("Cada pieza cuenta una historia") es texto de moda, no la
  filosofía del fotógrafo; y `about_main` duplica el rol de manifesto → en el custom, `text_block`
  variant editorial = sección Filosofía forest.
- **Detail** ❌ doble: el legacy ni siquiera lo tenía (fallback Vitrina) y el staging usa
  `product-page-client.tsx` genérico. La ficha forest+crema+azul del HTML no existe en ningún lado.
- **Cart** ⚠️: staging monta `CartSheet` genérico; atelier aprobado no usa carrito (reserva directa).
- **Demo data** ❌: nicho equivocado (fashion vs servicios) — ver §7.

---

## 9. Plan de port

**Nivel 2 — renderer custom** `components/storefront-v2/themes/atelier/index.tsx` registrado como
`atelier:` en `THEME_RENDERERS`. El hero blureado, la filosofía forest, el grid 12-col y las cards
de servicio no son expresables con el catálogo base.

### Tokens

`ink → var(--bl-text)/(--bl-primary)` · beige base `--bl-background` · crema `--bl-surface` ·
sepia `--bl-accent` · ink-soft `--bl-secondary` · muted/line: derivar con `color-mix(in srgb,
var(--bl-text) 55%/12%, transparent)` para conservar los alphas firma. Forest y pd-blue: constantes
del renderer (documentadas) o par de tokens extra si el framework los admite; el resto de presets
del tema los re-tiñen vía color-mix sobre `--bl-primary`.

### Responsive

`containerName: bl-atelier`; **container queries, nunca @media** (el legacy usa `@media (max-width:768px)`
en el styled-jsx de la galería — reescribir como `@container bl-atelier (max-width: 768px)`):
galería 12-col → 2-col span-1 aspect-4/5; servicios 2-col → 1-col imagen 1:1; pilares 4 → 2 col;
aside/tarjeta destacada del hero se ocultan en angosto.

### Mapeo de secciones (árbol seed)

| Sección | Bloque atelier |
|---|---|
| `hero_main` | Hero 100dvh: `image` → cover blureado; `headline` → H1 (fallback "Tu {bio} / es un ritual"); `kicker` → tagline del nav; pilares = categorías del contrato; aside = bio. |
| `featured_main` | Tarjeta destacada del hero (primer producto featured) — no bloque aparte. |
| `editorial_block` (`text_block`) | **Sección Filosofía forest**: kicker/headline/body de props sobre `#1f3330`. |
| `product_grid_main` | Servicios: head "Servicios / NN · disponibles" + cards §2.4 (grid-2 ⇄ stack 1-col). |
| `about_main` | Delegar a `SectionRenderer` o fusionar con filosofía (evitar duplicado — propuesta: ocultarla por defecto en el árbol). |
| `gallery_main` | Portafolio 12-col con `GALLERY_LAYOUT`; `items` de props + fotos de productos (`gatherGalleryImages`). |
| `socials_bar` + `footer_main` | Footer custom "Capturemos algo juntos" (iconos circulares desde `store.socials`). |

### Contrato

- Cards de servicio: `<a href={productHref(p)}>` (pill "Reservar" navega igual — toda la card es link);
  fallback `onOpenProduct` en previews. Sin quick-add.
- `onOpenCart`/`cartCount`: atelier no muestra carrito en la página (ícono solo en topbar del detail);
  si `cartCount > 0` puede mostrarse pill flotante discreta (patrón persona) para no romper el contrato.
- Editor: `editorWrap` (outline + tag) por bloque, patrón persona.
- **Detail propio**: `themes/atelier/product-page.tsx` vía registro `THEME_PRODUCT_PAGES` (mismo
  mecanismo que noir/rosier, fallback `product-page-client.tsx`). Implementa la ficha §4 con
  container `bl-atelier-pd`; el CTA "Reservar sesión" arma el mensaje §4 y llama
  `paymentProvider.checkout` con item único + qty; conservar tracking `PRODUCT_VIEW`/`CHECKOUT_START`.
- **Cart**: no custom — genérico themeado (§5) solo como fallback del sistema.
- Demo data: reconstruir `demoDataJson` como Daniel Mendoza (§7), copiar assets de
  `landing-videos/atelier/assets/` a public, corregir niche, y quitar `about_main` duplicada del defaultOrder.
