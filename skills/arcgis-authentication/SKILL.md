---
name: arcgis-authentication
description: >
  Authenticate ArcGIS apps with the ArcGIS Maps SDK for JavaScript 5.0: API keys
  via esriConfig.apiKey for location services, and user sign-in via OAuth2 with
  OAuthInfo and IdentityManager. Use this skill whenever the user accesses secured
  content, configures an API key, or sets up OAuth2 / named-user sign-in.
lang: en
version: 0.1.0
status: stable
sdk_version: ">=5.0 <6.0"
created: 2026-05-31
updated: 2026-05-31
category: services
tags:
  - authentication
  - oauth2
  - api-key
  - identitymanager
  - security
packages:
  - "@arcgis/core@^5.0"
maintainer: "GeoAI LATAM"
license: MIT
---

# Authentication

> **When to use:** Activate this skill whenever the user configures an API key, signs in users with
> OAuth2, or accesses secured ArcGIS content.

## Overview

Two models: an **API key** for location services, and **OAuth2 user sign-in** for org content.

- **Problem it solves:** authorizing access to billed services and private content.
- **Who it serves:** developers wiring auth into ArcGIS apps.
- **Pattern it teaches:** `esriConfig.apiKey` for keys; `OAuthInfo` + `IdentityManager` for users.
- **What it does NOT cover:** which services need auth (see `arcgis-rest-services` / `arcgis-portal-content`).

## Quick Start

```typescript
import esriConfig from "@arcgis/core/config.js";
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

## Decision Tree

1. **Just calling location services (basemaps, geocode, route)?**
   - Yes → an **API key** (`esriConfig.apiKey`).

2. **Accessing a user's private org content / editing secured layers?**
   - Yes → **OAuth2** with `OAuthInfo` + `IdentityManager`.

3. **Enterprise / app login (not per-user)?**
   - Consider app-credential / token flows server-side; never ship secrets to the browser.

**Default:** API key for public services; OAuth2 for named-user access.

## Import Patterns

### Direct ESM (recommended for npm/Vite/Webpack)

```typescript
import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";
```

### Dynamic Imports (CDN)

```javascript
const esriConfig = await $arcgis.import("@arcgis/core/config.js");
```

### Map Components (recommended for new projects)

```typescript
// Set esriConfig.apiKey (or register OAuth) before the map component loads.
import "@arcgis/map-components/components/arcgis-map";
```

## Key Concepts

### Concept 1: API keys

`esriConfig.apiKey` authorizes location services scoped to that key. Read it from the environment;
never hardcode. Keys are not user identities.

### Concept 2: OAuth2 flow

`new OAuthInfo({ appId, popup })` + `IdentityManager.registerOAuthInfos([info])` sets up sign-in.
The SDK then prompts when a request hits secured content; `IdentityManager.checkSignInStatus` resumes.

### Concept 3: appId is public

The OAuth `appId` (client id) is a public identifier — safe in the browser. There is no client
secret in the implicit/PKCE browser flow; never embed secrets client-side.

## Common Pitfalls (Top 3)

### Pitfall 1: Hardcoding the API key

```typescript
// ❌ Anti-pattern
esriConfig.apiKey = "AAPK_real_key";
```

```typescript
// ✅ Correct
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impact:** the key leaks into source control; gitleaks blocks it.

### Pitfall 2: Putting a client secret in the browser

```typescript
// ❌ Anti-pattern
const info = new OAuthInfo({ appId, /* secret */ });
```

```typescript
// ✅ Correct
const info = new OAuthInfo({ appId, popup: false }); // PKCE/implicit; no secret client-side
```

**Impact:** a leaked secret compromises the app registration.

### Pitfall 3: Registering OAuth after the first secured request

```typescript
// ❌ Anti-pattern
await layer.load();                          // hits secured content first
IdentityManager.registerOAuthInfos([info]);  // too late
```

```typescript
// ✅ Correct
IdentityManager.registerOAuthInfos([info]);  // register first
await layer.load();
```

**Impact:** the first secured request fails before sign-in is configured.

## When to Read references/

| If you need... | Read |
|---|---|
| esriConfig / OAuthInfo / IdentityManager | `references/api-detail.md` |
| API key + OAuth examples | `references/examples.md` |
| More pitfalls (5+ extended) | `references/pitfalls.md` |

## Related Skills

- `arcgis-rest-services` — services that need a key
- `arcgis-portal-content` — private content needs sign-in
- `arcgis-starter-app` — env-var setup for keys

## Reference Samples

- [API keys](https://developers.arcgis.com/javascript/latest/api-reference/)
- [OAuth2](https://developers.arcgis.com/javascript/latest/sample-code/identity-oauth-basic/)

## Changelog

- **0.1.0** (2026-05-31): Initial release.
