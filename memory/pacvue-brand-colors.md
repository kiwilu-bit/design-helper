---
name: pacvue-brand-colors
description: Pacvue brand color values — Blue is
metadata: 
  node_type: memory
  type: project
  originSessionId: d5583284-a5c7-474e-ad7b-af0ad9287333
---

Pacvue uses two brand modes managed in the Figma file's `Brand` variable collection (`Blue` and `Orange`). Real values:

- **Pacvue Blue**: `#0D6EFD` — defined in `src/styles/local-theme.scss` as `--pac-project-blue` and `--pac-href-color`. **Not** Element Plus default `#409EFF`.
- **Pacvue Orange**: `#ff9f43` — `--pac-theme-color`.
- **Hover bg (Orange theme)**: `#fff1e3` (CSS var `--hover-color--`). But the official Figma design spec for Dropdown uses `rgba(255,159,67,0.05)` ≈ pre-blended `#fffaf6` — see [[component-from-research-workflow]] for why CSS var ≠ design spec.
- **Disabled text**: `#b2b2b2` (`--pac-disabled-text-color--`) or `#b2b2b8` (`--icon-light--`) depending on context. Design spec uses `#b2b2b8`.
- **Default text**: `#6e6b7b` for dropdown items, `#66666c` for slightly-darker hover state.

In the Figma `Brand` variable collection: `primary/bg` aliases to `brand/blue` (Blue mode) or `brand/orange` (Orange mode). **Don't alias brand-color text to `primary/text`** — that one is white (used for reverse-out text on colored buttons). Brand-colored text aliases to `primary/bg`.
