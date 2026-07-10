# Resumen ejecutivo — Fase 2 front-prod

Rama frontend `fase2/front-prod` (11 commits, B0→B8), rama backend `fase2/front-prod-support` (0 commits — no hizo falta tocar backend). Ambas desde `staging/bylink`. Detalle completo bloque por bloque en `docs/journal-fase2.md`; plan original en `docs/plan-fase2-front-prod.md`.

**Alcance de la sesión, por instrucción explícita:** solo front visual + funcionalidad de flujos (lo que va a prod). Seguridad queda fuera, para una sesión dedicada aparte.

## Qué se hizo

- **B0-B1:** contraste AA, placeholder de imágenes que no existía, quitado el andamiaje de demo del panel real (toggle mobile falso → viewport real), apagados los mocks del dashboard.
- **B2:** rebrand completo de lo visible (biolinkstore/teal → bylink/navy-coral) en todo lo que quedaba con la marca vieja.
- **B3:** auth real — Google OAuth, recuperar contraseña con API real, invitación de equipo por token (antes rota).
- **B4:** onboarding reducido a 3 pasos reales (nombre/slug/instagram), con validación de username en vivo. El scraping de Instagram queda mockeado a propósito — es tema de otra sesión.
- **B5:** multi-tienda real (antes decía "próximamente" con la feature ya en el backend), QR real para compartir tienda, fix de bug de límite de plan en invitaciones de equipo (contaba solo aceptadas, no pendientes).
- **B6:** paridad total de productos — variantes y atributos reales (el backend ya los soportaba, nadie los llamaba desde el front), `priceCurrency` conectado.
- **B7 (el bloque grande):** el storefront con theming real (BE-120) pasa a ser la tienda pública canónica en `/[slug]` — carrito real, checkout WhatsApp, multi-moneda (USD/Bs con tasa BCV), preview de borrador del editor de temas, tipografía de los 9 templates cargando de verdad (antes ninguna fuente no-Inter se veía), responsive real en hero/about, y varios bugs de mapeo backend↔frontend (tracking sin `/api`, nombres de paleta desalineados, secciones del editor que el renderer ignoraba).
- **B8:** limpieza de código muerto — resultó mucho más grande de lo previsto. Se fueron ~11.600 líneas: todo el sistema de 6 templates legacy (vitrina/luxora/noir/menu/servicios/inmuebles), un flujo de auth mobile completo que nunca estuvo conectado a producción, la landing pre-v2, editores de diseño viejos, y varios clusters de componentes huérfanos.

## Decisiones tomadas sin preguntar (autonomía dentro del plan acordado)

- **Preview de borrador sin tocar seguridad:** el botón "Abrir preview" del editor de temas no funcionaba. En vez de crear un endpoint público nuevo, reutilicé el endpoint autenticado que ya existe (`GET /stores/:id/theme/preview`) leyendo la misma cookie de sesión que ya usa el dashboard. Cero superficie nueva sin auth — coherente con dejar seguridad para la otra sesión.
- **`/[slug]/[productSlug]` (página de producto individual) pasó a redirect.** Confirmé que nada en el storefront nuevo generaba ese link — ya era funcionalidad muerta antes de esta sesión. Si querés links compartibles por producto (tiene sentido para WhatsApp-commerce), es una feature nueva a diseñar, no algo que se perdió hoy.
- **`auth-mobile` (flujo completo, 587 líneas) eliminado.** Confirmé con `git log` que quedó fuera de uso desde hace tiempo (`auth-desktop` es el flujo canónico desde un commit anterior a esta sesión) y que `auth-desktop` sí es responsive de verdad. No es un gap de mobile sin resolver, es código abandonado.
- **Consolidación de botones (pedida en el plan) — diferida.** Los únicos 6 lugares que aún usan el botón shadcn viejo son páginas explícitamente fuera de esta fase (`/dashboard/plan`, `/dashboard/pagos`, formularios de password). Migrarlos es un refactor real sobre código que hoy funciona y no se verificó visualmente en esta sesión — lo dejé para cuando esas páginas mismas se migren al v2.

## Verificación hecha

- `npx tsc --noEmit` y `pnpm build` limpios después de cada bloque (36 rutas al final).
- Grep guards del plan (§5.2) corridos al final: 0 restos de marca vieja, mocks solo en las páginas `*-demo` (intencional), currency default corregido.
- Smoke test del servidor dev: landing, registro, las 4 páginas `*-demo`, un slug inexistente (404 correcto) y `/v2/slug` (redirect correcto) — todo responde sin errores de runtime.

## Qué quedó fuera (para decidir después, no son bugs de hoy)

- **Seguridad** — sesión dedicada aparte, como pediste.
- **Scraping real de Instagram** en el onboarding (queda mockeado).
- **Links compartibles por producto individual** en el storefront (antes tampoco existían).
- **Consolidación de botones** en las páginas legacy no migradas (`/dashboard/plan`, `/dashboard/pagos`).
- **Recorrido E2E con Playwright** que pide el plan (§5.3) — no lo automaticé; hice smoke test manual de rutas pero no un flujo completo de registro→compra con datos de prueba. Si querés que lo corra, dímelo y lo armo en la próxima sesión.

## Cómo revisar

Los 11 commits en `fase2/front-prod` están en orden (B0→B8), cada uno con su entrada correspondiente en `docs/journal-fase2.md` con el detalle de qué se encontró y por qué se decidió cada fix. Ningún deploy se hizo — todo queda en la rama, a la espera de que la revises.
