# Plan Fase 2 — Front de ByLink a producción

> **Destinatario:** sesión automática de implementación.
> **Fecha de definición:** 2026-07-09 · Fundador: Antonio.
> **Repos:** `frontend/` (Next.js 15 + React 19 + Tailwind v4 + shadcn) y `igsotre-back/` (NestJS, prefijo global `/api`).
> **Objetivo:** completar la Fase 2 del rebrand (cablear v2 al backend real y retirar el legacy v1) para dejar el front coherente y listo para producción. La seguridad backend se trata en OTRA sesión — ver §7.

---

## 0. Contexto imprescindible

ByLink nació como **igstore**. En mayo se hizo la **Fase 1**: un prototipo visual navy-coral ("ByLink", `bylink.app`) portado a rutas dedicadas (`/registro`, `/acceso`, `/tienda-demo`, `/panel-demo`, `/analytics-demo`) con **datos mock y sin backend**. La **Fase 2** (cablear a la API real + retirar el legacy verde "Bio Link Store"/`biolinkstore.com`) quedó **a medias**: conviven dos marcas y hay datos falsos mostrados como reales.

**Dos ejes ortogonales** que hay que tener presentes en todo el plan:
- **v1 (legacy)** = diseño viejo verde/teal, marca "Bio Link Store", **cableado** (funciona).
- **v2 (rebrand)** = diseño nuevo navy-coral "ByLink", parte **cableado** y parte **mock**.
- **cableado** = conectado al backend real (datos reales, guarda de verdad).
- **mock** = puro diseño con datos inventados quemados en el código.

El fin de esta sesión: **todo v2, todo cableado (salvo lo explícitamente diferido), legacy retirado, cero mocks en rutas reales.**

---

## 1. Decisiones cerradas (LOCKED — no re-litigar)

| # | Decisión | Resolución |
|---|----------|-----------|
| Storefront | Arquitectura de la tienda pública | **Renderer de 9 templates (BE-120) + carrito/checkout/tracking/responsive/OG.** Se convierte en la tienda canónica en `/{slug}`; el legacy de 3 templates se retira. |
| Onboarding | Alta de tienda | **Onboarding tipo Notion: una pregunta por página**, que culmina en el paso "Importar de Instagram". Ese paso queda **mock/"próximamente"** hasta que exista el backend de scraping (otra sesión). El resto del wizard crea la tienda de verdad. |
| Mocks | Datos falsos en rutas reales | **Estados vacíos/skeleton/error reales.** Cero números inventados en rutas reales. Los mocks solo sobreviven en las rutas `/*-demo` (showcase aislado). |
| Rutas demo | `/tienda-demo`, `/panel-demo`, `/signup-demo`, `/analytics-demo`, `/acceso` + andamiaje | **Quitar andamiaje** (toggle debug z-10000, FAB "Saltar a…", atajos) de rutas reales. **Conservar** las `/*-demo` como vitrina, **sin enlazarlas** desde flujos reales. |
| D1 · Usuario nuevo | registro → crear tienda → panel | **A:** cablear registro v2 real + onboarding Notion real (rebrandeado). Usuario nuevo vive 100% en v2. `/acceso` cinematográfico queda como demo. |
| D2 · CRUD producto | Profundidad | **A: paridad total.** Portar variantes + atributos al form v2 + arreglar `priceCurrency`. |
| D3 · Features del panel | Cuáles cablear ahora | **Las 4 (todas):** multi-tienda, tasas custom, plantilla WhatsApp + dominio propio, equipo + toggle moneda comprador. **Todas filtradas por plan de suscripción** (gating en UI acorde a los límites del backend). Condiciones específicas de gating se afinan después. |
| D4 · Rama | Dónde trabajar | **A: rama nueva `fase2/front-prod` desde `staging/bylink`**, commits por bloque. |

---

## 2. Restricciones no negociables

