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
| 2 | `arcgis-advanced-layers` | aporta con arreglos | CatalogLayer sobre MapServer (rechazado, ejecutado) y no es de 5.0; pitfall WFS equivocado; WMS mal nombrado falla en silencio |
| 3 | `arcgis-arcade` | aporta con arreglos | Pitfall falso (mayúsculas: Arcade no las distingue, ejecutado); campos/geometría no pedidos dan 0 en silencio; faltaba isAsync y createArcadeProfile |
| 4 | `arcgis-authentication` | aporta con arreglos | La key en VITE_ igual viaja en el bundle; keys AAPK retiradas el 27-jun-2026 (Invalid Token, ejecutado); OAuth tarde abre el diálogo del SDK, no falla |
| 5 | `arcgis-charts` | aporta con arreglos | antes no corría: `config` inventado; ahora `createModel` + `model`, ruta sin `.js`, Calcite fijado en ~5.1.2 |
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

### 2. `arcgis-advanced-layers` — aporta con arreglos

**¿Corre en 5.1?** Los 3 snippets y los 38 bloques compilan contra 5.1.27. Se ejecutaron 11
comprobaciones en Chromium contra servicios públicos (`tests/runtime/casos/arcgis-advanced-layers.ts`):
catálogo de Esri, `MapImageLayer` USA, WMS y WFS del demo de MapServer y OGC API de pygeoapi. Todas
en verde.

**Lo que estaba mal (y ya se arregló):**

- **`CatalogLayer` apuntaba a un MapServer.** Ejecutado: se rechaza con "There is no Catalog Layer in
  the service"; la capa vive en un FeatureServer. Además decía "nueva en 5.0" y es de 4.30, y no
  enseñaba nada de su uso real (`footprintLayer`, `dynamicGroupLayer`, `createLayerFromFootprint`):
  el ejemplo solo imprimía el título.
- **El pitfall de WFS era el equivocado.** Hablaba de CRS; el requisito duro que documenta el SDK es
  WFS 2.0.0 con salida GeoJSON, y muchos geoportales nacionales siguen en WFS 1.1. Faltaba `name`.
- **El pitfall del nombre WMS describía mal el síntoma.** Decía que el servidor devuelve un error;
  ejecutado: `load()` resuelve, `loadError` queda en `null` y no se dibuja nada. Se añadió cómo sacar
  los nombres reales (`allSublayers` sin declarar `sublayers`).
- **Faltaba que declarar `sublayers` reemplaza la lista del servicio** (medido: 2 de 4).
- **Faltaban `WMTSLayer` y `OGCFeatureLayer`**, los dos protocolos que más sirven hoy las IDE de
  la región, y que `OGCFeatureLayer` no tiene `queryFeatures` en la capa (se consulta por el layer
  view; ejecutado: 20 lagos).
- Los ejemplos usaban `https://example/geoserver/wms`: se cambiaron por servicios que responden.

**¿Aporta?** Sí, después del arreglo. "WMS no se consulta, WFS sí" lo sabe cualquier modelo. Lo que
un agente no sabe y le cuesta horas: el requisito de WFS 2.0 + GeoJSON, los dos fallos silenciosos
(nombre WMS, `sublayers` que esconden capas), dónde vive un catálogo y cómo se usa, y por dónde se
consulta una capa OGC API.

### 3. `arcgis-arcade` — aporta con arreglos

**¿Corre en 5.1?** El snippet y los 28 bloques compilan contra 5.1.27. Diez comprobaciones en
Chromium (`tests/runtime/casos/arcgis-arcade.ts`), todas en verde, una contra el servicio USA real.

**Lo que estaba mal (y ya se arregló):**

- **Un pitfall era falso.** "Mayúsculas en el nombre del campo: `$feature.pop` con campo `POP` da
  null". Ejecutado: devuelve 7. Arcade no distingue mayúsculas en los campos. Un agente que lo
  siguiera buscaría el error donde no está.
- **El pitfall de geometría decía que "falla".** Ejecutado: `Area($feature)` sin geometría
  devuelve 0, sin error. Es peor: un número falso que parece bueno.
- **Faltaba el fallo silencioso más común**: el campo que no se pidió en `outFields`. Medido en un
  servicio real: `$feature.pop2000 / 1000` da 0 sin el campo y 1211.537 con él. La API ya da la
  respuesta (`executor.fieldsUsed`, `geometryUsed`) y la skill no la nombraba.
- **Faltaba `isAsync` / `executeAsync`.** Un script con FeatureSet ejecutado con `execute()` lanza
  "Cannot execute the script in synchronous mode" (ejecutado).
- **Faltaba `createArcadeProfile`**, que arma el perfil correcto de cada contexto (popup trae 7
  variables; visualización, 2) en vez de escribirlo a mano.
- 5.0 deprecó `lruCache` por `cache`; no estaba.
- Se añadió el área plana frente a la geodésica: medido a 50° S, `Area` en Web Mercator da 2,42 veces
  `AreaGeodetic`. Para catastro o cobertura en el Cono Sur no es un detalle.

