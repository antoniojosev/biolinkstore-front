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

## Diseño elegido

**El link de producto NO abre una página distinta: abre la tienda completa con el sheet del producto ya abierto.**

Razón de producto: el comprador que recibe el link en WhatsApp aterriza viendo el producto (sheet abierto, listo para agregar al carrito) **y** con toda la tienda detrás — puede seguir mirando, el carrito funciona, el checkout por WhatsApp funciona. Una página de producto aislada cortaría ese flujo. Es el patrón Linktree/Instagram-shop: el link vende el producto y de paso presenta la tienda.

### Piezas

1. **`app/[slug]/[productSlug]/page.tsx`** deja de ser redirect →
   - Extraer el cuerpo de `app/[slug]/page.tsx` (fetch de store/products/theme/rate + armado de `StorefrontClient`) a un componente/función compartida — las dos rutas lo llaman; la de producto pasa `initialProductSlug`.
   - `generateMetadata` propio: fetch al endpoint público de producto individual → `title: "{producto} — {tienda}"`, `description` (descripción o línea de precio), `og:image` = primera foto del producto, canonical `https://bylink.app/{slug}/{productSlug}`. Producto inexistente/oculto → metadata de la tienda + la página redirige a `/{slug}` (comportamiento actual preservado).
2. **`StorefrontClient`**: prop `initialProductSlug?: string` — al montar, busca el producto por slug en los ya fetcheados y lo abre **vía `handleOpenProduct`** (así el `PRODUCT_VIEW` del deep-link se trackea gratis). No encontrado → no-op (la tienda carga normal).
3. **`TemplateProduct.slug?: string`** + mapeo en el armado de productos de la página (y en draft-preview con optional chaining).
4. **Botón "Compartir" en `ProductDetailSheet`**: `navigator.share` (en móvil abre el share sheet nativo → WhatsApp directo) con fallback a `navigator.clipboard` + feedback inline "✓ Link copiado" (mismo patrón que el "✓ Agregado" existente; el storefront no usa la librería de toasts del dashboard).
5. **URL sync suave**: al abrir un producto desde una card, `history.replaceState` a `/{slug}/{productSlug}`; al cerrar, de vuelta a `/{slug}`. `replaceState` (no push) a propósito: cero interacción con el botón atrás, cero manejo de popstate — v1 sin estados fantasma. El botón Compartir compone la URL por su cuenta, así que esto es solo para "copiar de la barra".

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
