# Journal — Fase 2 front-prod

Fuente: `docs/plan-fase2-front-prod.md`. Rama `fase2/front-prod` desde `staging/bylink`.

---

## B0 — Base de diseño, tokens y assets (2026-07-09)

- **`public/placeholder.svg`** creado (no existía → imágenes rotas en ~15 lugares: cards de producto, cart-drawers, wishlist, store-header en todos los templates legacy). SVG neutro con la paleta `--bg-2`/`--line`/`--ink-3`.
- **Primitivos `components/bylink/`**: verificado que `.btn` (usado por `Button`) ya cubre `:hover`, `:focus-visible` y `:disabled` en `globals.css:328-360`. No requirió cambios.
- **Contraste AA — 2 casos corregidos:**
  - `components/landing-v2/landing-page.tsx`: número "02" del paso 2 (how-it-works) y checkmarks del plan Pro (pricing) usaban `var(--accent)` (coral #DC4A3D) como texto sobre fondo navy → ~2.51:1, falla AA. Cambiados a `#fff` (ya usado como color base heredado en esas tarjetas, consistente con el resto del texto blanco).
  - `components/dashboard-v2/orders-board.tsx`: id de pedido, resumen de items y teléfono del cliente usaban `var(--ink-3)` (#94A3B8) en 10-12px sobre blanco → ~2.9:1. Cambiados a `var(--ink-2)` (#475569), sigue siendo tono secundario pero pasa AA.
- **Diferido a B7:** contraste del placeholder de búsqueda en el template Noir (legacy, ~1.5:1) — ese template se retira en B7/B8, no vale tocarlo dos veces.
- Tokens navy-coral confirmados vigentes en `app/globals.css` (`--brand`, `--accent`, `--ink-*`, `--bg-*`), sin restos de paleta turquesa/dorada en el sistema base (los restos de marca vieja viven en componentes legacy — se tratan en B2).

**Verificación:** `npx tsc --noEmit` limpio.

---

## B1 — Higiene: andamiaje demo fuera, mocks apagados (2026-07-09)

**Andamiaje eliminado de rutas reales:**
- `components/panel-v2/panel-official.tsx`: el modo mobile dependía de un **toggle manual** (`.demo-toggle`, z-10000) que forzaba una clase `.bp-mobile` — no del viewport real. Quitar solo el toggle habría dejado el panel roto en celulares reales (sin bottom-nav/FAB/topbar, con el top-dock desktop desbordando). Se rehizo de raíz:
  - Eliminado el toggle + el "device-frame" con bisel de teléfono (chrome decorativo solo-demo).
  - Todas las reglas `.bpanel.bp-mobile X` migradas a un bloque `@media (max-width: 768px)` real, con `m-topbar`/`m-bottom-nav`/`m-fab`/`quick-actions-sheet` pasados de `position: absolute` (relativo al bisel que ya no existe) a `position: fixed` (patrón correcto de app mobile-web, pinneados al viewport real, con `env(safe-area-inset-bottom)`).
  - `mobile` ahora se deriva de `matchMedia("(max-width: 768px)")` con listener de resize, no de estado manual.
  - Fix adicional encontrado en el camino: `.pc-actions` (editar/duplicar en las cards de producto) solo aparecía en `:hover` → inalcanzable en táctil. Ahora siempre visible en el breakpoint mobile.
  - Fix adicional: faltaba el tab "Pedidos" en el bottom-nav móvil (`grid-template-columns` pasó de 4 a 5 columnas).
  - `/panel-demo` pierde el toggle mostrar-como-mobile (usaba el mismo componente compartido); ahora para ver el layout mobile del demo hay que angostar la ventana real, igual que en prod.
- `components/auth-v2/auth-desktop/index.tsx` y `auth-mobile/index.tsx`: el FAB "🧭/📱 Saltar a…" (z-999) estaba baked-in sin gate — aparecía en `/login` y `/registro` **reales** porque comparten el mismo componente `AuthDesktopFlow`/`AuthMobileFlow` con la ruta demo `/acceso` y `/acceso/movil`. Se agregó un prop `showScreenJumper` (default `false`); solo `app/acceso/page.tsx` y `app/acceso/movil/page.tsx` lo pasan en `true`. `/login` y `/registro` ya no muestran el FAB.

**Mocks apagados (regla: sin dato o fetch fallido → empty-state/error real, nunca número inventado):**
- `components/dashboard-v2/dashboard-overview.tsx`:
  - Quitados los fallbacks `?? 847` / `?? 4280` / `?? 12` en los KPIs → ahora `?? 0` (dato real o cero real, nunca inventado).
  - Quitado `MOCK_ORDERS` y la rama `useRealOrders ? … : MOCK_ORDERS`; `orders` ahora es siempre un array real (`[]` por defecto), con `ordersError`/`statsError` separados del estado de carga para distinguir "cargando" / "vacío real" / "falló el fetch" (antes un error tumbaba `stats`/`orders` a `null` y eso disparaba el mock).
  - Panel "Pedidos recientes": 3 estados reales (error / cargando / vacío con copy accionable) en vez de mock.
  - Panel "Top productos": agregado estado de error separado del vacío real.
  - Panel "De dónde llegan" (62/24/9/5% hardcodeado con badge "demo" chiquito): reemplazado por card honesta "Próximamente" — no hay endpoint de fuentes de tráfico todavía.
  - Panel "Pendiente esta semana" (lista de tareas 100% inventada, sin ningún modelo de datos real detrás): **eliminado**, no es un "mock de un endpoint futuro", era contenido decorativo sin backing feature.
  - Bug "Hola Hola" corregido: `greeting()` devolvía el literal `"Hola"` como fallback de nombre, y el render anteponía otro "Hola" → `greetName` ahora es `""` si no hay nombre, con render condicional (`"¡Hola, buen día!"` sin nombre repetido).
- `components/dashboard-v2/catalog-board.tsx`: quitado `MOCK` (6 productos falsos) y el `if (!products) return MOCK`; `products` ahora es siempre `[]` por defecto. `published`/`draft` ya no caen a `Math.floor(total*0.7)` heurístico, siempre cuentan sobre datos reales. Loading check ajustado a `products.length === 0` en vez de `!products`.
- `components/dashboard-v2/analytics-board.tsx`: quitada la rama `!storeId` que renderizaba las 4 widgets sin `data` (mostrando sus defaults `MOCK_SUMMARY/MOCK_TOP/MOCK_FUNNEL/MOCK_SOURCES` completos) → ahora muestra "Selecciona una tienda para ver sus datos." `SourcesWidget` (sin endpoint backend — BE-126 no tiene `/sources`) ahora recibe explícitamente `{ sources: [] }` en vez de quedar sin `data` y caer al mock.
- `components/dashboard-v2/analytics-widgets.tsx`: agregado estado vacío a `SourcesWidget` ("Sin datos de tráfico todavía.") — cambio no-breaking, la ruta demo (`/analytics-demo`, único otro consumidor) sigue mostrando su mock porque no pasa `data` y por lo tanto nunca cae en el array vacío.

**Diferido a B5 (fuera de alcance de "higiene"):** los botones "Compartir tienda"/"Nuevo producto" del header de `dashboard-overview.tsx` siguen sin `onClick` — cablearlos requiere que el padre (`PanelOfficial`) exponga un callback de navegación/acción, que es del mismo tipo de trabajo que el resto de "botones muertos" que B5 ya tiene asignado. No se tocó aquí para no duplicar el patrón dos veces.

**Verificación:** `npx tsc --noEmit` limpio · `pnpm build` limpio (39 rutas) · grep-guard sin coincidencias de `María Alvarado`/`Vestido Camelia`/`Julián Rodríguez`/`demo-toggle`/`z-index.*10000` en rutas reales · FAB "Saltar a…" confirmado ausente en el JSX de `/login` y `/registro`.

---

## B2 — Rebrand de lo legacy visible (2026-07-09)

**Criterio de alcance usado (importante para las sesiones que sigan):** antes de tocar cada archivo verifiqué si la ruta/componente es **realmente reachable hoy** y si **sobrevive** a los bloques siguientes de esta misma sesión. Si un archivo con marca vieja va a ser reescrito o retirado por B4/B6/B7/B8 más adelante en este mismo run, **no lo recoloreé ahora** — hacerlo sería doble trabajo (se pisa cuando ese bloque corra). Documento la lista exacta de "diferidos" abajo para que quien continúe no piense que quedaron sueltos por descuido.

**Rebrandeado ahora (rutas reales que sobreviven tal cual):**
- `app/[slug]/page.tsx`: OG image/canonical/siteName `biolinkstore.com`/"Bio Link Store" → `bylink.app`/"ByLink" (nota: este archivo se reemplaza por el renderer templado en B7, pero el fix de metadata es de una línea y sin costo si se pisa).
- `components/store-page-client.tsx`: badge "Creado con Bio Link Store" (con ícono SVG viejo teal) → wordmark "bylink." + link a `bylink.app`.
- `app/home/terminos/page.tsx`: rebrand completo — título/metadata, las 8 apariciones de "Bio Link Store" → "bylink", `biolinkstore.com`/`soporte@biolinkstore.com` → `bylink.app`/`soporte@bylink.app`, logo `LogoFull` (ícono teal + wordmark "biolinkstore") → `BrandMark` + wordmark "bylink.", enlaces `#33b380` → `var(--accent)`.
- `app/(auth)/olvide-password/page.tsx` y `reset-password/page.tsx` (rutas reales y funcionales hoy — B3 decide después si las reemplaza): metadata title/description; `components/auth/{forgot-password-form,reset-password-form}.tsx`: `LogoIcon` viejo → `BrandMark`, todos los `#33b380`/`#6ee490` → `var(--brand)`/`var(--brand-2)`/`var(--brand-3)`.
- `app/globals.css`: `.gradient-background` y `.cta-grad-bar` (utilidades "preserved... Fase 2 reintegra" — literalmente esperaban este bloque) recoloreadas de `#33b380,#327be2,#6ee490,#595f73/#C9A86C` (teal/azul/verde/dorado viejo) a `#1E3A8A,#3B5BDB,#DC4A3D,#0A0F1F/#F97066` (navy/coral). Afecta a `/olvide-password`, `/reset-password` y, como beneficio colateral gratis, a componentes legacy ya muertos que las importan (no se tocaron esos por separado).
- `app/dashboard/layout.tsx`: metadata title/description (envuelve TODO `/dashboard/*`, incluida la ruta raíz nueva `/dashboard` que hoy tapa esto visualmente con el overlay de `PanelOfficial` pero el `<title>` de la pestaña seguía diciendo "Bio Link Store").
- `components/dashboard/dashboard-shell.tsx` (el nav lateral legacy — sigue siendo la chrome visible de `/dashboard/plan`, `/pagos`, `/plantillas` hasta que B5/B6/B7/B8 los redirijan): `LogoFull` → `BrandMark` + wordmark, todos los `#33b380`/`#327be2`/`#6ee490` → `var(--brand)`/`var(--accent)`/`var(--ink-3)`.
- `components/dashboard/store-switcher.tsx` y `profile-completion-modal.tsx` (viven dentro del shell anterior, mismo criterio): recoloreados. En el SVG de `profile-completion-modal` usé hex literal (`#1E3A8A`/`#DC4A3D`) en vez de `var(--brand)` porque es un `<stop stopColor>` de gradiente SVG — más seguro con hex literal que confiar en soporte de CSS custom properties ahí.
- `app/dashboard/plan/page.tsx` (40 apariciones — la página de facturación/planes, sin equivalente v2 asignado en el plan): remapeo consistente de paleta de 3 tonos (free/pro/business eran `#6ee490`/`#33b380`/`#327be2`) a `var(--ink-3)`/`var(--brand)`/`var(--accent)`, incluidos los `colorBg` en rgba (recalculados a los rgb de los nuevos tokens) y los hovers oscuros (`#2a9669` etc.) a `var(--brand-3)`/`var(--accent-2)`.
- `app/dashboard/pagos/page.tsx` (15 apariciones, sin equivalente v2): mismo remapeo de paleta; `components/dashboard/payment-report-form.tsx` (usado ahí) también recoloreado.
- `app/dashboard/plantillas/page.tsx` (2 apariciones): recoloreado.
- `app/(auth)/login/oauth/page.tsx` (pantalla de loading real del callback de Google): recoloreada.
- **Voseo rioplatense → tuteo neutro** en componentes v2 **reales que persisten** (no se tocó el voseo dentro de `app/onboarding/*` ni de los textos de marketing en `auth-desktop` que B3/B4 reescriben por completo): `custom-domain-card.tsx`, `store-settings-board.tsx`, `product-form-sheet.tsx` (x2), `instagram-import-card.tsx` (x2), `design/theme-editor.tsx`, `app/dashboard/plan/page.tsx`. Patrón: "configurá/subí/agregá/Pegá/podés/decidís" → "configura/sube/agrega/Pega/puedes/decides".

**Deliberadamente NO tocado en B2 (para no duplicar trabajo — cada uno tiene dueño en un bloque posterior de esta misma sesión):**
- `app/onboarding/*` (layout+page, 29+3 apariciones, incl. teléfonos `+54` argentinos y voseo) → **B4** lo reescribe entero (onboarding tipo Notion).
- `app/dashboard/productos/*` (list/crear/editar) + `components/dashboard/{product-attributes-builder,product-image-upload,variant-pricing-table}.tsx` → **B6** porta esta lógica al `product-form-sheet` v2 y retira la ruta legacy.
- `app/dashboard/diseno/page.tsx` + `components/dashboard/design-editor/{editor-panel,preview-panel}.tsx` → **B7/B8** retiran el editor legacy (el diseño ya vive en `DesignBoard` de `PanelOfficial`).
- `components/templates/{noir/*,shared/wishlist-drawer,custom-cta-versions,template-preview-modal,template-card}.tsx` (storefront legacy, hoy **sí es la tienda pública real** en `/{slug}`) → **B7** retira el storefront legacy completo al hacer canónico el renderer templado; recolorear ahora se habría perdido.
- Cifras de marketing inventadas ("+12K", "94% de tiendas") en `components/auth-v2/auth-desktop/index.tsx` (pantallas de registro/onboarding) → quedan para **B3/B4**, que reescriben esas pantallas de todos modos.
- Código muerto confirmado (nadie lo importa, cero rutas lo alcanzan): `components/landing/*` (navbar, hero-section, features-section, cta-section, pricing-section, stats-section, testimonials-section, footer, how-it-works-section — landing v1 completa), `components/auth/{login-form,register-form}.tsx`, `components/templates/custom-template-card.tsx`, `components/dashboard/{rates-config-card,profile-completion-card}.tsx`, `components/brand/logo.tsx` (el logo viejo en sí — origen del hex teal). Ninguno se tocó; quedan anotados para que **B8** los borre en vez de que alguien pierda tiempo rebrandeando código que se va a eliminar.

**Verificación:** `npx tsc --noEmit` limpio (2 errores de `LogoIcon` sin importar detectados y corregidos sobre la marcha) · `pnpm build` limpio (39 rutas) · grep-guard final `biolinkstore|Bio Link Store` y `#33b380|#327be2|#6ee490|#C9A86C` en `app/`+`components/` solo devuelve archivos de las dos listas de arriba (dead code o diferido a bloque posterior) — cero coincidencias fuera de esas listas.