**¿Aporta?** Sí, después del arreglo, y es de las que más: los modelos escriben Arcade "que compila"
y fallan en la integración (campos no pedidos, sync/async, perfiles). Antes del arreglo tenía un
consejo falso y le faltaba lo que de verdad rompe.

### 4. `arcgis-authentication` — aporta con arreglos

**¿Corre en 5.1?** Los 2 snippets y los 31 bloques compilan contra 5.1.27. Cinco comprobaciones en
Chromium (`tests/runtime/casos/arcgis-authentication.ts`) contra ArcGIS Online, todas en verde.

**Lo que estaba mal (y ya se arregló):**

- **Daba una falsa seguridad con la API key.** Presentaba `import.meta.env.VITE_ARCGIS_API_KEY` como
  la protección; Vite mete ese valor en el JavaScript público. La key es visible por construcción:
  la protegen la restricción de referrers, los privilegios mínimos y la expiración, que la skill no
  nombraba.
- **No sabía que las keys legacy murieron.** Las API keys anteriores al 27-jun-2024 (`AAPK…`) se
  retiraron el 27-jun-2026 (fuente: Esri, "API keys (legacy)" y el aviso de soporte 000036479);
  ejecutado: una `AAPK` responde "Invalid Token". Tampoco decía que las nuevas expiran (hasta un año)
  ni cómo rotar con key 1 / key 2.
- **El pitfall de registrar OAuth tarde describía mal el síntoma.** Decía "la primera petición
  falla"; ejecutado: el SDK abre su propio diálogo de usuario y contraseña (`.esri-identity-modal`,
  en español) y la promesa queda esperando. Lo mismo un geocode sin key.
- **"Una API key no sirve para capas seguras" ya no es cierto**: a una API key credential se le
  pueden dar ítems privados. Se reescribió como lo que sí es cierto: una key es una sola identidad
  para todos los visitantes.
- Faltaba que `flowType` vale `"auto"` por defecto (PKCE) y que `"implicit"` es solo para
  servidores anteriores a 10.9.

**¿Aporta?** Sí, después del arreglo. Lo de "no metas secretos en el navegador" lo sabe cualquier
modelo. Lo que no sabe porque cambió en 2024–2026: el retiro de las keys legacy, la expiración y
rotación, y qué hace el SDK cuando falta el sign-in. Antes del arreglo, en lo central (la key)
enseñaba algo engañoso.

### 5. `arcgis-charts` — aporta con arreglos

**¿Corre en 5.1?** Ahora sí: el snippet y los 28 bloques compilan contra 5.1.27, y en Chromium
(`tests/runtime/casos/arcgis-charts.ts`) el bar chart de `createModel` dispara
`arcgisDataProcessComplete` con una `barSeries`. **Antes de este arreglo no corría nada.**

**Lo que estaba mal (y ya se arregló):**

- **Enseñaba una API que no existe.** Todo el código de la skill (Quick Start, ejemplos, pitfalls,
  AGENTS.md) armaba el chart con `chartEl.config = { type: "bar", category: { field }, aggregation }`.
  `arcgis-chart` no tiene `config` público. En ejecución hay una propiedad interna con ese nombre:
  asignarla no da error, no crea modelo y el chart queda vacío. Los ejemplos solo compilaban porque
  hacían cast del elemento a `{ config?: unknown }`. La API real es
  `createModel({ layer, chartType: "barChart" })`, luego `model.xAxisField`/`aggregationType`, y
  `chart.layer` + `chart.model`.
- **La ruta de `createModel` que publica Esri falla.** Las notas de 5.1 la imprimen con `.js`; el
  mapa de exports del paquete no la trae y Vite para con "Missing specifier". Sin `.js` funciona.
  Hoy el índice del paquete también funciona, pero está deprecado y sale en 6.0.
- **Calcite 5.2 rompe charts 5.1.27** (hallazgo de esta validación, no está documentado). Con
  `^5.1.1` se instala Calcite 5.2.0, amCharts lanza "Unknown color syntax: light-dark(...)" y el
  chart nunca dibuja. Con 5.1.2 dibuja. Va como Concepto 4 y Pitfall 3, y el repo fija `~5.1.2`.
- Bloque de CDN sin URL real → los dos `<script>` de `js.arcgis.com/5.1/`. Ahora también enseña
  `syncViewSelection` + `chart.view` (5.1), el detalle real de `arcgisSelectionComplete`
  (`{ selectionData, model }`), `chartIndex` para charts guardados, los renombres de 5.1 y que desde
  5.1 se aceptan capas de imágenes.
- El pitfall "serie de tiempo sobre campo string" no tenía síntoma comprobado. Ejecutado: el modelo
  acepta un string como `xAxisField` sin quejarse, así que la comprobación quedó en el ejemplo
  (`layer.getField(...).type === "date"`) y el Top-3 lo ocupa lo de Calcite, que sí rompe en silencio.

**¿Aporta?** Ahora sí y mucho: un agente sin la skill tiende a inventar un objeto de configuración
(es lo que hizo la propia skill), y no puede adivinar ni la ruta sin `.js` ni el choque con Calcite
5.2. Antes del arreglo la skill era peor que nada: enseñaba con seguridad un código que nunca dibuja.
