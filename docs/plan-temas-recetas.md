# Plan — Temas como "kit de pizza": recetas, variantes reales y framework de diseño

> Rama frontend: `fase2/front-prod` · Rama backend: `fase2/front-prod-support`
> Continuación del editor de secciones (2026-07-10/11). Estado: PLAN, pendiente de implementación.

## 1. El modelo (la analogía que gobierna todo)

Un tema es un **kit de pizza**:

1. **La pizza armada (receta default)** — el tema tal cual lo entrega el diseñador: layout de secciones (`defaultTree`), estética (`defaultTokens`: paleta + tipografía + radius + spacing + botón). El usuario que no toca nada tiene una tienda hermosa.
2. **Los compartimientos con recetas alternativas (NUEVO)** — el mismo tema trae 1–3 combinaciones completas adicionales curadas por el diseñador ("Noir Cálido", "Noir Contraste"): cada una es un set completo y coherente de tokens (+ opcionalmente variantes de sección predefinidas). Un click y la tienda cambia de personalidad **sin riesgo de romper la estética**, porque la combinó un diseñador.
3. **Los ingredientes sueltos (ya existe, no se toca)** — la edición libre actual: picker de color libre, whitelist de fuentes, agregar/quitar/reordenar secciones, editar props, elegir variante por sección. Para el usuario que quiere cocinar su propia receta.

Decisión de producto confirmada por Antonio: **no se restringe la edición libre**. Las recetas son la vía recomendada, no la única.

Regla estructural que ya rige y se mantiene: el diseñador **compone, no programa**. Las secciones y sus variantes están implementadas (responsive incluido) en el `TemplateRenderer`; un tema solo declara cuáles usa y con qué contenido demo. Por eso ningún tema puede quedar roto en móvil: el responsive vive en el componente, una sola vez.

## 2. Estado actual (verificado en código, 2026-07-11)

| Pieza | Estado |
|---|---|
| `defaultTree`/`defaultTokens` por template | ✅ backend + seed |
| Variantes por sección declaradas en schema | ✅ 26 declaraciones en el seed (hero, product_grid, gallery, faq, about, cta, testimonials, featured, text_block…) |
| Select de variante en el inspector de secciones | ✅ (editor de secciones, 2026-07-10) |
| Persistencia de `variant` por sección | ✅ backend valida y guarda |
| **Renderizado de variantes** | ❌ `TemplateRenderer` ignora `section.variant` por completo — promesa vacía |
| **Recetas alternativas por tema** | ❌ no existe el concepto |
| Reset quirúrgico de estética | ❌ solo existe "Descartar" (borra todo el borrador, contenido incluido) |
| Doc del framework para diseñadores | ❌ solo existe implícito en el código del seed |

## 3. Fases

### Fase A — Variantes reales en el renderer (frontend puro, la pieza técnica central)

**A1. Normalizar el catálogo de variantes en familias.** Las 26 declaraciones del seed se reducen a familias implementables:

- `product_grid` / `featured_products`: `grid-2|grid-3|grid-4` (columnas del auto-fit), `list` (filas horizontales), `carousel` (scroll-snap horizontal), `grouped-by-category` (título de categoría + grid por grupo), `with-swatches` (grid + swatches de color del producto), `cards-real-estate`/`list-detailed`/`services-cards`/`showcase-poster` (alias de nicho de las anteriores con densidad distinta).
- `hero`: `split` (texto|imagen 2 col — el actual), `banner` (imagen full-bleed con texto encima), `compact` (texto centrado sin imagen), `full-screen` (100vh), `editorial`/`cinematic`/`rose-bloom` (alias tipográficos de banner/full-screen con tratamientos distintos — evaluar en implementación cuáles colapsan).
- `gallery`: `grid` (actual), `masonry` (columns CSS), `carousel`.
- `faq`: `pills` (acordeón actual), `cards`, `sidebar` (2 col: índice + contenido).
- `about`: `split` (actual), `banner`, `centered-quote`, `two-column`.
- `cta_banner`: `banner` (actual), `split`, `full-screen-cta`.
- `testimonials`: `cards`, `carousel`.
- `text_block`: `editorial` (actual), `full-screen`.

**A2. Mecanismo.** `SectionRenderer` ya recibe el nodo completo; cada componente de sección lee `section.variant`, con default = primera variante declarada o el layout actual. Convención: `const variant = (section as SectionNode).variant ?? "<default>"`. Cada variante nueva DEBE incluir su comportamiento responsive (media query o auto-fit) antes de mergear — es la regla del framework.

**A3. Orden de implementación por tandas** (cada tanda = commit verificable):
1. `hero` + `product_grid` (definen el golpe visual de todos los temas).
2. `gallery` + `featured_products` + `about` + `cta_banner`.
3. `faq` + `testimonials` + `text_block` (+ lo que quede).

**A4. Dónde se ve.** El canvas del editor, el modal de vista previa de Temas, el preview de borrador (`?preview=true`) y la tienda pública usan el mismo renderer → las variantes funcionan en los 4 contextos sin trabajo extra.

### Fase B — Recetas por tema (backend chico + frontend)

