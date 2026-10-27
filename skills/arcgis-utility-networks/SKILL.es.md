---
name: arcgis-utility-networks
description: >
  Trabaja con utility networks en el ArcGIS Maps SDK for JavaScript 5.0: carga una
  UtilityNetwork, ejecuta traces (connected, upstream/downstream, isolation) vía el
  módulo REST trace, y usa el nuevo componente Utility Network Trace Analysis para
  una UI lista. Usa esta skill cuando el usuario analice redes de servicios (agua,
  electricidad, gas), corra un trace, o trabaje con terminals/asociaciones.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
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
  - "@arcgis/core@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Utility Networks

> **Cuándo usar:** Activa esta skill cuando el usuario cargue una utility network, corra un trace, o
> analice conectividad (agua/electricidad/gas).

## Resumen

Una `UtilityNetwork` modela infraestructura conectada; los traces siguen la conectividad desde puntos de inicio.

- **Problema que resuelve:** análisis de conectividad en infraestructura de servicios.
- **A quién sirve:** desarrolladores que construyen apps de redes de agua/electricidad/gas.
- **Patrón que enseña:** carga la red, define starting points + config de trace, corre el trace.
- **Qué NO cubre:** capas genéricas (ver `arcgis-layers`) ni routing (ver `arcgis-rest-services`).

## Inicio Rápido

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
const un = new UtilityNetwork({ layerUrl: "https://.../FeatureServer/0" });
await un.load();
```

## Árbol de Decisión

1. **¿Necesitas una UI de trace lista?**
   - Sí → el componente Utility Network Trace Analysis.

2. **¿Lógica de trace custom?**
   - Sí → carga la `UtilityNetwork`, arma los parámetros de trace, llama al módulo REST trace.

3. **¿Qué tipo de trace?**
   - Conectividad → connected trace; flujo → upstream/downstream; válvulas → isolation.

**Default:** el componente de trace para UX estándar; el módulo REST para análisis custom.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import UtilityNetwork from "@arcgis/core/networks/UtilityNetwork.js";
```

### Imports Dinámicos (CDN)

```javascript
const trace = await $arcgis.import("@arcgis/core/rest/networks/trace.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// El componente de trace analysis provee una UI lista enlazada al mapa.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Cargar la red

`new UtilityNetwork({ layerUrl })` y luego `await un.load()` resuelve la topología de red, las
configuraciones de terminal y los tiers necesarios antes de trazar.

### Concepto 2: Parámetros de trace

Un trace necesita starting points (y barriers opcionales), un tipo de trace, y una configuración de
trace (global id o config nombrada) definida en la red.

### Concepto 3: Terminals y asociaciones

Los dispositivos tienen terminals; las asociaciones de conectividad/contención/attachment definen
cómo se relacionan las features. Los traces las honran, así que la selección de terminal afecta resultados.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Trazar antes de cargar la red

```typescript
// ❌ Anti-patrón
const un = new UtilityNetwork({ layerUrl });
runTrace(un); // topología no lista
```

```typescript
// ✅ Correcto
const un = new UtilityNetwork({ layerUrl });
await un.load();
runTrace(un);
```

**Impacto:** el trace falla porque la topología/config no está disponible.

### Pitfall 2: Sin starting points

```typescript
// ❌ Anti-patrón
// Correr un trace sin starting points
```

```typescript
// ✅ Correcto
// Provee al menos un starting point válido (y barriers si aplica).
```

**Impacto:** el trace falla o no retorna nada.

### Pitfall 3: Terminal incorrecto en un dispositivo

```typescript
// ❌ Anti-patrón
// Seleccionar un starting point sin especificar su terminal en dispositivos multi-terminal
```

```typescript
// ✅ Correcto
// Especifica el terminalId para que la dirección de flujo sea correcta.
```

**Impacto:** el trace sigue el camino equivocado por un dispositivo.

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
- [UtilityNetwork](https://developers.arcgis.com/javascript/latest/api-reference/esri-networks-UtilityNetwork.html)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
