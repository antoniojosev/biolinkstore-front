# bylink — email templates rebrandeados (Fase 1)

Artefactos HTML rebrandeados para los 4 emails transaccionales que hoy viven
como HTML inline en el backend. **No se commiteó nada al repo backend.** Antonio
porta estos HTML a sus archivos `.ts` manualmente (reemplazando el template
literal correspondiente y conservando los placeholders dinámicos).

## Lenguaje visual

- Tema claro (fondo `#FAFBFD`, tarjeta `#FFFFFF`) — reemplaza el tema oscuro previo.
- Marca: wordmark `bylink` + punto azul. Primary `#1E3A8A` (azul confianza), accent `#DC4A3D` (coral).
- Tipografía: Plus Jakarta Sans con fallback a system sans (los clientes que la soporten la cargan vía `<link>`).
- HTML email-safe: layout con tablas, estilos inline, `max-width: 600px`.

## Mapeo template → archivo backend

| Artefacto | Archivo backend a actualizar | Subject |
|-----------|------------------------------|---------|
| `password-reset.html` | `src/modules/auth/application/use-cases/forgot-password.use-case.ts` | `Recupera tu contraseña — bylink` |
| `demo-request.html` | `src/modules/contact/contact.use-case.ts` (`getDemoRequestEmailHtml`) | `Nueva solicitud de demo: {name}` |
| `inquiry.html` | `src/modules/contact/contact.use-case.ts` (`sendInquiry`) | `[{typeLabel}] Solicitud de {storeName}` |
| `payment-report.html` | `src/modules/payment-reports/application/use-cases/create-payment-report.use-case.ts` | `[Pago] {typeLabel} — {storeName}` |

## Placeholders

Cada archivo usa `{{placeholder}}` para los valores dinámicos (interpolaciones
del template literal actual). Reemplazar por las variables JS correspondientes
al portar. Placeholders por template documentados como comentario al inicio de
cada `.html`.

## Pendiente (no es scope Fase 1, anotado para Antonio)

- `src/infrastructure/image/watermark.service.ts` usa el texto `Bio Link Store`
  como watermark. Cambiar a `bylink` cuando se rebrandee assets de imagen.
- No existe email de bienvenida transaccional en el backend hoy; el flujo de
  onboarding lo sugiere pero no entra en Fase 1.
