---
name: arcgis-knowledge-graphs
description: >
  Consulta knowledge graphs de ArcGIS con el ArcGIS Maps SDK for JavaScript 5.0:
  conéctate vía knowledgeGraphService.fetchKnowledgeGraph, corre queries estilo
  openCypher para entidades y relaciones, y visualiza con un link chart. Usa esta
  skill cuando el usuario se conecte a un knowledge graph, corra una query de
  grafo, o explore entidades y sus relaciones.
lang: es
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: specialized
tags:
  - knowledge-graph
  - cypher
  - entities
  - relationships
  - link-chart
requires:
  - arcgis-authentication
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Knowledge Graphs

> **Cuándo usar:** Activa esta skill cuando el usuario se conecte a un knowledge graph, corra una
> query de grafo, o explore entidades y relaciones.

## Resumen

Un knowledge graph almacena entidades y relaciones; lo consultas con un lenguaje estilo openCypher.

- **Problema que resuelve:** modelar y consultar datos conectados, no tabulares.
- **A quién sirve:** desarrolladores que construyen apps de investigación/análisis de vínculos.
- **Patrón que enseña:** fetch del grafo, correr query, renderizar resultados (mapa + link chart).
- **Qué NO cubre:** feature layers (ver `arcgis-layers`) ni setup de auth (ver `arcgis-authentication`).

## Inicio Rápido

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
const graph = await knowledgeGraphService.fetchKnowledgeGraph("https://.../KnowledgeGraphServer");
```

## Árbol de Decisión

1. **¿Conectando a un servicio de grafo?**
   - Sí → `fetchKnowledgeGraph(url)` para obtener el objeto graph.

2. **¿Corriendo una query?**
   - Sí → ejecuta una query openCypher para entidades/relaciones.

3. **¿Visualizando relaciones?**
   - Sí → usa un link-chart junto al mapa.

**Default:** fetch y luego query; renderiza entidades con geometría en el mapa.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as knowledgeGraphService from "@arcgis/core/rest/knowledgeGraphService.js";
```

### Imports Dinámicos (CDN)

```javascript
const kg = await $arcgis.import("@arcgis/core/rest/knowledgeGraphService.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Grafica entidades con geometría en el mapa; combina con un link chart para relaciones.
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Fetch del grafo

`fetchKnowledgeGraph(url)` retorna un objeto `KnowledgeGraph` con el modelo de datos (tipos de
entidad/relación) necesario para construir e interpretar queries.

### Concepto 2: Queries openCypher

Las queries usan una sintaxis estilo openCypher para hacer match de entidades y relaciones,
retornando records que mapeas a UI — nodos/aristas del grafo y/o gráficos del mapa.

### Concepto 3: Entidades, relaciones, geometría

Las entidades pueden tener geometría (grafícalas en el mapa); las relaciones conectan entidades
(muéstralas en un link chart). El modelo de datos define qué tipos existen.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Consultar antes de hacer fetch del grafo

```typescript
// ❌ Anti-patrón
runQuery(url, cypher); // sin objeto graph / modelo de datos
```

```typescript
// ✅ Correcto
const graph = await knowledgeGraphService.fetchKnowledgeGraph(url);
// luego consulta contra `graph`
```

**Impacto:** las queries no se pueden construir/interpretar sin el modelo de datos.

### Pitfall 2: Asumir que todas las entidades tienen geometría

```typescript
// ❌ Anti-patrón
entities.forEach((e) => map.add(graphicFrom(e.geometry))); // algunas no tienen
```

```typescript
// ✅ Correcto
entities.filter((e) => e.geometry).forEach((e) => map.add(graphicFrom(e.geometry)));
```

**Impacto:** errores al graficar entidades sin geometría.

### Pitfall 3: Queries de grafo sin límite

```typescript
// ❌ Anti-patrón
// MATCH de todo sin límite
```

```typescript
// ✅ Correcto
// Restringe con filtros y un LIMIT para evitar result sets enormes.
```

**Impacto:** queries lentas y payloads pesados.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas de knowledgeGraphService | `references/api-detail.md` |
| Ejemplos de query + visualización | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-authentication` — los grafos suelen estar protegidos
- `arcgis-layers` — grafica entidades con geometría
- `arcgis-interaction` — selecciona nodos/aristas

## Samples de Referencia

- [Knowledge graph](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)
- [knowledgeGraphService](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-knowledgeGraphService.html)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
