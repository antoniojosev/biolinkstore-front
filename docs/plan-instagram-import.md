# Plan — Import real de Instagram (Apify + IA)

> Rama frontend: `fase2/front-prod` · Rama backend: `fase2/front-prod-support`
> Sesión "iteraciones v1" (2026-07-14). Estado: PLAN, pendiente de implementación.
> Primera de las 3 iteraciones acordadas (IG import → link compartible → temas B-E).

## Decisiones tomadas por Antonio (2026-07-14)

1. **Últimos 30 posts** por defecto; importar más = gate de plan PRO.
2. **LLM parsea captions** (nombre/precio/moneda/descripción) y **modelo de visión revisa las imágenes** para clasificar qué posts son productos de verdad (vs memes, fotos personales, flyers de promo).
3. Productos importados nacen **ocultos** (`isVisible: false`) para revisión del vendedor antes de publicar.

## Lo que ya existe (construido en fase2, hoy mockeado)

- `Store.instagramImportRequestedAt DateTime?` + migración (corrida en local).
- `UpdateStoreDto.requestInstagramImport: boolean` → el use-case lo traduce a fecha.
- Onboarding con revelación progresiva (campo @handle → elegir importar/manual) + animación `CinematicScraper`.
- Banner `instagram-import-banner.tsx` en el dashboard ("Importando tu catálogo de @handle", dismissible por localStorage).
- Módulo `uploads` (storage local hoy; el pipeline de imágenes lo reusa tal cual — cuando storage pase a R2/S3 para prod, el import lo hereda gratis).

## Arquitectura

### Sin webhook, sin cron: lazy + fire-and-forget (regla de ByLink)

La solución clásica (webhook de Apify → endpoint público nuestro) crea superficie pública nueva que habría que firmar y auditar en la sesión de seguridad. No hace falta:

1. **Trigger**: cuando `requestInstagramImport` llega, el use-case arranca el run de Apify vía API y guarda el `apifyRunId`. Además dispara un poll **in-process fire-and-forget** (cada ~15s, máx ~5 min) para que en el caso feliz el import se procese solo, sin que el usuario haga nada.
2. **Lazy fallback**: el endpoint de estado del import (que el banner consulta al cargar el dashboard) hace la resolución perezosa — si hay un import `RUNNING` cuyo run de Apify ya terminó (p. ej. el server se reinició a mitad del poll), lo procesa ahí mismo. Nada puede quedar colgado para siempre: se resuelve en la próxima lectura.
3. Cero endpoints públicos nuevos, cero secrets de webhook, cero scheduler.

### Modelo de datos (backend)

Nueva tabla (mejor que sobrecargar `Store` — da historial y estado granular):

```prisma
model InstagramImport {
  id              String   @id @default(cuid())
  storeId         String
  store           Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  handle          String
  status          InstagramImportStatus @default(RUNNING) // RUNNING | PROCESSING | DONE | FAILED
  apifyRunId      String?
  postsFound      Int      @default(0)
  postsSkipped    Int      @default(0)  // clasificados como no-producto
  productsCreated Int      @default(0)
  error           String?
  requestedAt     DateTime @default(now())
  finishedAt      DateTime?
  @@index([storeId, requestedAt])
}
```

Migración additive generada y dejada en `prisma/migrations/` — **NO se corre** sin OK de Antonio. `instagramImportRequestedAt` en Store queda como legacy/atajo del banner hasta migrar el banner al endpoint de estado.

### Pipeline de procesamiento (cuando el run de Apify termina)

Por cada post del dataset (máx. 30 en FREE):

1. **Clasificación + extracción en UNA llamada** a un modelo multimodal barato (Claude Haiku): entrada = primera imagen del post + caption; salida estructurada:
   ```json
   { "isProduct": bool, "name": str, "price": number|null, "currency": "USD"|"VES"|null, "description": str, "confidence": 0-1 }
   ```
   Una llamada por post (30 por import, paralelizables) — centavos por import. Posts con `isProduct: false` o confidence baja se cuentan en `postsSkipped`.
