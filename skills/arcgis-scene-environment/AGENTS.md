# Agent Guide: arcgis-scene-environment

Quick-reference for 3D environment. Read before adjusting lighting/weather.

## Quick Decision Tree

1. **Realistic sun + shadows?** → `lighting: { type: "sun", directShadowsEnabled: true }`.
2. **Even light?** → `lighting: { type: "virtual" }`.
3. **Weather mood?** → `environment.weather = { type: ... }`.
4. **Sky realism?** → `atmosphereEnabled` / `starsEnabled`.

## Setup Checklist

- [ ] Use a `SceneView` (environment is 3D-only).
- [ ] Enable `directShadowsEnabled` for cast shadows.
- [ ] Set `date` for time-of-day.
- [ ] Lower `qualityProfile` if weather + shadows are heavy.

## Anti-patterns (one-liner reminders)

- ❌ Expecting shadows without `directShadowsEnabled`.
- ❌ `environment` on a MapView (2D).
- ❌ Max quality + weather + shadows on weak GPUs.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — environment / lighting / weather
- `references/examples.md` — lighting / shadows / weather
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-environment.ts`
