# Agent Guide: arcgis-authentication

Quick-reference for auth. Read before accessing secured content.

## Quick Decision Tree

1. **Location services only?** → `esriConfig.apiKey` (from env).
2. **Private org content / secured edits?** → OAuth2 (`OAuthInfo` + `IdentityManager`).
3. **App-level (not per-user)?** → server-side token; never ship secrets.

## Setup Checklist

- [ ] API key from `import.meta.env`, never hardcoded.
- [ ] `registerOAuthInfos` BEFORE the first secured request.
- [ ] `appId` is public; no client secret in the browser.
- [ ] Handle token expiry / re-auth.

## Anti-patterns (one-liner reminders)

- ❌ Hardcoded API key.
- ❌ Client secret in browser code.
- ❌ Registering OAuth after a secured request.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — esriConfig / OAuthInfo / IdentityManager
- `references/examples.md` — API key + OAuth
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-apikey.ts`, `snippet-oauth.ts`
