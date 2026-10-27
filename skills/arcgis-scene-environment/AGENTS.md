# Agent Guide: arcgis-scene-environment

Quick-reference for 3D environment (SDK 5.1). Read before adjusting lighting/weather.

## Quick Decision Tree

1. **Fixed instant (shadow study)?** → `lighting: { type: "sun", date, directShadowsEnabled: true,
   cameraTrackingEnabled: false }`.
2. **Even light?** → `lighting: { type: "virtual" }`.
3. **Weather?** → `environment.weather = { type: ... }` in a global scene; check `weatherAvailable`.
4. **UI?** → `arcgis-daylight`, `arcgis-weather`.

## Setup Checklist

- [ ] Use a `SceneView` (a MapView ignores `environment`).
- [ ] `directShadowsEnabled: true` (false by default).
- [ ] Pass `date` with an explicit offset (the default is 15 March, not now).
- [ ] `cameraTrackingEnabled: false` if the instant must not move.
- [ ] Weather only in global scenes near the ground; parameters 0–1.

## Anti-patterns (one-liner reminders)

- ❌ Expecting shadows without `directShadowsEnabled`.
- ❌ A shadow study with `cameraTrackingEnabled` left on (the date jumps when navigating).
- ❌ Weather in a local scene (`weatherAvailable` false, no error).
- ❌ `new Date("2026-06-21")` meaning local midnight (it is UTC).

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — environment / lighting / weather
- `references/examples.md` — lighting / shadows / weather
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-environment.ts`
