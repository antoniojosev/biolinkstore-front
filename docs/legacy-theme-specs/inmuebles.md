# Spec legacy — Tema `inmuebles` (nicho inmobiliario, PRO)

> Fuentes: React legacy `rebrand/bylink-domain-swap:components/templates/inmuebles/`
> (`index.tsx`, `property-card.tsx`, `product-detail.tsx`, `cart-drawer.tsx`) +
> HTML aprobado `/home/antonio-dev/igstore/landing-videos/inmuebles/index.html` +
> seed real `igsotre-back/prisma/seeds/seed-inmuebles.ts`.
>
> ⚠️ Nota sobre el HTML: es una **composición de video** (viewport fijo 1170×2532,
> timeline GSAP, tap-dots, pantalla 3 = mock de WhatsApp). NO es un sitio interactivo:
> sirve como referencia visual aprobada de home + detalle y como contrato de copy del
> mensaje de WhatsApp. Donde el HTML y el React difieren, **manda el HTML** (diffs
> anotados con 🔶 en cada sección). Lo que el HTML no cubre (footer, sobre mí, drawer
> menú, carrito de guardadas, filtros de operación) lo define el React legacy.

---

## 1. Identidad visual

### Colores (hex exactos)

| Rol | Valor | Uso |
|---|---|---|
| Ink / negro base | `#0a0a0a` | Texto principal, banner, footer, CTAs sólidos, fondo raíz detrás del frame |
| Ink soft | `#2a2a2a` | (HTML `--ink-soft`) cuerpo de descripción en detalle |
| Navy (acento marca) | `#1a3550` | Punto del logo, hover de CTAs, outline de thumb activa, badges "Destacada", checks, contador del drawer |
| Navy hover claro | `#2a4a6a` | Hover del botón de búsqueda del hero |
| Navy claro (footer) | `#6f9bc7` | Punto del logo en footer oscuro |
| 🔶 Dorado (HTML) | `#d4a04f` | `--accent` del HTML: `em` del título hero ("la encontramos juntos."), label "PROPIEDAD DESTACADA" del featured peek, outline de card destacada. **El React usa `text-white/70` en el em y `#1a3550` en el label — manda el HTML: dorado.** |
| Texto secundario | `#4a4a4a` | Links de nav, párrafos, specs de card |
| Muted | `#8a8a8a` | Labels uppercase, categorías, placeholders. (HTML usa `#6b6b6b` como `--muted` — equivalente funcional; para port usar token muted) |
| Border | `#e5e3df` | Todos los bordes (HTML: `#e6e6e6` / `#f0f0f0`) |
| Surface | `#f6f5f3` | Fondos suaves: pill "En preventa", sección CTA, hover de botones outline, footer del drawer de guardadas. (HTML `--chip-light: #f5f5f5`) |
| Placeholder img | `#ebe9e4` | Fondo de imágenes mientras cargan |
| Verde "online" | `#5cb85c` + halo `rgba(92,184,92,.25)` | Dot del banner de estado. 🔶 HTML usa `#3bd68a` + `rgba(59,214,138,0.25)` — manda HTML |
| Verde WhatsApp | `#25d366` | Hover del CTA "Contactar" de la property card |
| Blanco | `#ffffff` | Frame de página, cards, search pill |

### Tipografía

- 🔶 HTML: **Inter** para TODO (400/500/600/700/800), incluidos headings.
  El seed staging pone `headingFont: 'Manrope'` — el HTML manda: **Inter/Inter**.
- Tracking negativo sistemático: `-tracking-[.02em]` en headings/logo, `-.01em` en precios.
- Labels/kickers: uppercase, `tracking-[.22em]` (kicker), `.18em` (footer h3), `.14em`
  (badges), `.12em` (tags de card), 11px/10px, font-medium/semibold.
- Números siempre `tabular-nums`.
- Precios: `Intl.NumberFormat('en-US', { style:'currency', currency, minimumFractionDigits:0, maximumFractionDigits:0 })` → `$185,000`.

---

## 2. Estructura de página (home)

Orden vertical exacto:

1. **Skip link** (`sr-only focus:not-sr-only`, fondo `#0a0a0a`).
2. **Banner de estado** — sticky `top-0 z-[60]`, fondo `#0a0a0a`, texto blanco 12px,
   `min-h-[42px]`, dot verde con halo. Copy: desktop
   `Disponible esta semana · respondo en menos de 1 h por ` / mobile `Online ahora · `
   + link **WhatsApp** subrayado (`underline underline-offset-[3px] font-medium`) →
   `wa.me/<tel>?text=Hola {store.name}, te escribo desde tu sitio web.`
   Safe-area paddings (`env(safe-area-inset-*)`).
