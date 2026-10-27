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
| 6 | `arcgis-cim-symbols` | aporta con arreglos | orden de capas al revés y el pitfall de `enable` falso (medido); Quick Start vacío; overrides con la trampa de `"size"` |
| 7 | `arcgis-coding-components` | aporta con arreglos | antes era relleno con API inventada (`arcgisChange`, `sqlEditor.layer`); ahora perfil + diagnósticos medidos; SQL/code editor son `@internal` |
| 8 | `arcgis-coordinates-projection` | aporta con arreglos | datum medido (492 m reetiquetando Bogotá 1975, 27 transformaciones a 22 m), mezcla de SR da `false` en silencio, 9377 en vez de 3116 |
| 9 | `arcgis-core-maps` | aporta con arreglos | el Inicio Rápido lanzaba error (`detail` es `null` en `arcgisViewReadyChange`); sin key o sin alto la vista nunca queda lista |
| 10 | `arcgis-core-utilities` | aporta con arreglos | `when` no es de una vez, `watch` agrupa asíncrono (3 cambios → 1 llamada), un getter que lanza hace lanzar a `watch()`, `debounce` corre 2 de 3 |
| 11 | `arcgis-custom-rendering` | aporta con arreglos | el ejemplo dejaba la escena en negro; externalRenderers no existe; sí hay WebGL 2D |
| 12 | `arcgis-editing` | aporta con arreglos | dos pitfalls falsos (SR y refresh); los errores no rechazan la promesa |
| 13 | `arcgis-embeddable-maps` | aporta con arreglos | el script 5.x no registra el elemento; hide-* no existen |
| 14 | `arcgis-feature-effects` | aporta con arreglos | pitfall falso (sin filtro); faltaban límites 3D/heatmap y layerView.filter |
| 15 | `arcgis-geometry-operations` | aporta con arreglos | el Inicio Rápido lanzaba con lon/lat; recomendaba geometryEngine (deprecado) |
| 16 | `arcgis-imagery` | aporta con arreglos | la función NDVI que enseñaba devuelve 0–200 (101), no −1..1; pitfall falso del tile layer |
| 17 | `arcgis-interaction` | aporta con arreglos | hitTest tipado; en capas de servicio el hit trae solo objectid sin outFields; 2 pitfalls falsos (suelo 3D, create apilado) |
| 18 | `arcgis-knowledge-graphs` | aporta con arreglos (parcial) | sin grafo accesible (token): geometría en properties, no e.geometry; fetch sin sesión queda pendiente, no 403; ejemplos que no compilaban; streaming + bindParameters |
| 19 | `arcgis-layers` | aporta con arreglos | reemplazar createQuery().where pierde el definitionExpression (29 vs 6); tope de 1000 silencioso (11 vs 51 capitales); outFields de capa no limitan queries |
| 20 | `arcgis-map-tools` | aporta con arreglos | snapping-controls NO se conecta al sketch (snappingOptions separados); 3D en 2D = unsupported en silencio; medición por análisis; pitfalls que eran comentarios |
| 21 | `arcgis-performance` | aporta con arreglos | import() solo ahorra 24 KB de 1494 (el SDK ya se divide); el import raíz no resuelve; 20 vistas sin destroy pierden contexto; destroy() se lleva el mapa compartido |
| 22 | `arcgis-popup-templates` | aporta con arreglos | 3 pitfalls falsos; los reales: outFields en funciones, zona horaria, separadores |
| 23 | `arcgis-portal-content` | aporta con arreglos | su paginación duplicaba (start -1 reinicia); sortField sin sortOrder = lo más viejo |
| 24 | `arcgis-rest-services` | aporta con arreglos | sin key no hay 401: diálogo y promesa colgada; raíz del servicio = 0 features |
| 25 | `arcgis-scene-environment` | aporta con arreglos | cameraTrackingEnabled mueve la fecha al navegar; clima no disponible en local/altura |
| 26 | `arcgis-smart-mapping` | aporta con arreglos | intervalos iguales meten 3553/3557 en una clase; type solo 10 categorías; 2 pitfalls falsos |
| 27 | `arcgis-spatial-analysis` | aporta con arreglos | su ejemplo fallaba (número para GPLinearUnit); job fallido rechaza con JobInfo; suma en cliente 54M de 165M |
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
- Bloque de CDN sin URL real → un solo `<script type="module" src="https://js.arcgis.com/5.1/">`, que ya trae charts (corregido en la validación 7: la primera versión de este arreglo usaba una etiqueta clásica, que no registra nada). Ahora también enseña
  `syncViewSelection` + `chart.view` (5.1), el detalle real de `arcgisSelectionComplete`
  (`{ selectionData, model }`), `chartIndex` para charts guardados, los renombres de 5.1 y que desde
  5.1 se aceptan capas de imágenes.
- El pitfall "serie de tiempo sobre campo string" no tenía síntoma comprobado. Ejecutado: el modelo
  acepta un string como `xAxisField` sin quejarse, así que la comprobación quedó en el ejemplo
  (`layer.getField(...).type === "date"`) y el Top-3 lo ocupa lo de Calcite, que sí rompe en silencio.

**¿Aporta?** Ahora sí y mucho: un agente sin la skill tiende a inventar un objeto de configuración
(es lo que hizo la propia skill), y no puede adivinar ni la ruta sin `.js` ni el choque con Calcite
5.2. Antes del arreglo la skill era peor que nada: enseñaba con seguridad un código que nunca dibuja.

### 6. `arcgis-cim-symbols` — aporta con arreglos

**¿Corre en 5.1?** El snippet y los 34 bloques compilan contra 5.1.27. Quince comprobaciones en
Chromium (`tests/runtime/casos/arcgis-cim-symbols.ts`): pintan cada símbolo con
`symbolUtils.renderPreviewHTML` y cuentan píxeles, y tres van en un MapView con `takeScreenshot`.

**Lo que estaba mal (y ya se arregló):**

- **El Inicio Rápido no dibujaba nada**: `symbolLayers: []` pinta 0 px. Ahora es el cuadrado rojo
  del ejemplo 1, que pinta 27×27 px.
- **Uno de los tres pitfalls principales era falso.** Decía que una capa sin `enable: true` "no se
  dibuja". Medido en la vista previa y en el mapa: sin `enable` dibuja igual (1680 px); solo
  `enable: false` oculta la capa (0 px). Pasó a un pitfall extendido para desmentirlo.
- **El orden de capas estaba al revés**: decía que las últimas se dibujan encima. Medido: con rojo
  en `[0]` y azul en `[1]` el centro queda rojo, o sea que `[0]` va encima. Con el orden que
  enseñaba, el relleno tapa la mitad de su propio contorno.
- **"Geometría fuera del frame → recortada o invisible" era falso**: el frame no recorta. El
  marcador crece de 27 a 120 px.
- **"Los tamaños son relativos al frame" estaba a medias**: `size` va en puntos (20 → 27 px,
  40 → 54 px).
- **Mencionaba `primitiveOverrides` sin enseñar cómo se usan.** Ahora hay un ejemplo medido en un
  MapView (s=8 → 132 px, s=40 → 2970 px) y una trampa real que no salía: `propertyName: "size"` en
  minúscula se ignora sin aviso.
- Faltaban `cimSymbolUtils`, la vista previa para depurar, y lo nuevo de 5.1 (`MoveAlongLine`,
  `AtMeasuredUnits`); en 5.1.27 el tipo `CIMSymbolAnimation` aún no incluye `MoveAlongLine`.
- Se comprobó y es cierto: el alfa 0–255 (alfa 1 pinta a 1/255), el envoltorio `CIMSymbolReference`
  (sin él la vista previa lanza un error críptico) y el símbolo compartido entre renderers (es el
  mismo objeto).

