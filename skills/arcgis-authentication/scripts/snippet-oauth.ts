// snippet-oauth.ts — register OAuth2 so the SDK prompts/handles user sign-in. Smoke-tested.
import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import IdentityManager from "@arcgis/core/identity/IdentityManager.js";

// appId is a public client id (not a secret); use a placeholder in the repo.
const info = new OAuthInfo({
  appId: "YOUR_PUBLIC_APP_ID",
  popup: false,
  portalUrl: "https://www.arcgis.com",
});

IdentityManager.registerOAuthInfos([info]);

export { info };
