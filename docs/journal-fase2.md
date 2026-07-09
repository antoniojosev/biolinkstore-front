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
