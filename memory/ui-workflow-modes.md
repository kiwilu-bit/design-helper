---
name: ui-workflow-modes
description: Four UI workflow modes — A Figma精细化, B Vue快速Demo, C Figma快速线框, D shadcn独立双主题. Always run Pre-flight Check first. Decision tree inside.
metadata:
  type: project
---

Three distinct workflow modes. Pick one explicitly before starting.
If unclear, ask the user. See decision tree at bottom.

---

## Pre-flight Check (run before ANY mode)

**Mode A:**
- Can I access the Figma file? (`get_metadata` to verify)
- Is `/tmp/ui-design-state.json` from a previous session? (resume if yes)

**Mode B:**
- Is vite running on port 5173? (`lsof -i :5173 | grep LISTEN`)
- Does a similar component already exist in `src/views/`?

---

## Mode A — 精细化 Figma（High-Fidelity）

**When:** user says 设计稿 / Figma / 规范 / 交付 / 高保真

**Tool:** Figma Plugin API (`use_figma`)
**Phases:** Brief → Tokens → Components (no skip) → Assembly → Blind Critique → Design Spec

**Non-negotiable:**
- Auto-layout mandatory (NEVER createFrame + absolute x/y)
- Read reference node before building each component
- One theme color per page (orange OR blue, never mixed)
- Tag opacity on fill color, not frame
- Pagination active = orange border + white bg, no fill

**Blind Critique (Phase 5):**
Critic agent receives ONLY: original brief + fresh screenshot.
It does NOT receive componentRegistry, tokens, or build decisions.
Prompt explicitly: "你不知道这个设计是怎么做出来的."
Max 3 rounds.

**Version snapshots (before Phase 3):**
Create `V{n}-{YYYYMMDD}` frame, copy current work into it, lock it.
Never overwrite. Working area = separate frame named "Working".

**Output:** Figma nodes + `/tmp/design-spec.json` (when review passes)

---

## Mode B — 快速 Demo（Runnable Vue）

**When:** user says demo / 跑起来 / 原型 / 演示 / 看看效果

**Tool:** Vue 3 SFC in `src/views/`, add route `{ hide: true, ... }`

**Read design-spec.json first:**
```bash
cat /tmp/design-spec.json 2>/dev/null
```
If it exists (from a Mode A run), use its component names and color tokens — don't reinvent.

**Sub-component first:**
Identify atoms before writing the page. Single file > 300 lines = split signal.

**3-state enforcement (all required):**
| State | Description |
|---|---|
| 🔄 Loading | Spinner / skeleton / step progress |
| ✅ Data | Normal success view with content |
| 📭 Empty | No data / first use / after clear |

**Token existence check (after writing SFC):**
```bash
grep -oE "var\(--[^)]+\)" src/views/XxxDemo.vue | sort -u > /tmp/used-tokens.txt
grep -oE "\-\-[a-zA-Z][a-zA-Z0-9_-]+" src/styles/local-theme.scss | sort -u > /tmp/defined-tokens.txt
comm -23 /tmp/used-tokens.txt /tmp/defined-tokens.txt
# Must be empty to pass
```

**Done when:**
- HMR no errors
- All 3 states triggerable
- No file > 300 lines
- Token check output is empty

---

## Mode C — 快速线框（Quick Wireframe）

**When:** user says 草图 / 线框 / 快速看结构 / 方案讨论 / 聊聊布局

**Tool:** `use_figma` (simplified, one call)

**Rules:**
- Gray only: `#f2f3f5` bg, `#dedfe3` frames, `#b2b2b8` text
- No variable binding
- No Critique Loop
- Auto-layout recommended, not required

**Steps:**
1. Say the structure out loud (one sentence), user confirms
2. One `use_figma` call for the full structure
3. `await frame.screenshot()` = done

**Done when:** screenshot returned, structure matches description

---

## Mode D — shadcn-vue 独立双主题项目

**When:** user says shadcn / 独立项目 / 双主题 / 可切换主题 / 规范可交付的前端

**Tool:** 独立 Vite + Vue 3 + Tailwind v3 + shadcn-vue（不嵌入 Pacvue 工程）

**Key rules:**
- Tailwind 无 `important` wrapper，类名全局生效
- CSS 变量双主题：`:root`（Default zinc）+ `.theme-custom-pacvue`（Pacvue orange）
- 根元素绑定 `:class="activeTheme"`，切换主题 class 即可
- shadcn 组件：Button / Card / Badge / Skeleton / Separator / Sheet（`src/components/ui/`）
- 图标：`@icon-park/vue-next`，`theme="outline"` `size="18"` `:stroke-width="3"`
- 颜色：`fillFg / fillMuted / fillPrimary / fillSuccess` 均为 `hsl(var(--token))`，随主题切换
- 间距 token：`--spacing-1 ~ --spacing-12`，Pacvue 主题下指向 `--pac-s*--`
- 最小字号：11px（`text-[11px]`）
- 禁止：内联 hex 颜色、裸 px 间距值、硬编码主题色

**Pacvue token 颜色（来源：ENT Design System New node 2666:31076）：**
- Primary: `#FF9F43` → `--primary: 31 100% 63%`
- 标题文字: `#45464F` → `--foreground: 237 7% 29%`
- 正文: `#66666C` → `--muted-foreground: 240 3% 41%`
- 边框: `#DEDFE3` → `--border: 228 9% 88%`
- Error: `#EA5455` → `--destructive: 0 77% 62%`

**Done when:**
- `pnpm dev` 启动无报错
- Default / Pacvue 双主题切换视觉差异明显
- 所有颜色/间距走 token
- 3 种状态（loading / data / empty）均可触发

---

## Decision Tree

```
User requests UI work
        ↓
Says Figma / design / spec / 规范 / 交付?
        → YES → Mode A (精细化)
        ↓ NO
Says demo / prototype / 跑起来 / 演示?
        → YES → Mode B (快速 Demo)
        ↓ NO
Says wireframe / 草图 / 线框 / 看结构?
        → YES → Mode C (快速线框)
        ↓ NO
Says shadcn / 独立项目 / 双主题 / 可切换主题 / 规范可交付前端?
        → YES → Mode D (shadcn 双主题)
        ↓ NO
Ask: 需要 Figma 设计稿、可运行 Demo、快速草图，还是带主题系统的 shadcn 独立项目？
```

**Why separate modes:** toolchain, quality gates, and deliverables are completely different.
Mixing them wastes time or produces wrong-quality output.

[[pacvue-autolayout-rule]]
[[pacvue-color-system]]
