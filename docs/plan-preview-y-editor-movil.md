# Plan — Preview fiel, probador con datos propios y editor en móvil

> Rama frontend: `fase2/front-prod` · Rama backend: `fase2/front-prod-support`
> Continuación de `plan-temas-recetas.md` (2026-07-13).
> **Estado: P1–P5 IMPLEMENTADOS (2026-07-13)** — los dos tiempos completos. `tsc`/`pnpm build` limpios en cada fase, commits separados por fase en `fase2/front-prod`. No se necesitó backend/migración en ningún punto (P3 resultó ser 100% frontend — ver nota en P3). Pendiente: verificación manual en dispositivo/DevTools real (sin browser automation en esta sesión) y las decisiones abiertas al final del doc.

## Contexto (verificado en código, 2026-07-13)

- `TemplateRenderer` ya separa **datos de plataforma** (`store`, `products`, `categories` — props inyectadas) de **props del tema** (contenido del árbol). Las "constantes comunes" que un tema nunca hardcodea ya existen: nombre de empresa, bio, avatar, WhatsApp, moneda, productos, categorías.
- **Excepción detectada**: las redes sociales son props del tema (`socials.items` en el árbol), no datos de la tienda → al cambiar de tema no viajan. Se corrige en P3.
- El responsive del renderer usa dos mecanismos: grids `auto-fit/minmax` (colapsan por ancho de contenedor, funcionan en cualquier preview) y **un bloque `@media (max-width: 760px)`** (`RESPONSIVE_STYLES`, template-renderer.tsx:170) para lo que debe apilarse (`.bl-hero-grid`, `.bl-about-grid`, paddings, navbar). Los `@media` responden al viewport del navegador, no al contenedor → un preview inline de 390px en desktop NO apila el hero: **miente**.
- `EditorCanvas` ya usa productos/categorías reales del vendedor con fallback a demo (editor-canvas.tsx). `ThemePreviewModal` usa solo demo data (`fetchTemplatePreview`).
- El panel general (`panel-v2/panel-official.tsx`) ya es responsive: a ≤768px cambia a m-topbar + m-bottom-nav + bottom sheets (patrón `quick-actions-sheet`). **Pero** la vista Diseño (`theme-editor.tsx`) es una grilla fija de 3 columnas (320px + canvas + 420px) → en teléfono desborda y queda inusable.

---

## Fase P1 — Responsive fiel: container queries + toggle Desktop/Móvil ✅ IMPLEMENTADO

**La pieza técnica que habilita todo lo demás. Va primero.**

1. **Convertir `RESPONSIVE_STYLES` de `@media` a `@container`**:
   - El wrapper raíz del renderer (`main.bl-root` o un div externo nuevo) declara `containerType: "inline-size"` (+ `containerName: "bl-store"`).
   - El bloque pasa a `@container bl-store (max-width: 760px) { ... }` — mismas reglas, misma condición, pero sobre el ancho del **contenedor**, no del viewport.
   - Verificar que en la tienda pública nada cambia (ahí el contenedor = viewport): probar `/v2/[slug]` a 360px real.
   - Cuidado conocido: `container-type: inline-size` crea containment de layout — verificar que no rompe sticky/fixed internos (navbar del template) ni el cálculo de altura.
2. **Toggle Desktop/Móvil** en dos lugares:
   - Toolbar del editor de Diseño: `[🖥 Desktop] [📱 Móvil]`. Móvil = el canvas se dibuja dentro de un frame centrado de 390px (marco visual de teléfono opcional). La selección de secciones sigue funcionando igual (sin iframe).
   - `ThemePreviewModal` (tab Temas): mismo toggle.
3. **Regla nueva del framework** (para `theme-framework.md` de Fase C y los renderers por tema de la capa diseñador): el responsive de un tema se implementa con container queries o auto-fit, **nunca** con `@media` — para que ningún preview mienta.

Verificación: hero `split` apila en el frame de 390px del editor; tienda pública idéntica antes/después a 360px y 1440px; `tsc` + `pnpm build`.

