---
name: arcgis-ai-components
description: >
  Construye experiencias de mapas agénticas con los AI Components del ArcGIS Maps
  SDK for JavaScript 5.x (BETA): el componente arcgis-assistant y sus agentes
  integrados (navigation, data-exploration, help, knowledge) más agentes custom
  construidos con LangGraph para interacción con el mapa por lenguaje natural. Usa
  esta skill cuando el usuario agregue un asistente AI conversacional o exploración
  de datos por lenguaje natural. Nota: el asistente solo enlaza a arcgis-map 2D (no SceneView),
  los agentes integrados necesitan un web map (item-id) y en 5.1 un agente custom puede usar
  agent-utils (FunctionAgent, LLMAgent) en vez de un grafo de LangGraph escrito a mano.
lang: es
version: 0.3.0
status: beta
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: new-in-5.0
tags:
  - ai
  - assistant
  - agents
  - langgraph
  - natural-language
  - beta
requires:
  - arcgis-core-maps
packages:
  - "@arcgis/ai-components@5.1.27"
  - "@arcgis/map-components@^5.1"
  # Solo para agentes custom (requieren bundler — no disponibles por CDN):
  - "@langchain/langgraph"
  - "@langchain/core@^1.3.0"
  - "zod"
maintainer: "GeoAI LATAM"
license: MIT
---

# AI Components (Beta)

> **Cuándo usar:** Activa esta skill cuando el usuario agregue un asistente AI conversacional a un
> mapa o construya exploración de datos por lenguaje natural. Este paquete es **beta**.

## Resumen

Los AI Components agregan un asistente conversacional cuyos agentes actúan sobre el mapa vía lenguaje natural.

- **Problema que resuelve:** dejar a los usuarios explorar, navegar y analizar mapas conversando.
- **A quién sirve:** desarrolladores que construyen UIs de mapa asistivas y agénticas.
- **Patrón que enseña:** coloca `arcgis-assistant`, registra agentes, enlázalo al mapa.
- **Qué NO cubre:** el mapa subyacente (ver `arcgis-core-maps`) ni los charts (ver `arcgis-charts`).

> ⚠️ **Beta:** la API cambia entre releases 5.x (5.1 rompió el contrato orquestador↔agente — ver abajo).
> Pinea versiones y re-prueba al actualizar.
>
> ⚠️ **Solo 2D:** `arcgis-assistant` enlaza a `arcgis-map` (MapView) — **no** a `arcgis-scene`
> (SceneView). Para 3D, ver *Concepto 4*.
>
> ⚠️ **Solo ArcGIS Online:** el asistente requiere un **named user** de una organización de ArcGIS
> Online con sesión iniciada. Enterprise aún no está soportado (previsto ~12.2, finales de 2026). Las
> API keys no lo habilitan en apps públicas.

## Inicio Rápido

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
// <arcgis-map id="myMap" item-id="<webmap-id>"></arcgis-map>
// <arcgis-assistant reference-element="#myMap">
//   <arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>
// </arcgis-assistant>
```

El asistente necesita **al menos un agente registrado** (integrado o custom) para funcionar.

## Árbol de Decisión

1. **¿Quieres un asistente de chat listo sobre un web map 2D?**
   - Sí → `arcgis-assistant` + agentes integrados.

2. **¿Qué capacidades integradas?**
   - Navigation (ir a lugares / mover la vista), data-exploration (consultar, estadísticas, filtrar),
     help (ayuda en la app), knowledge (explorar datos de knowledge graph — 5.1+).

3. **¿Comportamiento de dominio, herramientas propias o una escena 3D?**
   - Sí → construye un **agente custom** con LangGraph (`AgentRegistration` + `createGraph`).

**Default:** `arcgis-assistant` + agentes integrados sobre un mapa 2D. Agrega agentes custom para lógica de dominio.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-data-exploration-agent";
```

### Imports Dinámicos (CDN) — solo agentes integrados

```javascript
// La CDN unificada 5.x incluye ai-components; referencia los custom elements directamente.
const script = "https://js.arcgis.com/5.1/";
// ⚠️ Los agentes custom NO se pueden construir por CDN — requieren bundler (npm/yarn).
```

### Map Components (recomendado para proyectos nuevos)

