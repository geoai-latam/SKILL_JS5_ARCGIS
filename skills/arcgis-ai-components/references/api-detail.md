# API Reference: AI Components (Beta)

## Table of Contents

- [arcgis-assistant](#arcgis-assistant)
- [Built-in agents](#built-in-agents)
- [Notes](#notes)

---

## arcgis-assistant

`@arcgis/ai-components/dist/components/arcgis-assistant`

| Member | Description |
|---|---|
| `reference-element` | The map element the assistant acts on |
| agent sub-components | Enable specific agents (see below) |
| chat UI | Hosts the conversation |

---

## Built-in agents

| Component | Capability |
|---|---|
| `arcgis-assistant-navigation-agent` | Go to places / move the view |
| `arcgis-assistant-data-exploration-agent` | Query / summarize / explore data |
| `arcgis-assistant-help-agent` | In-app help |
| `arcgis-assistant-layer-filter-agent` | Filter layers by prompt |

Custom agents can be registered for domain-specific behavior.

---

## Notes

- The package is **beta** — pin the version and re-test on upgrades.
- The unified 5.0 CDN includes `ai-components`.
- Review what data/agents the assistant can access before shipping.
