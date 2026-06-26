# Design Help Agent

AI-assisted UI design workflow for Claude Code. **Four modes** covering the full spectrum from Figma high-fidelity to shadcn standalone projects with dual-theme support.

Built from real product work on Pacvue (enterprise advertising platform). Evolves through use.

---

## Four Workflow Modes

> **Every design session starts by picking a mode.** If unclear, Claude will ask.

### Mode A — 精细化 Figma（High-Fidelity）

For design-system-compliant Figma output ready for dev handoff.

- **Tool:** Figma Plugin API via `use_figma`
- **Enforces:** auto-layout, design tokens, component specs, blind critique loop (StyleSeed 0–100 scoring), version snapshots
- **Output:** Figma nodes + `/tmp/design-spec.json` for Mode B handoff
- **Trigger:** Figma / 设计稿 / 符合规范 / 交付

### Mode B — 快速 Demo（Rapid Vue Demo）

For validating a product idea in ~30 minutes, embedded in the Pacvue project.

- **Tool:** Vue 3 SFC in `src/views/` + vue-router route
- **Enforces:** HMR passes, 3 states (loading/data/empty), no single file > 300 lines, token existence check
- **Output:** `http://localhost:5173/#/your-route`
- **Trigger:** demo / 跑起来 / 原型 / 演示

### Mode C — 快速线框（Quick Wireframe）

For 5-minute information architecture sketches before committing to a layout.

- **Tool:** `use_figma` (single call, gray placeholder only)
- **Enforces:** structure matches verbal description; no color, no tokens, no critique
- **Output:** Figma screenshot
- **Trigger:** 草图 / 线框 / 快速看结构 / 方案讨论

### Mode D — shadcn-vue 双主题（Standalone Dual-Theme）

For polished, token-driven front-end with Default / Pacvue theme switching.

- **Tool:** Standalone Vite + Vue 3 + Tailwind v3 + shadcn-vue (separate project, no `important` conflicts)
- **Enforces:** CSS variable dual-theme system, Pacvue color + spacing tokens, IconPark icons (outline/size=18/stroke-width=3), min font 11px, no hardcoded hex or bare px values
- **Output:** Independent runnable project at `http://localhost:5174`
- **Trigger:** shadcn / 独立项目 / 双主题 / 可切换主题

---

## Decision Tree

```
Design task requested
         ↓
Figma / design / spec / 规范 / 交付?   → Mode A
         ↓ NO
demo / prototype / 跑起来 / 演示?      → Mode B
         ↓ NO
草图 / 线框 / 快速看结构?              → Mode C
         ↓ NO
shadcn / 双主题 / 独立项目?            → Mode D
         ↓ NO
Ask: "Figma 设计稿、可运行 Demo、快速草图，还是 shadcn 独立项目？"
```

---

## File Structure

```
design-helper/
├── skills/
│   └── ui-design-workflow/
│       ├── SKILL.md                    # Full workflow: mode table, all 4 modes, design rules
│       └── references/
│           ├── pacvue-components.md    # Exact specs from real Figma nodes
│           └── pacvue-color-system.md  # 7 color categories with token names
├── workflows/
│   ├── ui-design.js                    # Multi-agent workflow (Phase 0–6, blind critic, design-spec output)
│   └── pacvue-research-and-propose.js  # Research + propose new components
└── memory/
    ├── INDEX.md
    ├── ui-workflow-modes.md            # 4-mode decision tree (A/B/C/D)
    ├── pacvue-autolayout-rule.md       # ALWAYS createAutoLayout(), NEVER createFrame()
    ├── pacvue-brand-colors.md          # Orange #ff9f43, Blue #0D6EFD
    ├── pacvue-color-system.md          # 7-category color spec
    ├── pacvue-user-persona.md          # Target user: ad ops, KPI-first
    └── component-from-research-workflow.md
```

---

## Mode A — Key Rules