```typescript
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: El asistente + agentes (patrón orquestador)

`arcgis-assistant` hospeda una UI de chat respaldada por un **orquestador LLM**. En cada prompt el
orquestador detecta la intención y delega a uno o más **agentes** registrados. Nunca ejecuta
herramientas él mismo — cada agente tiene su propia lógica. Cada agente = **system prompt + contexto +
tools + output**.

Agentes integrados (5.1):

| Componente | Capacidad |
|---|---|
| `arcgis-assistant-navigation-agent` | Ir a lugares / mover la vista |
| `arcgis-assistant-data-exploration-agent` | Consultar atributos, estadísticas, proximidad espacial, **filtrar features** |
| `arcgis-assistant-help-agent` | Ayuda dentro de la app |
| `arcgis-assistant-knowledge-agent` | Explorar datos de knowledge graph (servicios, mapas, link charts) — **nuevo en 5.1** |

> **No existe un agente `layer-filter`.** El filtrado lo hace el agente **data-exploration**.

### Concepto 2: Enlace al mapa (solo 2D)

Enlaza el asistente vía `reference-element` (un `arcgis-map` / su `id`) para que los agentes
integrados actúen sobre sus capas, view y filtros. **Solo acepta elementos `arcgis-map`** — no
SceneView. `reference-element` es **obligatorio cuando hay agentes integrados ArcGIS registrados**.

Para que data-exploration funcione, las feature layers del web map necesitan **AI vector embeddings**
generados en ArcGIS Online (*Item → Settings → Manage AI vector embeddings → Generate embeddings*).

Los agentes integrados necesitan un **web map** (`item-id`), no un mapa armado en código. Medido en
5.1.27: con el agente de navegación sobre `<arcgis-map basemap="osm">`, el asistente emite
`arcgisError("WebMap portal item is missing.")` al montar y `submitMessage()` rechaza con
`Orchestrator not initialized yet.` `reference-element` acepta `"myMap"` o `"#myMap"`.

### Concepto 3: Agentes custom (agent-utils o LangGraph)

**Atajo de 5.1: `agent-utils`.** `FunctionAgent` (tu función es el agente), `LLMAgent` (una plantilla de
prompt + nivel de modelo + tools y esquemas Zod opcionales) y `WorkflowAgent` con flujos secuencial,
paralelo, router, switch, loop y condicional arman el grafo de LangGraph por ti. Su `.registration` es
el `AgentRegistration` que espera el asistente:

```typescript
import { FunctionAgent } from "@arcgis/ai-components/agent-utils/FunctionAgent.js";

const conteoCapas = new FunctionAgent({
  name: "LayerCountAgent", // el id se deriva: "layercountagent"
  description: "Counts the layers in the map. Use it when users ask how many layers there are.",
  execute: async () => `El mapa tiene ${mapEl.map?.layers.length ?? 0} capas.`, // string → respuesta
});

agentEl.agent = conteoCapas.registration; // agentEl es un <arcgis-assistant-agent>
```

Medido: el grafo compilado de un `FunctionAgent` corre sin LLM y devuelve `outputMessage`, y
`arcgis-assistant-agent` acepta `.registration`. En 5.1 estas clases solo usan el modelo de Esri.

**LangGraph escrito a mano** (control total, o tu propio LLM detrás de tu propio backend). Es un
objeto `AgentRegistration`:

```typescript
import { StateGraph } from "@langchain/langgraph/web";