**¿Aporta?** Sí, después del arreglo. Un agente sin la skill escribe CIM JSON plausible y se
equivoca justo en lo que no da error: el orden de capas, los puntos y los píxeles, el alfa, la
mayúscula del override. Antes, dos de sus cinco "reglas" eran falsas y una tercera enseñaba el orden
al revés: hacía daño en lo que más se copia.

### 7. `arcgis-coding-components` — aporta con arreglos

**¿Corre en 5.1?** Ahora sí: el snippet y los 32 bloques compilan contra 5.1.27, y siete
comprobaciones en Chromium (`tests/runtime/casos/arcgis-coding-components.ts`) montan
`arcgis-arcade-editor` y leen los diagnósticos que emite. Antes la skill no traía código que
corriera: el Inicio Rápido, los pitfalls y el árbol eran comentarios.

**Lo que estaba mal (y ya se arregló):**

- **API inventada en las referencias.**
  - El evento `arcgisChange` no existe; los reales son `arcgisScriptChange` y
    `arcgisDiagnosticsChange`.
  - `sqlEditor.layer` no existe.
  - El perfil `{ variables: [{ name: "$feature", type: "feature" }] }` no le da campos al editor.
  - Para "validar antes de aplicar" se apoyaba en una validez que no se expone: no hay `isValid`.
- **Ofrecía como opciones componentes que no son API pública.** `arcgis-sql-expression-editor`,
  `arcgis-sql-layer-editor`, `arcgis-code-editor` y `arcgis-code-viewer` están marcados `@internal`
  en las declaraciones de 5.1.27. Ahora el árbol lo dice y propone qué usar en su lugar.
- **Los pitfalls eran plausibles pero sin síntoma.** Ahora están medidos:
  - Sin perfil, hasta un `$feature.state_name` correcto sale "'$feature' is not defined", el
    mismo mensaje que un campo inexistente.
  - Con perfil, el campo inexistente trae la lista de los campos reales.
  - Con el perfil `labeling`, `FeatureSetByName` y `$map` salen "not defined": el perfil de
    edición tiene que ser el mismo del lugar donde se ejecuta.
- **Faltaba lo de 5.1:**
  - El asistente de Arcade (beta) viene encendido por defecto; se apaga con `disableAssistant`.
  - `arcadeAssistant` queda deprecado.
  - `enableDebugger`.
  - Los tipos `I*` quedan deprecados.
- **El script de la CDN es un módulo** (hallazgo que aplica a todas las skills). Ejecutado con
  `tests/runtime/cdn.mjs`:
  - `<script type="module" src="https://js.arcgis.com/5.1/">` registra map, charts, coding, ai y
    Calcite.
  - Con `<script>` clásico falla con "Cannot use import statement outside a module" y no registra
    nada.
  - La skill 5 (charts), ya registrada, usaba la etiqueta clásica más un segundo script
    innecesario; se corrigió en este mismo commit.

**¿Aporta?** Sí, después de reescribirla. Sin ella, un agente monta el editor sin perfil o con el
equivocado, y escucha un evento que no existe (es lo que hacía la skill). Lo que no se adivina es
qué componentes son internos y que el asistente de IA viene encendido. Antes era relleno: el
contenido no tenía código y lo poco concreto era inventado.

### 8. `arcgis-coordinates-projection` — aporta con arreglos

**¿Corre en 5.1?** Los 2 snippets y los 34 bloques compilan contra 5.1.27. Catorce comprobaciones
en Chromium (`tests/runtime/casos/arcgis-coordinates-projection.ts`), todas con puntos reales en
Colombia: la Plaza de Bolívar en 4326, 3116, 9377 y Bogotá 1975.

**Lo que estaba bien:** que hay que cargar `projectOperator` antes de `execute`. Era cierto, y el
error que da es `p is not a function`, que no menciona "load"; ahora la skill trae ese mensaje.

**Lo que estaba mal o faltaba (y ya se arregló):**

- **El pitfall de mezclar sistemas usaba `geometryEngine` (deprecado) y no decía el síntoma.**
  Medido con `intersectsOperator`: el mismo polígono en 4326 y en 3857 devuelve `false`, sin error.
- **El datum era una línea genérica.** Medido:
  - Tomar coordenadas en Bogotá 1975 (4218) como si fueran WGS84 las corre 492 m.
  - `execute` aplica sola una transformación por defecto: el resultado sin opciones es igual al de
    `getTransformation`.
  - Hay 27 transformaciones candidatas, y en Bogotá difieren hasta 22 m.
  - Ahora se enseñan `geographicTransformationUtils`, `getTransformations` con área de interés y el
    límite de 5.1: solo transformaciones por ecuación, no por grilla.
- **El ejemplo de "cuadrícula nacional" usaba la 3116 (Bogota zone).** Desde las resoluciones 471
  y 529 de 2020 del IGAC, el sistema plano oficial es MAGNA-SIRGAS / Origen-Nacional (EPSG 9377).
  Valores medidos en los dos.
- **`webMercatorUtils` hace cosas sin avisar:**
  - `canProject(4686, 3857)` es `false`, pero `geographicToWebMercator` convierte igual.
  - La latitud 90 da y = 103 676 511, fuera del rango ±20 037 508; no recorta en los polos.
  - Con los ejes al revés (`x` = lat), Bogotá cae en aguas antárticas sin error.
- **`executeMany` con una geometría en otro sistema la devuelve `null`**, sin error.
- **Z:** pasa sin cambio en una proyección horizontal (medido). El pitfall "se pierden z/m" no se
  reproducía; ahora dice lo cierto: un cambio de sistema vertical no se soporta y lanza error.

**¿Aporta?** Sí. El Inicio Rápido ya era correcto para 5.x. Lo que un agente no sabe es lo que
falla en silencio: `false` en vez de un error, 492 m de corrimiento por reetiquetar, `null` en
`executeMany`, y que 3116 ya no es el sistema oficial de Colombia. Para un público de LATAM es de las
skills que más rinden.

### 9. `arcgis-core-maps` — aporta con arreglos

**¿Corre en 5.1?** Compila (3 snippets, 31 bloques), pero **el Inicio Rápido se caía**. Nueve
comprobaciones en Chromium (`tests/runtime/casos/arcgis-core-maps.ts`): `arcgis-map` y `MapView`
reales.

**Lo que estaba mal (y ya se arregló):**

- **El patrón central lanzaba error.** El Inicio Rápido, el Pitfall 1 "correcto", el ejemplo 3, el
  snippet y la referencia leían la vista de `(e as CustomEvent).detail.view`. En 5.1.27 el
  `detail` de `arcgisViewReadyChange` es `null` (los tipos lo dicen: `TargetedEvent<this, void>`).
  Ejecutado: "Cannot read properties of null (reading 'view')". El cast es lo que lo escondía de
  TypeScript. Ahora se usa `await el.viewOnReady()` / `el.view`.
- **"`el.view` es undefined antes de estar lista" era falso.** Existe desde antes de montar el
  componente, con `ready === false`; preguntar si está definida no sirve.
- **Faltaba lo grave de la API key.** No es solo "lienzo gris": el estilo responde 401, el basemap
  se queda en `loading` y `view.when()` no se resuelve en 30 s, así que todo lo que espera a la
  vista se cuelga. Con `osm` carga sin key.
- **Contenedor de alto 0:** además de verse en blanco, la vista nunca queda lista (`when()` sigue
  pendiente a los 10 s).
- **Centro con ejes al revés:** el diagnóstico decía "frente a África". Medido: `[4.6, -74.08]`
  cae en latitud -74, la Antártida; frente a África es `[0, 0]`.