1. **NO tocar temas de seguridad** (IDOR, guards de rol, SSE público, SSRF, JWT, RLS…). Están inventariados en §7 para la sesión dedicada. Si un fix de front roza uno, hacer solo la parte de front y dejar nota `// TODO(sec-session)`.
2. **NO correr migrations ni seeds** en dev (regla `feedback_no_run_migrations_seeds`). Dejar archivos listos si hicieran falta; Antonio los corre al ir a prod.
3. **NO cron/scheduler** (regla `feedback_no_cron`).
4. **NO `Co-Authored-By`** en commits (regla `feedback_no_coauthor`).
5. **Preferir cambios solo-frontend.** Los toques de backend permitidos están acotados y enumerados en §3.1 (son no-seguridad y mínimos). Cualquier otro toque backend → parar y flaggear, no improvisar.
6. **Compat de datos:** no romper tiendas/productos/pedidos existentes. Campos nuevos opcionales.
7. **Verificación sin ensuciar prod:** si se prueba contra datos, usar tienda/usuario de prueba claramente nombrados `test-*`, y limpiarlos al terminar. No mutar tiendas reales. `playwright` como devDependency transitoria, removida antes de cada commit.
8. **Marca:** navy `#1E3A8A` + coral `#DC4A3D`, tokens de `globals.css`. Cero `#33b380`/teal, cero "Bio Link Store"/"biolinkstore" en rutas reales.
9. **Gate de cierre por bloque:** `pnpm build` limpio + `npx tsc --noEmit` limpio + criterios de aceptación del bloque + commit `fase2/<bloque>: <qué>`.
10. **Journal:** mantener `frontend/docs/journal-fase2.md` (una entrada por bloque: qué se hizo, decisiones, qué falta) para sobrevivir compactaciones de contexto.

---

## 3. Estrategia de ramas y orden

**Rama:** `git checkout -b fase2/front-prod staging/bylink` (frontend). Si hacen falta los toques backend de §3.1, hacerlos en `igsotre-back` en una rama gemela `fase2/front-prod-support` desde `staging/bylink` y flaggearlos en el journal — NO mezclar con el trabajo de front.

**Orden de bloques** (cada uno deployable/revisable por separado; respeta dependencias):

`B0 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8`

- **B0** base de diseño y assets → desbloquea todo.
- **B1** higiene (quitar andamiaje + apagar mocks) → deja las rutas reales honestas antes de cablearlas.
- **B2** rebrand de lo legacy visible → coherencia de marca.
- **B3** auth real → precondición del alta.
- **B4** onboarding Notion → precondición de tener tiendas nuevas.
- **B5** panel: cablear features + plan-gating.
- **B6** catálogo/productos con paridad.
- **B7** storefront v2 canónico (el bloque más grande).
- **B8** limpieza de código muerto.

### 3.1 Toques de backend permitidos (mínimos, NO seguridad) — verificar antes

Antes de asumir un cambio backend, **verificar el contrato actual**. Solo estos, y solo si la verificación confirma que faltan:

1. **`priceCurrency` en crear/editar producto.** El form v2 lo descarta (`product-form-sheet.tsx`, comentario "backend main doesn't accept it yet"). **Verificar** `CreateProductDto`/`UpdateProductDto` en `igsotre-back/src/modules/products`. Si ya acepta `priceCurrency` → fix solo-front (dejar de omitirlo). Si no → agregar el campo al DTO (aditivo, no-seguridad).
2. **`GET /api/invitations/:token`.** El front acepta la invitación equivocada porque no puede resolver una invitación por token (`app/invite/[token]/page.tsx`). **Verificar** si los objetos de `GET /api/invitations/me` ya incluyen su `token`. Si sí → fix solo-front (elegir la que matchea el token de la URL). Si no → agregar endpoint de lectura por token.
3. **Tokens de paleta/tipografía del builder.** Alinear nombres front↔backend (ver B7). Preferir cambiar el front a los nombres del backend (`bg`/`muted`/`secondary`) → **cero cambio backend**. Solo si un token deseado (p.ej. `monoFont`) no existe en el DTO y se decide conservarlo, agregarlo al DTO (aditivo); si no, quitar ese control del editor.

Cualquier otra necesidad de backend → **parar y flaggear**, no implementar.

---

## 4. Bloques de trabajo

### B0 — Base de diseño, tokens y assets

**Objetivo:** cimientos que usan todos los bloques.