3. **Page frame (efecto pestaña)** — todo el contenido vive en
   `div.bg-white.rounded-t-[18px].relative.z-0.min-h-[calc(100dvh-42px)]` sobre el fondo
   negro; recibe `inert` cuando el drawer de menú está abierto.
4. **Nav** — sticky `top-[42px] z-[50]`,
   `bg-white/92 backdrop-blur-[14px] [backdrop-filter:saturate(140%)_blur(14px)] border-b border-[#e5e3df] rounded-t-[18px]`,
   contenedor `max-w-[1280px] py-3.5`:
   - Logo: `{store.name}` bold 18/20px `-tracking-[.02em]` + punto navy
     `<span className="text-[#1a3550]">.</span>` (patrón del HTML: `Carlos Mendoza — Remax.`).
   - Links desktop (`hidden lg:flex`, 13px, `#4a4a4a`): Propiedades (`#destacados`),
     **En preventa** como pill `bg-[#f6f5f3] px-3 py-[7px] rounded-[4px]`, Sobre mí, Contacto.
   - Derecha: CTA `Escribir` pill negra
     (`px-3 sm:px-4 py-2 rounded-full bg-[#0a0a0a] hover:bg-[#1a3550] hover:-translate-y-[1px]`,
     icono `MessageCircle` 3.5) + botón **Menú** pill outline
     (`border border-[#e5e3df] rounded-full hover:bg-[#f6f5f3]`, icono `Menu`) → drawer lateral.
5. **Hero** — `min-h-[clamp(520px,78dvh,780px)]`, imagen `store.coverImage ?? /cover.webp`
   cover + veladura `linear-gradient(180deg,rgba(0,0,0,.45)_0%,rgba(0,0,0,.25)_35%,rgba(0,0,0,.6)_100%)`
   (🔶 HTML: 4 stops hasta `.82` abajo — más oscuro al pie porque el contenido va abajo).
   - Kicker `ASESOR INMOBILIARIO` — 11px uppercase `tracking-[.22em]`, con líneas laterales
     (`before/after: w-[22px] h-px bg-white/50`).
   - H1 `text-[clamp(36px,7vw,82px)] font-semibold leading-[1.04] -tracking-[.02em]`:
     `Tu próxima casa <em>la encontramos juntos.</em>` — 🔶 em en dorado `#d4a04f` (HTML).
   - Bio (`store.bio` o fallback), 14px `opacity-85 max-w-[540px]`.
   - **Search pill**: `bg-white rounded-full pl-5 pr-1.5 py-1.5 max-w-[680px]
     shadow-[0_18px_40px_-16px_rgba(0,0,0,.35)]`, input transparente
     placeholder `Buscar por zona, tipo o precio…`, botón circular
     `w-11 h-11 rounded-full bg-[#1a3550] hover:bg-[#2a4a6a]` con lupa. Submit →
     scroll suave a `#destacados`.
   - **Quick filters**: chips glass derivadas de las categorías de los primeros productos
     (máx 4, únicas): `px-3.5 py-[7px] border border-white/35 rounded-full text-xs bg-white/10
     backdrop-blur-[6px] hover:bg-white/[.18] hover:border-white`; click → `setSearch(categoria)`
     + ancla `#destacados`. 🔶 HTML muestra estado `active` (chip blanca `bg:#fff color:#0a0a0a`)
     — portar chip activa cuando `search === categoria`.
6. **Featured peek** — card que "asoma" solapando el hero:
   `-mt-20 sm:-mt-[90px] z-[5]`, `<a>` hacia el detalle de la propiedad destacada
   (`products.find(p => p.featured && p.inStock) ?? products[0]`):
   `flex items-center gap-3 bg-white rounded-lg p-3.5 max-w-[440px]
   shadow-[0_30px_70px_-20px_rgba(0,0,0,.3)] hover:-translate-y-1`.
   Thumb 80/100px cuadrada, label `PROPIEDAD DESTACADA` 10px `tracking-[.14em]`
   (🔶 dorado por HTML), nombre `line-clamp-1`, categoría muted, precio 15px semibold.
