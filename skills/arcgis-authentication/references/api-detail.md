# API Reference: Authentication

## Table of Contents

- [esriConfig.apiKey](#esriconfigapikey)
- [OAuthInfo](#oauthinfo)
- [IdentityManager](#identitymanager)

---

## esriConfig.apiKey

`@arcgis/core/config.js`

| Property | Type | Description |
|---|---|---|
| `apiKey` | `string` | Authorizes location services for this key |

Set from `import.meta.env.VITE_ARCGIS_API_KEY`. Not a user identity.

---

## OAuthInfo

`@arcgis/core/identity/OAuthInfo.js`

| Property | Type | Description |
|---|---|---|
| `appId` | `string` | Public client id of your registered app |
| `popup` | `boolean` | Popup vs redirect flow |
| `portalUrl` | `string` | Portal to authenticate against |
| `flowType` | `string` | e.g. `"authorization-code"` (PKCE) |

---

## IdentityManager

`@arcgis/core/identity/IdentityManager.js`

| Method | Description |
|---|---|
| `registerOAuthInfos([info])` | Register OAuth config (do this first) |
| `checkSignInStatus(portalUrl)` | Resume an existing session |
| `getCredential(url)` | Trigger sign-in for a resource |
| `destroyCredentials()` | Sign out |
