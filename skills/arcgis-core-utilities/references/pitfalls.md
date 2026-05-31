# Extended Pitfalls: Core Utilities

> Extends the Top 3 in SKILL.md. Format: Anti-pattern / Correct / Impact / Diagnosis.

## Pitfall 1: Watching before the target exists

### Anti-pattern

```typescript
reactiveUtils.watch(() => view.map.layers.length, cb); // view.map may be null early
```

### Correct

```typescript
reactiveUtils.watch(() => view.map?.layers.length, cb);
```

### Impact

A thrown error inside the getter silently stops the watch.

### Diagnosis

Add a `?.` and confirm the callback fires after the map loads.

---

## Pitfall 2: Re-creating debounced functions per render

### Anti-pattern

```typescript
function onType(q: string) {
  const search = promiseUtils.debounce(realSearch); // new debounce every call
  return search(q);
}
```

### Correct

```typescript
const search = promiseUtils.debounce(realSearch); // created once
function onType(q: string) {
  return search(q);
}
```

### Impact

Debouncing never actually happens; every keystroke fires a request.

### Diagnosis

Network tab shows one request per keystroke instead of one per pause.

---

## Pitfall 3: Forgetting `initial` when you need an immediate run

### Anti-pattern

```typescript
reactiveUtils.watch(() => layer.visible, sync); // sync never runs until it changes
```

### Correct

```typescript
reactiveUtils.watch(() => layer.visible, sync, { initial: true });
```

### Impact

Initial UI state is out of sync until the first change.

### Diagnosis

State is wrong on load but corrects after the first toggle — add `initial: true`.

---

## Pitfall 4: Holding view references after destroy

### Anti-pattern

```typescript
const handle = reactiveUtils.watch(() => view.zoom, cb);
view.destroy(); // handle still references view internals
```

### Correct

```typescript
handle.remove();
view.destroy();
```

### Impact

Retained references prevent garbage collection of the destroyed view.

### Diagnosis

Heap snapshots show detached views still reachable via watch closures.

---

## Pitfall 5: Using esriRequest for cross-origin without CORS/proxy

### Anti-pattern

```typescript
await esriRequest("https://third-party.example/data"); // CORS error
```

### Correct

```typescript
import esriConfig from "@arcgis/core/config.js";
esriConfig.request.proxyUrl = "/proxy";
await esriRequest("https://third-party.example/data");
```

### Impact

Browser blocks the response; the promise rejects with a network error.

### Diagnosis

Console shows a CORS error; configure a proxy or enable CORS on the server.