7. **Grid de propiedades** (`#destacados`, `scroll-mt-[90px]`, `max-w-[1280px]`):
   - Header con `border-b border-[#e5e3df] pb-6 mb-8`: kicker
     `Portafolio · {N} disponible(s)` + H2 `Mis propiedades`
     (`text-[clamp(28px,4vw,44px)] font-semibold`).
   - **Filtros de operación** (radiogroup, scrollable-x sin scrollbar): pills
     `Todas / Comprar / Alquilar / Preventa` —
     activa: `bg-[#0a0a0a] text-white border-[#0a0a0a]`;
     inactiva: `text-[#4a4a4a] border-[#e5e3df] hover:border-[#0a0a0a]`.
     `detectOperation(p)`: tag/spec `preventa` → preventa; tag `alquiler` o spec
     `Operación=alquiler` → alquilar; resto → comprar.
   - Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8` de property cards (§3).
   - Empty: `No hay propiedades que coincidan con tu búsqueda.` (centrado, muted).
   - 🔶 En el HTML móvil las cards van en columna única full-width con `gap: 72px` —
     coherente con el breakpoint mobile.
8. **Sobre mí** (`#sobre-mi`) — grid `lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20`:
   retrato `aspect-[4/5] rounded-md` (`store.avatar`), kicker `SOBRE MÍ`, H2
   `Años viendo cómo se mueve el mercado.`, bio + párrafo fijo
   `Mi forma de trabajar: pocas propiedades, conversación larga, recorridos con tiempo. Cero presión.`,
   y **3 stats** sobre `border-t`: `{N}+ / Propiedades`, `12 / Años de carrera`,
   `< 1h / Respuesta` (22/28px semibold + label 10/11px uppercase `tracking-[.16em]`).
9. **CTA grande** — fondo `#f6f5f3`, centrado, `py-20 sm:py-[100px]`:
   kicker `¿Quieres vender o buscas algo puntual?`, H2
   `Escríbeme. Respondo yo, no un call center.` (`clamp(30px,5.5vw,60px)`),
   párrafo, botón pill negra `Escribir por WhatsApp` + `MessageCircle`
   (wa text: `Hola {store.name}, quiero más información sobre tus propiedades.`).
10. **Footer oscuro** (`#contacto`) — `bg-[#0a0a0a] text-white/75 pt-[70px] pb-8`,
    grid `md:grid-cols-[1.6fr_1fr_1fr]`:
    - Col 1: logo blanco 22px + punto `#6f9bc7`, bio 13px, contactos
      (WhatsApp con número visible, `mailto:` "Escribir por email", iconos 3.5 `opacity-70`).
    - Col 2 `PROPIEDADES`: botones Comprar/Alquilar/Preventa → `setFilter` + scroll a grid.
    - Col 3 `ZONAS`: hasta 4 categorías únicas → `setSearch(zona)` + scroll.
    - Bottom bar `border-t border-white/10 pt-6`, 12px `text-white/50`:
      `© {año} {nombre} · Asesor inmobiliario` · iconos circulares 34px
      (`border border-white/20 hover:bg-white/10 hover:border-white`) IG + WA ·
      `Creado con ByLink`.
11. **Barra flotante de guardadas** — solo si `totalItems > 0`: fija bottom,
    `bg-white/95 backdrop-blur-lg border-t`, botón full-width `max-w-[720px] h-12
    rounded-full bg-[#0a0a0a] hover:bg-[#1a3550]`:
    `[Bookmark][badge blanco con contador] Ver propiedades guardadas [ArrowRight]` → abre drawer §5.
12. **Drawer de menú** (aside, `role=dialog`): panel derecho `w-[min(420px,92vw)]`,
    `shadow-[-20px_0_50px_-20px_rgba(0,0,0,.3)]`, slide-in 350ms
    `cubic-bezier(.2,.7,.3,1)`, backdrop `bg-black/50 backdrop-blur-[2px]`.
    Header logo + botón X circular outline; links 22px medium con `border-b` y flecha
    que aparece/desliza en hover (Propiedades, En preventa, Sobre mí, Contacto);
    footer `mt-auto` con kicker `¿Buscas algo puntual?` + pill negra WhatsApp.
    A11y completa: focus trap Tab/Shift-Tab, Escape cierra, autofocus en X,
    `body.overflow=hidden`, `inert` en el frame, restaura foco al cerrar.

---

## 3. Property card (con specs m²/hab/baños)

Estructura: `<li>` con hover `-translate-y-[3px]` (250ms `cubic-bezier(.2,.7,.3,1)`);
el bloque imagen+texto es un `<Link>` al detalle, el CTA es un `<a>` de WhatsApp aparte.

