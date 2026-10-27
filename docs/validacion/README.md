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