- **`public/placeholder.svg`**: crear el asset (hoy no existe → imágenes rotas en ~15 lugares). SVG neutro navy-coral con ícono de imagen. Verificar todas las referencias `/placeholder.svg`.
- **Auditar tokens** en `app/globals.css`: confirmar navy/coral vigentes y que las utilidades Tailwind (`bg-brand`, `text-ink-*`, `--danger-soft`, etc.) existen. Documentar en el journal el mapa de tokens para que los bloques no inventen hex.
- **Primitivos `components/bylink/`** (Button, Card, Input…): confirmar que cubren estados `hover/focus-visible/disabled`. Estos son el estándar de botón único para toda la Fase 2 (retiran `.h-btn` inline y `S.btnPrimary`).
- **Contraste AA:** subir a ≥4.5:1 los casos verificados que queden en superficies reales (coral sobre navy 2.51:1 en landing/CTA; placeholder de búsqueda ~1.5:1; `--ink-3` a 10px en metadata de pedidos). Ajustar tokens o usos.

**Aceptación:** `placeholder.svg` resuelve en todas sus referencias; ningún componente real usa hex teal; build+tsc limpios.

---

### B1 — Higiene de producción (andamiaje fuera, mocks apagados)

**Objetivo:** que las rutas reales sean honestas antes de cablearlas.

**Quitar andamiaje de rutas reales:**
- `components/panel-v2/panel-official.tsx`: eliminar el toggle debug desktop/mobile (`.demo-toggle`, z-10000). El modo responsive debe salir del viewport real, no de un toggle (ver B5).
- `components/auth-v2/auth-desktop/index.tsx` y `auth-mobile/index.tsx`: eliminar el FAB "🧭 Saltar a…" (z-999) y cualquier navegación de atajo entre pantallas.

**Apagar mocks en rutas reales** (regla: si no hay dato o falla el fetch → empty-state/skeleton/error real, nunca número inventado):
- `components/dashboard-v2/dashboard-overview.tsx`: quitar los fallbacks `?? 847`, `?? 4280`, `?? 12`; quitar `MOCK_ORDERS`; quitar "De dónde llegan" hardcodeado (62/24/9/5) y "Pendiente esta semana" hardcodeada — o cablearlas a su endpoint, o marcarlas "Próximamente" si no hay endpoint. Arreglar el saludo "Hola Hola" (`|| "Hola"` + `Hola {greetName}`).
- `components/dashboard-v2/catalog-board.tsx`: quitar el `return MOCK` cuando `products` es null; usar empty-state ("Aún no tienes productos") y estado de error explícito. Corregir `published = Math.floor(total*0.7)` (usar el conteo real de visibles).
- `components/dashboard-v2/analytics-board.tsx` y `analytics-widgets.tsx`: `SourcesWidget`, `MOCK_SUMMARY/TOP/FUNNEL/SOURCES` → datos reales o empty-state. Nada rotulado como real sin serlo.
- Diseñar/usar los estados vacíos y skeletons que ya existen (`.empty`, `.shimmer`) de forma consistente (hoy ~9 componentes muestran "Cargando…" en texto plano con layout shift).

**Aceptación:** `grep -rin "MOCK_\|?? 847\|María Alvarado\|Rosa Atelier\|Vestido Camelia" app components` no aparece fuera de rutas/comp. `*-demo`; no hay toggles/FAB de debug en `/dashboard`, `/login`, `/registro`; empty-states visibles en tienda nueva.

---

### B2 — Rebrand de lo legacy que queda visible

**Objetivo:** una sola identidad (navy-coral) en todo lo real.