2. **Imágenes**: las URLs del CDN de IG son firmadas y **expiran en horas** → descargar inmediatamente (todas las del post, no solo la primera) y resubir vía el storage service existente del módulo uploads.
3. **Crear producto**: `isVisible: false`, nombre/descripción/precio del LLM (precio null → 0 y el vendedor lo completa), `priceCurrency` detectada (default USD), imágenes resubidas. Sin categoría (el vendedor asigna al revisar).
4. Actualizar `InstagramImport` → `DONE` con contadores; limpiar `instagramImportRequestedAt`.

### Gate de plan

- FREE: 30 posts. PRO/BUSINESS: límite mayor (número exacto a definir con Antonio; propuesta: 100).
- El límite se aplica en el input del actor de Apify (`resultsLimit`), no post-hoc — no pagamos por lo que no usamos.
- UI: si el perfil tiene más posts que el límite, mensaje "Importamos tus últimos 30 posts. ¿Querés más? Pasate a PRO".

### Config nueva (backend `.env`)

```
APIFY_TOKEN=            # cuenta de Apify (tier gratis alcanza para desarrollo)
APIFY_ACTOR_ID=         # actor de instagram scraping (verificar el vigente en el marketplace)
ANTHROPIC_API_KEY=      # para Haiku (clasificación + parseo)
```

### Frontend

1. **Banner** pasa de leer `instagramImportRequestedAt` a un endpoint de estado (`GET /stores/:id/instagram-import/latest`): estados *importando* (spinner actual) → *listo* ("✓ Importamos N productos de @handle — revisalos y publicá" + CTA al catálogo) → *falló* (mensaje + botón reintentar). El estado *listo* es dismissible.
2. **Catálogo**: los importados ya aparecen (son productos ocultos normales). Nice-to-have no bloqueante: chip/filtro "ocultos".
3. **Onboarding**: sin cambios de UI — al crear la tienda con importar elegido, ya dispara `requestInstagramImport`.

## Orden de implementación (commits verificables)

1. **I1 — Backend base**: tabla + migración (sin correr), cliente Apify (arrancar run, consultar estado, leer dataset), use-case StartImport conectado al trigger existente.
2. **I2 — Pipeline**: clasificación/extracción con Haiku + descarga/resubida de imágenes + creación de productos ocultos + resolución lazy y poll fire-and-forget.
3. **I3 — Frontend**: endpoint de estado + banner con los 3 estados + copy del gate PRO.
4. **I4 — Verificación**: import real contra una cuenta IG pública de prueba, builds limpios, journal.

## Decisiones cerradas (2026-07-14, segunda ronda)

1. **Cuenta de Apify**: Antonio ya tiene (tier gratis, le meterá saldo). Elegir actor concreto del marketplace al implementar (verificar precios vigentes).
2. **Modelo de IA**: **Haiku 4.5** (`claude-haiku-4-5`) para TODO el pipeline — clasificación visual + extracción de caption en UNA llamada multimodal por post, con structured outputs (`messages.parse()`, JSON garantizado). Costo ≈ $0.09 por import de 30 posts (≈$0.05 si se downscalea la imagen a ~768px antes de mandarla). Se evaluó Gemini 2.5 Flash-Lite ($0.10/$0.40 por MTok, ~9x más barato ≈ $0.01/import) — descartado para v1: agregar un segundo proveedor de IA (key, SDK, manejo de errores) no se justifica por ~8 centavos por import; revisitar si el volumen supera ~5-10k imports/mes. Sonnet 5 queda como escalación opcional para posts con confidence baja (v1.1, no v1).
3. **1 import activo a la vez**; botón reintentar solo en estado FAILED.

## Abierto

1. **API key de Anthropic** para el backend: ¿existe una para ByLink o se genera?
2. Límite PRO exacto (propuesta: 100 posts).
