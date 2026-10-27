# Informe final: las 35 skills contra el SDK 5.1

Rama `actualizacion-5.1`, 2026-10-27. Son 40 commits sobre `main`. Nada se publicó ni se
empujó: abrir el repo lo decide Sebastián. El detalle de cada skill está en
[`README.md`](./README.md) y los cambios del SDK en [`cambios-sdk-5.1.md`](./cambios-sdk-5.1.md).

## El resultado en una línea

**Las 35 aportan, pero ninguna aportaba tal como estaba.** Todas necesitaron arreglos que
rompían código o enseñaban algo falso. Ninguna se propone para borrar o fusionar.

| Veredicto | Skills |
|---|---|
| aporta con arreglos (aplicados) | 33 |
| aporta con arreglos, parcial (`arcgis-knowledge-graphs`: sin grafo accesible, todo pide token) | 1 |
| aporta con arreglos propuestos, sin aplicar (`arcgis-ai-components`: 6 archivos con trabajo sin guardar de Sebastián; ver [`propuestas/`](./propuestas/arcgis-ai-components.md)) | 1 |
| no aporta | 0 |

## Cómo se midió

- **Que compile.** Cada bloque de código de `SKILL.md`, `SKILL.es.md`, `AGENTS.md` y
  `references/*.md` se compila contra los `.d.ts` 5.1.27, y se marca lo `@deprecated`
  (`scripts/check-code-blocks.mjs`). Al final: 1064 bloques, y solo fallan los 5 del trabajo
  sin guardar de ai-components. Los `scripts/snippet-*.ts` pasan los 59 (`smoke-test.mjs`).
- **Que corra.** Hay un caso de runtime por skill en `tests/runtime/casos/` (34 archivos,
  más el de ai-components). Corren en Chromium real contra servicios públicos de Esri, sin
  API key y sin iniciar sesión. Lo que la skill dice que pasa se ejecuta, se lee el resultado
  y, en las de visualización, se leen los píxeles dibujados.
- **Que no sea relleno.** Un pitfall que solo es un comentario, o que dice algo que cualquier
  modelo ya escribe bien, se quitó o se reemplazó por uno medido.

## Lo que se repitió

1. **Pitfalls falsos.** Ejemplos medidos:
   - «Hay que cargar la capa antes de la tabla»: la tabla la carga sola.
   - «Las mayúsculas del campo importan»: no importan, ni en Arcade ni en los renderers.
   - «El orden de los stops importa»: no.
   - «`new Date("2020-01-01")` es hora local»: es UTC; la trampa real es `new Date(2020,0,1)`.
   - «Print sin URL falla»: no falla.
   - «La brújula en 2D no hace nada»: sí sigue la rotación.
   - «Dos componentes en el mismo slot se tapan»: quedan apilados.

   Un agente que se los cree escribe código de más o evita lo que sí funciona.
2. **Fallos silenciosos que no estaban documentados.** Son lo que más valor dio, porque sin
   error el agente no se entera:
   - un `reference-element` sin enlazar o mal escrito deja `view: null`;
   - un valor sin clase y sin `defaultSymbol` no se dibuja;
   - un `startField` mal escrito;
   - `TraceParameters` descarta `traceConfigurationGlobalId`;
   - `editingEnabled` sobre un MapServer de solo lectura;
   - un perfil de elevación sin `ground`;
   - campos que Arcade no pidió dan 0;
   - un `queryFeatures` que corta en `maxRecordCount`.

   Cada uno quedó medido en su caso.
3. **Restos de 4.x.**
   - `position="top-right"` en todos los ejemplos de las dos skills de widgets y en
     `arcgis-editing`. No existe: el componente cae al slot por defecto como una franja de
     600×32. Ahora es `slot`.
   - Las estadísticas del perfil en `line.statistics`. En 5.x están en la analysis view.
   - Versiones de deprecación inventadas («todo en 5.0»). Según los tipos van de 4.32 a 5.0.