**B1. Modelo backend.** Nueva columna en `Template`:

```prisma
// Recetas alternativas curadas por el diseñador ("compartimientos del kit"):
// combos completos de tokens (+ overrides de variante/visibilidad por sección)
// que cambian la personalidad del tema sin romper su estetica.
stylePresets Json?
```

Shape (documentado en el DTO y el doc del framework):

```ts
type StylePreset = {
  key: string            // "noir-warm"
  name: string           // "Noir Cálido"
  description?: string
  tokens: ThemeTokens    // set COMPLETO (palette+typography+radius+spacing+buttonStyle)
  sectionOverrides?: Array<{ key: string; variant?: string; visible?: boolean }>
}
```

- Migración additive generada y dejada en `prisma/migrations/` — **NO se corre** hasta OK de Antonio (regla de sesión; en local la corre él o pide correrla).
- Exponer `stylePresets` en el response del catálogo de templates (público y autenticado). Sin validación server-side compleja en v1: es contenido autorado por nosotros vía seed, no input de usuario.

**B2. Seed.** Autorar recetas para 3 templates insignia como prueba del framework: Vitrina (+1 receta), Noir (+2), Menu (+1). Cada receta usa solo fuentes de la whitelist y colores accesibles. Actualizar el seed existente (idempotente por `upsert`).

**B3. Frontend — UI de recetas.** En la tab "Diseño" del inspector (arriba del `TokensEditor` actual):

- Bloque "Recetas del tema": cards horizontales compactas — nombre + fila de swatches de la paleta + nombre de la fuente heading. La primera card es siempre **"Original"** (los `defaultTokens` del template) — esto resuelve de paso el reset quirúrgico: volver a la estética del diseñador sin tocar contenido = aplicar la receta Original.
- Card activa marcada (comparación de tokens actuales vs receta).
- Aplicar receta = reemplazo **completo** de tokens (no merge — atención: `patchTokens` del hook hace deep-merge; para recetas se envía el set completo con todos los campos para que el merge equivalga a replace) + `replaceSections` con los `sectionOverrides` aplicados sobre el árbol actual (solo pisa `variant`/`visible` de las keys que matchean; nunca toca `props` = nunca pisa contenido del usuario).
- Debajo de las recetas, el editor libre actual pasa a un bloque "Personalizar" — misma funcionalidad, jerarquía visual nueva: receta primero, ingredientes después.

### Fase C — Doc del mini-framework para diseñadores

`igsotre-back/docs/theme-framework.md` (vive junto al seed, que es el medio de autoría):

1. **Anatomía de un tema**: key/name/niche/plan, `defaultTokens`, `sectionSchema` (secciones + props + variantes + removable), `demoDataJson`, `stylePresets`, `previewImage`.
2. **Catálogo de secciones**: los 15 tipos con sus props, variantes implementadas (post-Fase A) y screenshot/descripción de cada variante.
3. **Reglas del framework**: (a) el diseñador compone, no programa — si necesita un layout que no existe, se implementa primero como variante en el renderer; (b) responsive garantizado por el componente, no por el tema; (c) fuentes solo de la whitelist; (d) todo tema entrega receta default obligatoria + recetas alternativas opcionales; (e) contraste AA en toda paleta entregada.
4. **Checklist de entrega** de un tema nuevo y **cómo probarlo** (seed local + tab Temas + vista previa).

### Fase D — Verificación y cierre

- `tsc --noEmit` + `pnpm build` frontend; `pnpm build` backend.
- Prueba manual: aplicar cada variante de hero/grid en el editor y verificar en canvas + tienda pública + **360px móvil**; aplicar receta y confirmar que el contenido del usuario (textos/fotos/orden) no se pierde; "Original" restaura la estética.
- Grep guard: ninguna variante declarada en el seed sin caso en el renderer (script o revisión manual — si alguna queda fuera, quitarla del seed antes que dejar promesa vacía **[regla: schema nunca promete lo que el renderer no dibuja]**).
- Journal (`docs/journal-fase2.md`) + memoria + commits por fase (`fase2/temas-A1`, `fase2/temas-B`, …).

## 4. Decisiones ya tomadas (por Antonio, 2026-07-11)

- Edición libre se mantiene intacta — las recetas suman, no restringen.
- Variantes por sección = mecanismo de layouts alternativos; layouts estructuralmente distintos de un mismo look = template hermano, no un concepto nuevo.
- Diseñadores trabajan sobre el framework (componen); el layout default es obligatorio, variantes opcionales a su criterio.

## 5. Decisiones abiertas (para resolver durante la implementación, con Antonio)

1. ¿Cuántos alias de variantes de nicho colapsan entre sí en el renderer? (ej. `cinematic` ≈ `full-screen` con otro tratamiento tipográfico — decidir caso por caso en A1, criterio: si no hay diferencia visual clara, colapsar y limpiar el seed.)
2. Momento de correr la migración de `stylePresets` en local (Antonio decide, como con `instagramImportRequestedAt`).
3. Si el modal de vista previa de la tab Temas debería permitir hojear las recetas del template (nice-to-have, no bloqueante).