- **`camera` en un MapView:** los tipos no lo admiten (no compila tipado). Sin tipos se ignora, como
  decía la skill.

**El mismo error está en otra skill:** `arcgis-starter-app` usa `detail.view` en
`scripts/snippet-main.ts`, `scripts/scaffold.sh` y `references/examples.md`. Se corrige cuando le toque
(validación 28).

**¿Aporta?** Sí, después del arreglo. El árbol (componentes frente a Core API), `[lon, lat]` y
`view.destroy()` en una SPA eran correctos y útiles. Pero el patrón que un agente copia primero
rompía el arranque de cualquier app con `<arcgis-map>`. Era la skill más leída enseñando un error.

### 10. `arcgis-core-utilities` — aporta con arreglos

**¿Corre en 5.1?** Sí: los 3 snippets y los 33 bloques compilan contra 5.1.27, y el código que
enseña funciona. Quince comprobaciones en Chromium (`tests/runtime/casos/arcgis-core-utilities.ts`).
Una de ellas falla a propósito: reproduce el getter que lanza error.

**Lo que estaba mal (y ya se arregló):**

- **El árbol de decisión decía que `when` es "de una sola vez".** Medido: corre cada vez que el valor
  vuelve a ser verdadero (3 de 3). El comentario del Inicio Rápido ("re-run whenever") sí era
  correcto: la skill se contradecía.
- **No decía que los callbacks de `watch` son asíncronos y agrupados.** Tres asignaciones seguidas
  dan 0 llamadas en el momento y 1 después, con el último valor. Con `sync: true` son 3. Es el
  origen de muchos "mi watch no se dispara". Ahora también aparecen `once` y `equals`.
- **"Un getter que lanza detiene el watch en silencio" era falso.** El getter corre de inmediato y
  el propio `watch()` lanza "Cannot read properties of null", así que el código que sigue no corre.
- **`debounce` no "colapsa" a una sola llamada.** Medido: de tres llamadas seguidas corren la
  primera y la tercera; la segunda se rechaza con un error de abort.
- **Asignar por índice en una Collection** (`layers[0] = x`): la skill decía "no notifica". Medido:
  ni siquiera asigna; la capa vieja sigue ahí y no hay evento. Ahora también dice que los eventos
  `change` se agrupan por tick.
- **Se comprobó y es cierto:**
  - `isAbortError` en el debounce y en `esriRequest` con `signal`.
  - `filter`/`map` devuelven una `Collection`.
  - `initial: true`.
  - El debounce recreado en cada llamada no agrupa nada (3 → 3).
  - `layer.watch()` existe, pero con aviso de deprecación (desde 4.32).

**¿Aporta?** Sí, con matices. La parte básica (`watch` + `remove`) la sabe cualquier modelo. Lo que
aporta es lo que no da error: el agrupado asíncrono, `when` sin `once`, el debounce que deja correr
dos llamadas y la Collection sin índice. Antes enseñaba tres de esas cuatro de forma equivocada.

### 11. `arcgis-custom-rendering` — aporta con arreglos

**¿Corre en 5.1?** Antes no. El único ejemplo con código real (`examples.md`, ejemplo 2) pasaba
`consumes: [{ name: "composite-color" }]`. Medido en Chromium con 5.1.27: el constructor lo acepta,
pero después **cada cuadro** lanza "Cannot read properties of undefined (reading 'includes')",
`render` nunca se llama y **toda la escena sale negra** (`rgb(0,0,0)`), no solo el paso custom.
El ejemplo 1 (`class TintNode extends RenderNode`) lanza en el constructor ("reading 'stage'").
Ocho comprobaciones en `tests/runtime/casos/arcgis-custom-rendering.ts`.

**Lo que estaba mal (y ya se arregló):**

- **Forma de `consumes` y de la subclase.** Ahora es `RenderNode.createSubclass({ consumes:
  { required: [...] }, produces: "composite-color", render })`. Medido: el cuadrado rojo de prueba
  aparece en `takeScreenshot()`; `render` corre al redibujar y más con `requestRender()`; después
  de `destroy()` ya no corre.
- **`externalRenderers` ya no existe en 5.x.** La skill decía que estaba "superada", como si todavía
  sirviera. El módulo no está en el paquete 5.1.27, así que el import falla. Es justo el error 4.x
  que un agente cometería.
- **"En 2D usa un GraphicsLayer o un canvas" era falso.** `BaseLayerViewGL2D` existe en 5.1 y no está
  deprecado. Medido: 91 llamadas a `render` en 1,5 s, con `WebGL2RenderingContext`. Se agregó como
  rama del árbol y como ejemplo.