export const MiAgente = {
  id:          "mi-agente",             // único, snake-case
  name:        "Mi Agente",             // legible
  description: "…qué hace + prompts de ejemplo + cuándo NO usarlo…", // CRÍTICO para el enrutamiento
  createGraph: () => new StateGraph(MiWorkspace) /* …nodos/aristas… */, // devuelve el grafo SIN compilar
  workspace:   MiWorkspace,             // AnnotationRoot de LangGraph (debe exponer outputMessage)
};
```

Regístralo (los agentes integrados son opcionales):

```tsx
<arcgis-assistant-agent agent={MiAgente} context={{ map, view, graphicsLayer }} />
```

Las tools acceden al mapa en runtime vía `config?.configurable?.context`. Requiere bundler +
`@langchain/langgraph @langchain/core zod`. Ver `references/api-detail.md` y el `CUSTOM_AGENTS_GUIDE.md`
del repo para el patrón completo de grafo de dos nodos.

### Concepto 4: Escenas 3D — el workaround

El asistente no enlaza a `arcgis-scene`. Pero **las tools de un agente custom son tu propio código**,
así que pueden controlar un `SceneView` que le pases vía `context`. Patrón para una demo 3D / gemelo digital:

- Registra **solo** agente(s) custom (sin agentes integrados ArcGIS) → `reference-element` no es obligatorio.
- Pasa `{ scene, view: sceneView, graphicsLayer }` como `context`.
- Las tools llaman `view.goTo(...)`, filtran `SceneLayer`s, alternan pisos, ajustan entorno/daylight, etc.

Valídalo en tu build: es beta y no está documentado para 3D.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Asumir soporte de SceneView 3D

```typescript
// ❌ Anti-patrón
// <arcgis-assistant reference-element="#miEscena"> … </arcgis-assistant>  // arcgis-scene NO soportado
```

```typescript
// ✅ Correcto
// 2D: reference-element apunta a un arcgis-map.
// 3D: solo agente custom; controla el SceneView desde tus tools vía context (Concepto 4).
```

**Impacto:** los agentes integrados no hacen nada contra una escena.

### Pitfall 2: Falta un agente registrado (o pin de versión incorrecto)

```typescript
// ❌ Anti-patrón
// <arcgis-assistant reference-element="#myMap"></arcgis-assistant>  // sin agentes
"@arcgis/ai-components": "^5"                                        // flota entre cambios breaking
```

```typescript
// ✅ Correcto
// Registra ≥1 agente; fija la versión exacta en package.json y re-prueba al actualizar:
// "@arcgis/ai-components": "5.1.27"
```

**Impacto:** el asistente no responde; los bumps de beta rompen el contrato orquestador↔agente.

### Pitfall 3: Exponerlo sin guardrails / supuestos de auth

```typescript
// ❌ Anti-patrón
// Asumir que API keys o cuentas públicas funcionan; publicar contra datos sensibles sin scoping
```

```typescript
// ✅ Correcto
// Sign-in OAuth de named user (org Online, AI assistants habilitado); acota agentes/datos.
```

**Impacto:** fallos de sign-in en runtime; el asistente expone datos que no pretendías.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Atributos de assistant/agentes, eventos, métodos, API de agente custom | `references/api-detail.md` |
| Ejemplos de setup del asistente + agente custom | `references/examples.md` |
| Más pitfalls (extendidos) | `references/pitfalls.md` |
| Guía profunda de agente custom (LangGraph) | `CUSTOM_AGENTS_GUIDE.md` del repo |

## Skills Relacionadas

- `arcgis-core-maps` — el mapa sobre el que actúa el asistente
- `arcgis-layers` — los datos que explora
- `arcgis-knowledge-graphs` — datos que explora el agente knowledge
- `arcgis-3d-layers` / `arcgis-scene-environment` — capas/entorno 3D que un agente custom puede controlar
- `arcgis-charts` — charts para exploración de datos

## Samples de Referencia

- [AI components (beta) — referencia](https://developers.arcgis.com/javascript/latest/references/ai-components/)
- [Intro a apps de mapas agénticas](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-introduction/)
- [Agentes custom](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-custom-agents/)
- [Sample AI Assistant](https://developers.arcgis.com/javascript/latest/sample-code/ai-assistant/)
- [FAQ](https://developers.arcgis.com/javascript/latest/agentic-apps/ai-faq/)

## Changelog

- **0.3.0** (2026-10-27): Validada contra 5.1.27 (`tests/runtime/casos/arcgis-ai-components.ts`).
  Imports a `components/<tag>` (`dist/components` no está en los exports del paquete: Vite lo
  rechaza). Se agregó el camino de `agent-utils` de 5.1, el requisito de web map de los agentes
  integrados y el pin de `@langchain/core`; los pitfalls de relleno se cambiaron por medidos.
- **0.2.0** (2026-07-15): Lista de agentes corregida (se eliminó el inexistente `layer-filter`; se
  agregó el agente `knowledge`). Se documentó `reference-element` solo-2D, los requisitos de auth
  ArcGIS Online / named-user, el contrato estructurado orquestador↔agente de 5.1, la API de agentes
  custom con LangGraph y el workaround para escenas 3D.
- **0.1.0** (2026-05-31): Versión inicial (beta).
