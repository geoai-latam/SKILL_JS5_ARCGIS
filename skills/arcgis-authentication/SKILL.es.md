---
name: arcgis-authentication
description: >
  Autentica apps de ArcGIS con el ArcGIS Maps SDK for JavaScript 5.1: API keys vía
  esriConfig.apiKey para location services, y sign-in de usuario vía OAuth2 con
  OAuthInfo e IdentityManager. Usa esta skill cuando el usuario acceda a contenido
  seguro, configure un API key, o monte OAuth2 / sign-in de usuario nombrado.
lang: es
version: 0.2.0
status: stable
sdk_version: ">=5.1 <6.0"
created: 2026-05-31
updated: 2026-10-27
category: services
tags:
  - authentication
  - oauth2
  - api-key
  - identitymanager
  - security
packages:
  - "@arcgis/core@^5.1"
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
   - Sí → un **API key** de API key credentials (`esriConfig.apiKey`), con restricción de referrers
     y una expiración que alguien vigile.

2. **¿Accedes a contenido privado de un usuario / editas capas seguras?**
   - Sí → **OAuth2** con `OAuthInfo` + `IdentityManager` (por defecto `flowType: "auto"`: dos pasos
     con PKCE donde el servidor lo soporta; `"implicit"` solo para servidores anteriores a 10.9).

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

`esriConfig.apiKey` autoriza las peticiones con los privilegios de esa key. Léela del entorno para
que no entre a git — pero ten claro que `import.meta.env.VITE_*` queda **dentro del bundle
público**: cualquier visitante la puede leer. Lo que la protege se configura en el ítem de API key
credentials, no en el código:

- **Restricción de referrers** (solo tus dominios la usan) y los **privilegios mínimos**.
- **Expiración**: las keys de API key credentials duran hasta un año. Dos keys por credencial, con
  expiraciones escalonadas, permiten rotar sin caída.
- **Las keys legacy ya no existen**: las API keys creadas antes del 27 de junio de 2024 (`AAPK…`) se
  retiraron el 27 de junio de 2026 y hoy responden "Invalid Token". Hay que migrarlas a API key
  credentials.

Una key es una identidad de app, no de usuario: se le puede dar acceso a ítems privados concretos,
pero los permisos por usuario (quién edita qué) necesitan OAuth.

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

**Impacto:** la key se filtra al control de versiones; gitleaks la bloquea. La variable de entorno
solo la saca de git: igual viaja en el bundle, así que restringe sus referrers y privilegios.

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

**Impacto:** la petición no falla: medido con el SDK 5.1.27, una capa segura (o un geocode sin
key) abre el **diálogo propio de usuario y contraseña** del SDK (`.esri-identity-modal`) y la
promesa queda esperando. Tu flujo OAuth nunca corre para esa petición.

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

- **0.2.0** (2026-10-27): SDK 5.1. La variable de entorno no esconde la key (viaja en el bundle);
  restricción de referrers, expiración y rotación; las keys legacy `AAPK` se retiraron el 2026-06-27; OAuth
  registrado tarde abre el diálogo de usuario y contraseña del SDK en vez de fallar (medido); `flowType` por
  defecto `auto`; a una API key credential se le pueden dar ítems privados. En `tests/runtime/casos/arcgis-authentication.ts`.
- **0.1.0** (2026-05-31): Versión inicial.
