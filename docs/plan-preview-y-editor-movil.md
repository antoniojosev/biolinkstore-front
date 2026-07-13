# Plan — Preview fiel, probador con datos propios y editor en móvil

> Rama frontend: `fase2/front-prod` · Rama backend: `fase2/front-prod-support`
> Continuación de `plan-temas-recetas.md` (2026-07-13). Estado: PLAN, pendiente de implementación.
> Decidido en conversación con Antonio: enfoque móvil "en dos tiempos" (P4 barato ahora, P5 editor completo después).

## Contexto (verificado en código, 2026-07-13)

- `TemplateRenderer` ya separa **datos de plataforma** (`store`, `products`, `categories` — props inyectadas) de **props del tema** (contenido del árbol). Las "constantes comunes" que un tema nunca hardcodea ya existen: nombre de empresa, bio, avatar, WhatsApp, moneda, productos, categorías.
- **Excepción detectada**: las redes sociales son props del tema (`socials.items` en el árbol), no datos de la tienda → al cambiar de tema no viajan. Se corrige en P3.
- El responsive del renderer usa dos mecanismos: grids `auto-fit/minmax` (colapsan por ancho de contenedor, funcionan en cualquier preview) y **un bloque `@media (max-width: 760px)`** (`RESPONSIVE_STYLES`, template-renderer.tsx:170) para lo que debe apilarse (`.bl-hero-grid`, `.bl-about-grid`, paddings, navbar). Los `@media` responden al viewport del navegador, no al contenedor → un preview inline de 390px en desktop NO apila el hero: **miente**.
- `EditorCanvas` ya usa productos/categorías reales del vendedor con fallback a demo (editor-canvas.tsx). `ThemePreviewModal` usa solo demo data (`fetchTemplatePreview`).
- El panel general (`panel-v2/panel-official.tsx`) ya es responsive: a ≤768px cambia a m-topbar + m-bottom-nav + bottom sheets (patrón `quick-actions-sheet`). **Pero** la vista Diseño (`theme-editor.tsx`) es una grilla fija de 3 columnas (320px + canvas + 420px) → en teléfono desborda y queda inusable.

---

## Fase P1 — Responsive fiel: container queries + toggle Desktop/Móvil

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

## Fase P2 — Probador "Mi tienda" en el preview de Temas

**Frontend puro. Depende de P1 solo para heredar el toggle de dispositivo en el mismo modal.**

1. Toggle de fuente de datos en `ThemePreviewModal`: **"Datos de ejemplo | Mi tienda"** (nombre de producto interno: *probador*).
2. "Mi tienda" = misma plantilla (tree + tokens default del template en preview) pero con datos reales del vendedor: reutilizar exactamente el fetch de `EditorCanvas` (`ProductHttpRepository.findAll` + `CategoryHttpRepository.findAll` + `mapRealProduct`) — **extraer ese fetch+mapeo a un hook compartido** (`useStorePreviewData()` en `lib/hooks/`) para no duplicarlo.
3. Estados borde:
   - Tienda sin productos → toggle "Mi tienda" deshabilitado con tooltip ("Cargá productos para probarte el tema con tu catálogo").
   - Copy en el modal aclarando el comportamiento correcto-pero-sorprendente: los textos editados del tema actual (headline, etc.) no viajan — cada tema trae los suyos. Que no parezca bug.
4. El botón "Aplicar" del modal queda igual (ya existe vía `switchTemplate`).

Verificación: probarse un tema con catálogo real y con tienda vacía; aplicar desde el probador y confirmar que el editor abre con el tema nuevo.

## Fase P3 — Redes sociales como datos de tienda (backend chico)

**El único item con backend. Independiente de P1/P2 — puede ir en paralelo.**

1. `Store.socials Json?` — array `[{ platform: 'instagram'|'tiktok'|..., url: string }]` (mismo shape que hoy usa `socials.items` en los temas). Migración additive generada y dejada en `prisma/migrations/` — **NO se corre** sin OK de Antonio (regla de sesión).
2. Exponer en: DTO de store autenticado, response de tienda pública, y `TemplateStore` (frontend) gana `socials?: Array<{platform, url}>`.
3. `SocialsSection` (y footer si muestra redes): lee `store.socials` primero, `section.props.items` como fallback/override — los temas existentes no se rompen.
4. UI de edición en Configuración de la tienda (lista simple plataforma+URL).
5. Seed/demo data: sin cambios (el demo `store` puede ganar socials de ejemplo, opcional).

Verificación: cambiar de tema y confirmar que las redes viajan; tema viejo con `props.items` sigue mostrando lo suyo si la tienda no configuró redes.

## Fase P4 — Diseño en móvil, tiempo 1: modo preview + publicar

**Barato. Cierra el hueco de UX antes de que exista el editor móvil real. Depende de P1 (el preview a pantalla completa ya es fiel gratis: el contenedor ES angosto).**

En `theme-editor.tsx`, a ≤768px (mismo breakpoint y misma detección `matchMedia` que ya usa `panel-official.tsx`):

1. NO se renderiza la grilla de 3 columnas. En su lugar:
   - **Preview del borrador a pantalla completa** (el `EditorCanvas` sin selección, o `TemplateRenderer` directo — decidir en implementación; sin overlays de selección).
   - **Barra de acciones táctil** (sticky bottom, encima del m-bottom-nav): estado del borrador + **Publicar** + **Descartar**.
   - Cuando exista Fase B (recetas): bloque de **Recetas** arriba del preview — un tap, perfectas para móvil.
   - Aviso: *"Para editar secciones y textos, entrá desde una computadora"*.
2. La tab Temas (`themes-board.tsx`) sí debe funcionar completa en móvil (es grid de cards + modal — revisar que el modal y los filtros se vean bien a 390px, ajustar lo que haga falta).

Verificación: flujo completo en 390px real (DevTools + teléfono): entrar a Diseño → ver preview fiel → publicar. Nada desborda horizontalmente.

## Fase P5 — Editor móvil completo, tiempo 2

**Fase propia, NO entra en fase2/front-prod. Prerrequisitos: P1–P4 mergeados, editor desktop estable en prod, idealmente Fase B (recetas) hecha.**

Objetivo de aceptación: **todo lo editable en desktop es editable en teléfono.** La lógica es compartida (`useTheme`, `replaceSections`, `SectionInspector` auto-generado); lo que se rehace es solo el layout, con los patrones móviles que el panel ya tiene (bottom sheets estilo `quick-actions-sheet`).

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

1. Ancho del frame móvil del preview: 390px (iPhone 12–15) vs 360px (Android chico). Propuesta: frame de 390px, y la verificación manual siempre a 360px.
2. ¿Marco visual de teléfono (notch, bordes) en el modo móvil del preview, o solo el recuadro angosto? (cosmético, decidir al implementar).
3. En P4, ¿el preview móvil permite tap para navegar (abrir producto, carrito demo) o es estático? Propuesta: interactivo, es más útil como "así lo ve tu cliente".
4. Nombre visible del probador: "Mi tienda" vs "Probar con mis datos" vs "Probador". Propuesta: toggle corto "Ejemplo | Mi tienda".
