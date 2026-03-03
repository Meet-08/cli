---
'@tanstack/cli': patch
---

Improve e2e test performance: parallelize tests via Nx caching and `nx affected`, block non-essential assets (images, fonts, media) during test runs, add per-fixture timing logs, make quality gates opt-in per fixture, and move template/router-only tests from `@blocking` to `@matrix`.