```tsx
<div className="relative aspect-[4/3] rounded overflow-hidden bg-[#ebe9e4] mb-4">
  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
  {/* badge de tag: Nuevo | Preventa | Alquiler | Vendido */}
  <span className={`absolute top-3 left-3 text-[10px] font-semibold tracking-[.12em] uppercase
    px-2.5 py-[5px] rounded-[3px] backdrop-blur-sm
    ${isSold ? 'bg-[#0a0a0a] text-white' : 'bg-white/95 text-[#0a0a0a]'}`}>
```

- **Fila precio**: `text-[20px] font-semibold tabular-nums` + sufijo
  `<span className="text-xs text-[#8a8a8a]"> /mes</span>` si `Operación=alquiler`;
  a la derecha `USD` (o `Alquiler`) en 12px uppercase muted.
- Nombre `text-sm line-clamp-2`, categoría `text-xs text-[#8a8a8a] line-clamp-1`.
- **Fila de specs** (la firma del tema) — solo si hay alguna:

```tsx
<div className="flex gap-[14px] text-xs text-[#4a4a4a] border-t border-[#e5e3df] pt-3 tabular-nums">
  <span className="inline-flex items-center gap-[5px]"><Bed className="w-3.5 h-3.5" strokeWidth={1.6}/>{hab}</span>
  <span ...><Bath .../>{bath}</span>
  <span ...><Square .../>{m2} m²</span>
</div>
```

  Fuente de datos: `product.specs['Habitaciones' | 'Hab']`, `['Baños' | 'Banos']`,
  `['m²' | 'm2']` (attributes con `role='spec'`, primera option). Iconos lucide
  `Bed/Bath/Square` con `<span className="sr-only">` por accesibilidad.
- **CTA**: pill full
  `mt-[14px] px-4 py-[11px] rounded-full text-[13px] active:scale-[0.98]` —
  disponible: `bg-[#0a0a0a] text-white hover:bg-[#25d366]` + `MessageCircle`, texto
  `Contactar`; vendida (`tag vendido` o `!inStock`): outline
  `border-[#e5e3df] hover:bg-[#f6f5f3]`, texto `Pedir similar`.
  href WA con mensaje:
  `Hola {store}, me interesa {nombre} ({precio} {moneda}). ¿Podemos coordinar una visita?`
- 🔶 HTML (video) simplifica la card (sin specs ni badges en las 2 cards de demo) y usa
  `border-radius: 20px` + `box-shadow 0 10px 32px -12px rgba(0,0,0,0.12)` +
  `border: 1px solid #f0f0f0` como card contenida (imagen dentro de la card, body con
  padding) — vs React que usa imagen suelta sin card. **Manda el HTML: card contenida
  con radio 20px, sombra suave y body con padding**; conservar la fila de specs del React
  (el HTML de video no la muestra pero es feature aprobada del tema). Estado destacado:
  `outline: 4px solid #d4a04f; outline-offset: 8px`.

---

## 4. Product detail PROPIO

Página completa (no sheet): mismo banner de estado + nav + drawer que la home
(logo linkea a `backHref` con `?preview=` preservado).

1. **Breadcrumb**: `Inicio / Propiedades / {nombre}` — 12px muted, actual en ink medium.
2. **Galería** — grid `lg:[grid-template-columns:1.5fr_1fr] lg:[height:clamp(380px,60vh,580px)] gap-2 lg:gap-3`:
   - Imagen principal (botón, `rounded-md bg-[#ebe9e4]`, `h-[260px] sm:h-[320px] lg:h-full`)
     con pill flotante `Ver las {N} fotos`
     (`absolute right-4 bottom-4 bg-white/95 rounded-full px-4 py-2 text-xs
     shadow-[0_6px_18px_-8px_rgba(0,0,0,.4)] backdrop-blur-[8px]` + icono `Grid3x3`).
   - Hasta 4 thumbs: mobile fila scrollable `snap-x` (140×90), desktop grid 2×2.
     Activa: `outline outline-2 outline-[#1a3550] outline-offset-2`; inactiva
     `opacity-75 hover:opacity-100`. Última thumb con overlay `+{extra}` si hay más fotos
     (`bg-black/55 text-white text-xs grid place-items-center`).