- **Era casi todo relleno.** Los tres pitfalls tenían el bloque "correcto" vacío ("Convert to the
  view's render coordinate system"). Ahora llevan código y valores medidos:
  - `toRenderCoordinates`: Bogotá → ECEF, a 6.380.737 m del centro de la Tierra. Pasado crudo queda
    a 2,6 km del centro.
  - El precio en precisión de float32: un paso de ~0,5 m.
  - La vista no redibuja sola cuando está quieta.
  - Una entrada requerida que falta (`highlights`) hace que se salte el nodo.
- **Lo que no se reprodujo:** "dejar el estado GL sucio rompe el render del SDK". Con `SCISSOR_TEST`
  encendido y una caja de 1×1, la escena siguió pintándose normal. Queda como precaución
  (`resetWebGLState()`), no como hecho medido.
- **Sin probar:** el decorador `@subclass`.

**¿Aporta?** Ahora sí, para quien ya sabe WebGL. Sin la skill, un agente escribe `externalRenderers`
(4.x). Con la versión anterior, copiaba un `consumes` que deja la escena en negro. El valor real son
la forma exacta de `consumes`/`produces`, `createSubclass` y la rama 2D. No enseña a escribir
shaders, y no lo pretende.

### 12. `arcgis-editing` — aporta con arreglos

**¿Corre en 5.1?** Sí. El Inicio Rápido, los snippets y los 32 bloques compilan contra 5.1.27, y el
código corre. Hice doce comprobaciones en Chromium (`tests/runtime/casos/arcgis-editing.ts`) sobre
una capa en memoria del navegador, así que no se escribió en ningún servicio, más la lectura de las
capacidades de un MapServer público de solo lectura. El `arcgis-editor` con `reference-element`
monta y queda `ready`.

**Lo que estaba mal (y ya se arregló):**

- **Pitfall extendido 1, falso:** decía que una geometría en otra referencia espacial "queda mal
  ubicada o se rechaza". Medido: un punto en 3857 se guardó proyectado en 4326 (`-74.0806, 4.6000`).
- **Pitfall extendido 2, falso:** decía que hay que llamar `refresh()` después de `applyEdits`.
  Medido: el layer view pasó de 2 a 3 features sin `refresh()` y la capa emitió un evento `edits`.
- **En su lugar entran dos fallos silenciosos medidos:**
  - Borrar un `objectId` que no existe devuelve `ok(99)`.
  - Un atributo que no es un campo (`ESTADO`) se descarta y el update igual devuelve `ok`.
- **Qué rechaza y qué no:** una edición mala nunca rechaza la promesa; vuelve como `error` en su
  resultado. Solo rechazan los problemas de la capa (`editingEnabled: false`, z en una capa sin z).
  Un lote con un update válido y uno inválido aplica el válido, así que no es transaccional. Se
  documentó `rollbackOnFailureEnabled`, sin medirlo.
- **Pitfall 3:** ahora usa `layer.objectIdField` en vez de un `OBJECTID` fijo.

**Se comprobó y es cierto:**

- Los tres pitfalls principales. El error aparece en el resultado: "Identifier fields: OBJECTID
  missing" y "Feature with object id 9999 missing".
- Las capacidades en `false` de un servicio de solo lectura.
- El `Editor` widget está deprecado desde 5.0.

**¿Aporta?** Sí, con matices. El `applyEdits` básico lo escribe cualquier modelo. Lo que aporta es
saber que una edición mala no lanza error, los éxitos que mienten (borrar un id que no existe,
campos desconocidos) y que no hace falta `refresh()`. Antes enseñaba dos de esos puntos al revés.
Advertencia honesta: todo se midió sobre una capa en memoria, no contra un servicio de ArcGIS
Server, que puede comportarse distinto (por ejemplo, con el delete de un id que no existe).

### 13. `arcgis-embeddable-maps` — aporta con arreglos

**¿Corre en 5.1?** Antes no, en nada. La skill enseñaba a cargar el script unificado
`https://js.arcgis.com/5.0/` y poner `<arcgis-embedded-map>`. Medido en Chromium
(`tests/runtime/embebido.mjs`): ni el script de 5.0 ni el de 5.1 registran `arcgis-embedded-map`.
`customElements.get` devuelve `undefined` y el elemento queda vacío, sin ningún error en la consola.
Los embeddable components tienen su propio script, el que documenta Esri:
`https://js.arcgis.com/5.1/embeddable-components/`. Con ese, el WebMap público de la documentación
carga (`webMap.loadStatus === "loaded"`, 2 capas). La tipografía de los bloques no lo detectaba
porque es HTML.

**Lo que estaba mal (y ya se arregló):**

- **El script.** Ahora es `js.arcgis.com/5.1/embeddable-components/` en el Inicio Rápido, los
  ejemplos, el snippet y el AGENTS. Se agregó el pitfall de adivinar la ruta versionada de 4.x: la
  medí, y `/embeddable-components/5.1/...esm.js` da 404 (el patrón llegó hasta 4.33).
- **Los atributos `hide-legend` / `hide-bookmarks` / `hide-zoom` no existen.** No están en
  `observedAttributes`. Las herramientas se encienden con booleanos `*-enabled` (`legend-enabled`,
  `bookmarks-enabled`, `scroll-enabled`…), todos en `false` por defecto. La skill decía que la leyenda
  y los bookmarks venían encendidos. Ahora está la lista completa, sacada de la referencia de Esri.
- **`scroll-enabled` en `false`:** la rueda del mouse mueve la página, no el mapa. Es un pitfall
  real de embeds; lo agregué.
- **No se reprodujo:**
  - "contenedor de alto cero": sin estilo, el elemento mide 400 px.
  - "conflicto por cargar dos scripts del SDK": con el del SDK y el de embeddable juntos, cargan los
    dos elementos y el WebMap.
  
  Los reemplacé.
- **Lo que no se midió:** un item privado (no lo había).
- **Se comprobó y es cierto:** no hay paquete npm (`npm view` da 404).

**¿Aporta?** Ahora sí. Esta es justo la pieza que un agente se inventa: el script de la página del
SDK, o la ruta 4.x con el número cambiado, y los nombres de los atributos. La versión anterior
enseñaba las dos cosas mal y el embed salía en blanco sin ningún aviso. Es una skill corta, pero cada
línea que tiene ahora está medida o viene de la referencia de Esri.

### 14. `arcgis-feature-effects` — aporta con arreglos

**¿Corre en 5.1?** Sí: los 33 bloques y los 2 snippets compilan contra 5.1.27. Probé el efecto real
midiendo píxeles en Chromium (`tests/runtime/casos/arcgis-feature-effects.ts`) con dos cuadrados
rojos sobre fondo blanco: `grayscale(100%)` → `rgb(54,54,54)`; `blur(8px)` los esparce unos 10 px; el
ejemplo 2 (incluido gris, excluido al 40 %) da `rgb(54,54,54)` y `rgb(255,153,153)`.

**Lo que estaba mal (y ya se arregló):**

- **Pitfall extendido 2, falso:** decía que "un featureEffect sin filtro no resalta nada". Medido: sin
  filtro todos cuentan como incluidos, así que la capa entera toma el `includedEffect` y el
  `excludedEffect` nunca se aplica.
- **El "ocultar de verdad" mandaba a `definitionExpression`, que hace una petición nueva al servidor.**
  Agregué `layerView.filter`, en el cliente. Medido: el feature sale del hitTest y el layer view cuenta
  1 de 2.
- **Faltaban límites que la documentación de 5.1 sí trae:** los efectos no se aplican en un SceneView
  (medido: asignarlo no lanza y no se ve nada) ni con heatmap. También faltaban los efectos por escala
  (`[{ scale, value }]`) y `excludedLabelsVisible`. Esta última viene en `false` por defecto, así que
  las etiquetas de los excluidos desaparecen, y puede sorprender.
- **Pitfall 1, precisado:** `blur(2)` no lanza. La consola dice `Invalid Effect` y la capa se pinta
  sin ningún efecto.

**Se comprobó y es cierto:**

- `opacity(0%)` deja el feature invisible, pero `hitTest` lo devuelve y el layer view lo sigue
  contando (pitfall 2).
- La forma con comas de `drop-shadow` es la de la documentación.

**Lo que no cuadró con la documentación:** según ella, el efecto no funciona con clustering. Con un
cluster de 2 puntos que no llegó a agrupar, el gris sí se aplicó. No lo pongo como hecho, ni en un
sentido ni en el otro.

**Sin medir:** el costo de bloom en una capa densa (pitfall 3).

**¿Aporta?** Sí, con matices. La sintaxis de los efectos es la de CSS y cualquier modelo la adivina.
Lo que aporta es lo que no da error: la unidad faltante que solo avisa por consola, `opacity(0%)` que
sigue respondiendo a los clics, el featureEffect sin filtro y los efectos que no se ven en 3D.

### 15. `arcgis-geometry-operations` — aporta con arreglos

**¿Corre en 5.1?** El Inicio Rápido, no. Hacía `bufferOperator.execute(point, 1000, { unit: "meters" })`.
Con un punto en lon/lat, que es la entrada más común (`new Point({ longitude, latitude })`), medido
en Chromium con 5.1.27 **lanza** "Unable to convert from a linear unit to an angular unit". La skill
decía que "distorsiona". Su arreglo (`geodesicBufferOperator`) también lanzaba, porque le faltaba
`load()`: "m is not a function". Diez comprobaciones en
`tests/runtime/casos/arcgis-geometry-operations.ts`.

**Lo que estaba mal (y ya se arregló):**

- **`geometryEngine` era el respaldo recomendado** (árbol, AGENTS, snippet, dos ejemplos), pero está
  deprecado desde 4.32. El verificador de tipos ya lo marcaba en dos bloques. Todavía funciona en
  5.1.27 y no avisa nada en tiempo de ejecución, así que nadie se entera. Ahora la skill usa solo
  operadores y trae la tabla de migración método por método. "Si no hay operador, usa geometryEngine"
  era falso: hay operador para todos los casos que la skill mostraba.
- **"Operators API new in 5.0" era falso:** son de 4.31.
- **El error planar, medido:** un buffer planar de 1000 m en Web Mercator cubre 3,099 km² en Bogotá
  (1,4 % menos) y 0,787 km² a 60°N (75 % menos), contra 3,142 km² de un círculo de 1 km. El
  geodésico da 3,138 km².
- **Pitfall 2 (geometría auto-intersecada):** "la intersección da mal" no se reprodujo (dio 50 en los
  dos casos). Lo que sí falla en silencio es el área: el moño crudo mide **0**. Simplificado, mide 50.
- **Pitfall 3:** "usa `executeMany` para no bloquear la UI" era falso. Los dos son síncronos: 5.000
  buffers tardaron 150 ms con loop, 113 ms con `executeMany` y 2,9 s con `union: true`. La salida es un
  Worker.
- **Agregado:** la lista de los 9 operadores que piden `load()` (sacada de los tipos), y que
  referencias espaciales distintas dan `null` sin lanzar.

**¿Aporta?** Ahora sí, y mucho. Un agente que escribe de memoria usa `geometryEngine` (lo que salía
en la documentación de 4.x) o el `bufferOperator` planar con lon/lat. Lo primero está deprecado y lo
segundo lanza error. La versión anterior enseñaba las dos cosas.

### 16. `arcgis-imagery` — aporta con arreglos

**¿Corre en 5.1?** Sí: compila y la capa carga. El problema es lo que hace. Medí con `identify` en
Chromium (`tests/runtime/casos/arcgis-imagery.ts`) sobre el servicio público Toronto de
sampleserver6 (4 bandas: Azul, Verde, Rojo, NIR). El servicio Landsat público responde la metadata,
pero `identify` y las consultas espaciales tardaron más de 60 s, incluso por REST directo, así que
lo usé solo para el orden de bandas.

**Lo que estaba mal (y ya se arregló):**

- **La función ráster que enseñaba (`functionName: "NDVI"`) no devuelve NDVI entre -1 y 1.** Medido:
  **101** sobre un parque y **74** sobre agua, la salida entera escalada de 0 a 200. A mano, con los
  píxeles crudos, da 0,015 y -0,263. Un umbral como "NDVI > 0,3" nunca se cumple, y nada avisa.
  `rasterFunctionUtils.bandArithmeticNDVI` (desde 4.28) devuelve exactamente 0,0148 y -0,263, así que
  ahora es el patrón por defecto.
- **Los ids de banda van desde 0.** Lo confirmé con resultados (verde en vez de rojo da 85, no 101).
  Para Landsat 8, rojo/NIR son 3/4, no los números de banda del sensor (4/5). La skill no lo decía.
  Un id fuera de rango, o sin argumentos, dio el resultado por defecto sin error. Por eso el pitfall
  "sin argumentos da basura" no se reprodujo en este servicio, y se reescribió.
- **Pitfall 1, falso:** "ImageryTileLayer ignora las funciones ráster". En 5.1, `ImageryTileLayer`
  tiene `rasterFunction` y la procesa en el cliente (también con COG y CRF).
- **`renderingRule` (4.x) estaba en la API de la skill y ya no está en los tipos de 5.1.** Medido sin
  tipos: no llena `rasterFunction`.
- **Agregado:** `queryRasters` (medido: devuelve las escenas del catálogo), `getSamples` y
  `fetchPixels`.
- **De paso:** el ejemplo de la documentación de Esri usa `colorRampName: "NDVI3"`, pero el tipo pide
  `"ndvi3"`. El verificador lo atrapó.

**¿Aporta?** Sí, y la versión anterior hacía daño. Un agente que sigue la doc de 4.x escribe
`renderingRule` o la función `"NDVI"` y usa el valor como NDVI real: un error de escala que no lanza
nada. Ahora la skill enseña la función que da el valor real, con las bandas contadas como las cuenta
el SDK.

### 17. `arcgis-interaction` — aporta con arreglos

**¿Corre en 5.1?** El código del inicio rápido corría, pero los bloques de errores comunes y los extendidos usaban
`results[0].graphic`, que en 5.x no compila: el resultado de `hitTest` es una unión tipada (`graphic`, `media`,
`route`, `raster`, `layer`) y hay que comprobar `type === "graphic"`. Medí 12 casos en Chromium
(`tests/runtime/casos/arcgis-interaction.ts`) con clics sintéticos sobre la superficie de la vista, una capa
cliente y el servicio público de estados de EE. UU.

**Lo que estaba mal (y ya se arregló):**

- **El hueco más caro: los atributos.** En una `FeatureLayer` de servicio, el graphic del hit trae solo
  `objectid` (medido: 1 campo). Con `outFields: ["*"]`, 9 campos y `state_name = "Kansas"`. Sin error, solo
  `undefined`. La skill no lo decía. Ahora es el pitfall 1 y está en el inicio rápido.
- **Falso: "en 3D el hitTest devuelve impactos del terreno".** El suelo no está en `results`: un clic en terreno
  vacío da `results: []` y el punto en `response.ground.mapPoint`.
- **Falso: "llamar `create()` dos veces apila operaciones".** El segundo `create()` cancela el primero
  (`polygon:cancel`) y deja activa la nueva herramienta.
- **Matizado: "sin `include` agarras una etiqueta".** Un clic sobre la etiqueta devuelve el graphic del propio
  feature. Lo real es que, sin filtro, el primer resultado es la capa de arriba (medido: la GraphicsLayer encima
  de la FeatureLayer). No medí un mapa base vectorial porque necesita API key.
- **Relleno:** el pitfall 4 recomendaba `await doExpensiveWorkOffThread()`, pero un `async` no saca nada del
  hilo. Lo reemplacé por `promiseUtils.debounce` sobre `pointer-move`. Medido: el SDK entrega los 30 de 30
  movimientos sin limitar; con debounce corrieron 2 hitTests y 28 se abortaron con `AbortError`, que hay que
  tragarse.
- **Datos que faltaban:** `create()` devuelve una Promise en 5.x. Un punto dispara `start` y `complete` (la doc
  dice que solo `complete`). Un polígono de 3 vértices disparó 4 `active`. `destroy()` deja los gráficos
  dibujados en la capa. `arcgis-sketch` crea y agrega su propia capa, y viene en `creationMode: "continuous"`.
  En la tabla de la API quedaron los cinco tipos de hit y `exclude`.

**¿Aporta?** Sí. Un agente sin ella escribe `results[0].graphic` (4.x, no compila) o, peor, lee
`graphic.attributes.nombre` de una capa de servicio y recibe `undefined` sin ningún error. Las dos cosas las
corrige ahora la skill, con la medida al lado.

### 18. `arcgis-knowledge-graphs` — aporta con arreglos (parcial)

**¿Corre en 5.1?** Dos de los tres ejemplos no compilaban: `graph.id` no existe en `KnowledgeGraph`, y
`executeQuery(graph, { openCypherQuery })` falla el tipo porque en 5.1 el parámetro es la clase `GraphQuery`.
Paradójicamente, el ejemplo de la documentación de Esri usa el mismo objeto plano.

**Validación parcial, y por qué.** Todos los grafos públicos de ejemplo (sampleserver7) responden 499 "Token
Required", y la validación no inicia sesión. Así que **no corrí ninguna consulta contra un grafo vivo**. Medí lo que se
puede medir sin servidor (`tests/runtime/casos/arcgis-knowledge-graphs.ts`) y el resto lo comprobé contra los tipos
y la documentación de 5.1. En la skill quedó marcado qué es cada cosa.

**Lo que estaba mal (y ya se arregló):**

- **El pitfall 2 enseñaba `e.geometry`, que no existe.** Medido: en un `Entity`, `"geometry" in e` es `false`;
  la geometría es una propiedad más (`e.properties.shape`) y su nombre sale del modelo de datos (la propiedad con
  `fieldType` `"esriFieldTypeGeometry"`). Con el código viejo, cada graphic sale vacío y sin error.
- **Falso: "sin auth, 403".** Medido sobre el grafo protegido: `fetchKnowledgeGraph` no rechaza. A los 15 s sigue
  pendiente, con el diálogo de inicio de sesión del SDK en el DOM, y no acepta `signal`.
  `KnowledgeGraphLayer.load({ signal })` sí aborta (`AbortError`).
- **Relleno:** tres pitfalls eran solo comentarios sin código ("usa streaming/paginación", "no mezcles ids entre
  servicios", "autentícate"), y el inicio rápido se quedaba en el `fetch`.
- **Lo que faltaba y ahora enseña:** `executeQueryStreaming` como camino por defecto (según la doc, trae todas
  las coincidencias aunque pasen de `maxRecordCount`; `executeQuery` se corta ahí), cómo leer `resultRowsStream`,
  que las filas son arrays en el orden del `RETURN`, y `bindParameters` en vez de concatenar texto. Medido: un
  `Polygon` se conserva como geometría para `ST_Intersects`. También `KnowledgeGraphLayer`, `LinkChartLayer`,
  `WebLinkChart` y `arcgis-link-chart` (medido: registrado en 5.1).

**¿Aporta?** Sí, con la salvedad de que la parte del servidor no está medida. La versión anterior era casi toda
relleno y su único código de manejo de resultados (`e.geometry`) fallaba en silencio. La nueva le ahorra a un
agente los errores que comete sin ella: el objeto plano que no compila, la geometría en el lugar equivocado y la
concatenación inyectable. Lo pendiente: correr la consulta contra un grafo con credenciales propias de Sebastián.

### 19. `arcgis-layers` — aporta con arreglos

**¿Corre en 5.1?** Sí: todo compilaba y corría. El problema es lo que enseñaba. Medí 15 casos en Chromium
(`tests/runtime/casos/arcgis-layers.ts`) contra el servicio público de ciudades de EE. UU. (3557 filas,
`maxRecordCount` 1000) y con CSV y GeoJSON en Blob.

**Lo que estaba mal (y ya se arregló):**

- **El hallazgo más serio, que la skill no tenía:** `definitionExpression` no se aplica a `queryFeatures`. Llega a
  la consulta solo porque `createQuery()` lo copia en `query.where`. Con la capa filtrada a Texas, reemplazar
  `q.where` contó **29** ciudades de todo el país; con `(${q.where}) AND ...`, las **6** correctas. Un objeto plano o
  `new Query()` también dieron 29. El mapa muestra Texas y la lista, el conteo y la exportación muestran el país.
- **Filtrar en el cliente no es solo lento, es incorrecto:** `queryFeatures()` sin filtro se cortó en 1000 de 3557
  filas (`exceededTransferLimit: true`, sin error). Filtrando después encontró 11 capitales; en el servidor, 51.
- **El inicio rápido usaba `outFields: ["*"]`, contra su propio pitfall 1.** Y el pitfall 1 tampoco era cierto como
  estaba: los `outFields` de la capa **no** limitan las consultas. `createQuery()` arranca con `["*"]` y devolvió los
  6 campos. Ahora se dice dónde actúa cada uno.
- **El pitfall 3 era vago ("returnGeometry varía").** Ahora es preciso: `createQuery()` trae `true`; `new Query()`
  trae `false` y `outFields: null` (medido: geometría `null` y solo el campo de visualización).
- **Pitfalls extendidos medidos:** `map.layers[0] = nueva` no lanza error y no cambia nada. Una URL rota deja
  `loadStatus: "failed"`, un error en la consola y `whenLayerView` pendiente a los 10 s. El CSV con nombres propios
  falla con "Unable to identify latitude and longitude fields"; con `lat`/`lon` los detecta solo. El pitfall
  "consultar antes de `load()`" era falso: `createQuery()` funciona sin `load()`. Lo cambié por el de `outFields`.

**¿Aporta?** Sí, y es de las que más. El error de `definitionExpression` y el tope silencioso de `maxRecordCount`
dan números equivocados sin ningún aviso. Es justo lo que un agente escribe sin pensarlo: `q.where = "..."` y
`queryFeatures()` sin revisar `exceededTransferLimit`.

### 20. `arcgis-map-tools` — aporta con arreglos

**¿Corre en 5.1?** Lo poco que tenía código sí: imports de componentes y HTML anidado. Pero la mitad de la skill
eran comentarios sin código ("configura las fuentes de snapping", "limpia la herramienta", "fija la unidad"). Medí
8 casos en Chromium con los componentes montados dentro de `arcgis-map`
(`tests/runtime/casos/arcgis-map-tools.ts`).

**Lo que estaba mal (y ya se arregló):**

- **Falso, y es el error que más cuesta: "los controles de snapping se conectan al sketch activo".** Medido: con
  `arcgis-sketch` y `arcgis-snapping-controls` en el mismo mapa, cada uno tiene **su propio** `snappingOptions`.
  Activar el snapping en los controles deja el del sketch en `enabled: false`: el usuario lo prende y no se ajusta
  nada. Se arregla con `controls.snappingOptions = sketch.snappingOptions`. Ahora es el pitfall 1 y está en el
  inicio rápido.
- **Pitfall de 3D en 2D, ahora preciso:** `arcgis-direct-line-measurement-3d` dentro de `arcgis-map` resuelve
  `start()`, queda en `state: "unsupported"` y solo avisa en la consola. `arcgis-measurement` acepta
  `activeTool = "direct-line"` en 2D sin mostrar ninguna herramienta.
- **Lo que faltaba:** los valores por defecto medidos. El snapping viene apagado, con `featureEnabled: true` pero 0
  `featureSources`, así que nunca se ajusta a otras capas; ahora enseña `FeatureSnappingLayerSource`. La unidad es el
  sistema `"metric"`, que cambia entre m y km. `arcgis-measurement` arranca sin herramienta. El sketch agrega una
  capa "Sketch Layer" visible en la lista de capas. También la medición por código con análisis: una línea de 0,05°
  a 4,6°N dio 5,5 km geodésicos, y un cuadrado de 0,01° dio 1,23 km² (los dos cuadran con el cálculo a mano).
- **De paso, para core-maps:** un `arcgis-map` sin basemap ni capas nunca resuelve `viewOnReady()`, y las
  herramientas no aparecen. Quedó como pitfall extendido.

**¿Aporta?** Sí, con arreglos. Se cruza con `arcgis-interaction` en el sketch, pero lo propio de esta skill (el
snapping compartido por referencia, la variante 2D/3D y la medición como análisis) no está en ninguna otra, y el
caso del snapping es exactamente el que un agente escribiría mal: poner los dos componentes juntos y darlo por
conectado.

### 21. `arcgis-performance` — aporta con arreglos

**¿Corre en 5.1?** El código que tenía corría, salvo los dos anti-patrones de import. Pero el consejo principal era
el más débil. Medí en Chromium (`tests/runtime/casos/arcgis-performance.ts`) y con builds de Vite
(`tests/bundle/medir.mjs`, que agregué al repo para reproducirlo).

**Lo que estaba mal (y ya se arregló):**

- **El inicio rápido vendía `import()` como la palanca del bundle.** Medido: un build de Map + MapView + FeatureLayer
  ya sale en **748 chunks**, con un chunk inicial de 1494 KB (430 KB gzip). Pasar `CSVLayer` y `KMLLayer` a `import()`
  ahorró **24 KB (6 KB gzip)**, un 1,6 %. El SDK ya se carga solo en diferido. Lo dejé como recurso para lo opcional,
  con el número, y no como solución.
- **Pitfall 1 imposible:** `import * from "@arcgis/core"` (y el barrel `"@arcgis/core/layers"` de los extendidos) no
  "infla el bundle": no resuelve (TS2307; el paquete no tiene módulo raíz ni índices). Rompe el build.
- **El que sí importa, ahora con números:** 20 MapViews sin `destroy()` (solo vaciando el contenedor) quedaron vivas.
  Chromium escribió "Too many active WebGL contexts" y 4 terminaron con `fatalError`. Con `destroy()`, 0.
- **Lo que faltaba, y es una trampa del mismo consejo:** `view.destroy()` **también destruye el mapa y sus capas**
  (medido: `map.destroyed` y `layer.destroyed` en `true`, 0 capas). En una SPA que comparte el mapa entre rutas, la
  receta vieja ("siempre `view.destroy()`") deja la siguiente vista vacía. La solución, medida: `view.map = null`
  antes.
- **Extendidos medidos:**
  - `watch(() => view.center)`: 92 disparos en un `goTo` de 1,5 s, contra 1 de `stationary`.
  - Con `minScale`, la capa queda `suspended` y no pide nada.
  - Alternar `visible`: 0 pedidos; quitar y recrear: 24.
  - `featureReduction` como objeto plano se convierte bien.

**¿Aporta?** Sí, con arreglos, y ahora apunta a lo que de verdad pesa: la fuga de contextos WebGL, la trampa de que
`destroy()` se lleva el mapa, y los `watch` por cuadro. Le ahorra a un agente dos errores contrarios: no destruir
nunca, o destruir y perder el mapa compartido.

### 22. `arcgis-popup-templates` — aporta con arreglos

**Evidencia (5.1.27, `tests/runtime/casos/arcgis-popup-templates.ts`, 12/12 en verde, popups reales abiertos con `view.openPopup`):**

- Los **tres pitfalls principales eran falsos o exagerados**:
  - «Errores de mayúsculas en placeholders»: `{Name}` y `{name}` muestran `Bogotá` para `NAME`, no distinguen mayúsculas (el AGENTS decía «case-sensitive»).
  - «Olvidar outFields que necesita el popup»: con `outFields: ["areaname"]` en la capa, `{pop2000}` igual mostró `8008278`, porque el popup pide sus campos al abrirse aunque el graphic del hit solo traiga `areaname,objectid`.
  - «Riesgo de inyección HTML»: el SDK sanitiza. Con `<img onerror>` y `<script>` quedó `__xss=0`, sin `img[onerror]` ni script.
- **Lo que sí muerde, medido, y ahora es el Top 3**:
  - Una función de contenido que lee un campo sin `template.outFields` recibe `F:undefined`; con `outFields: ["pop2000"]` recibe `F:8008278`.
  - Las fechas a medianoche UTC salen con el día anterior: `view.timeZone` por defecto es `"system"` (America/Bogota) y muestra `26/10/2026, 7:00 p. m.`; con `"UTC"` muestra `27/10/2026`.
  - Sin `format`, los números no llevan separador (`7900000`); con `digitSeparator: true` salen como `7.900.000`.
- **Extendidos**:
  - Se confirmaron `popupEnabled=false`, que ni con `openPopup({fetchFeatures})` muestra el popup, y la función sin `return`, que deja el cuerpo vacío.
  - Nuevos: el HTML dentro de un atributo se interpreta (un `<b>` real; `textContent` si debe verse literal) y un campo inexistente sale vacío, no `{NOEXISTE}`.
  - Se arreglaron dos bloques que no compilaban y se marcó como «no medido» el de trabajo pesado.
- **Lo demás**: `api-detail` gana `expression` y `relationship` y aclara para qué sirve `outFields`; los snippets se actualizaron a 5.1 y `snippet-popup-custom` declara sus `outFields`.

**Por qué aporta**: sin la skill, un agente escribe la función de contenido sin `outFields` y le sale `undefined`, entrega fechas corridas un día y cifras sin separador. Los tres errores fallan en silencio. La versión anterior advertía de tres problemas que no existen.

### 23. `arcgis-portal-content` — aporta con arreglos

**Evidencia (5.1.27 contra ArcGIS Online público, sin sesión, `tests/runtime/casos/arcgis-portal-content.ts`, 15/15 en verde):**

- **El arreglo de paginación que enseñaba la skill tenía un error.** `nextQueryParams` siempre es un objeto, y al terminar trae `start: -1`. Consultarlo vuelve a la primera página. El bucle `while (page.nextQueryParams)` llevaba 446 resultados tras 6 páginas de una búsqueda de 223, y seguía. El `if (first.nextQueryParams)` de la skill vieja duplica la primera página cuando todo cabe en una. La versión correcta pagina hasta `start === -1`: 223 de 223 en 3 páginas.
- **Topes que fallan en silencio:**
  - la página por defecto trae 10 resultados;
  - un `num` de 250 trae 100;
  - `start` empieza en 1 (el primer `nextQueryParams.start` es 11);
  - `start + num` por encima de 10000 lanza `Result window is too large`;
  - `total` se detiene en 10000: una búsqueda de `"water"` dio exactamente 10000.
- **`sortField: "modified"` sin `sortOrder` ordena ascendente:** los primeros resultados eran de 2020, y con `"desc"` de 2026. El ejemplo y el snippet de la skill vieja devolvían los mapas más viejos creyendo traer los últimos.
- **`Layer.fromPortalItem` sobre un web map** lanza `Unknown item type 'Web Map'`, y ese item no tiene `url`. Con un Feature Service devuelve una capa `feature`.
- **Lo que la skill vieja decía y sí es cierto:**
  - `title` y `type` son `null` antes de `load()`;
  - `new Portal()` apunta a `https://www.arcgis.com`, con `user` en `null`;
  - `fetchData()` de un web map trae `operationalLayers` y `baseMap`;
  - los grupos públicos se pueden consultar (63 de Esri; el primero tiene 45 items).
- **Un id inexistente** falla rápido con `Item does not exist or is inaccessible.` (`loadStatus` `failed`, sin diálogo de inicio de sesión). Curiosidad: el id de 32 ceros existe en ArcGIS Online.
- **Relleno quitado:** dos pitfalls extendidos que eran solo un comentario (expiración del token y membresía de grupos), cambiados por otros medidos. El pitfall de contenido privado sin sesión se dejó como concepto: es cierto por diseño y no se puede medir sin una cuenta.

**Por qué aporta:** las tres trampas principales (el bucle infinito, el orden ascendente y el cargador equivocado) son errores que un agente comete casi seguro y que no se notan a simple vista. La versión anterior enseñaba la primera y la segunda en su propio código.

### 24. `arcgis-rest-services` — aporta con arreglos

**Evidencia** (5.1.27, `tests/runtime/casos/arcgis-rest-services.ts`, 14/14 en verde, servicios públicos y sin API key):

- **El Pitfall 1 viejo («401 sin key») era falso**, y en la práctica es peor. Se midió en `geocode-api`, `route-api` y `places`:
  - el IdentityManager dispara `dialog-create` y se abre un `calcite-dialog` de inicio de sesión;
  - no hay respuesta HTTP y la promesa queda pendiente, así que el `catch` nunca corre.

  Un agente que espera un 401 no lo va a ver nunca.
- **Una query a la raíz del MapServer** devuelve **0 features sin error**, cuando la skill decía que fallaba. Con `/0` devolvió 9. En la capa:
  - `where 1=1` trae 1000 de 3557 filas (`exceededTransferLimit: true`);
  - sin `returnGeometry` la geometría llega en `null`.
- **Paradas crudas o un objeto plano en vez de `RouteParameters`**: fallan con `TypeError: t.toJSON is not a function`, un error que no dice qué está mal. Con un `FeatureSet` o una `Collection<Stop>` resuelve (servicio de muestra de San Diego: polilínea, 14.79 min).
- **Direcciones de ruta**: no llegan por defecto. Con `returnDirections` y `directionsLanguage: "es"` llegan 12 maniobras («Salga desde Location 1»).
- **Geocodificación**:
  - `attributes` llega con 0 claves sin `outFields`; con `outFields` trae `{"Addr_type":"POI","City":"Bogotá","Country":"COL"}`;
  - una dirección sin sentido devuelve un array vacío, no un error;
  - `locationToAddress` responde «Plaza de Bolivar»;
  - el geocoder clásico `geocode.arcgis.com` respondió sin key.
- **Pitfall extendido 2 falso, quitado** («sin `outSpatialReference` el punto cae corrido»): el punto WGS84 cae en el centro (200, 157) de una vista 102100 de 400×300.
- **Relleno quitado**: tres extendidos que eran solo comentario (cuotas, CORS, esriRequest). El de esriRequest queda como consejo de estilo marcado «no medido».
- **`places` no recibe URL**: se corrigió en `api-detail`.

**Por qué aporta**: los tres errores principales fallan en silencio o de forma opaca, y la versión anterior describía mal dos de ellos.

### 25. `arcgis-scene-environment` — aporta con arreglos

**Evidencia** (5.1.27, `tests/runtime/casos/arcgis-scene-environment.ts`, 9/9 en verde, SceneView real):

- **Valores por defecto medidos:**
  - `lighting` `sun`, con `directShadowsEnabled` en `false`: el Pitfall 1 viejo era cierto y se queda;
  - `cameraTrackingEnabled` en `true`;
  - `date` = **15 de marzo al mediodía solar local bajo la cámara** (16:56Z sobre Bogotá), no «ahora»;
  - `weather` `sunny`, atmósfera y estrellas encendidas, `qualityProfile` `medium`.
- **Pitfall nuevo y grave: el estudio de sombras se mueve solo.** Con `cameraTrackingEnabled` por defecto, mover la cámara de Bogotá a Tokio cambió la fecha de `17:00Z` a `02:44Z`: conserva la hora local, no el instante. Con `false` se queda en 17:00Z. La skill vieja no lo mencionaba.
- **El clima no aparece y no avisa.** `weather.type` vale `rainy` en los tres casos medidos, pero `weatherAvailable` solo es `true` en una escena global a 3 km. Da `false` a 3000 km y en una escena local, sin ningún error.
- **El pitfall de fechas estaba mal explicado.** `new Date("2026-06-21")` es medianoche **UTC**, no medianoche local como decía la skill. En cambio, `"2026-06-21T12:00"` sin offset sí es hora local del navegador (17:00Z en Bogotá).
- **Otros hallazgos:**
  - un `environment` pasado a una MapView no lanza error: queda como propiedad plana sin efecto (cierto, pasó a la lista extendida);
  - `precipitation: 3` se recorta a 1;
  - `snowCover` es `disabled` por defecto;
  - `qualityProfile` se puede cambiar después de crear la vista;
  - cambiar la luz a `virtual` en caliente hace autocast;
  - `arcgis-daylight` y `arcgis-weather` se registran.
- **Relleno quitado:** tres extendidos que eran solo comentario: sombras sin objetos, el clima que no cambia los datos y la atmósfera que tapa el horizonte. El pitfall de GPU queda en la lista extendida marcado «no medido».

**Por qué aporta:** un estudio de sombras a una hora fija es el uso analítico principal de esta API. Sin la skill, un agente deja las sombras apagadas, no fija la fecha y deja el seguimiento de cámara encendido, y la hora cambia en cuanto el usuario navega. El clima en una escena local falla igual de callado.

### 26. `arcgis-smart-mapping` — aporta con arreglos

**Evidencia** (5.1.27, `tests/runtime/casos/arcgis-smart-mapping.ts`, 11/11 en verde, servicio público de ciudades y estados de EE. UU.):

- **Dos de los tres pitfalls principales eran falsos:**
  - *Llamar antes de `view.when()`*: resolvió con las mismas estadísticas.
  - *Renderer continuo sobre un campo de texto*: no falla, y eso es peor. Devuelve un `class-breaks` con `min`/`max` en `undefined` y stops inventados `0,25,50,75,100`. Quedó reescrito como Pitfall 3.
- **El Concepto 1 viejo era falso.** No muestrea la vista: las estadísticas cubren toda la capa.
  - Capa de servicio: `n=3557` con la vista sobre NY, sobre EE. UU. y sin vista.
  - Capa cliente armada con `source`: `n=51` con la vista sobre NY.
  - `definitionExpression` sí se respeta (`st='NY'` da `n=187`); `filter.where` se ignora (`n=3557`).
- **Pitfall nuevo 1: cortes por defecto.** Son de intervalos iguales: 5 clases de unos 1,6 M, con **3553 de 3557 ciudades en la primera**. Con `quantile`, la primera clase termina en 12938 y tiene 712.
- **Pitfall nuevo 2: categorías.** `type.createRenderer` sobre un campo con 51 valores da 10 `uniqueValueInfos` y el resto queda como «Otro». Con `numTypes: -1` salen los 51.
- **Confirmado:**
  - el creador no asigna el renderer (sigue `simple`);
  - `size` devuelve una variable visual `size`;
  - `above-and-below` da 5 stops;
  - `basemapTheme` sale `light` sobre OSM.
- **Arreglos:**
  - el extendido que usaba `view.watch` (deprecado) pasó a `reactiveUtils`;
  - el del basemap no estaba medido y se quitó;
  - el de «ignorar statistics» era solo un comentario y se cambió por «esperar que la vista acote las estadísticas».

**Por qué aporta:** sin la skill, un agente usa los cortes por defecto y entrega un mapa de un solo color. También manda un campo de texto sin recibir ningún error, o pierde 41 de 51 categorías bajo «Otro». La versión anterior advertía de dos problemas que no existen y no decía nada de estos tres.

### 27. `arcgis-spatial-analysis` — aporta con arreglos

**Evidencia** (5.1.27, `tests/runtime/casos/arcgis-spatial-analysis.ts`, 13/13 en verde). Servicios GP públicos: Viewshed (síncrono) y 911 Calls Hotspot (asíncrono).

- **El código de la skill fallaba.** El ejemplo y el snippet pasaban `Viewshed_Distance: 5000`, pero ese parámetro es `GPLinearUnit` y la llamada falla con `Unable to complete operation.`. Con `new LinearUnit({ distance: 5, units: "kilometers" })` devuelve 73 polígonos. Un `Graphic` suelto como observador también falla. Un `FeatureSet` y su `toJSON()` funcionan los dos.
- **El extendido 1 («revisar `jobStatus` tras `waitForJobCompletion`») era falso.** Un trabajo con entrada inválida **rechaza** la promesa con un `JobInfo` (`jobStatus` `job-failed`, último mensaje `Failed.`), no con un `Error`. Ese `if` nunca corre y `e.message` es `undefined`.
- **Pitfall 3: bajar features para sumar da un número equivocado, no solo lento.** El bucle en el cliente sumó 54.124.707 con 1000 filas (`exceededTransferLimit`). La query de estadísticas da el valor real, 165.628.942.
- **Pitfall 2 corregido.** Los nombres de parámetro no distinguieron mayúsculas en este servidor (`input_observation_point` funcionó). Lo que falla es un nombre mal escrito, y da el mismo mensaje opaco que un tipo equivocado.
- **Confirmado:**
  - `execute` sobre una tarea asíncrona falla con `Error performing execute operation`;
  - `submitJob` pasa de `job-executing` a `job-succeeded`, y `fetchResultData` trae un `raster-data-layer`;
  - sin `outStatisticFieldName` el campo de salida se llama `sum_expr0`;
  - `groupBy` devuelve 51 grupos sin geometría;
  - `execute` resuelve con `{results, messages}` y su `value` es un `FeatureSet`.
- **Relleno quitado:** el pitfall de autenticación, que era solo un comentario. El de progreso ahora tiene código real (`statusCallback` y `cancelJob`).

**Por qué aporta:** sin la skill, un agente copia el ejemplo y el viewshed falla con un error que no dice por qué. También suma features en el cliente y entrega un total equivocado, o escribe un manejo de fallos que nunca se ejecuta.