- **Tienda pública (crítico):** `app/[slug]/page.tsx` — OG image, `canonical`, `siteName` pasan de `biolinkstore.com`/"Bio Link Store" a `bylink.app`/"ByLink". (Este archivo se reescribe en B7; asegurar que el metadata quede correcto ahí.)
- `components/store-page-client.tsx`: badge "Creado con Bio Link Store" → "Creado con ByLink" apuntando a `bylink.app`.
- `app/home/terminos/page.tsx`: rebrand completo (título, `soporte@biolinkstore.com`, links teal, logo viejo, estilo dark-glass) a navy-coral.
- **Auth legacy** `app/(auth)/olvide-password`, `reset-password` y `components/auth/*-form.tsx`: rebrandear a v2 o retirar en favor de las pantallas v2 cableadas de B3.
- **Onboarding legacy** `app/onboarding/*`: lo reemplaza B4 — al terminar B4, retirar/redirigir.
- **Dashboard legacy** `app/dashboard/{productos,plan,pagos,diseno,plantillas}/page.tsx` + `components/dashboard/*` (teal): a medida que la vista v2 equivalente los cubra (B5/B6), **redirigir** la ruta legacy a la vista v2 (`/dashboard?view=…`) y retirar la página. Si al cierre de la sesión alguna quedara sin cobertura v2, **rebrandearla** provisionalmente a navy-coral (nunca dejarla teal). `app/dashboard/layout.tsx`: `metadata.title` "Bio Link Store" → "ByLink".
- **Español neutro/VE:** eliminar voseo rioplatense ("configurá/Empezá/Pegá") mezclado con tuteo — unificar a tuteo neutro. Reemplazar teléfonos/WhatsApp argentinos (`+54…`, `WA_SALES=5491100000000`) por los de ByLink/VE o placeholders configurables. Corregir locale `es-AR` y `currency:'ARS'` hardcodeados en formateo de precios (ver B7).
- **Copy interno filtrado:** `store-settings-board.tsx` — quitar "Disponible cuando BE-127 esté en main… `components/dashboard/store-switcher.tsx`" (multi-store se cablea en B5).
- Cifras de marketing inventadas ("+12K tiendas", "94%") en landing/auth: sustituir por copy honesto o quitarlas (producto pre-lanzamiento).

**Aceptación:** `grep -rin "biolinkstore\|Bio Link Store\|#33b380\|327be2\|C9A86C\|es-AR\|ARS\|+549" app components lib` no aparece en rutas reales; navegar `/dashboard → /dashboard/*` no cambia de identidad.

---

### B3 — Auth real (v2 canónico)

**Objetivo:** login/registro/recuperación 100% v2 cableado. `/acceso` queda como demo.

- **Registro** (`/registro`, `components/auth-v2/signup-desktop.tsx`): cablear a la creación de cuenta real (usar `auth-context`/cliente real). Al éxito → onboarding Notion (B4). Bindear inputs y validar contra el backend.
- **Login** (v2): ya funciona con email/password. Verificar redirección post-login a `/dashboard`.
- **"Continuar con Google"** (`auth-desktop/index.tsx`, `auth-mobile/index.tsx`): agregar `onClick` que dispare el flujo OAuth real (ya existe la ruta `/login/oauth` y el callback). Hoy los botones son `type="button"` sin handler.
- **Recuperar contraseña** (`auth-desktop` `ForgotScreen` y mobile): hoy es mock (muestra "link enviado" sin llamar a nada, el input ni está bindeado). Cablear al endpoint real de reset (el legacy `/olvide-password` ya lo tiene) — bindear email, llamar API, manejar éxito/error reales. Cablear también `/reset-password`.
- **Invitación** (`app/invite/[token]/page.tsx`): corregir que muestra la primera invitación pendiente e ignora el token de la URL. Ver §3.1(2): si `GET /api/invitations/me` trae el `token` por invitación → elegir la que matchea; si no → usar el nuevo `GET /api/invitations/:token`. Flujo usuario sin cuenta → `/registro?email=X` y volver a aceptar.
- **Ruta canónica:** `/login` y `/registro` renderizan la v2 cableada; retirar/redirigir las auth legacy teal.

**Aceptación:** registro real crea cuenta y entra a onboarding; Google inicia OAuth real; "olvidé mi contraseña" envía correo real y `/reset-password` cambia la clave; invitación por link correcto acepta la invitación correcta; build+tsc limpios.

---

### B4 — Onboarding Notion (crear tienda real) + paso IG mock

**Objetivo:** wizard **una pregunta por página** que crea la tienda de verdad y termina ofreciendo "Importar de Instagram" (mock por ahora).

