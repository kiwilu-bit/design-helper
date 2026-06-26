# Design Help Agent

AI-assisted UI design workflow for Claude Code. Supports two modes: high-fidelity Figma output and rapid runnable Vue demos.

Built from real product work on Pacvue (enterprise advertising platform). Evolves through use.

---

## Two Workflow Modes

### Mode A — 精细化 Figma（High-Fidelity）

For when you need a design-system-compliant Figma output ready for dev handoff.

- Tool: Figma Plugin API via `use_figma`
- Enforces: auto-layout, design tokens, component specs, critique loop
- Output: Figma nodes, screenshottable, stakeholder-ready

### Mode B — 快速 Demo（Rapid Vue Demo）

For when you need to validate a product idea in 30 minutes.

- Tool: Vue 3 SFC written into the project
- Enforces: runnable in browser, mock data, HMR passes
- Output: `http://localhost:5173/#/your-route`

**Decision rule:** if the user says "Figma / design / spec" → Mode A. If they say "demo / prototype / try it out" → Mode B. If unclear, ask.

---

## File Structure

```
design-help-agent/
├── skills/
│   └── ui-design-workflow/
│       ├── SKILL.md                    # Full workflow doc, mode selector at top
│       └── references/
│           ├── pacvue-components.md    # Exact specs from real Figma nodes
│           └── pacvue-color-system.md  # 7 color categories with token names
├── workflows/
│   ├── ui-design.js                    # Multi-agent workflow script (Claude Workflow tool)
│   └── pacvue-research-and-propose.js  # Research + propose new components
└── memory/
    ├── INDEX.md                        # Memory index
    ├── ui-workflow-modes.md            # Mode A vs B decision tree
    ├── pacvue-autolayout-rule.md       # ALWAYS createAutoLayout(), NEVER createFrame()
    ├── pacvue-brand-colors.md          # Orange #ff9f43, Blue #0D6EFD
    ├── pacvue-color-system.md          # Full 7-category color spec
    ├── pacvue-user-persona.md          # Target user: ad ops, KPI-first
    └── component-from-research-workflow.md
```

---

## Key Rules (Non-Negotiable in Mode A)

**Auto-Layout**
```js
// ✅ Always
const row = figma.createAutoLayout('HORIZONTAL')
parent.appendChild(row)
row.layoutSizingHorizontal = 'FILL' // FILL *after* appendChild

// ❌ Never for structural containers
const row = figma.createFrame()
row.x = 100
```

**Tag opacity on fill color, not frame**
```js
// ✅
frame.fills = [{ type: 'SOLID', color: successColor, opacity: 0.05 }]
// ❌ makes text invisible too
frame.opacity = 0.05
```

**Pagination active state**
```js
// ✅ Orange border + white bg
btn.fills = [{ type: 'SOLID', color: white }]
btn.strokes = [{ type: 'SOLID', color: orange }]
textNode.fills = [{ type: 'SOLID', color: orange }]
// ❌ filled orange background
```

**One theme per page** — never mix orange (#ff9f43) and blue (#0D6EFD) as primary actions.

---

## Pacvue Design Tokens (Quick Reference)

| Token | Value | Use |
|---|---|---|
| `--pac-theme-color` | `#ff9f43` | Orange primary (buttons, active states) |
| `--pac-href-color` | `#0d6efd` | Blue primary |
| `--color-title--` | `#45464f` | Page titles, section headers, labels |
| `--color-text--` | `#66666c` | Body text, descriptions |
| `--color-info--` | `#b2b2b8` | Placeholders, muted, disabled |
| `--pac-filter-line-color` | `#dedfe3` | Borders, dividers, input default |
| `--el-bg-color-page` | `#f2f3f5` | Page background |
| `--el-color-success` | `#28c76f` | Success / approved |
| `--el-color-danger` | `#ea5455` | Error / rejected |
| `--pac-s2--` to `--pac-s8--` | `8px` to `32px` | Spacing scale |
| `--pac-radius--` | `6px` | Base border-radius |

---

## Reference Figma Nodes (Pacvue Design System)

| Component | Node ID | Key specs |
|---|---|---|
| DatePicker | `15087:22990` | 36px h, white bg, `#dedfe3` border, calendar icon right |
| Search Input | `15087:23079` | 36px h, search icon left, `#b2b2b8` placeholder |
| Tag / Badge | `15087:23123` | 22px h, rgba opacity bg + border (NOT solid) |
| Table | `15087:14773` | Header 48px WHITE, data rows 72px, product img 52×52 |
| Pagination | `15087:23312` | Active = orange border + white bg, NO fill |

---

## Workflow Improvement Backlog

Ideas not yet implemented, prioritized:

1. **True independent critic** — separate agent for critique, not same session
2. **Mode A → B bridge** — output `design-spec.json` from Figma run, Mode B reads it
3. **Mode C** — quick Figma wireframe (5 min, no design system required)
4. **3-state enforcement** — Mode B demos must include: loading / data / empty
5. **Token existence check** — grep `var(--pac-*)` usage against `local-theme.scss`
6. **Figma version snapshots** — keep `V1-YYYYMMDD` frames, never overwrite

---

## How to Use with Claude Code

1. Copy `skills/` and `workflows/` into your project's `.claude/` directory
2. Copy `memory/` files into `.claude/projects/.../memory/`
3. Update `memory/INDEX.md` to point to your memory files
4. In Claude Code, trigger with `/ui-design` or reference the skill directly

The workflow reads design tokens from your Figma file and builds components using the Plugin API. All specs in `references/` are extracted from real Pacvue Figma nodes — adapt them to your own design system.
