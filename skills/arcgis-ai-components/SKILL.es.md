---
name: arcgis-ai-components
description: >
  Construye experiencias de mapas agénticas con los AI Components del ArcGIS Maps
  SDK for JavaScript 5.0 (BETA): el componente arcgis-assistant y sus agentes
  (navigation, data-exploration, help, layer-filter) más agentes custom para
  interacción con el mapa por lenguaje natural. Usa esta skill cuando el usuario
  agregue un asistente AI conversacional o exploración de datos por lenguaje natural.
lang: es
version: 0.1.0
status: beta
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: new-in-5.0
tags:
  - ai
  - assistant
  - agents
  - natural-language
  - beta
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/ai-components@^5.0"
  - "@arcgis/map-components@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# AI Components (Beta)

> **Cuándo usar:** Activa esta skill cuando el usuario agregue un asistente AI conversacional a un
> mapa o construya exploración de datos por lenguaje natural. Este paquete es **beta**.

## Resumen

Los AI Components agregan un asistente conversacional cuyos agentes actúan sobre el mapa vía lenguaje natural.

- **Problema que resuelve:** dejar a los usuarios explorar y navegar mapas conversando.
- **A quién sirve:** desarrolladores que construyen UIs de mapa asistivas y agénticas.
- **Patrón que enseña:** coloca `arcgis-assistant`, habilita agentes, enlázalo al mapa.
- **Qué NO cubre:** el mapa subyacente (ver `arcgis-core-maps`) ni los charts (ver `arcgis-charts`).

> ⚠️ Beta: la API de AI Components puede cambiar entre releases 5.x. Pinea versiones y re-prueba al actualizar.

## Inicio Rápido

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
// <arcgis-map id="myMap"></arcgis-map>
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>
```

## Árbol de Decisión

1. **¿Quieres un asistente de chat listo?**
   - Sí → `arcgis-assistant` con los agentes integrados.

2. **¿Qué capacidades?**
   - Navigation (ir a lugares), data-exploration (consultar/filtrar), help, layer-filter.

3. **¿Comportamiento de dominio específico?**
   - Sí → configura un agente custom.

**Default:** `arcgis-assistant` con los agentes integrados enlazado al mapa.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/ai-components/dist/components/arcgis-assistant";
```

### Imports Dinámicos (CDN)

```javascript
// La CDN unificada 5.0 incluye ai-components; referencia el custom element directamente.
const script = "https://js.arcgis.com/5.0/";
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/dist/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: El asistente + agentes

`arcgis-assistant` hospeda una UI de chat; los agentes (navigation, data-exploration, help,
layer-filter) convierten prompts en acciones del mapa. Habilita los agentes que tu app necesite.

### Concepto 2: Enlace al mapa

Enlaza el asistente a un mapa vía `reference-element` para que los agentes actúen sobre sus capas,
view y filtros.

### Concepto 3: Beta + agentes custom

La API es beta y evoluciona. Puedes registrar agentes custom para tareas de dominio; espera cambios
y pinea la versión del paquete.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Tratar beta como estable

```typescript
// ❌ Anti-patrón
"@arcgis/ai-components": "^5"  // flotando entre cambios breaking de beta
```

```typescript
// ✅ Correcto
"@arcgis/ai-components": "5.0.x"  // pinea y re-prueba al actualizar
```

**Impacto:** cambios breaking entre releases beta te sorprenden.

### Pitfall 2: Asistente sin enlace al mapa

```typescript
// ❌ Anti-patrón
// <arcgis-assistant></arcgis-assistant> sin reference-element
```

```typescript
// ✅ Correcto
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>
```

**Impacto:** los agentes no tienen sobre qué actuar.

### Pitfall 3: Exponerlo sin guardrails

```typescript
// ❌ Anti-patrón
// Publicar el asistente contra datos sensibles sin scoping
```

```typescript
// ✅ Correcto
// Acota agentes/datos; revisa a qué puede acceder el asistente.
```

**Impacto:** el asistente expone datos que no pretendías.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos de assistant / agentes | `references/api-detail.md` |
| Ejemplos de setup del asistente | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — el mapa sobre el que actúa el asistente
- `arcgis-layers` — los datos que explora
- `arcgis-charts` — charts para exploración de datos

## Samples de Referencia

- [AI Components (beta)](https://www.esri.com/arcgis-blog/products/js-api-arcgis/developers/introducing-ai-components-beta-in-arcgis-maps-sdk-for-javascript)
- [Components overview](https://developers.arcgis.com/javascript/latest/components/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial (beta).
