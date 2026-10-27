---
name: arcgis-utility-networks
description: >
  Trabaja con utility networks en el ArcGIS Maps SDK for JavaScript 5.1: carga
  una UtilityNetwork (desde un web map o la URL de una capa; los servicios
  protegidos se quedan colgados en un diálogo de inicio de sesión), corre trazados
  con utilityNetwork.trace() y TraceParameters (el nombre en JS es
  namedTraceConfigurationGlobalId; el nombre REST se descarta en silencio) y el
  componente arcgis-utility-network-trace-analysis (el viejo
  arcgis-utility-network-trace está deprecado desde 5.0, y el nuevo necesita un
  web map que guarde la red). Usa esta skill cuando el usuario analice redes de
  servicios (agua, electricidad, gas), corra un trazado o use terminales.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: specialized
tags:
  - utility-network
  - trace
  - terminals
  - isolation
  - networks
requires:
  - arcgis-layers
packages:
  - "@arcgis/core@^5.1"
  - "@arcgis/map-components@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Utility Networks

> **Cuándo usar:** Activa esta skill cuando el usuario cargue una utility network, corra un trace, o
> analice conectividad (agua/electricidad/gas).

## Resumen

Una `UtilityNetwork` modela infraestructura conectada; un trazado sigue la conectividad desde unos puntos de inicio.

- **Problema que resuelve:** análisis de conectividad sobre infraestructura de servicios.
- **A quién sirve:** desarrolladores que construyen apps de redes de agua, electricidad y gas.
- **Patrón que enseña:** tomar la red de un web map, iniciar sesión, elegir una configuración de trazado con nombre,
  trazar.