4. **Rutas de import.** `dist/components/<tag>` pasó a `components/<tag>` en todas las skills
   (commit 63dfb1e). La CDN apunta a `js.arcgis.com/5.1/`.
5. **API inventada.** El `config` de charts, `arcgisChange` y `sqlEditor.layer` de coding
   components, y `externalRenderers` en custom rendering no existen. Esas skills no corrían.

## Arreglos al propio verificador

- **Bloques `tsx` y `jsx`.** Se escriben como `.tsx`; sin eso, `<arcgis-map …>` se leía como
  una aserción de tipo.
- **TS2307 de paquetes que no son del SDK.** Angular, React y LangGraph no están instalados y
  se ignoran. Una ruta del SDK que no resuelve sigue fallando.
- **Rutas contra `exports` (nuevo, skill 35).** tsc resuelve `@arcgis/ai-components/dist/...`
  por directorio, pero Vite y Node lo rechazan. Ahora se coteja cada ruta `@arcgis/*` y
  `@esri/*` contra el `exports` del paquete. En las otras 34 skills no encontró nada nuevo.
  `smoke-test.mjs` todavía no tiene este chequeo.
- **Dependencias.** Calcite queda fijado en `~5.1.2`, que es el peer del SDK. `@langchain/core`
  queda en `^1.3.0`: pnpm dejaba `langchain@1.5` junto con core 1.1, y Vite no compilaba
  ai-components.

## Lo que no se pudo medir

Todo lo que pide credenciales quedó medido solo hasta donde llega un usuario sin sesión:

- trazados reales de `arcgis-utility-networks` (Naperville responde «Token Required»);
- consultas a un grafo en `arcgis-knowledge-graphs`;
- respuestas del LLM en `arcgis-ai-components`: necesita un usuario nominal de ArcGIS Online,
  y el primer mensaje abre «Iniciar sesión»;
- la exportación de un print.

En ninguno se inició sesión ni se escribió en un servicio público.

## Frente a SaschaBrunnerCH/arcgis-maps-sdk-js-ai-context

Ese repo (MIT, 23 estrellas, 34 commits) tiene **las mismas 35 skills con los mismos
nombres**. Apunta al SDK 5.0, guarda 4.34 en una rama aparte y su README dice que está «work
in progress and not yet tested extensively». No muestra type-check ni pruebas de runtime del
código que enseña: tiene markdownlint, Prettier y cspell.

Solo se cotejaron dos skills contra su `master`. No es una comparación de las 35.

- **Su `arcgis-widgets-ui` ya usa `slot=`.** El `position=` que se arregló aquí era un error
  propio de este repo, no heredado. Sus imports, en cambio, siguen en
  `@arcgis/map-components/dist/components/...`. Esa ruta sí está en el `exports` de
  map-components, así que funciona, pero no es la forma de 5.x.
- **Su `arcgis-ai-components` importa bien** (`@arcgis/ai-components/components/...`) y ya
  documenta el usuario nominal y los embeddings del web map. El trabajo sin guardar de este
  repo **rompió** esa ruta (`dist/components`, que Vite rechaza). Lo de ellos está mejor en ese
  punto, y la propuesta lo corrige.
- **Lo que este repo tiene y aquel no:**
  - el SDK 5.1, con `agent-utils`, el agente `knowledge`, el nivel `fast` y los cambios de
    `cambios-sdk-5.1.md`;
  - cada afirmación ejecutada contra el SDK real, con su caso de runtime;
  - pitfalls medidos en vez de supuestos, y los falsos fuera;
  - un verificador que compila los 1064 bloques y ahora coteja `exports`;
  - versión bilingüe ES/EN.

Antes de abrir el repo conviene decidir dos cosas, y las dos son de Sebastián:

- cómo se presenta frente a ese otro, que tiene la misma estructura y los mismos nombres
  (atribución si de ahí salió la base, o diferenciarse por la validación);
- qué hacer con el trabajo sin guardar de `arcgis-ai-components`.