**Auto-Layout (non-negotiable)**
```js
// ✅
const row = figma.createAutoLayout('HORIZONTAL')
parent.appendChild(row)
row.layoutSizingHorizontal = 'FILL'  // AFTER appendChild

// ❌ Never
const row = figma.createFrame(); row.x = 100
```

**Tag opacity on fill, not frame**
```js
frame.fills = [{ type: 'SOLID', color: col, opacity: 0.05 }]  // ✅
frame.opacity = 0.05  // ❌ makes text invisible
```

**Pagination active = orange border + white bg (never filled)**

**One theme per page** — never mix orange `#ff9f43` and blue `#0D6EFD` as primary actions.

---

## Mode A — Review Scoring (StyleSeed 7-category, 0–100)

| Category | Max | Key deductions |
|---|---|---|
| Coherence | 20 | Mixed radii, multiple accents, emoji as icons |
| Color | 16 | Hardcoded hex, pure #000 text, status color misuse |
| Typography | 16 | No font scale, wrong number/unit ratio |
| Layout | 12 | No cards, off-grid spacing |
| States | 12 | Missing empty/loading/error |
| UX Writing | 12 | Vague button labels, blame-y errors |
| Motion & Polish | 12 | Ad-hoc fades, hard black shadow |

**Quality gate: ≥ 80 to ship.** Pacvue-specific deductions embedded in each category.

---

## Mode D — Setup Checklist

```bash
pnpm create vite <name> --template vue && cd <name> && pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer && npx tailwindcss init -p
pnpm add reka-ui class-variance-authority clsx tailwind-merge @icon-park/vue-next
```

**Theme toggle pattern:**
```vue
<div :class="activeTheme">           <!-- '' = Default, 'theme-custom-pacvue' = Pacvue -->
  <div class="theme-switcher">...</div>
</div>
```

**Icon pattern:**
```vue
<History theme="outline" size="18" :stroke-width="3" :fill="fillMuted" />

const fillMuted   = 'hsl(var(--muted-foreground))'   // #66666C in Pacvue
const fillPrimary = 'hsl(var(--primary))'             // #FF9F43 in Pacvue
```

---

## Pacvue Design Tokens (Source: ENT Design System New, node 2666:31076)

| Token | Value | Use |
|---|---|---|
| `--primary` | `31 100% 63%` = `#FF9F43` | Orange primary |
| `--foreground` | `237 7% 29%` = `#45464F` | 标题文字 |
| `--muted-foreground` | `240 3% 41%` = `#66666C` | 正文 / icon 深色 |
| `--muted-foreground` (muted) | `240 2% 71%` = `#B2B2B8` | 占位符 |
| `--border` | `228 9% 88%` = `#DEDFE3` | 边框 / 输入框 |
| `--destructive` | `0 77% 62%` = `#EA5455` | Error |
| `--pac-success` | `148 66% 47%` = `#28C76F` | Success |
| `--pac-link` | `214 98% 52%` = `#0D6EFD` | 跳转链接 |
| `--spacing-1~12` | `4px~48px` | 间距 token (Pacvue 主题下 → `--pac-s*--`) |

---

## Reference Figma Nodes (Pacvue Design System)

| Component | Node ID | Key specs |
|---|---|---|
| DatePicker | `15087:22990` | 36px h, white bg, `#dedfe3` border |
| Search Input | `15087:23079` | 36px h, search icon left |
| Tag / Badge | `15087:23123` | 22px h, rgba opacity bg (NOT solid) |
| Table | `15087:14773` | Header 48px WHITE, rows 72px, img 52×52 |
| Pagination | `15087:23312` | Active = orange border + white bg |

---

## How to Use with Claude Code

1. Copy `skills/` and `workflows/` into your project's `.claude/` directory
2. Copy `memory/` files into `.claude/projects/.../memory/`
3. Trigger with `/ui-design` — Claude will ask which mode before starting