- **Nuevo flujo** `app/onboarding/*` (reescrito en v2) o dentro de `/registro` post-registro. Estilo Notion: **un paso = una pregunta**, transición suave, barra de progreso, botón atrás, guardado incremental del estado (no perder respuestas al retroceder).
- **Pasos** (reutilizar los campos reales que ya pide el create-store legacy; ajustar orden/copy): (1) nombre de la tienda, (2) usuario/slug con validación de disponibilidad en vivo (`check-slug/username` real), (3) rubro/nicho, (4) moneda por defecto (USD/EUR/VES), (5) logo (upload real), (6) **"Importar de Instagram"** — paso final que HOY es placeholder/"próximamente" y cae a "agregar productos manualmente"; dejar el componente `instagram-import-card`/paso preparado para cablear el scraper después (marcar `// TODO(ig-scraper-session)`).
- **Al completar:** crear la tienda de verdad (cliente `stores-api`), setear tienda activa, redirigir a `/dashboard`. Sin datos mock, sin "Rosa Atelier", sin "Bienvenida María" ni redirección a `/tienda-demo`/`/panel-demo` (hoy `auth-desktop` manda ahí — eliminar).
- **Compat:** un usuario sin tienda que llega a `/dashboard` va al onboarding; uno con tienda no es rebotado por error transitorio (ver B5, fix de `refreshStore`).

**Aceptación:** un usuario nuevo real recorre el wizard, crea su tienda y llega al panel con su tienda activa; el paso IG dice "próximamente" y ofrece carga manual; cero mocks; build+tsc limpios.

---

### B5 — Panel v2: cablear features + plan-gating + fixes de estado

**Objetivo:** las 4 familias de features vivas y cableadas, con gating por plan. (Los componentes ya existen — es cablear/mostrar/filtrar, no construir.)

**Estado de tienda activa (base del resto):**
- Introducir/usar contexto de tienda activa real (existe `lib/store-context.tsx` y `lib/multi-store-api`). `contexts/auth-context.tsx` hoy toma siempre `stores.data[0]` — reemplazar por el `activeStoreId` real de `GET /api/users/me/stores`.
- **Fix desync:** `refreshStore()` debe cargar la tienda **activa**, no `stores[0]` (bug al cambiar de tienda).
- **Fix rebote:** el `catch(()=>({data:[]}))` en la restauración de sesión no debe mandar a `/onboarding/create-store` a un usuario con tiendas por un error transitorio — distinguir "sin tiendas" de "falló el fetch".

**1 · Multi-tienda (BE-127):** superficie el switcher dentro del panel v2 (hoy vive en el shell legacy tapado por el overlay). Quitar el rótulo "próximamente/BE-127" de `store-settings-board.tsx`. Cambiar de tienda refetchea todas las vistas.

**2 · Tasas custom (BE-129):** cablear `custom-rates-card.tsx` (modos MANUAL/FORMULA/API) al backend. Plan-gate: FREE=1 solo MANUAL; PRO/BUSINESS=∞ todos los modos (reflejar en UI: deshabilitar+upsell lo no permitido).

**3 · Plantilla WhatsApp (BE-124) + Dominio propio (BE-122):** cablear `whatsapp-template-card.tsx` (editor con preview en vivo) y `custom-domain-card.tsx` (instrucciones DNS + verificación). Gate por plan donde corresponda.

**4 · Equipo (BE-131) + QR:** cablear `team-members-card.tsx` (invitar/roles OWNER/ADMIN/STAFF, mín. 1 OWNER). Plan-gate de miembros (FREE=1/PRO=3/BUSINESS=∞) — contar **también invitaciones pendientes** en el límite (hoy solo cuenta aceptados) y refrescar tras invitar. Implementar el **QR** real de la URL de la tienda (client-side) en el share sheet ("Compartir tienda (link + QR)" hoy es un `<div>` inerte).

**Plan-gating transversal (D3):** leer `store.subscription.plan` (el backend ya lo expone en `/api/stores`) y aplicar gating de UI consistente con los límites del backend en las 4 familias + productos (B6). Patrón: mostrar la feature, deshabilitar lo que exceda el plan con un upsell claro. Condiciones específicas se afinan después — por ahora aplicar los límites conocidos.

**Botones muertos:** cablear u ocultar "Compartir tienda", "Nuevo producto", "Ver todos →", chips de filtro del catálogo, ítems del FAB/quick-actions (hoy con `cursor:pointer` sin handler).