- **Qué NO cubre:** capas genéricas (ver `arcgis-layers`), ruteo (ver `arcgis-rest-services`) ni el inicio de sesión
  en sí (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import WebMap from "@arcgis/core/WebMap.js";

const webMap = new WebMap({ portalItem: { id: "YOUR_UN_WEBMAP_ID" } }); // un web map que guarda la red
await webMap.load();
const un = webMap.utilityNetworks?.at(0);
if (un) {
  await un.load();
  const config = un.sharedNamedTraceConfigurations[0]; // configuraciones guardadas con el web map
  const result = await un.trace({
    namedTraceConfigurationGlobalId: config.globalId,
    traceLocations: [{ type: "starting-point", globalId: "{FEATURE-GLOBALID}", terminalId: 1 }],
  });
  console.log(result.elements.length, result.startingPointsIgnored);
}
```

Los servicios de utility network están protegidos: la app tiene que iniciar sesión primero (`arcgis-authentication`).
El ejemplo público de Naperville de Esri responde "Token Required" sin sesión.

## Árbol de Decisión

1. **¿Necesitas una UI de trazado lista?**
   - Sí → `arcgis-utility-network-trace-analysis` en un mapa cargado desde un web map que guarda la red.
   - No `arcgis-utility-network-trace`: deprecado desde 5.0.

2. **¿Lógica de trazado propia?**
   - Sí → `un.trace({ namedTraceConfigurationGlobalId, traceLocations })` (llena `gdbVersion` y `moment`), o el
     `trace(url, new TraceParameters(...))` de REST cuando solo tienes la URL del servicio.

3. **¿Qué tipo de trazado?**
   - Conectividad → `connected`; flujo → `upstream`/`downstream`; válvulas → `isolation`; un camino → `path`
     (`shortest-path` está deprecado en ArcGIS Pro 3.7 y Enterprise 12.1).

**Por defecto:** el componente de análisis de trazado para la UX estándar; `un.trace()` con una configuración con
nombre para trabajo propio.

## Patrones de Import

### ESM directo (recomendado para npm/Vite/Webpack)

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
import TraceParameters from "@arcgis/core/rest/networks/support/TraceParameters.js";
```

### Imports dinámicos (CDN)

```javascript
const UtilityNetwork = await $arcgis.import("@arcgis/core/networks/UtilityNetwork.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-utility-network-trace-analysis";
```

## Conceptos Clave

### Concepto 1: De dónde sale la red

Un web map guardado con una utility network la expone como `webMap.utilityNetworks`, junto con las configuraciones de
trazado compartidas con él (`sharedNamedTraceConfigurations`). `new UtilityNetwork({ layerUrl })` también sirve, pero
entonces no hay configuraciones compartidas; pídelas al servicio con `un.queryNamedTraceConfigurations()`.

### Concepto 2: Un trazado es una configuración más unas ubicaciones

Una configuración de trazado con nombre (su `globalId`) trae el tipo de trazado, los tiers y los filtros. Las
ubicaciones son `starting-point`, `stopping-point` o `barrier`, cada una con el `globalId` de una feature, con un
`terminalId` en dispositivos de varios terminales o un `percentAlong` en líneas.

### Concepto 3: Lee lo que el trazado ignoró

`TraceResult` devuelve `elements`, `aggregatedGeometry`, `globalFunctionResults`, y también `startingPointsIgnored` y
`warnings`: una ubicación que la red no pudo usar no hace fallar el trazado, se reporta ahí.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Usar en JavaScript el nombre del parámetro REST

```typescript
// ❌ Anti-patrón: el nombre REST; la clase de JS lo descarta
new TraceParameters({ traceConfigurationGlobalId: cfgId } as never);
```

```typescript
// ✅ Correcto: el nombre de JS, que se serializa como traceConfigurationGlobalId
new TraceParameters({ namedTraceConfigurationGlobalId: cfgId });
```

**Impacto:** medido en 5.1.27: con el nombre REST, `namedTraceConfigurationGlobalId` es `null` y `toJSON()` no trae
ninguna configuración, sin error. El trazado sale sin ella.

### Pitfall 2: Pasarle un objeto plano al trace de REST

```typescript
// ❌ Anti-patrón
await trace.trace(url, { traceType: "connected", traceLocations }); // TypeError: n2.toJSON is not a function
```

```typescript
// ✅ Correcto
await trace.trace(url, new TraceParameters({ namedTraceConfigurationGlobalId: cfgId, traceLocations }));
// o, con la red cargada: await un.trace({ namedTraceConfigurationGlobalId: cfgId, traceLocations })
```

**Impacto:** medido: el módulo REST llama `toJSON()` sobre sus parámetros y lanza un `TypeError` antes de cualquier
petición. TypeScript strict también rechaza el objeto plano (TS2740).

### Pitfall 3: Construir sobre el componente de trazado deprecado

```html
<!-- ❌ Anti-patrón -->
<arcgis-utility-network-trace></arcgis-utility-network-trace>
```

```html
<!-- ✅ Correcto, dentro de un mapa cargado desde un web map que guarda la red -->
<arcgis-map item-id="YOUR_UN_WEBMAP_ID">
  <arcgis-utility-network-trace-analysis slot="top-right"></arcgis-utility-network-trace-analysis>
</arcgis-map>
```

**Impacto:** `arcgis-utility-network-trace` está `@deprecated since 5.0`. Su reemplazo necesita la red en el web map:
medido en un mapa con solo un basemap, llegó a `state: "ready"` y pintó sus pestañas, y la consola registró "The
property `utilityNetworks` is empty but must have at least one element".

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de UtilityNetwork / trace | `references/api-detail.md` |
| Ejemplos de trace | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-layers` — las feature layers de la red
- `arcgis-editing` — edita features de la red
- `arcgis-interaction` — elige starting points en el mapa

## Samples de Referencia

- [Utility network trace](https://developers.arcgis.com/javascript/latest/sample-code/utility-network-trace/)
- [UtilityNetwork](https://developers.arcgis.com/javascript/latest/references/core/networks/UtilityNetwork/)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Pruebas en tiempo de ejecución en `tests/runtime/casos/arcgis-utility-networks.ts`,
  sin credenciales (el ejemplo público de Naperville pide token, y el arnés no inicia sesión), así que ningún trazado
  corrió de punta a punta. Se arregló: el parámetro de configuración era el nombre REST `traceConfigurationGlobalId`,
  que la clase de JS descarta en silencio (medido); el ejemplo del trace de REST pasaba un objeto plano, que lanza
  `TypeError: n2.toJSON is not a function` (medido; era también el bloque que fallaba con TS2740);
  `dataElement.domainNetworks` se cambió por los miembros con tipos. Nuevo: `arcgis-utility-network-trace` está
  deprecado desde 5.0, su reemplazo necesita un web map que guarde la red (medido), un servicio protegido deja `load()`
  pendiente en un diálogo de inicio de sesión (medido), `un.trace()`, `startingPointsIgnored` y `shortest-path`
  deprecado. Se reemplazaron los cinco pitfalls que eran solo comentarios.
- **0.1.0** (2026-05-31): Versión inicial.
