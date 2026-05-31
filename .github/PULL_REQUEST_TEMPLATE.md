# Pull Request

## What

<!-- One sentence: which skill or part of the repo does this change? -->

## Checklist

- [ ] `pnpm run validate-all` passes
- [ ] `pnpm run smoke` passes (if the skill ships code)
- [ ] `pnpm run lint` passes
- [ ] `pnpm run test:unit` passes
- [ ] `SKILL.md` and `SKILL.es.md` are in sync (same heading structure)
- [ ] `tests/evals/<skill>.eval.json` has ≥5 should_trigger and ≥3 should_not_trigger
- [ ] No hardcoded API keys / secrets
- [ ] `CHANGELOG.md` updated