**Instagram import card** (`instagram-import-card.tsx`): mantener el estado "En construcción/Próximamente" (BE-128 diferido) — consistente con B4.

**Aceptación:** cambiar de tienda recarga datos de la tienda correcta; cada feature guarda contra el backend real; el gating refleja el plan (probar FREE vs PRO); no quedan botones sin handler en el panel; build+tsc limpios.

---

### B6 — Catálogo y productos: paridad total (D2·A)

**Objetivo:** gestionar productos completos desde v2.

- **`components/dashboard-v2/product-form-sheet.tsx`:** portar los editores del legacy a v2, rebrandeados:
  - **Variantes** (desde `components/dashboard/variant-pricing-table.tsx`): talla/color con `priceAdjustment`, stock por variante, etc.
  - **Atributos** (desde `components/dashboard/product-attributes-builder.tsx`).
  - Reusar la subida de imágenes ya presente (`upload-button.tsx`) y el reordenamiento existente.
- **`priceCurrency`:** dejar de omitirlo al guardar (quitar el comentario "backend main doesn't accept it yet"). Ver §3.1(1): verificar el DTO; si no acepta, agregarlo (aditivo).
- **Categorías** (`category-manager-sheet.tsx`): confirmar cableado real.
- **Retirar** `app/dashboard/productos` legacy (redirigir a `/dashboard?view=catalog`) y los componentes `components/dashboard/{variant-pricing-table,product-attributes-builder,product-image-upload}.tsx` una vez portados (o dejarlos solo si el port los reutiliza).

**Aceptación:** crear/editar un producto con variantes y atributos desde v2 persiste correctamente (incl. `priceCurrency`); el legacy de productos redirige a v2; build+tsc limpios.

---

### B7 — Storefront v2 canónico (bloque mayor)

**Objetivo:** la tienda pública `bylink.app/{slug}` sirve el **renderer de 9 templates** con carrito, checkout, tracking, responsive, multi-moneda y OG. Retirar el storefront legacy.

**Ruta canónica:**
- Hacer que `app/[slug]/page.tsx` sirva el renderer templado (mover la lógica de `app/v2/[slug]/page.tsx`). Mantener `/v2/[slug]` como alias temporal o retirarlo. Retirar `StorePageClient` + `components/templates/*` legacy (ver B8).

**Contrato con el backend (mismatches — arreglar contra el seed real de BE-120):**
- **`lib/storefront-tracking.ts`:** postear a **`/api/public/:slug/event`** (falta el prefijo `/api`) y usar `NEXT_PUBLIC_API_URL` con default correcto (hoy `''` → postea contra el propio Next). Sin esto, **ningún** evento nuevo se persiste.
- **Paleta de tokens** (`components/storefront-v2/tokens.ts` + editor `tokens-editor.tsx`): alinear nombres a los del backend (`bg`/`muted`/`secondary`) en renderer Y editor. Hoy el renderer lee `background`/`textMuted` (nunca pinta fondo/muted) y el editor escribe esos nombres que el `ValidationPipe` con whitelist stripea en silencio → editar "Fondo" es un no-op. Ver §3.1(3) para `monoFont`.
- **Props de sección** (`components/storefront-v2/template/template-renderer.tsx`) — alinear al seed: `hero` (`headline/subheadline` no `title/subtitle`, honrar `ctaType/ctaUrl`); `cta_banner` (`headline/subline/backgroundColor`); `faq` (`question/answer` no `q/a`); `gallery` (`{image,caption}` no `{src,alt}`); `map` (`latitude/longitude/zoom/title`, y pasar la dirección desde la page); `product_grid` (`layout` grid-2/3/4/list, `filterByCategory/showPrice/showSku`); `featured_products` (`productIds` es lista de objetos `{id}`); `text_block` (`kicker/headline`).

**Carrito + checkout (nuevo en el renderer):**
- Integrar `lib/cart-context.tsx` (el real) en el renderer. Product cards deben abrir detalle real (hoy `<a href="#product-id">` sin destino) — crear vista/hoja de detalle de producto en v2 con selección de variantes.
- Checkout WhatsApp: generar `wa.me` con la **plantilla del vendedor** (BE-124) vía `POST /api/public/:slug/orders`. Eliminar el fallback con chat FALSO ("pedido #1284") y el mensaje genérico `es-AR`/`ARS` hardcodeado; si el POST falla, error real + reintento.