3. **Listing** — grid `lg:[grid-template-columns:1.45fr_1fr] gap-8 lg:gap-[60px]`:
   - Columna izquierda:
     - Badge `DESTACADA` si `featured` (`text-[#1a3550] bg-[#f6f5f3] rounded-[3px]`).
     - H1 `clamp(28px,4.4vw,48px)`; ubicación = categoría con `MapPin`.
     - **Strip de specs** `grid-cols-2 sm:grid-cols-4 border-y border-[#e5e3df] py-5`:
       por spec, icono 18px `opacity-55` + valor `text-[18px] font-semibold tabular-nums`
       + label 11px uppercase `tracking-[.12em]` muted.
       `Bed→Habitaciones`, `Bath→Baños`, `Square→{m2} m² / Construcción`,
       `Car→Estacionamientos` (lee `Estacionamientos|Parking`; ojo: el seed graba
       `Estacionamiento` singular — incluir en fallbacks).
     - **Descripción**: h2-label `DESCRIPCIÓN` 18px uppercase `tracking-[.14em]` muted con
       `border-b`; párrafos `split(/\n{2,}/)`, 15px `leading-[1.75] max-w-[64ch]`.
     - **Características** (attributes `role='tag'`, todas las options): mismo h2-label,
       lista `sm:grid-cols-2 gap-x-7`, ítems `py-2.5 border-b border-dashed` +
       `Check` navy 4×4.
   - **Aside sticky** (`lg:sticky lg:top-[110px]`):
     - Card de precio `border border-[#e5e3df] rounded-xl p-6
       shadow-[0_8px_30px_-20px_rgba(0,0,0,.25)]`: label `PRECIO DE VENTA/ALQUILER`,
       precio `clamp(28px,4.4vw,40px)` (+`/mes` si alquiler), sub `USD · {Venta|Alquiler|Preventa}`.
     - CTAs apilados: **Contactar por WhatsApp** (pill negra→navy; mensaje
       `Hola {store}, me interesa {nombre} ({precio} {moneda}). ¿Cuándo podemos coordinar una visita?`);
       si NO hay teléfono → botón `Consultar disponibilidad` que dispara
       `paymentProvider.checkout` de 1 ítem (+`trackEvent CHECKOUT_START`);
       **Llamar por teléfono** (outline, `tel:`); **Guardar/Guardada** toggle Bookmark
       (guardada: `bg-[#1a3550] text-white`, ícono `fill=currentColor`) — agrega/quita
       del "carrito" de guardadas.
     - Grid info 2×2 (`border-t pt-6`): `Referencia` = `product.id.slice(0,10).toUpperCase()`
       · `Estado` = Disponible/No disponible · `Operación` · `Zona` = categoría.
       🔶 El HTML confirma este bloque (grid con borde `#e6e6e6`, radio 18) y añade
       `Habitaciones` como 4ª celda en el video — mantener las 4 del React.
     - **Agent card**: avatar 56px circular + `ASESOR` / `{store.name}` /
       `Responde en menos de 1 h` (idéntico en HTML: `pd-asesor`).
4. **Similares**: header `Propiedades similares` + link `Ver todo →`; grid de 3
   property cards (mismo componente §3), excluye el actual.
5. **Sticky CTA móvil** (`lg:hidden fixed bottom-0`, `bg-white/95 backdrop-blur-lg border-t`):
   precio + `{moneda} · {operación}` a la izquierda, pill negra `Contactar` a la derecha.
   🔶 HTML confirma este patrón (`pd-sticky` con precio 52px + CTA full
   `Contactar por WhatsApp` con sombra superior) — en el video es la ÚNICA fila de acción:
   priorizarla visualmente.
6. **Botón flotante desktop** `Guardadas` (bottom-6 right-6, pill negra con badge) si
   `totalItems > 0`.

---

## 5. Cart drawer PROPIO — "Propiedades de interés" (NO es carrito de compra)

**Flujo real del tema**: no hay compra ni cantidades. El "carrito" es una lista de
**propiedades guardadas** (bookmark) para consultar por todas en un solo mensaje de
WhatsApp. Contacto directo por propiedad convive con esto (CTA de card y de detalle van
directo a `wa.me`). El drawer usa `Sheet` shadcn (`sm:max-w-md p-0 bg-white border-[#e5e3df]`):

- **Header**: `Building2` navy + `Propiedades de interés` + contador pill
  `bg-[#1a3550] text-white text-[11px] rounded-full` a la derecha.
- **Empty**: círculo `#f6f5f3` con `Building2` gris, `Aún no guardaste propiedades` /
  `Guarda las que te interesen y consulta por todas en un mensaje.`
