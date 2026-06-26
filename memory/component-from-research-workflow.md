---
name: component-from-research-workflow
description: 7-phase workflow with AB critique that auto-generates Pacvue components into Figma Reference Cards
metadata: 
  node_type: memory
  type: project
  originSessionId: d5583284-a5c7-474e-ad7b-af0ad9287333
---

There's a project-level skill `pacvue-component-from-research` (and a portable user-level twin) that turns "research and generate X component" into a complete Reference Card on Figma.

**Workflow upgrade (2026-06-23)**: Phase R+C+P+P-Critique are now automated via a Workflow script at `.claude/workflows/pacvue-research-and-propose.js`. Trigger: `Workflow({ scriptPath: '...', args: 'ComponentName' })`. The workflow runs 3-4 parallel subagents, runs A↔B critique, and returns a `_phaseA1Ready: true` payload for Claude to format as Phase A1. Human-in-loop starts at Phase A1.

**Trigger phrases**: 研究并生成 X 组件 / 调研 X 组件并落到 Figma / `/pacvue-component-from-research <Component>`

**The 7 phases**:
1. **R Research** — WebFetch industry libs (default: Element Plus / Arco / eBay). Property list must be exhaustive. eBay sometimes lacks the component — explicitly say "skip", don't fabricate.
2. **C Code** — Read source from `src/components/`. Both `Pacvue<X>` and `pacvue-<x>-<y>` naming exist. CSS vars resolved via `src/styles/local-theme.scss`.
3. **P Propose** — Agent A drafts property set with source annotations.
4. **P-Critique** — Agent B critiques (≤2 rounds). Either passes or B's residual issues become user-facing open questions.
5. **A1 Approve-1** — Output proposal template, **STOP and wait for user**.
6. **F Figma** — Skill-call to [[figma-component-ref-card]] with handoff object.
7. **A2 Approve-2** — Screenshot, iterate. **Always `get_design_context` if user provides a Figma reference link** — design spec > CSS var.
8. **L Learn** — Append to skill's `## Lessons (auto-appended)` section.

**Key learned constraints** (accumulated across sessions):
- CSS `rgba` opacity → Figma SOLID needs pre-blending
- Hug width + long placeholder text wraps; use `textAutoResize='WIDTH_AND_HEIGHT'` to push container open
- Dimension product > 16 → split into multiple ComponentSets
- Multi-level submenu demos use absolute-positioned FRAME, not auto-layout
- `figma.group()` + later `ungroup` can damage adjacent placeholders — avoid

**Boolean Component Properties** (2026-06-23 PacvueInput):
- For toggles like Has Prefix / Has Suffix: use `cs.addComponentProperty('Name','BOOLEAN',false)` AFTER `combineAsVariants`, then set `layer.componentPropertyReferences = { visible: key }` on each variant's icon layer. Does NOT increase variant count. Hidden layers in auto-layout don't occupy space when controlled by boolean property.
- Component can be an auto-layout frame with border/fill directly — no outer wrapper needed.

**State vs Validation split** (mandatory for form inputs):
- State = interaction: Default|Hover|Focus|Disabled
- Validation = data: None|Error|Warning|Success
- These are orthogonal. NEVER mix into one enum. Agent A in the Workflow already has this constraint in its system prompt.

**Pacvue project specific** (confirmed 2026-06-23):
- `--el-color-warning` aliased to `--el-color-primary` via `themeColorsPlugin` → Warning border = Hover border = #FF9F43. Annotate in Reference Card.
- Pacvue doesn't use `size` variants for most components.
- `inputWithSelection` (33/67 PacvueSelect + Input layout) is a Pacvue-specific pattern not in industry libs.

See [[pacvue-brand-colors]] for color values, [[figma-file-ent-design-system]] for the target Figma file, [[pacvue-dropdown-design-intent]] for the PacvueDropdown semantic clarification (NOT Element's command-menu Dropdown).