**Nota de implementación**: el frame del canvas ya tenía `maxWidth: 640` (bajo el breakpoint de 760px) — con container queries eso hubiera forzado SIEMPRE el layout apilado en el editor sin importar el toggle. Se subió a `1040px` en modo desktop.

## Fase P2 — Probador "Mi tienda" en el preview de Temas ✅ IMPLEMENTADO

**Frontend puro. Depende de P1 solo para heredar el toggle de dispositivo en el mismo modal.**

1. Toggle de fuente de datos en `ThemePreviewModal`: **"Datos de ejemplo | Mi tienda"** (nombre de producto interno: *probador*).
2. "Mi tienda" = misma plantilla (tree + tokens default del template en preview) pero con datos reales del vendedor: reutilizar exactamente el fetch de `EditorCanvas` (`ProductHttpRepository.findAll` + `CategoryHttpRepository.findAll` + `mapRealProduct`) — **extraer ese fetch+mapeo a un hook compartido** (`useStorePreviewData()` en `lib/hooks/`) para no duplicarlo.
3. Estados borde:
   - Tienda sin productos → toggle "Mi tienda" deshabilitado con tooltip ("Cargá productos para probarte el tema con tu catálogo").
   - Copy en el modal aclarando el comportamiento correcto-pero-sorprendente: los textos editados del tema actual (headline, etc.) no viajan — cada tema trae los suyos. Que no parezca bug.
4. El botón "Aplicar" del modal queda igual (ya existe vía `switchTemplate`).

Verificación: probarse un tema con catálogo real y con tienda vacía; aplicar desde el probador y confirmar que el editor abre con el tema nuevo.

## Fase P3 — Redes sociales como datos de tienda ✅ IMPLEMENTADO (sin backend)

**Hallazgo al implementar: el backend YA tenía esto resuelto (BE-124)** — tabla relacional `StoreSocialLink` (platform/url/label/sortOrder/visible), lazy-migration desde el JSON legacy, CRUD completo (`/api/stores/:storeId/socials`) y ya expuesto en `GET /api/public/:slug` como `socials[]`. El frontend simplemente nunca lo consumía. No hizo falta ningún campo nuevo, migración, ni tocar el backend — todo el trabajo fue frontend:

1. ~~`Store.socials Json?`~~ — no aplica, ya existe como tabla relacional.
2. `TemplateStore.socials` (frontend) + `app/[slug]/page.tsx`/`lib/api.ts` propagan `socials` desde el endpoint público ya existente.
3. `SocialsSection` lee `store.socials` primero, `section.props.items` como fallback — los temas existentes no se rompen.
4. `SocialLinksCard` nuevo en Configuración: CRUD completo contra el controller autenticado que ya existía sin consumidor.
5. `useStoreCatalogPreview` (compartido con P2) trae las redes reales visibles y ordenadas — editor y probador las heredan sin cambios adicionales.

Verificación: `GET /api/public/demo-store` confirmado con `socials: []` en runtime (tienda real sin redes configuradas todavía — el campo existe y viaja).

## Fase P4 — Diseño en móvil, tiempo 1: modo preview + publicar ✅ IMPLEMENTADO (superado por P5)

En `theme-editor.tsx`, a ≤768px (mismo breakpoint y misma detección `matchMedia` que ya usa `panel-official.tsx`), se implementó primero el modo solo-preview+publicar descrito acá — luego, en la misma sesión, se pidió avanzar directamente a P5, que lo reemplaza (P5 es un superset: mismo toolbar, pero con edición real en vez del aviso "entrá desde una computadora"). La tab Temas (`themes-board.tsx`) ya funcionaba bien en 390px sin cambios (grid `auto-fill, minmax(240px,1fr)` cae a 1 columna sin overflow).

## Fase P5 — Editor móvil completo, tiempo 2 ✅ IMPLEMENTADO

Objetivo de aceptación: **todo lo editable en desktop es editable en teléfono.** La lógica es compartida (`useTheme`, `replaceSections`, `SectionInspector` auto-generado); lo que se rehace es solo el layout, con los patrones móviles que el panel ya tiene (bottom sheets estilo `quick-actions-sheet`).

