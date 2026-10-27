# Agent Guide: arcgis-popup-templates

Quick-reference for popups (SDK 5.1). Read before customizing feature info.

## Quick Decision Tree

1. **Fields + title?** → string `title` + `fields` content block.
2. **Formatting?** → `fieldInfos[].format` (`digitSeparator`, `dateFormat`, `places`); dates follow `view.timeZone`.
3. **Custom HTML?** → `content` function returning an element, with `template.outFields`.
4. **Charts/images?** → `media` content block.

## Setup Checklist

- [ ] Every field a content function reads is in `template.outFields`.
- [ ] Decide the time zone for date fields (`view.timeZone`, default `"system"`).
- [ ] Set `digitSeparator: true` for counts.
- [ ] Render user text with `textContent` if "<" must survive.

## Anti-patterns (one-liner reminders)

- ❌ A content function reading fields not in `template.outFields` (`undefined`).
- ❌ UTC-midnight dates under the default time zone (previous day).
- ❌ Expecting thousands separators without `format`.
- ❌ Content functions that return nothing.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — PopupTemplate / content / format
- `references/examples.md` — fields / text / custom
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-popup-template.ts`, `snippet-popup-custom.ts`
