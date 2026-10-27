---
name: arcgis-authentication
description: >
  Autentica apps de ArcGIS con el ArcGIS Maps SDK for JavaScript 5.0: API keys vía
  esriConfig.apiKey para location services, y sign-in de usuario vía OAuth2 con
  OAuthInfo e IdentityManager. Usa esta skill cuando el usuario acceda a contenido
  seguro, configure un API key, o monte OAuth2 / sign-in de usuario nombrado.
lang: es
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

# Autenticación

> **Cuándo usar:** Activa esta skill cuando el usuario configure un API key, inicie sesión de
> usuarios con OAuth2, o acceda a contenido seguro de ArcGIS.

## Resumen

Dos modelos: un **API key** para location services, y **OAuth2 de usuario** para contenido de la organización.

- **Problema que resuelve:** autorizar acceso a servicios facturados y contenido privado.
- **A quién sirve:** desarrolladores que cablean auth en apps de ArcGIS.
- **Patrón que enseña:** `esriConfig.apiKey` para keys; `OAuthInfo` + `IdentityManager` para usuarios.
- **Qué NO cubre:** qué servicios requieren auth (ver `arcgis-rest-services` / `arcgis-portal-content`).

## Inicio Rápido

```typescript
import esriConfig from "@arcgis/core/config.js";
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

## Árbol de Decisión

1. **¿Solo llamas location services (basemaps, geocode, route)?**
   - Sí → un **API key** (`esriConfig.apiKey`).

2. **¿Accedes a contenido privado de un usuario / editas capas seguras?**
   - Sí → **OAuth2** con `OAuthInfo` + `IdentityManager`.

3. **¿Login de Enterprise / app (no por usuario)?**
   - Considera flujos de app-credential / token del lado servidor; nunca envíes secretos al navegador.

**Default:** API key para servicios públicos; OAuth2 para acceso de usuario nombrado.

## Patrones de Import

### ESM Directo (recomendado para npm/Vite/Webpack)

```typescript
import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";
```

### Imports Dinámicos (CDN)

```javascript
const esriConfig = await $arcgis.import("@arcgis/core/config.js");
```

### Map Components (recomendado para proyectos nuevos)

```typescript
// Define esriConfig.apiKey (o registra OAuth) antes de que cargue el componente de mapa.
import "@arcgis/map-components/components/arcgis-map";
```

## Conceptos Clave

### Concepto 1: API keys

`esriConfig.apiKey` autoriza location services con el alcance de esa key. Léela del entorno;
nunca la hardcodees. Las keys no son identidades de usuario.

### Concepto 2: Flujo OAuth2

`new OAuthInfo({ appId, popup })` + `IdentityManager.registerOAuthInfos([info])` monta el sign-in.
El SDK entonces solicita login cuando una petición toca contenido seguro; `IdentityManager.checkSignInStatus` reanuda.

### Concepto 3: appId es público

El `appId` de OAuth (client id) es un identificador público — seguro en el navegador. No hay client
secret en el flujo implicit/PKCE del navegador; nunca embebas secretos en el cliente.

## Pitfalls Comunes (Top 3)

### Pitfall 1: Hardcodear el API key

```typescript
// ❌ Anti-patrón
esriConfig.apiKey = "AAPK_real_key";
```

```typescript
// ✅ Correcto
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Impacto:** la key se filtra al control de versiones; gitleaks la bloquea.

### Pitfall 2: Poner un client secret en el navegador

```typescript
// ❌ Anti-patrón
const info = new OAuthInfo({ appId, /* secret */ });
```

```typescript
// ✅ Correcto
const info = new OAuthInfo({ appId, popup: false }); // PKCE/implicit; sin secret en cliente
```

**Impacto:** un secret filtrado compromete el registro de la app.

### Pitfall 3: Registrar OAuth después de la primera petición segura

```typescript
// ❌ Anti-patrón
await layer.load();                          // toca contenido seguro primero
IdentityManager.registerOAuthInfos([info]);  // demasiado tarde
```

```typescript
// ✅ Correcto
IdentityManager.registerOAuthInfos([info]);  // registra primero
await layer.load();
```

**Impacto:** la primera petición segura falla antes de configurar el sign-in.

## Cuándo leer references/

| Si necesitas... | Lee |
|---|---|
| esriConfig / OAuthInfo / IdentityManager | `references/api-detail.md` |
| Ejemplos de API key + OAuth | `references/examples.md` |
| Más pitfalls (5+ extendidos) | `references/pitfalls.md` |

## Skills Relacionadas

- `arcgis-rest-services` — servicios que necesitan una key
- `arcgis-portal-content` — el contenido privado necesita sign-in
- `arcgis-starter-app` — setup de env-vars para keys

## Samples de Referencia

- [API keys](https://developers.arcgis.com/javascript/latest/api-reference/)
- [OAuth2](https://developers.arcgis.com/javascript/latest/sample-code/identity-oauth-basic/)

## Changelog

- **0.1.0** (2026-05-31): Versión inicial.
