# Examples: Authentication

## Example 1: API key from environment

**Use case:** authorize basemaps and geocoding.

```typescript
import esriConfig from "@arcgis/core/config.js";

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY as string;
```

**Notes:**

- Keep the real key in `.env` (git-ignored).
- The key scopes which services you can call.

---

## Example 2: Register OAuth2 sign-in

**Use case:** access a user's private org content.

```typescript
import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";

const info = new OAuthInfo({ appId: "YOUR_PUBLIC_APP_ID", popup: false });
IdentityManager.registerOAuthInfos([info]);
```

**Notes:**

- Register before any secured request.
- `appId` is public; no secret in the browser.

---

## Example 3: Resume or trigger sign-in

**Use case:** restore a session on load, sign in on demand.

```typescript
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";

try {
  await IdentityManager.checkSignInStatus("https://www.arcgis.com/sharing");
} catch {
  await IdentityManager.getCredential("https://www.arcgis.com/sharing");
}
```

**Notes:**

- `checkSignInStatus` resumes an existing session.
- `getCredential` triggers the sign-in prompt.