- **Ítems**: card `border border-[#e5e3df] rounded-lg p-3`, imagen `h-20 w-28` (foto de la
  propiedad), nombre `line-clamp-2`, precio navy `#1a3550` semibold tabular, botón
  `Trash2` (`hover:text-red-500 hover:bg-red-50`). Sin qty, sin variantes, sin total.
- **Footer** (`bg-[#f6f5f3] border-t`): nota
  `Se enviará una consulta con esta propiedad / estas {N} propiedades.` + botón
  `h-12 rounded-full bg-[#0a0a0a] hover:bg-[#1a3550]` — `Consultar por WhatsApp`
  (loading `Enviando…`). Al enviar: `trackEvent(slug,'CHECKOUT_START')` →
  `paymentProvider.checkout({ items quantity:1, total, currency, storeSlug })` →
  `clearCart()` + cierra.

---

## 6. Interacciones

**React legacy:**
- Búsqueda del hero filtra por `name | category | description` (case-insensitive) y el
  submit hace `scrollIntoView({behavior:'smooth'})` a `#destacados`.
- Quick-filter chips = `setSearch(categoria)`; filtros de operación = radiogroup con
  estado `filter`; los dos se combinan (AND) en el `useMemo` de filtrado.
- Footer: columnas Propiedades/Zonas re-disparan `setFilter`/`setSearch` + scroll suave.
- Drawer menú: focus trap completo (Tab circular), Escape, autofocus, `inert`,
  `body.overflow`, restauración de foco. Transición 350ms `cubic-bezier(.2,.7,.3,1)`.
- Hovers: cards `-translate-y-[3px]`, imagen `scale-[1.04]` 500ms, CTAs `-translate-y-[1px]`,
  `active:scale-[0.98/0.99]` en botones.
- Año del copyright vía `useEffect` (evita hydration mismatch).
- `?preview=` se propaga en todos los `Link` internos.

**JS del HTML (composición de video — contratos a respetar):**
- Secuencia: home (entra banner→header→kicker→título→desc→search→filters) →
  2 scroll-pans → highlight de card (`outline 4px #d4a04f offset 8px`) → tap en
  `Contactar` → fade al detalle → scroll → pulso del sticky CTA → tap → pantalla WhatsApp.
- **Contrato de copy del mensaje WA** (pantalla 3):
  `¡Hola {asesor}! 👋⏎⏎ Me interesa {propiedad} 🏠⏎ Precio: {precio} {moneda}⏎ Ref: {referencia}⏎⏎ ¿Podemos coordinar una visita?`
  — incluye la **Referencia** (id truncado §4.3), que el mensaje del React no trae.
  Al portar, preferir este formato para los CTAs de consulta.

---

## 7. Demo data real (`seed-inmuebles.ts`)

Store: **Andrea Torres Propiedades** — slug `andrea-torres-propiedades`
(demo: `demo-andrea-torres-propiedades`, user `demo-inmuebles@example.com` / `password123`,
`isDemo=true`). `template: 'inmuebles'`, plan PRO activo, `stockEnabled: false`,
WhatsApp `+584141234567`, IG `andreatorres.propiedades`,
email `andrea@torrespropiedades.com`, currency `{ code:'USD', symbol:'$', locale:'es-VE' }`,
logo `/demo-assets/inmuebles/logo.jpg`, banner `/demo-assets/inmuebles/banner.jpg`.
Bio: `Agente inmobiliario certificado. Casas, apartamentos, terrenos y locales comerciales. +10 años asesorando compra y venta de inmuebles.`

Categorías (orden): Casas · Apartamentos · Terrenos · Locales Comerciales.
Attributes por producto: `role='spec'` (`Habitaciones`, `Baños`, `m²`, `Año`,
`Estacionamiento` — 1 option c/u) + `role='tag'` (`Características`, options = tags).

