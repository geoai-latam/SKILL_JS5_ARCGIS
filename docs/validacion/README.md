# Validación una por una contra el SDK 5.1

Rama `actualizacion-5.1`, empezada el 2026-10-27. Nada de esto se publicó ni se empujó:
abrir el repo lo decide Sebastián.

## Cómo se juzga cada skill

Tres preguntas, con evidencia, no con impresión:

1. **¿Corre en 5.1?** Los `scripts/snippet-*.ts` con `pnpm smoke` y CADA bloque de código de
   `SKILL.md`, `SKILL.es.md`, `AGENTS.md` y `references/*.md` con
   `node scripts/check-code-blocks.mjs --skill=<nombre>` (compila contra los `.d.ts` 5.1.27 y
   marca lo `@deprecated`). Las afirmaciones en prosa (nombres de propiedades, atributos de
   componentes, rutas de módulos) se cotejan contra los `.d.ts` instalados y
   `docs/validacion/cambios-sdk-5.1.md`.
2. **¿Corrige un error que un agente cometería sin ella?** Se nombra el error concreto (escribir
   4.x, un módulo deprecado, una propiedad que no existe, un patrón que falla en silencio) y se
   comprueba que el error sería real (que la API vieja existe y está deprecada, o que el patrón
   falla). Si lo que enseña es lo que cualquier modelo ya escribe bien, no cuenta.
3. **¿Es relleno?** Contenido genérico de documentación, repetido entre archivos, o
   contradictorio con su propia regla.

**Veredicto:** `aporta` · `aporta con arreglos` (se arregló en esta rama) · `no aporta`
(propuesta: fusionar o quitar; no se borra nada sin el sí de Sebastián).

## Estado

| # | Skill | Veredicto | Evidencia corta |
|---|---|---|---|
| 1 | `arcgis-3d-layers` | pendiente | |
| 2 | `arcgis-advanced-layers` | pendiente | |
| 3 | `arcgis-arcade` | pendiente | |
| 4 | `arcgis-authentication` | pendiente | |
| 5 | `arcgis-charts` | pendiente | |
| 6 | `arcgis-cim-symbols` | pendiente | |
| 7 | `arcgis-coding-components` | pendiente | |
| 8 | `arcgis-coordinates-projection` | pendiente | |
| 9 | `arcgis-core-maps` | pendiente | |
| 10 | `arcgis-core-utilities` | pendiente | |
| 11 | `arcgis-custom-rendering` | pendiente | |
| 12 | `arcgis-editing` | pendiente | |
| 13 | `arcgis-embeddable-maps` | pendiente | |
| 14 | `arcgis-feature-effects` | pendiente | |
| 15 | `arcgis-geometry-operations` | pendiente | |
| 16 | `arcgis-imagery` | pendiente | |
| 17 | `arcgis-interaction` | pendiente | |
| 18 | `arcgis-knowledge-graphs` | pendiente | |
| 19 | `arcgis-layers` | pendiente | |
| 20 | `arcgis-map-tools` | pendiente | |
| 21 | `arcgis-performance` | pendiente | |
| 22 | `arcgis-popup-templates` | pendiente | |
| 23 | `arcgis-portal-content` | pendiente | |
| 24 | `arcgis-rest-services` | pendiente | |
| 25 | `arcgis-scene-environment` | pendiente | |
| 26 | `arcgis-smart-mapping` | pendiente | |
| 27 | `arcgis-spatial-analysis` | pendiente | |
| 28 | `arcgis-starter-app` | pendiente | |
| 29 | `arcgis-tables-forms` | pendiente | |
| 30 | `arcgis-time-animation` | pendiente | |
| 31 | `arcgis-utility-networks` | pendiente | |
| 32 | `arcgis-visualization` | pendiente | |
| 33 | `arcgis-widgets-advanced` | pendiente | |
| 34 | `arcgis-widgets-ui` | pendiente | |
| 35 | `arcgis-ai-components` | pendiente | |

`arcgis-ai-components` va al final a propósito: tiene 596 líneas sin guardar de antes de esta
rama, y guardarlas o descartarlas lo decide Sebastián. Se valida la versión del working tree sin
mezclarla en los commits de esta rama.

## Registro por skill

