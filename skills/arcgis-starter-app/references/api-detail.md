# API Reference: Starter App

## Table of Contents

- [esriConfig](#esriconfig)
- [tsconfig (required options)](#tsconfig-required-options)
- [Environment variables](#environment-variables)

---

## esriConfig

`@arcgis/core/config.js` — global SDK configuration (default export).

| Property | Type | Description |
|---|---|---|
| `apiKey` | `string` | API key for location services / basemap styles |
| `portalUrl` | `string` | Portal/Enterprise URL (default ArcGIS Online) |
| `request` | `object` | Default request options (interceptors, timeouts) |
| `assetsPath` | `string` | Override the SDK asset path (rarely needed in 5.0) |

---

## tsconfig (required options)

| Option | Value | Why |
|---|---|---|
| `moduleResolution` | `"bundler"` (or `"node16"`) | Resolve SDK subpath exports |
| `module` | `"ESNext"` | ESM only |
| `target` | `"ES2020"`+ | Modern output |
| `strict` | `true` | Project standard |
| `lib` | `["ES2020","DOM","DOM.Iterable"]` | Browser + iterables |

---

## Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `VITE_ARCGIS_API_KEY` | `esriConfig.apiKey` | Must be `VITE_`-prefixed to be exposed by Vite |

Access with `import.meta.env.VITE_ARCGIS_API_KEY`. Keep the real value in `.env` (git-ignored);
commit `.env.example` with a placeholder.
