# API Reference: Core Utilities

## Table of Contents

- [reactiveUtils](#reactiveutils)
- [promiseUtils](#promiseutils)
- [esriRequest](#esrirequest)
- [Collection](#collection)

---

## reactiveUtils

`@arcgis/core/core/reactiveUtils.js`

| Function | Returns | Description |
|---|---|---|
| `watch(getValue, callback, options?)` | `WatchHandle` | Run callback when the tracked value changes |
| `when(getValue, callback, options?)` | `WatchHandle` | Run callback **every time** the value becomes truthy |
| `whenOnce(getValue, options?)` | `Promise<T>` | Resolve the first time the value is truthy |
| `on(getTarget, eventName, callback)` | `WatchHandle` | Listen to an event on a reactive target |

`options`: `initial` (also run with the current value), `sync` (one call per change instead of one
batched, asynchronous call), `once` (stop after the first call), `equals` (custom comparison). Every
handle has `.remove()`.

---

## promiseUtils

`@arcgis/core/core/promiseUtils.js`

| Function | Returns | Description |
|---|---|---|
| `debounce(fn)` | debounced fn | One call at a time: a burst runs the first and the last, the ones in between reject with an abort error |
| `isAbortError(error)` | `boolean` | True if the error is an abort/cancel |
| `eachAlways(promises)` | `Promise<EachAlwaysResult[]>` | Settle all, never reject |

---

## esriRequest

`@arcgis/core/request.js` (default export)

`esriRequest(url, options?) => Promise<{ data, requestOptions, ssl, url }>`

| Option | Type | Description |
|---|---|---|
| `responseType` | `"json" \| "text" \| "blob" \| ...` | Expected response type |
| `query` | `object` | Query parameters |
| `method` | `"get" \| "post"` | HTTP method |
| `signal` | `AbortSignal` | Cancellation |

---

## Collection

`@arcgis/core/core/Collection.js`

| Member | Description |
|---|---|
| `new Collection<T>(items?)` | Create an observable collection |
| `add(item, index?)` / `addMany(items)` | Insert items (emits `change`) |
| `removeAt(index)` / `remove(item)` | Remove items |
| `getItemAt(index)` | Item by index (there is no `[index]`) |
| `filter(fn)` / `map(fn)` | Return new `Collection`s |
| `on("change", e => e.added / e.removed)` | Batched per tick |
| `toArray()` | Plain array copy |
