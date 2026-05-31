# Agent Guide: arcgis-popup-templates

Quick-reference for popups. Read before customizing feature info.

## Quick Decision Tree

1. **Fields + title?** → string `title` + `fields` content block.
2. **Formatting?** → `fieldInfos[].format` (digitSeparator, dateFormat, places).
3. **Custom HTML?** → `content` function returning an HTMLElement.
4. **Charts/images?** → `media` content block.

## Setup Checklist

- [ ] Match `{FIELD}` placeholders to exact field names (case-sensitive).
- [ ] Include popup fields in the layer's `outFields`.
- [ ] Build custom HTML via DOM APIs (avoid raw string injection).
- [ ] Set `layer.popupTemplate` (the component renders it).

## Anti-patterns (one-liner reminders)

- ❌ Placeholder case typos (`{Name}` vs `{NAME}`).
- ❌ Popup fields missing from `outFields`.
- ❌ Returning unsanitized HTML strings.

## Files in This Skill

- `SKILL.md` / `SKILL.es.md` — full guides
- `references/api-detail.md` — PopupTemplate / content
- `references/examples.md` — fields / media / custom
- `references/pitfalls.md` — extended troubleshooting
- `scripts/snippet-popup-template.ts`, `snippet-popup-custom.ts`
