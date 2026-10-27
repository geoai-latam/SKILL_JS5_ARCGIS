---
name: arcgis-core-utilities
description: >
  Usa las utilidades core del ArcGIS Maps SDK for JavaScript 5.1: reactiveUtils
  para observar propiedades de Accessor, promiseUtils para async cancelable,
  esriRequest para llamadas REST, y Collection para arrays observables. Usa esta
  skill cuando el usuario necesite reaccionar a cambios de estado de view/layer,
  hacer debounce o cancelar requests, llamar un endpoint REST, o usar Collection.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: core
tags:
  - reactiveutils
  - promiseutils
  - esrirequest
  - collection
  - accessor
packages:
  - "@arcgis/core@^5.1"
maintainer: "GeoAI LATAM"
license: MIT
---

# Utilidades Core

> **Cuándo usar:** Activa esta skill cuando el usuario observe cambios de propiedades del SDK,
> necesite async cancelable/debounced, llame un endpoint REST con esriRequest, o use una Collection.

## Resumen

La mayoría de las clases del SDK extienden **Accessor**, que hace sus propiedades observables. Las
utilidades core son cómo reaccionas y orquestas ese mundo reactivo y asíncrono.

- **Problema que resuelve:** observar estado correctamente, manejar async y llamar servicios.
- **A quién sirve:** desarrolladores que cablean lógica alrededor del estado de map/layer/view.
- **Patrón que enseña:** observar-y-limpiar handles, promesas cancelables, colecciones observables.
- **Qué NO cubre:** renderizado (ver `arcgis-core-maps`) ni servicios REST específicos (`arcgis-rest-services`).

## Inicio Rápido

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
// Se ejecuta cuando view.stationary se vuelve true
const handle = reactiveUtils.when(
  () => view.stationary,
  () => console.log("center:", view.center),
);
// handle.remove() cuando termines
```

## Árbol de Decisión

1. **¿Reaccionar a una propiedad que cambia en el tiempo?**
   - Sí → `reactiveUtils.watch`.
   - **Cada vez** que una condición se vuelve verdadera → `reactiveUtils.when` (no es de una vez).
   - **Una sola vez** → `await reactiveUtils.whenOnce(...)` o `when(..., { once: true })`.

2. **¿Async que puede ser superado (typeahead, pans rápidos)?**
   - Sí → un `promiseUtils.debounce` creado una sola vez, e ignora `promiseUtils.isAbortError`.

3. **¿Llamar un endpoint REST?**
   - Sí → `esriRequest`.

**Default:** `reactiveUtils`. El método de instancia `.watch()` sigue existiendo en 5.1 pero está
deprecado desde 4.32 (el SDK escribe un aviso de deprecación).

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import esriRequest from "@arcgis/core/request.js";
```

### Imports Dinámicos (CDN)

```javascript
const reactiveUtils = await $arcgis.import("@arcgis/core/core/reactiveUtils.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Los componentes exponen los mismos objetos view; léelos en arcgisViewReadyChange,
// luego aplica reactiveUtils sobre las propiedades de la view.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: Accessor y observación

Las clases basadas en Accessor exponen propiedades observables. `reactiveUtils.watch(getValue,
callback)` retorna un handle; llama `handle.remove()` para dejar de observar y liberar memoria.

Los callbacks son **asíncronos y agrupados** por defecto (medido con 5.1.27): tres asignaciones
seguidas dan cero llamadas en el momento y **una** después, con el último valor. Pasa
`{ sync: true }` para recibir cada cambio (3 llamadas), `{ initial: true }` para correr también con
el valor actual, `{ once: true }` para parar después de la primera llamada. El getter corre de
inmediato: si lanza (`() => map.basemap.title` sin basemap), **el propio `watch()` lanza**; protégelo
con `?.`.

### Concepto 2: Async cancelable

`promiseUtils.debounce(fn)` deja correr una llamada a la vez: medido, tres llamadas seguidas corren
la primera, rechazan la segunda con un error de abort y corren la tercera (2 ejecuciones, no 1).
Detecta el rechazo con `promiseUtils.isAbortError(err)` y trágatelo. `esriRequest` recibe un
`signal`; una petición abortada también pasa `isAbortError`. Una función con debounce creada dentro
del handler no agrupa nada (3 llamadas → 3 ejecuciones).

### Concepto 3: Collection

`Collection<T>` es el array observable del SDK (usado por `map.layers`, `graphics`, etc.). Emite
eventos `change` (agrupados: `add`, `addMany` y `removeAt` en el mismo tick llegan como un solo
evento con `added`/`removed`) y ofrece `add`, `addMany`, `getItemAt`, `filter`, `map` y `toArray`.
No tiene acceso por índice: `collection[0]` no es un elemento.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Fugar handles de watch

```typescript
// ❌ Anti-patrón
reactiveUtils.watch(() => view.zoom, (z) => doStuff(z)); // nunca se remueve
```

```typescript
// ✅ Correcto
const handle = reactiveUtils.watch(() => view.zoom, (z) => doStuff(z));
// después: handle.remove();
```

**Impacto:** los callbacks se acumulan entre re-renders; la memoria crece y dispara lógica obsoleta.

### Pitfall 2: Tratar errores de abort como fallos

```typescript
// ❌ Anti-patrón
try { await search(q); } catch (e) { showError(e); } // muestra error en cada tecla
```

```typescript
// ✅ Correcto
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
try { await search(q); } catch (e) { if (!promiseUtils.isAbortError(e)) showError(e); }
```

**Impacto:** toasts de error espurios cada vez que un request más nuevo supera a uno viejo.

### Pitfall 3: Mutar una Collection como array plano

```typescript
// ❌ Anti-patrón
map.layers[0] = newLayer; // la asignación por índice no notifica a los watchers
```

```typescript
// ✅ Correcto
map.layers.removeAt(0);
map.layers.add(newLayer, 0);
```

**Impacto:** medido: la asignación se ignora. `length` sigue en 1, `getItemAt(0)` sigue siendo la
capa vieja y no se dispara ningún evento `change`. En TypeScript, `Collection` no tiene firma de
índice.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| Firmas completas de las utilidades | `references/api-detail.md` |
| Ejemplos de debounce / watch / request | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-core-maps` — las vistas cuyo estado observas
- `arcgis-rest-services` — helpers de servicio sobre esriRequest
- `arcgis-performance` — patrones de limpieza para evitar fugas

## Samples de Referencia

- [reactiveUtils](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-reactiveUtils.html)
- [esriRequest](https://developers.arcgis.com/javascript/latest/api-reference/esri-request.html)

## Changelog

- **0.2.0** (2026-10-27): SDK 5.1. Medido: `when` corre cada vez que el valor se vuelve verdadero (el árbol lo
  daba como de una vez); los callbacks de `watch` son asíncronos y agrupados (3 cambios → 1 llamada) salvo con
  `sync: true`; un getter que lanza hace lanzar a `watch()` (no "se detiene en silencio"); `debounce` corre la
  primera y la última de una ráfaga; asignar por índice en una Collection se ignora; `.watch()` deprecado. En
  `tests/runtime/casos/arcgis-core-utilities.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