| Propiedad | Precio | Cat | hab/baños/m²/año/parking | Tags | Fotos `/demo-assets/inmuebles/` | ★ |
|---|---|---|---|---|---|---|
| Casa con Piscina y Vista al Mar | $185,000 | Casas | 4/3/280/2018/3 | Piscina, Vista al mar, Vigilancia 24h | casa1, casa1b, casa1c | ★ |
| Casa Moderna en Complejo Turístico | $145,000 | Casas | 3/2/200/2020/2 | Vista al mar, BBQ | casa2, casa2b | ★ |
| Townhouse en Urbanización Privada | $95,000 | Casas | 3/2/180/2016/2 | Urbanización cerrada, Parque infantil | casa3, casa3b | |
| Casa de Playa Frente al Mar | $320,000 | Casas | 5/4/350/2019/4 | Piscina, Frente al mar, Jacuzzi | casa4 | ★ |
| Apartamento con Vista al Mar | $65,000 | Apartamentos | 2/2/95/2017/1 | Vista al mar, Piscina, Gimnasio | apto1, apto1b | ★ |
| Estudio Amoblado Céntrico | $35,000 | Apartamentos | 1/1/55/—/1 | Amoblado, Inversión | apto2, apto2b | |
| Penthouse Duplex con Terraza | $195,000 | Apartamentos | 3/3/180/2021/2 | Penthouse, Terraza, Jacuzzi, Vista 360° | apto3 | ★ |
| Apartamento Familiar en Zona Residencial | $42,000 | Apartamentos | 3/2/120/—/1 | Pozo de agua | apto4 | |
| Terreno 500m² con Vista al Mar | $75,000 | Terrenos | —/—/500 | Servicios completos, Vista al mar | terreno1 | |
| Parcela 1200m² en Zona Industrial | $55,000 | Terrenos | —/—/1200 | Zona industrial, Vía principal | terreno2 | |
| Local Comercial en Centro Comercial | $48,000 | Locales Comerciales | —/—/85 | Alto tráfico, Planta baja | local1 | |
| Oficina Premium en Torre Empresarial | $68,000 | Locales Comerciales | —/—/120/—/2 | Planta eléctrica, Pozo de agua, AC central | local2 | ★ |

Descripciones completas en el seed (multi-frase con specs narradas). Nota: las specs del
seed usan `Estacionamiento` (singular) — la property card/detail legacy busca
`Estacionamientos|Parking`: unificar claves al portar.

⚠️ El seed pone `primaryColor:'#1A3A52'` / `secondaryColor:'#D4AF37'` (paleta de
`estate`) — irrelevante en staging v2 (los colores salen de los tokens del tema), pero
no usarlos como referencia de `inmuebles`. El tema `inmuebles` es negro+navy.

---

## 8. Diff vs staging actual

Staging renderiza `inmuebles` con el **TemplateRenderer genérico por secciones** (no hay
renderer custom) + `cart-sheet.tsx` y `preview-product-sheet.tsx` genéricos.

| Elemento legacy/HTML | Staging hoy | Gap |
|---|---|---|
| Banner de estado negro (dot verde + WhatsApp) | No existe | Falta |
| Page frame `rounded-t-[18px]` sobre fondo negro | No existe | Falta |
| Nav propio (logo con punto navy, pill "En preventa", drawer con focus trap) | `NavBar` genérica del renderer | Falta |
| Hero con search pill + quick filters glass | `hero` variant `banner` (kicker `Tu próximo hogar`, imagen Unsplash) | Falta search/chips; kicker distinto (`Asesor Inmobiliario` en HTML) |
| Featured peek solapado | No existe | Falta |
| Filtros de operación (Todas/Comprar/Alquilar/Preventa) | `product_grid` con `showFilters` (filtro por categoría genérico) | Falta detección por specs/tags |
| Property card con specs Bed/Bath/Square + badge + CTA WhatsApp | Card genérica de `product_grid` (sin specs — `TemplateProduct` no expone attributes) | Falta contrato de datos + card |
| Detalle propio (galería 1.5fr/1fr, strip specs, aside sticky, referencia, agent card, similares, sticky móvil) | Página de producto genérica / `PreviewProductSheet` (ejes de variantes, qty, "Agregar al carrito") | Falta por completo; el sheet genérico es anti-patrón para propiedades |
| "Propiedades de interés" (guardadas, sin qty, consulta agrupada) | `CartSheet` genérico (qty ±, total, form nombre/teléfono/notas, "Pedir por WhatsApp") | Semántica equivocada para el nicho |
| Footer oscuro 3 columnas con filtros/zonas | `footer_main` genérico + `FooterBranding` | Falta |
| Sobre mí con 3 stats | `about_main` genérico (sin stats) | Parcial (existe `stats` section en el catálogo, no está en el schema de inmuebles) |
| Tokens (`page-builder.seed.ts` → `inmueblesTemplate.defaultTokens`) | `primary #1a3550, secondary #0a0a0a, accent #1a3550, bg #ffffff, surface #f6f5f3, text #0a0a0a, muted #4a4a4a, border #e5e3df` | ✅ Paleta correcta, salvo: **accent debería ser el dorado `#d4a04f`** del HTML (hoy duplica primary) y `headingFont` es `Manrope` (HTML: Inter) |
| Demo data (`demoRealEstate()`) | "Norte Inmuebles Demo", 4-5 productos con fotos Unsplash y specs narradas solo en descripción | Reescribir con seed-inmuebles (12 propiedades, fotos locales, attrs spec/tag) |
| Secciones extra del staging (`map_main`, `contact_main`) | Presentes en el schema | No existen en legacy; mantener como opcionales delegadas al catálogo |