**Multi-moneda comprador (D3·4):**
- Toggle USD/Bs con la **tasa pública real** (`GET /api/public/rates`), no la tasa hardcodeada `48.32`. Formateo por `store.currency`/`priceCurrency`, sin `es-AR`/`$` fijos. Fallback visible si la tasa falla (no ocultar el precio en silencio).

**Tracking dual (contrato):** disparar legacy (`lib/analytics.ts`) **y** nuevo (`lib/storefront-tracking.ts`) en eventos críticos: PAGE_VIEW, PRODUCT_VIEW, ADD_TO_CART, WHATSAPP_CLICK, y los declarados SOCIAL_CLICK/CATEGORY_CLICK/SECTION_VIEW donde apliquen. Hoy el renderer templado no trackea nada.

**Responsive (crítico — clientes entran desde el móvil de IG):** el renderer no tiene media queries (grids de columnas fijas inline). Rehacer responsive 320–430px: producto/hero/about/stats/gallery. Touch targets ≥44px.

**SEO/OG:** `generateMetadata` de la tienda con OpenGraph + Twitter + imagen por tienda (hoy v2 solo title/description). Usar la OG dinámica del backend si existe, o la del vendedor.

**Preview del editor:** "Abrir preview" debe mostrar el **draft** (`get-store-preview` del backend) no el publicado — leer `searchParams` en la page. Tipografías del builder (`FONT_WHITELIST`): cargarlas de verdad (hoy caen a fallback del sistema) — layout propio en `/[slug]` con las fuentes.

**Empty states:** tienda sin productos / theme sin publicar → estado diseñado, no copy de "búsqueda sin resultados". (El backend siempre devuelve un theme fallback, así que el "sin publicar" real casi no ocurre — verificar.)

**Aceptación:** `bylink.app/{slug}` renderiza el template publicado con la paleta correcta, permite agregar al carrito y hacer checkout por WhatsApp con la plantilla del vendedor, muestra precios en USD/Bs con tasa real, es usable en 360px, comparte con OG card correcta, y trackea en ambos sistemas. `grep` de `48.32`/`#product-`/`es-AR` sin resultados en storefront. Build+tsc limpios.

---

### B8 — Limpieza de código muerto

**Objetivo:** repo solo-prod, sin duplicación confusa.

- **Cluster v0 muerto** en raíz de `components/`: `cart-sheet.tsx`, `cart-button.tsx`, `cart-context.tsx` (el duplicado, NO `lib/cart-context.tsx`), `product-card.tsx`, `product-grid.tsx`, `store-header.tsx`, `search-bar.tsx`, `category-filter.tsx` + `lib/store-data.ts` — eliminar (solo se referencian entre sí).
- **Templates legacy huérfanos** `components/templates/{menu,servicios,inmuebles}` (jamás importados) y, tras B7, también `{vitrina,luxora,noir}` + `renderer.tsx`, `template-gallery.tsx`, `template-card.tsx`, `template-data.ts`, `custom-cta-versions.tsx`, los 6 `cart-drawer.tsx`, los 6 `product-detail.tsx` — eliminar lo que quede sin uso.
- **Editores legacy** `components/dashboard/design-editor/*` y `app/dashboard/diseno` tras B5 (el diseño vive en el builder v2).
- `orders.http-repository.ts`: quitar el `(this.http as any).tokenStorage?.getAccessToken()` (propiedad inexistente, arquitectura vieja).
- `app/page.tsx` vs `app/home/page.tsx`: dedup (renderizan la misma landing → SEO duplicado).
- Consolidar los 3 sistemas de botón restantes en el primitivo `components/bylink/Button`.

**Aceptación:** `pnpm build` limpio; `npx tsc --noEmit` limpio; `knip`/imports sin referencias colgando (o verificación manual de que lo borrado no se importa); la app funciona igual que antes de borrar.

---

## 5. Verificación global (antes de dar por cerrada la sesión)

