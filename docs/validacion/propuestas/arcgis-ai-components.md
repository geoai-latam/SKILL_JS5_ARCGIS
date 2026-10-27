# Propuesta de arreglos para `arcgis-ai-components` (sin aplicar)

Estos seis archivos tienen trabajo sin guardar de antes de esta rama: `AGENTS.md`, `SKILL.md`,
`SKILL.es.md` y `references/api-detail.md`, `examples.md` y `pitfalls.md` (+596/−128 líneas).
La validación no los tocó. Aquí está lo que les falta, medido contra el SDK 5.1.27, para que
Sebastián lo aplique cuando decida qué hacer con ese trabajo.

Evidencia: `tests/runtime/casos/arcgis-ai-components.ts`, 4/4 en verde en Chromium.

## 1. Rompe el build: las rutas de import (bloqueante)

Todos los imports de la skill usan `@arcgis/ai-components/dist/components/<tag>`, y esa ruta
no está en el `exports` del paquete. Medido:

- Node: `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Vite: `Missing "./dist/components/arcgis-assistant" specifier in "@arcgis/ai-components" package`.
- tsc lo resuelve por directorio y no se queja. Por eso el smoke test y el verificador de
  bloques lo daban por bueno. El verificador ya tiene el chequeo contra `exports`.

**Arreglo:** cambiar `dist/components/` por `components/` en estas líneas: `SKILL.md` 63, 64,
92 y 93; `SKILL.es.md` 64, 65, 93 y 94; `references/examples.md` 18 a 21; y
`references/api-detail.md` 19 y 86. Hay que revisar también `AGENTS.md`.
`scripts/snippet-assistant.ts` ya está arreglado en esta rama.

## 2. Bloques que no compilan

`node scripts/check-code-blocks.mjs --skill=arcgis-ai-components` falla en estos bloques:

| Archivo:línea | Error | Arreglo |
|---|---|---|
| `SKILL.md:203`, `SKILL.es.md:205` | TS1005 | El pin de versión (`"@arcgis/ai-components": "5.1.x"`) es JSON dentro de un bloque `typescript`. Pasarlo a un bloque `json` con el objeto `devDependencies` completo. |
| `references/examples.md:96` | TS2657 | El ejemplo 4 tiene dos elementos sueltos en un bloque `tsx`. Envolverlos en `<>…</>` o pasar el bloque a `html`. |
| `references/pitfalls.md:137` | TS1109/TS1351 | Comentario `<!-- -->` dentro de `tsx`. Usar `{/* … */}`. |
| `references/pitfalls.md:192` | TS1108 | `return` fuera de una función. Envolverlo en el nodo del grafo: `async function respond(state) { … }`. |

## 3. Afirmaciones que hay que cambiar o agregar (medidas)

- **Los agentes de ArcGIS necesitan un web map.** Con `arcgis-assistant-navigation-agent`
  sobre un `arcgis-map` sin `item-id` (solo `basemap`), el assistant emite
  `arcgisError("WebMap portal item is missing.")` al montar, y `submitMessage()` rechaza con
  `Orchestrator not initialized yet.`. Es un buen pitfall nuevo, porque el Quick Start de un
  agente que viene de los otros componentes pone `basemap="..."`.
- **La sesión se pide al primer mensaje, no al montar.** Un assistant con un solo agente
  propio y sin `reference-element` llega a `arcgisReady`. El primer `submitMessage` abre el
  diálogo «Iniciar sesión» y la promesa queda pendiente. El orquestador corre en el LLM de
  Esri y necesita un usuario nominal aunque no haya agentes de ArcGIS. Esto confirma la
  advertencia «ArcGIS Online only» con una medida.
- **5.1 trae `agent-utils`, y la skill no lo menciona.** `FunctionAgent`, `LLMAgent`,
  `WorkflowAgent` y los flujos `Sequential`, `Parallel`, `Router`, `Switch`, `Loop` y
  `Conditional` vienen en `@arcgis/ai-components/agent-utils/*.js`, todos `@since 5.1`. Un
  agente propio ya no exige escribir el `StateGraph` a mano. Medido:
  `new FunctionAgent({ name, description, execute })` da una `.registration` con
  `id = "conteoagent"` (el nombre en minúsculas). Su grafo compilado corre sin LLM y devuelve
  `outputMessage`. `arcgis-assistant-agent` acepta `agent = ag.registration`. Sugerencia: que
  el Concepto 3 enseñe primero `FunctionAgent`/`LLMAgent` y deje el `StateGraph` a mano como
  camino avanzado.
- **Instalar con pnpm rompe el build si no se fija `@langchain/core`.**
  `@arcgis/ai-components@5.1.27` depende de `langchain ^1.3.1` y de `@langchain/core ^1.1.39`.
  pnpm resolvió `langchain@1.5.20`, que pide `@langchain/core ^1.3.0`, junto con
  `@langchain/core@1.1.48`. Vite falla con `Missing "./utils/gateway" specifier in
  "@langchain/core"`. Se arregla instalando `@langchain/core@^1.3.0` como dependencia directa,
  y así quedó este repo.
- **`reference-element="#myMap"` y `"myMap"` funcionan las dos.** `resolveReferenceElement`,
  de `@arcgis/toolkit`, prueba `#id` y además antepone `#` a un id pelado. No es un pitfall.
  Los tipos usan la forma sin `#`.
- **Bien omitido:** `arcgis-assistant-layer-styling-agent` existe en 5.1.27 pero es
  `@internal`. No hay que enseñarlo.
- **Los niveles de modelo** de `invokeTextPrompt`, `invokeStructuredPrompt` e
  `invokeToolPrompt` son `"default" | "advanced" | "fast"`. `fast` es nuevo en 5.1. Los tipos
  advierten que el modelo detrás de cada nivel cambia sin respetar semver. Vale una línea en
  `api-detail.md`, que ya menciona el nivel rápido.

## 4. Lo que no se pudo medir

Sin un usuario nominal de ArcGIS Online no se probó ninguna respuesta del LLM: ni el ruteo,
ni la navegación, ni la exploración de datos con embeddings. Con un web map público (LA Parks
and Trails), el mapa no llegó a `ready` en Chromium headless en 20 s, así que el camino web
map + agente de ArcGIS quedó sin conclusión. Tampoco se probó el truco del Concepto 4 (un
agente propio que maneja una `SceneView`).
