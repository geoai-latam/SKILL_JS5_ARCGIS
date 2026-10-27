# Cambios del SDK 5.0 → 5.1 que tocan a las skills

Fuente: notas de versión de ArcGIS Maps SDK for JavaScript 5.1 (junio de 2026),
https://developers.arcgis.com/javascript/latest/release-notes/ , consultadas el 2026-10-27.
Paquetes instalados para validar: `@arcgis/core`, `@arcgis/map-components`,
`@arcgis/ai-components`, `@arcgis/charts-components`, `@arcgis/coding-components` 5.1.27;
`@esri/calcite-components` 5.2.0.

## Lo que rompe o cambia de comportamiento

- `arcgis-popup`: se retiró `triggerAction()`.
- `arcgis-assistant`: el contrato orquestador–agente usa entradas y salidas estructuradas, no solo mensajes. Los agentes propios hechos para 5.0 pueden necesitar cambios.
- Charts: `createModel()` se importa de `@arcgis/charts-components/model/shared/setup-utils.js`; desde el índice del paquete queda deprecado (se quita en 6.0).
- Editor (widget): los adjuntos y la opción múltiple piden `editor.viewModel.formSystem = "next"`; por defecto sigue `"legacy"`.
- Los componentes `-next` reemplazarán a los actuales en 6.0.

## Deprecado en 5.1 (con reemplazo)

- Todos los widgets siguen deprecados desde 5.0 y se quitan en 6.0 (Q1 2027): `MapView`→`arcgis-map`, `SceneView`→`arcgis-scene`, `LinkChartView`→`arcgis-link-chart` como punto de entrada recomendado.
- `arcgis-feature-table`: `hideMenuItemsToggleColumns`→`hideColumnVisibilityMenu`; `tableDisabled`→`disabled` (5.0).
- `arcgis-features` / `arcgis-popup`: `fetchFeatures()`→`fetchPopupFeatures()` en `arcgis-map`/`arcgis-scene`/`arcgis-link-chart`; `promises` sin reemplazo; `viewModel` de `arcgis-feature(s)`→propiedades del componente.
- `arcgis-scale-range-slider`→`arcgis-slider-scale-range`.
- `arcgis-sketch`: `scale`→`visualScale` (5.0).
- `arcgis-swipe`: `leadingLayers`→`startLayers`, `trailingLayers`→`endLayers`, `swipePosition`→`position` (5.0).
- `arcgis-utility-network-trace`→`arcgis-utility-network-trace-analysis` (5.0); `arcgis-utility-network-validate-topology`→`arcgis-utility-network-validate-network-topology` (5.1).
- `arcgis-chart`: `disableInteractions`→`interactionsDisabled`, `enableConfiguration`→`configurationEnabled`, `filterByExtent`→`filterByViewExtent`, `hideEmptySeries`→`showEmptySeries`, `useAnimatedCharts`→`animationEnabled`, `syncSelection`→`syncChartsSelection`, `rotation`→`rotated`, `legendPosition`/`legendVisibility`→en el modelo, `autoDisposeChart`→`autoDestroyDisabled`, y otras (lista completa en la fuente).

## Nuevo en 5.1 que una skill puede enseñar

- `fetchPopupFeatures()` en `arcgis-map`/`arcgis-scene` (punto o rectángulo de pantalla); `hitTest()` con rectángulo (beta); `RasterHit` para imágenes.
- `ParquetLayer` (beta), `AnnotationFeatureLayer` y `DimensionFeatureLayer` (beta, 2D), `FeatureLayer.symbolLayerDrawing`, `alternateSymbols` por escala en renderers.
- `CIMSymbolAnimationMoveAlongLine` (beta), `CIMMarkerPlacementAtMeasuredUnits`.
- Gaussian splats: recorte, corte, línea de visión, perfiles y sombras.
- AI: `arcgis-assistant-knowledge-agent`, tier `fast` en `modelTier`, utilidades para agentes propios.
- Coding: `arcgis-arcade-editor` con `enable-debugger`; el asistente de Arcade (beta) viene encendido (`disableAssistant` para apagarlo).
- Charts: imágenes (histograma y dispersión con `ImageryLayer`/`ImageryTileLayer`/`WCSLayer`), tema con `calciteThemingCSSVariables`.
- Editor/sketch: `AttachmentElement`, `MultipleChoiceInput`, etiquetas de segmento, curva tangente.
- `arcgis-feature-table`: `mapLayerId`, `filterByViewExtent`, `@arcgisCellDblClick`, etc.

## Hallazgos de la validación que las notas no dicen

- **Calcite 5.2.0 rompe `arcgis-chart` 5.1.27**: amCharts lanza "Unknown color syntax: light-dark(...)"
  y el chart no dibuja. `^5.1.x` resuelve a 5.2.0; el repo fija `@esri/calcite-components` en `~5.1.2`
  (medido el 2026-10-27).
- **`createModel` se importa sin `.js`**: `@arcgis/charts-components/model/shared/setup-utils`. La
  ruta con `.js` que imprimen las notas no está en el mapa de exports y Vite falla.
- **El script de la CDN es un módulo ES** (`https://js.arcgis.com/5.1/` → `index.js`, que importa
  Calcite, core, ai, charts, coding, common y map-components). Con `<script type="module">` registra
  todos los componentes; con un `<script>` clásico falla ("Cannot use import statement outside a
  module") y no registra nada (`tests/runtime/cdn.mjs`).
- **Los editores SQL y de código de `@arcgis/coding-components` son `@internal`** en 5.1.27; el único
  público es `arcgis-arcade-editor`. El asistente de Arcade viene encendido por defecto.
