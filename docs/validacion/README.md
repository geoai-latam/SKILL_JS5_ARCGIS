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
| 1 | `arcgis-3d-layers` | aporta con arreglos | Enseñaba el splat con .ply (falla en silencio, ejecutado); qualityProfile contra la guía del SDK; faltaba 3D Tiles |
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

### 1. `arcgis-3d-layers` — aporta con arreglos

**¿Corre en 5.1?** Los 3 snippets y los 37 bloques compilan contra 5.1.27, sin API deprecada.
Además se ejecutó en Chromium real (`tests/runtime/casos/arcgis-3d-layers.ts`, 6 comprobaciones
en verde): el `SceneLayer` de Nueva York carga, el splat de Esri carga desde su `tileset.json`, un
`SceneLayer` en `MapView` no crea layerView, y el SceneView fija `qualityProfile` solo (`medium`).

**Lo que estaba mal (y ya se arregló):**

- **Enseñaba a fallar con el splat.** Los tres archivos y el snippet ponían
  `new GaussianSplatLayer({ url: "…/site.ply" })`. La capa consume un `3DTilesServer/tileset.json`
  publicado o un `portalItem` (lo dice el `.d.ts`). Ejecutado: con la `.ply`, `load()` resuelve,
  `loadError` es `null` y el extent es el mundo entero; no hay error y no se dibuja nada. Un agente
  que siguiera la skill entregaba código roto sin saberlo.
- **El consejo de `qualityProfile` contradecía al SDK.** Recomendaba fijar `"medium"`; la
  documentación dice que el SceneView lo evalúa por equipo y recomienda no tocarlo.
- **Faltaba `IntegratedMesh3DTilesLayer`.** Una malla en 3D Tiles metida en `IntegratedMeshLayer`
  falla (ejecutado: 404 en `?f=json`). Es el caso más común hoy (3DTilesServer) y la skill no lo
  nombraba. También faltaban `BuildingSceneLayer` y `VoxelLayer` en el árbol.
- El enlace de muestra de `IntegratedMeshLayer` iba a una página genérica.

**Lo que se añadió:** el fallo silencioso del splat como pitfall con su diagnóstico (extent de
360°), la limitación documentada de `opacity` en mallas, nubes y splats dentro de un SceneView, y
lo que 5.1 trajo a los splats (recorte, slice, línea de visión, perfiles, sombras).

**¿Aporta?** Sí, después del arreglo. Lo de "3D solo en SceneView" y `ground` lo sabe cualquier
modelo; el valor está en lo que no sabe porque es de 5.0/5.1: de dónde sale un splat, qué clase lee
3D Tiles, cómo detectar que la capa cargó vacía y que `opacity` no hace nada ahí. Antes del
arreglo, la skill restaba: inducía el error.