1. `pnpm build` (frontend) y `npx tsc --noEmit` limpios; `pnpm build` (backend) limpio si se tocó §3.1.
2. Grep guards (deben dar 0 en rutas reales): `biolinkstore`, `Bio Link Store`, `#33b380`, `es-AR`, `ARS`, `MOCK_`, `847`, `48.32`, `María Alvarado`, `Rosa Atelier`, `Saltar a`, `demo-toggle`.
3. Recorrido E2E con datos de prueba `test-*` (Playwright transitorio, limpiar al final):
   - registro real → onboarding Notion → tienda creada → dashboard.
   - login + Google OAuth + recuperar contraseña reales.
   - crear producto con variantes/atributos + `priceCurrency`.
   - cambiar de tienda activa refetchea.
   - cada feature del panel guarda; gating FREE vs PRO.
   - storefront `/{slug}`: carrito → checkout WhatsApp con plantilla; toggle USD/Bs; responsive 360px; OG.
4. `journal-fase2.md` completo (una entrada por bloque) + resumen ejecutivo final para Antonio (qué se hizo, decisiones, qué quedó fuera, cómo revisar).
5. **CERO deploys** (ni `vercel --prod` ni push a remoto) salvo que Antonio lo pida.

---

## 6. Estados vacíos y de error (estándar para toda la sesión)

Todo dato del backend sigue este patrón (nunca mock en ruta real):
- **cargando** → skeleton/`.shimmer` (sin layout shift).
- **vacío** → `.empty` con ícono + copy accionable ("Comparte tu tienda para tu primer pedido").
- **error** → mensaje real + reintento; nunca caer a datos inventados.
- **sin endpoint aún** (p.ej. IG import) → "Próximamente", deshabilitado, con `// TODO(<session>)`.

---

## 7. FUERA DE ALCANCE de esta sesión

**Seguridad (sesión dedicada aparte) — NO tocar aquí, solo referenciar:**
- SSE admin público con PII cross-tenant (`admin-payment-reports.controller.ts` `@Public()`).
- IDOR en products/categories/variants y create-order cross-store.
- Split-brain de roles OWNER/ADMIN/STAFF (`StoreOwnerGuard` vs `StoreMemberGuard`) + promoción a OWNER.
- SSRF (custom rate API `sourceUrl`, logo OG).
- JWT secret default, `x-forwarded-for` sin trust proxy, admin sin `AdminGuard`, CSV/HTML injection, topes de quantity/items, races count+write, publish-theme sin plan-gate, custom domain en 5 endpoints públicos.

**Otras sesiones:**
- **Backend de scraping de Instagram (BE-128)** — el paso IG del onboarding queda mock esperándolo.
- Afinar **condiciones específicas de plan-gating** (esta sesión aplica los límites conocidos; el detalle fino viene después).
- Optimización de imágenes con `next/image` en todo el storefront (mejora, no bloqueante) — evaluar si entra en B7 o se difiere.

---

## 8. Apéndice — Índice de hallazgos por bloque (referencia rápida)

- **B1:** panel-official (toggle), auth-desktop/mobile (FAB), dashboard-overview (mocks+saludo), catalog-board (MOCK+published), analytics-board/widgets (mocks).
- **B2:** app/[slug] (OG/canonical/siteName), store-page-client (badge), home/terminos, (auth) legacy, app/onboarding legacy, app/dashboard/* legacy + layout, store-settings-board (copy interno), locale es-AR/ARS/+54.
- **B3:** signup-desktop (registro), auth-desktop/mobile (Google, forgot), invite/[token].
- **B4:** app/onboarding (reescritura), instagram-import-card (paso IG).
- **B5:** auth-context (activeStore/refreshStore/rebote), custom-rates-card, whatsapp-template-card, custom-domain-card, team-members-card, multi-store switcher, QR, botones muertos, plan-gating.
- **B6:** product-form-sheet (+variantes/atributos/priceCurrency), variant-pricing-table, product-attributes-builder, category-manager-sheet, app/dashboard/productos.
- **B7:** storefront-tracking (/api), tokens.ts + tokens-editor (paleta), template-renderer (props+carrito+tracking+responsive+moneda+detalle), app/[slug] + app/v2/[slug] (canónico+OG+preview+fonts), checkout WhatsApp.
- **B8:** cluster v0, templates legacy, design-editor legacy, orders.http-repository, app/page vs home, botones.
