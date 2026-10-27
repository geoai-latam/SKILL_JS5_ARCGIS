# Examples: Core Utilities

## Example 1: Watch a property and clean up

**Use case:** log the center whenever the user stops panning.

```typescript
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import type MapView from "@arcgis/core/views/MapView.js";

export function watchCenter(view: MapView) {
  const handle = reactiveUtils.when(
    () => view.stationary,
    () => console.log("center", view.center?.longitude, view.center?.latitude),
  );
  return () => handle.remove();
}
```

**Notes:**

- Return the remover so the caller can clean up on unmount.
- `view.stationary` is `true` when the user is not interacting.

---

## Example 2: Debounced, cancellable search

**Use case:** typeahead that cancels superseded requests.

```typescript
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";

const search = promiseUtils.debounce(async (q: string) => {
  const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
  return res.json();
});

export async function onInput(q: string) {
  try {
    return await search(q);
  } catch (e) {
    if (!promiseUtils.isAbortError(e)) throw e;
  }
}
```

**Notes:**

- Measured: a burst of three calls runs the first and the third; the second rejects with an abort error.
- Always ignore abort errors so the UI stays quiet between keystrokes.

---

## Example 3: REST call with esriRequest

**Use case:** read a service's JSON metadata.

```typescript
import esriRequest from "@arcgis/core/request.js";

export async function getServiceInfo(url: string) {
  const { data } = await esriRequest(url, { responseType: "json", query: { f: "json" } });
  return data;
}
```

**Notes:**

- `esriRequest` respects `esriConfig.request` interceptors and auth.
- Prefer it over raw `fetch` so identity/token handling is consistent.
