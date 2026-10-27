# Agent Guide: arcgis-authentication

Quick-reference for auth. Read before accessing secured content.

## Quick Decision Tree

1. **Location services only?** → `esriConfig.apiKey` from API key credentials (env keeps it out of
   git, NOT out of the bundle: set referrer restrictions, minimum privileges, an expiration).
2. **Private org content / secured edits?** → OAuth2 (`OAuthInfo` + `IdentityManager`).
3. **App-level (not per-user)?** → server-side token; never ship secrets.

## Setup Checklist

- [ ] API key from `import.meta.env`, never hardcoded.
- [ ] `registerOAuthInfos` BEFORE the first secured request.
- [ ] `appId` is public; no client secret in the browser.
- [ ] Handle token expiry / re-auth; keys last up to a year: rotate with key 1 / key 2.
- [ ] Legacy `AAPK…` keys were retired on 2026-06-27 ("Invalid Token"): migrate to API key credentials.

## Anti-patterns (one-liner reminders)

- ❌ Hardcoded API key.
- ❌ Client secret in browser code.
- ❌ Registering OAuth after a secured request: the SDK opens its username/password dialog instead.
- ❌ Believing `VITE_` hides the key: it is in the shipped JavaScript.
- ❌ `flowType: "implicit"` on a modern portal: leave the default `"auto"` (PKCE).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — esriConfig / OAuthInfo / IdentityManager
- `references/examples.md` — API key + OAuth
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-apikey.ts`, `snippet-oauth.ts`