---

## 9. Plan de port (renderer custom nivel 2)

Patrón `PersonaRenderer` (`components/storefront-v2/themes/persona/index.tsx`),
registrado en `themes/registry.tsx` → `THEME_RENDERERS['inmuebles']`.

1. **Archivos**: `components/storefront-v2/themes/inmuebles/index.tsx` (home) +
   `product-detail.tsx` + `cart-drawer.tsx` propios. El registro hoy solo despacha el
   index — el detalle y el carrito propios necesitan que la página de producto y el
   host del carrito también despachen por tema (mismo pending que persona documenta).
2. **Contrato**: `TemplateRendererProps` completo — `store, products, categories, theme,
   onOpenProduct, productHref, cartCount, onOpenCart, rate, editorSelectedKey,
   onSectionClick`. Cards: `<a href={productHref(p)}>` cuando hay `productHref` (tienda
   real, SEO/middle-click); botón + `onOpenProduct(p)` en editor/previews. La barra
   "Ver propiedades guardadas" usa `cartCount`/`onOpenCart` (no `useCart` directo en el
   renderer). Respetar `editorSelectedKey`/`onSectionClick` con el `editorWrap` de persona.
3. **Tokens `--bl-*` (nunca hex hardcodeado)**: negro → `--bl-text`/`--bl-secondary`;
   navy → `--bl-primary`; dorado → `--bl-accent` (corregir seed: `accent: '#d4a04f'`);
   blanco → `--bl-background`; `#f6f5f3` → `--bl-surface`; `#e5e3df` → `--bl-border`;
   muted → `--bl-text-muted`; fuentes `--bl-heading-font`/`--bl-body-font` (seed →
   `Inter`/`Inter` según HTML); radios con `--bl-radius`, ritmo con `--bl-spacing`.
4. **Responsive**: SOLO container queries —
   `@container bl-inmuebles (max-width: 760px) { … }` con `containerType: 'inline-size'`
   + `containerName` en el root (regla del framework; los previews embebidos miden el
   frame, no el viewport). Breakpoints a cubrir: nav (ocultar links), hero (tamaños
   clamp ya lo resuelven), grid 3→2→1, galería detalle (thumbs fila snap), sticky CTA
   móvil vs aside.
5. **Mapping de secciones** (respetar orden/visibilidad/props del árbol):
   `hero` → banner de estado + nav + hero con search + quick filters (props kicker/
   headline/subheadline/image); `product_grid` → featured peek + filtros de operación +
   grid de property cards (props title/layout/showFilters/showPrice); `about` → Sobre mí
   con stats; `cta_banner` (añadir al schema) → CTA grande; `footer` → footer oscuro
   propio; `contact`/`map` → delegar a `SectionRenderer` base.
6. **Contrato de datos para specs**: extender `TemplateProduct` con
   `specs?: Record<string,string>` y `tags?: string[]` (derivados de attributes
   `role='spec'/'tag'` en la API pública y en `demoDataJson`), con las claves canónicas
   `Habitaciones | Baños | m² | Año | Estacionamiento`. Reescribir `demoRealEstate()`
   con los 12 productos/fotos del seed-inmuebles (tarea #23 del README).
7. **Precios**: usar `priceCtx`/`rate` del contrato (toggle Bs) en lugar del
   `Intl.NumberFormat` fijo del legacy; mantener `maximumFractionDigits: 0`.
8. **Carrito/consulta**: `InmueblesCartDrawer` fiel a §5 (guardadas, sin qty), themeado
   por tokens; checkout vía `paymentProvider` con mensaje WA formato HTML (§6, con Ref).
9. **No portar**: pantalla WhatsApp del HTML (es video), GSAP, tap-dots, `checkout`
   directo sin teléfono puede mantenerse como fallback.
