# Plan — Link compartible por producto (iteración 2)

> Rama frontend: `fase2/front-prod` · Backend: **sin cambios** (todo lo necesario ya existe).
> Sesión "iteraciones v1" (2026-07-15). Estado: PLAN.
> Segunda de las 3 iteraciones acordadas (IG import ✅ → **link compartible** → temas B-E).

## Panorama (verificado en código, 2026-07-15)

**Lo que ya existe y no sabíamos que estaba listo:**

- **Backend**: `GET /api/public/:slug/products/:productSlug` ya existe (`public-store.controller.ts:105`, con su use-case y DTO). Cero trabajo backend.
- **Slug de producto**: `Product.slug` con `@@unique([storeId, slug])` en Prisma — URL estable por tienda garantizada a nivel DB. El slug ya viaja por el endpoint público de lista y `adaptProduct` ya lo mapea (`lib/api.ts:99`). Solo falta en `TemplateProduct` (el tipo del renderer).
- **La ruta `/[slug]/[productSlug]` ya está reservada**: hoy es un `redirect(/${slug})` (decisión B8 — la página legacy murió sin caller). Reemplazarla por una página real no rompe nada y los links viejos siguen sin 404ear.
- **Tracking**: `handleOpenProduct` en `storefront-client.tsx` ya dispara `PRODUCT_VIEW` (dual legacy+nuevo) — el deep-link solo tiene que pasar por el mismo camino.

**La restricción que define el diseño**: el crawler de WhatsApp no ejecuta JS — el OG (título/foto/precio en el preview del chat) tiene que salir **server-rendered**. Eso obliga a que el link sea una ruta real con `generateMetadata`, no un estado del sheet.

## Diseño elegido (Modelo B — decidido por Antonio 2026-07-15)

**Cada producto tiene su página propia (`/{tienda}/{producto}`), renderizada por el sistema de temas y obligatoria en todos los temas.** Se descartó el modelo "sheet sobre la tienda": el sheet nunca sería diferenciable por tema, y la visión de producto es que la vista de detalle sea parte del framework de temas.

**Por capas, igual que el responsive**: la página de detalle se implementa UNA vez en el renderer base, estilizada por los tokens del tema (paleta/tipografías/radius) → todos los temas la tienen gratis, cumpliendo la regla "el diseñador compone, no programa". Cuando llegue Fase E (renderers por tema), un tema custom podrá traer su propia vista de detalle.

**Navegación**: las cards de producto navegan a la página (estilo Shopify) — links reales `<a href>` (SEO + middle-click + compartir desde el menú contextual gratis). El sheet lateral se retira: la página es LA vista de detalle, con selección de variantes, cantidad y carrito completo. El carrito se comparte entre tienda y página (mismo CartProvider por slug).

### Piezas

1. **`app/[slug]/[productSlug]/page.tsx`** deja de ser redirect → página real:
   - Mismos fetches que la tienda (store/products/theme/rate — helpers compartidos extraídos de `app/[slug]/page.tsx`), encuentra el producto por slug; inexistente/oculto → `redirect(/{slug})` (links viejos preservados).
   - **`generateMetadata` optimizado para WhatsApp/redes** (el crawler no ejecuta JS — todo server-rendered): `og:title` "{producto} — {tienda}", `og:description` con el precio adelante ("$12 · descripción…" — WhatsApp lo muestra en el preview del chat), `og:image` = primera foto del producto con width/height, canonical `https://bylink.app/{slug}/{productSlug}`, twitter card. Usa el endpoint público de producto individual (ya existente).
2. **`ProductPageClient`** (nuevo, en `storefront-v2/template/`): CartProvider + NavBar del renderer (exportada) + galería de fotos + nombre/precio (con línea en Bs si hay tasa) + selección de variantes (lógica movida del sheet) + cantidad + agregar al carrito + descripción + strip "Más de {tienda}" con otros productos + botón **Compartir** (`navigator.share` nativo → WhatsApp; fallback clipboard con "✓ Link copiado"). Dispara `PRODUCT_VIEW` al montar (cubre deep-links y navegación interna con un solo punto).
3. **`TemplateProduct.slug?: string`** + prop opcional `productHref` en el renderer: cuando está, las cards son `<a href>`; cuando no (editor/previews), siguen siendo botones inertes.
4. **`StorefrontClient`**: pasa `productHref` en vez de abrir el sheet; `ProductDetailSheet` queda sin caller → se elimina (su lógica de variantes vive ahora en la página).

### Reglas que caen solas

- **Productos ocultos no son compartibles**: los endpoints públicos solo devuelven visibles → un producto importado de IG sin revisar no tiene link hasta que el vendedor lo publique. Coherente sin código extra.
- Links viejos/bookmarks: siguen redirigiendo a la tienda si el producto no existe.

### Fuera de alcance (anotado, no bloqueante)

- Botón "copiar link" en la lista de productos del dashboard (lado vendedor) — nice-to-have de 20 minutos para después; el vendedor ya puede compartir abriendo su propia tienda.
- `og:type product` con precio estructurado (`product:price:amount`) — WhatsApp lee title/description/image igual; refinamiento posterior.

## Verificación (al implementar)

- `tsc` + `pnpm build` limpios.
- `curl -s https://localhost:3000/{slug}/{productSlug} | grep og:` muestra el OG del producto (server-rendered, sin JS).
- Deep-link abre el sheet con el producto correcto; slug inexistente redirige a la tienda.
- Compartir desde el sheet: URL correcta en clipboard/share nativo.