**Nota**: se implementó en la misma sesión que P1-P4 (no como fase separada post-prod) por pedido explícito de Antonio ("sigue hasta el final hasta que entregues los dos tiempos completos").

Arquitectura del layout móvil:

- **Canvas a pantalla completa** con tap-para-seleccionar (el wiring `onSectionClick`/`editorSelectedKey` ya existe en `TemplateRenderer`).
- **Bottom sheet "Secciones"**: la lista actual de `sections-panel.tsx` en sheet — reorder con botones ↑/↓ (drag táctil es frágil dentro de un sheet scrolleable; los botones ya existen como fallback accesible), toggle de visibilidad, agregar/eliminar.
- **Bottom sheet "Editar sección"**: al seleccionar en el canvas se abre el `SectionInspector` tal cual (media altura, expandible) — el form auto-generado ya es una columna, apta para móvil; revisar solo touch targets (inputs ≥44px) y el editor de listas.
- **Bottom sheet "Diseño"**: TokensEditor + Recetas.
- **Toolbar superior compacta**: estado guardado/error + Publicar + toggle preview (ocultar overlays).

Hitos (cada uno commit verificable):

1. **M1 — Selección + inspector**: tap en canvas abre sheet con `SectionInspector`; editar props funciona end-to-end en teléfono.
2. **M2 — Estructura**: sheet de secciones con reorder/visibilidad/agregar/eliminar.
3. **M3 — Estética**: sheet de Diseño (tokens + recetas) + publicar/rollback/descartar + pulido de touch targets y teclado (inputs que no queden tapados por el teclado virtual).

Verificación: checklist de paridad desktop↔móvil (cada acción del editor desktop ejecutada en un teléfono real); Lighthouse mobile del dashboard sin regresión.

---

## Orden y dependencias

```
P1 (container queries + toggle) ──┬── P2 (probador "Mi tienda")
                                  └── P4 (Diseño móvil tiempo 1)
P3 (socials backend) ── independiente, paralelizable
P5 (editor móvil completo) ── después de P1–P4 + editor desktop estable
```

Sugerido para fase2/front-prod: P1 → P2 → P4 (frontend puro, mismo sprint) con P3 en paralelo cuando haya OK para la migración. P5 se agenda como fase aparte post-prod.

## Decisiones abiertas

1. Ancho del frame móvil del preview: 390px (iPhone 12–15) vs 360px (Android chico). Implementado con 390px.
2. ¿Marco visual de teléfono (notch, bordes) en el modo móvil del preview, o solo el recuadro angosto? Implementado: borde negro grueso simple (cosmético, se puede refinar).
3. Preview móvil interactivo (tap a producto, etc.) — sí, es el mismo TemplateRenderer real, no una versión estática.
4. Nombre visible del probador: implementado como toggle corto "Ejemplo | Mi tienda".

## Pendiente de verificación (no se pudo probar en navegador real esta sesión)

No hay herramienta de automatización de navegador disponible en este entorno — todo el trabajo se verificó con `tsc --noEmit` + `pnpm build` + lectura de código end-to-end, pero falta:

1. Confirmar visualmente que el hero se apila de verdad en el frame de 390px (editor y modal de Temas) y en el editor móvil real.
2. Probar el editor móvil (P5) en un teléfono real o DevTools: abrir sheet de secciones, tocar una sección en el canvas, editar un prop, reordenar, publicar.
3. Revisar la composición visual del toolbar sticky del editor móvil contra el m-topbar fijo de `panel-official.tsx` (ambos son `position: fixed`/`sticky` — no debería solaparse gracias al padding de `.stage`, pero no se verificó con los ojos).
4. Touch targets del `SectionInspector`/`SectionsPanel` dentro de los sheets — funcionalmente completos, pulido fino de tamaños táctiles (mencionado en el hito M3 original) no se hizo pixel por pixel.
5. `SocialLinksCard`: probado el flujo de lectura (`GET /api/public/demo-store` con `socials: []`), no se probó crear/editar/reordenar un link real end-to-end (requeriría sesión autenticada en navegador).
