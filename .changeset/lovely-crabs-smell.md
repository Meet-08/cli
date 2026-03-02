---
'@tanstack/cli': patch
'@tanstack/create': patch
---

Make the default base starter minimal (Home + About) for React and Solid, and add a new `blog` template option for both frameworks.

Interactive `create` now prompts for a template when one is not provided, and template id resolution prefers the selected framework when ids overlap.
